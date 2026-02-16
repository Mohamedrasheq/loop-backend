import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { getUserPushToken } from "@/lib/supabase";
import { sendPushNotification } from "@/lib/push";

const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "PLACEHOLDER",
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "PLACEHOLDER",
});

/**
 * POST /api/push-worker
 * 
 * Target endpoint for QStash scheduled messages.
 * Verifies the signature and sends the actual push notification.
 */
export async function POST(request: NextRequest) {
    try {
        // signature verification
        const signature = request.headers.get("upstash-signature");
        if (!signature) {
            return new Response("Unauthorized", { status: 401 });
        }

        const bodyText = await request.text();
        const isValid = await receiver.verify({
            signature,
            body: bodyText,
        }).catch(() => false);

        if (!isValid && process.env.NODE_ENV === "production") {
            console.error("Invalid QStash signature");
            return new Response("Invalid signature", { status: 401 });
        }

        const { userId, title, body, data } = JSON.parse(bodyText);

        if (!userId || !title || !body) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log(`[Worker] Sending notification to user ${userId}: ${title}`);

        const pushToken = await getUserPushToken(userId);
        if (!pushToken) {
            return NextResponse.json({ error: "No push token found" }, { status: 404 });
        }

        const result = await sendPushNotification(pushToken, title, body, data);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in /api/push-worker:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
