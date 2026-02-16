import { NextRequest, NextResponse } from "next/server";
import { getNotificationsByUserId } from "@/lib/supabase";

/**
 * GET /api/notifications
 * 
 * Purpose: Fetch notification history and scheduled reminders for a specific user
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

        const notifications = await getNotificationsByUserId(userId);

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error("Error in /api/notifications:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
