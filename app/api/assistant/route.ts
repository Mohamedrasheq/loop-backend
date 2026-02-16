import { NextRequest, NextResponse } from "next/server";
import type { AssistantResponse } from "@/types";
import { analyzeTasks } from "@/lib/planner";

/**
 * GET /api/assistant
 *
 * Purpose: Frontend-facing assistant that presents task analysis conversationally.
 * Level 1: Guidance only - calm, supportive, action-oriented.
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

        // Call the optimized planner logic directly (no HTTP request, single pass)
        const plannerData = await analyzeTasks(userId);

        // Return the full planner data including actions
        return NextResponse.json({
            message: plannerData.analysis.trim(),
            priority_tasks: plannerData.priority_tasks,
            proposed_actions: plannerData.proposed_actions,
        });
    } catch (error) {
        console.error("Error in /api/assistant:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}


