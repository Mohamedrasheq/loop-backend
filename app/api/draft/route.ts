import { NextRequest, NextResponse } from "next/server";
import type { DraftRequest, DraftResponse } from "@/types";
import { getMemoryItemById } from "@/lib/supabase";
import { draftMessage } from "@/lib/llm";

/**
 * POST /api/draft
 * 
 * Purpose: Draft small work for user.
 * Flow:
 * 1. Fetch memory item
 * 2. Send context to LLM for drafting
 * 3. Return draft text
 */
export async function POST(request: NextRequest) {
    try {
        const body: DraftRequest = await request.json();
        const { memoryItemId, tone } = body;

        // Validate input
        if (!memoryItemId || !tone) {
            return NextResponse.json(
                { error: "Missing required fields: memoryItemId, tone" },
                { status: 400 }
            );
        }

        // Validate tone
        if (!["polite", "professional", "firm"].includes(tone)) {
            return NextResponse.json(
                { error: "Invalid tone. Must be: polite, professional, or firm" },
                { status: 400 }
            );
        }

        // Fetch memory item - backend controls what context LLM receives
        const memoryItem = await getMemoryItemById(memoryItemId);

        if (!memoryItem) {
            return NextResponse.json(
                { error: "Memory item not found" },
                { status: 404 }
            );
        }

        // LLM drafting - backend controls the context and tone
        const draft = await draftMessage(
            memoryItem.title,
            memoryItem.context,
            memoryItem.source_text,
            tone
        );

        if (!draft) {
            return NextResponse.json(
                { error: "Failed to generate draft" },
                { status: 500 }
            );
        }

        const response: DraftResponse = {
            draftText: draft,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in /api/draft:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
