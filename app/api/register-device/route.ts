import { NextRequest, NextResponse } from "next/server";
import { upsertDeviceToken } from "@/lib/supabase";

/**
 * POST /api/register-device
 *
 * Registers or updates a device push token for a user.
 * Called from the Expo app on launch after getting the push token.
 *
 * Flow:
 *   Expo app → registerForPushNotifications() → gets ExponentPushToken
 *   → calls this endpoint → token stored in Supabase device_tokens table
 */
export async function POST(request: NextRequest) {
    try {
        const { userId, pushToken, platform, deviceToken } = await request.json();

        if (!userId || !pushToken) {
            return NextResponse.json(
                { error: "Missing required fields: userId, pushToken" },
                { status: 400 }
            );
        }

        const success = await upsertDeviceToken(
            userId,
            pushToken,
            platform || "unknown",
            deviceToken
        );

        if (!success) {
            return NextResponse.json(
                { error: "Failed to register device token" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in /api/register-device:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
