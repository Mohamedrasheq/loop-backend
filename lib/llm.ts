import OpenAI from "openai";
import type { LLMExtractionResult, DraftTone } from "@/types";
import {
    EXTRACTION_SYSTEM_PROMPT,
    DRAFTING_SYSTEM_PROMPT,
    NOTIFICATION_SYSTEM_PROMPT,
    buildExtractionUserPrompt,
    buildDraftingUserPrompt,
    buildNotificationUserPrompt,
} from "./prompts";

const MODEL = "gpt-4o-mini";
const CONFIDENCE_THRESHOLD = 0.7;

// Lazy initialization to avoid build-time errors
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
 * Extract structured intent from user text.
 * LLM is used ONLY for extraction - backend makes all decisions.
 */
export async function extractIntent(
    text: string,
    timezone: string
): Promise<LLMExtractionResult | null> {
    try {
        const openai = getOpenAI();
        const response = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
                { role: "user", content: buildExtractionUserPrompt(text, timezone) },
            ],
            temperature: 0.3, // Low temperature for consistent extraction
            response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            console.error("No content in LLM response");
            return null;
        }

        const parsed = JSON.parse(content) as LLMExtractionResult;

        // Backend validation: filter out low-confidence items
        // This is where BACKEND makes the decision, not LLM
        parsed.items = parsed.items.filter(
            (item) => item.confidence >= CONFIDENCE_THRESHOLD
        );

        return parsed;
    } catch (error) {
        console.error("Error extracting intent:", error);
        return null;
    }
}

/**
 * Draft a message based on memory item context.
 * LLM is used ONLY for drafting - backend controls when/what to draft.
 */
export async function draftMessage(
    title: string,
    context: string | null,
    sourceText: string,
    tone: DraftTone
): Promise<string | null> {
    try {
        const openai = getOpenAI();
        const response = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                { role: "system", content: DRAFTING_SYSTEM_PROMPT },
                {
                    role: "user",
                    content: buildDraftingUserPrompt(title, context, sourceText, tone),
                },
            ],
            temperature: 0.7, // Slightly higher for natural drafting
            max_tokens: 500,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            console.error("No content in draft response");
            return null;
        }

        return content.trim();
    } catch (error) {
        console.error("Error drafting message:", error);
        return null;
    }
}

/**
 * Generate catchy notification title and body.
 */
export async function generateNotificationContent(
    title: string,
    context: string | null
): Promise<{ title: string; body: string } | null> {
    try {
        const openai = getOpenAI();
        const response = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                { role: "system", content: NOTIFICATION_SYSTEM_PROMPT },
                {
                    role: "user",
                    content: buildNotificationUserPrompt(title, context),
                },
            ],
            temperature: 0.8,
            response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return null;

        return JSON.parse(content);
    } catch (error) {
        console.error("Error generating notification content:", error);
        return null;
    }
}
