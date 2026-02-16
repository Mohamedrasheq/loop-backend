import { NextRequest, NextResponse } from "next/server";
import { upsertUser } from "@/lib/supabase";
import type { UserSyncRequest } from "@/types";

/**
 * POST /api/users/sync
 * 
 * Purpose: Sync user data from frontend/auth provider to backend.
 * Action: Upsert user record in 'users' table.
 */
export async function POST(request: NextRequest) {
    try {
        const body: UserSyncRequest = await request.json();
        const { userId, email, fullName, avatarUrl } = body;

        // Validate required fields
        if (!userId || !email) {
            return NextResponse.json(
                { error: "Missing required fields: userId, email" },
                { status: 400 }
            );
        }

        const success = await upsertUser(userId, email, fullName, avatarUrl);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to sync user data" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in /api/users/sync:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
