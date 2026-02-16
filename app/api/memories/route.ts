import { NextRequest, NextResponse } from "next/server";
import { getAllMemoryItems } from "@/lib/supabase";

/**
 * GET /api/memories
 * 
 * Purpose: Get all memory items for a user (for the memories page)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "Missing required query parameter: userId" },
                { status: 400 }
            );
        }

        const items = await getAllMemoryItems(userId);

        return NextResponse.json({ items });
    } catch (error) {
        console.error("Error in /api/memories:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
