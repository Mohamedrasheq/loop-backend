import { NextRequest, NextResponse } from "next/server";
import type { CloseRequest, CloseResponse } from "@/types";
import { closeMemoryItem } from "@/lib/supabase";

/**
 * POST /api/close
 * 
 * Purpose: Close a memory loop.
 * Action: Update status → closed
 * No LLM involved - pure backend logic
 */
export async function POST(request: NextRequest) {
    try {
        const body: CloseRequest = await request.json();
        const { memoryItemId } = body;

        // Validate input
        if (!memoryItemId) {
            return NextResponse.json(
                { error: "Missing required field: memoryItemId" },
                { status: 400 }
            );
        }

        // Simple database update - backend decision only
        const success = await closeMemoryItem(memoryItemId);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to close memory item" },
                { status: 500 }
            );
        }

        const response: CloseResponse = {
            success: true,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in /api/close:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
