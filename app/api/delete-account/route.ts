import { NextRequest, NextResponse } from "next/server";
import { deleteUser } from "@/lib/supabase";
import type { DeleteAccountPayload } from "@/types";

/**
 * POST /api/delete-account
 * 
 * Purpose: Permanently delete a user account and all associated data.
 * Action: Delete user record (cascades to memory items).
 */
export async function POST(request: NextRequest) {
    try {
        const body: DeleteAccountPayload = await request.json();
        const { userId } = body;

        // Validate required fields
        if (!userId) {
            return NextResponse.json(
                { error: "Missing required field: userId" },
                { status: 400 }
            );
        }

        const success = await deleteUser(userId);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to delete account" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in /api/delete-account:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
