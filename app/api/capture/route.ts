import { NextRequest, NextResponse } from "next/server";
import type { CaptureRequest, CaptureResponse } from "@/types";
import { extractIntent, generateNotificationContent } from "@/lib/llm";
import { createMemoryItem, updateMemoryItem, createNotification } from "@/lib/supabase";
import { scheduleNotification } from "@/lib/upstash";

/**
 * POST /api/capture
 * 
 * Purpose: Capture user input and extract memories.
 * Flow:
 * 1. Send text to LLM for EXTRACTION ONLY
 * 2. LLM returns structured JSON
 * 3. Validate confidence (backend decision)
 * 4. Store memory items
 * 5. Return calm confirmation message
 */
export async function POST(request: NextRequest) {
    try {
        const body: CaptureRequest = await request.json();
        const { userId, text, timezone } = body;

        // Validate input
        if (!userId || !text || !timezone) {
            return NextResponse.json(
                { error: "Missing required fields: userId, text, timezone" },
                { status: 400 }
            );
        }

        // LLM extraction - backend will validate and decide what to store
        const extraction = await extractIntent(text, timezone);

        if (!extraction || extraction.items.length === 0) {
            // Even if nothing extracted, stay calm
            const response: CaptureResponse = {
                agentMessage: "Got it. I've noted this down.",
            };
            return NextResponse.json(response);
        }

        // Backend stores validated items (already filtered by confidence threshold)
        let storedCount = 0;
        for (const item of extraction.items) {
            const memoryItem = await createMemoryItem({
                user_id: userId,
                type: item.type,
                title: item.title,
                context: item.context,
                source_text: text,
                due_at: item.due_at,
                urgency: item.urgency,
                status: "open",
            });

            if (memoryItem) {
                storedCount++;

                // Schedule notification if due date is in the future
                if (item.due_at) {
                    const dueDate = new Date(item.due_at);
                    if (dueDate > new Date()) {
                        const notificationContent = await generateNotificationContent(item.title, item.context);
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

                                // Create a persistent notification log
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
        }

        // Calm confirmation - backend controls messaging
        const response: CaptureResponse = {
            agentMessage:
                storedCount > 0
                    ? "Got it. I'll keep track of this."
                    : "Understood. I've made a note.",
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in /api/capture:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
