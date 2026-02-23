import { NextRequest, NextResponse } from "next/server";
import { updateUserProStatus, logRevenueCatEvent } from "@/lib/supabase";

/**
 * POST /api/webhooks/revenuecat
 * 
 * Purpose: Handle subscription events from RevenueCat.
 * Security: Verifies the Authorization header against REVENUECAT_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
    try {
        console.log("Incoming RevenueCat webhook...");

        // 1. Security Verification
        const authHeader = request.headers.get("authorization");
        const secret = process.env.REVENUECAT_WEBHOOK_SECRET;

        // RevenueCat typically sends "Bearer <YOUR_SECRET>"
        // If the secret is not set in env, we skip verification (not recommended for prod)
        if (secret && authHeader !== `Bearer ${secret}`) {
            console.error("Unauthorized RevenueCat webhook attempt: Invalid Secret");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const event = body.event;

        if (!event) {
            console.error("RevenueCat Webhook: Missing event object in payload");
            return NextResponse.json({ error: "Missing event data" }, { status: 400 });
        }

        const { type, app_user_id } = event;

        if (!app_user_id) {
            console.error("RevenueCat Webhook: Missing app_user_id in event");
            return NextResponse.json({ error: "Missing app_user_id" }, { status: 400 });
        }

        console.log(`Processing RevenueCat event: ${type} for user: ${app_user_id}`);

        /**
         * PROCESSING LOGIC
         * We do this before returning to ensure data consistency, 
         * but we keep it very fast.
         */

        // 2. Log the event for auditing
        await logRevenueCatEvent(app_user_id, type, body);

        // 3. Determine Pro Status
        // INITIAL_PURCHASE: User just subscribed
        // RENEWAL: Subscription renewed successfully
        // UNCANCELLATION: User opted back into subscription
        // EXPIRATION: Subscription ended
        // BILLING_ISSUE: Payment failed, entitlement lost

        let isPro: boolean | null = null;

        const grantAccessEvents = ["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION"];
        const revokeAccessEvents = ["EXPIRATION", "BILLING_ISSUE"];

        if (grantAccessEvents.includes(type)) {
            isPro = true;
        } else if (revokeAccessEvents.includes(type)) {
            isPro = false;
        }

        // 4. Update Database
        if (isPro !== null) {
            const success = await updateUserProStatus(app_user_id, isPro);
            if (!success) {
                console.error(`Failed to update pro status for user ${app_user_id}`);
                // We still return 200 to RevenueCat to avoid retries if the event was logged
            } else {
                console.log(`Successfully updated Pro status to ${isPro} for user ${app_user_id}`);
            }
        }

        // 5. Return success immediately to avoid retries
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Error in RevenueCat webhook handler:", error);
        // We return 500 here so RevenueCat will retry if something truly crashed
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
