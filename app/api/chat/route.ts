import { NextRequest, NextResponse } from "next/server";
import { createMemoryItem, updateMemoryItem, createNotification } from "@/lib/supabase";
import { generateNotificationContent } from "@/lib/llm";
import { scheduleNotification } from "@/lib/upstash";
import { runAgent, runAgentStreaming } from "@/lib/claude-agent";
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
 */
export async function POST(request: NextRequest) {
    try {
        const { userId, text, timezone, stream = false } = await request.json();

        if (!userId || !text || !timezone) {
            return NextResponse.json(
                { error: "Missing required fields: userId, text, timezone" },
                { status: 400 }
            );
        }

        // Step 1: Extract task/item using OpenAI (fast, synchronous before stream)
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
            parsed = { captured_item: null, proposed_actions: [] };
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

        // Step 3: Run Claude Agent (Streaming or Legacy)
        if (stream) {
            const encoder = new TextEncoder();
            const agentStream = runAgentStreaming(userId, text, timezone);

            const readableStream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const event of agentStream) {
                            // Format as SSE: data: <payload>\n\n
                            const data = JSON.stringify(
                                event.type === "done"
                                    ? { ...event, proposed_actions: parsed.proposed_actions || [] }
                                    : event
                            );
                            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                        }
                        controller.close();
                    } catch (err) {
                        controller.error(err);
                    }
                },
            });

            return new Response(readableStream, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
            });
        }

        // Non-streaming fallback
        const agentResponse = await runAgent(userId, text, timezone);
        return NextResponse.json({
            reply: agentResponse.reply,
            proposed_actions: parsed.proposed_actions || [],
            tool_results: agentResponse.tool_results,
            connected_services: agentResponse.connected_services,
        });

    } catch (error: any) {
        console.error("Error in /api/chat:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
