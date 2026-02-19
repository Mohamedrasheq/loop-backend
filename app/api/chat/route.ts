import { NextRequest, NextResponse } from "next/server";
import { createMemoryItem, updateMemoryItem, createNotification } from "@/lib/supabase";
import { generateNotificationContent } from "@/lib/llm";
import { scheduleNotification } from "@/lib/upstash";
import { runAgent } from "@/lib/claude-agent";
import {
    CHAT_SYSTEM_PROMPT,
    buildChatUserPrompt,
} from "@/lib/level1-prompts";
import OpenAI from "openai";

const EXTRACTION_MODEL = "gpt-4o-mini";

let openaiInstance: OpenAI | null = null;
function getOpenAI(): OpenAI {
    if (openaiInstance) return openaiInstance;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
    openaiInstance = new OpenAI({ apiKey });
    return openaiInstance;
}

/**
 * POST /api/chat
 *
 * Unified chat endpoint:
 * 1. Extracts tasks/items using OpenAI (fast, cheap)
 * 2. Runs Claude Agent for tool-use and conversational reply
 * 3. Saves captured items to Supabase
 * 4. Returns reply + proposed actions + tool results
 */
export async function POST(request: NextRequest) {
    try {
        const { userId, text, timezone } = await request.json();

        if (!userId || !text || !timezone) {
            return NextResponse.json(
                { error: "Missing required fields: userId, text, timezone" },
                { status: 400 }
            );
        }

        // Step 1: Extract task/item using OpenAI (keeps existing capture logic)
        const openai = getOpenAI();

        const extraction = await openai.chat.completions.create({
            model: EXTRACTION_MODEL,
            messages: [
                { role: "system", content: CHAT_SYSTEM_PROMPT },
                { role: "user", content: buildChatUserPrompt(text, timezone) },
            ],
            temperature: 0.3,
            max_tokens: 2000,
            response_format: { type: "json_object" },
        });

        const rawContent = extraction.choices[0]?.message?.content || "{}";
        let parsed;
        try {
            parsed = JSON.parse(rawContent);
        } catch {
            parsed = {
                captured_item: null,
                proposed_actions: [],
            };
        }

        // Step 2: Save captured item to database (existing logic)
        const item = parsed.captured_item;
        if (item?.title) {
            const memoryItem = await createMemoryItem({
                user_id: userId,
                type: item.type || "note",
                title: item.title,
                context: item.context || null,
                source_text: text,
                due_at: item.due_at || null,
                urgency: item.urgency || "medium",
                status: "open",
            });

            // Schedule notification if due date is in the future
            if (memoryItem && item.due_at) {
                const dueDate = new Date(item.due_at);
                if (dueDate > new Date()) {
                    const notificationContent = await generateNotificationContent(item.title, item.context || null);
                    if (notificationContent) {
                        const messageId = await scheduleNotification({
                            userId,
                            title: notificationContent.title,
                            body: notificationContent.body,
                            scheduledFor: dueDate,
                            data: { screen: "memory", itemId: memoryItem.id }
                        });

                        if (messageId) {
                            await updateMemoryItem(memoryItem.id, { scheduled_message_id: messageId });

                            await createNotification({
                                user_id: userId,
                                memory_item_id: memoryItem.id,
                                title: notificationContent.title,
                                body: notificationContent.body,
                                scheduled_at: dueDate.toISOString(),
                                status: "scheduled",
                                scheduled_message_id: messageId
                            });
                        }
                    }
                }
            }
        }

        // Step 3: Run Claude Agent for conversational reply + tool use
        const agentResponse = await runAgent(userId, text, timezone);

        return NextResponse.json({
            reply: agentResponse.reply,
            proposed_actions: parsed.proposed_actions || [],
            tool_results: agentResponse.tool_results,
        });
    } catch (error) {
        console.error("Error in /api/chat:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
