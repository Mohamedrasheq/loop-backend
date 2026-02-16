import { NextRequest, NextResponse } from "next/server";
import type { DailyBriefResponse } from "@/types";
import { getOpenItemsDueWithin24Hours } from "@/lib/supabase";

/**
 * GET /api/daily-brief
 * 
 * Purpose: Surface right things at right time.
 * Logic (all backend-controlled, no LLM):
 * - status = open
 * - due_at ≤ next 24h
 * - order by urgency + due_at
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

        // Pure database query - backend decides what to surface
        const items = await getOpenItemsDueWithin24Hours(userId);

        // Transform to API response format
        const response: DailyBriefResponse = {
            items: items.map((item) => ({
                id: item.id,
                title: item.title,
                type: item.type,
                urgency: item.urgency,
                dueAt: item.due_at,
            })),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in /api/daily-brief:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
