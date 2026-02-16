import type { MemoryItem, PlannerResponse } from "@/types";
import { getAllMemoryItems } from "@/lib/supabase";
import {
    LEVEL1_CONVERSATIONAL_ASSISTANT_SYSTEM_PROMPT,
    buildPlannerUserPrompt,
} from "@/lib/level1-prompts";
import OpenAI from "openai";

const MODEL = "gpt-4o-mini";

// Lazy initialization
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
    if (openaiInstance) return openaiInstance;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error(
            "Missing OpenAI API key. Please set OPENAI_API_KEY in .env.local"
        );
    }

    openaiInstance = new OpenAI({ apiKey });
    return openaiInstance;
}

/**
 * Core planner logic - can be called directly without HTTP.
 * Level 2: Draft automation with approval.
 * Returns structured JSON with analysis, tasks, and proposed actions.
 */
export async function analyzeTasks(userId: string): Promise<PlannerResponse> {
    // Fetch all open memory items
    const allItems = await getAllMemoryItems(userId);
    const openItems = allItems.filter((item) => item.status === "open");

    // If no items, return early immediately (no LLM call)
    if (openItems.length === 0) {
        return {
            analysis:
                "Hey! I checked your tasks, and you're all caught up. Nothing urgent needs your attention right now. Want to capture something new?",
            priority_tasks: [],
            proposed_actions: [],
        };
    }

    // Prepare items for LLM (only relevant fields)
    const itemsForLLM = openItems.map((item: MemoryItem) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        urgency: item.urgency,
        status: item.status,
        due_at: item.due_at,
        context: item.context,
    }));

    // Call LLM
    const openai = getOpenAI();
    const now = new Date().toISOString();

    try {
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                {
                    role: "system",
                    content: LEVEL1_CONVERSATIONAL_ASSISTANT_SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: buildPlannerUserPrompt(now, itemsForLLM),
                },
            ],
            temperature: 0.3, // Lower temperature for more reliable JSON
            max_tokens: 1000,
            response_format: { type: "json_object" },
        });

        const rawContent = completion.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(rawContent);

        return {
            analysis: parsed.analysis || "I've analyzed your tasks.",
            priority_tasks: parsed.priority_tasks || [],
            proposed_actions: parsed.proposed_actions || [],
        };
    } catch (error) {
        console.error("Error parsing LLM response in analyzeTasks:", error);

        // Fallback to simple analysis if JSON fails
        return {
            analysis: "I'm having a bit of trouble organizing everything into a formal plan, but I'm still here to help! You have some tasks that might need attention.",
            priority_tasks: openItems.slice(0, 3).map(item => ({
                id: item.id,
                title: item.title,
                reason: item.urgency,
                suggested_steps: []
            })),
            proposed_actions: [],
        };
    }
}

