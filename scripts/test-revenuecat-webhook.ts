/**
 * Test script to simulate a RevenueCat webhook event.
 * 
 * Usage:
 * 1. Ensure your server is running (npm run dev)
 * 2. Ensure REVENUECAT_WEBHOOK_SECRET is set in .env.local
 * 3. Run this script: npx tsx scripts/test-revenuecat-webhook.ts
 */

const ENDPOINT = "http://localhost:3000/api/webhooks/revenuecat";
// Replace with the secret from your .env.local
const SECRET = process.env.REVENUECAT_WEBHOOK_SECRET || "test_secret";
// Replace with a valid Clerk User ID from your database for a real test
const TEST_USER_ID = "user_2pSTxPq8X9XzY0Z1A2B3C4D5E6F";

const events = [
    {
        name: "Initial Purchase (Grant Pro)",
        payload: {
            event: {
                type: "INITIAL_PURCHASE",
                app_user_id: TEST_USER_ID,
                entitlement_ids: ["Loop Pro"],
                period_type: "NORMAL"
            }
        }
    },
    {
        name: "Expiration (Revoke Pro)",
        payload: {
            event: {
                type: "EXPIRATION",
                app_user_id: TEST_USER_ID,
                entitlement_ids: ["Loop Pro"],
                period_type: "NORMAL"
            }
        }
    },
    {
        name: "Invalid Secret Test",
        invalidSecret: true,
        payload: {
            event: {
                type: "RENEWAL",
                app_user_id: TEST_USER_ID,
                entitlement_ids: ["Loop Pro"]
            }
        }
    }
];

async function runTests() {
    console.log("🚀 Starting RevenueCat Webhook Tests...\n");

    for (const test of events) {
        console.log(`Testing: ${test.name}`);

        try {
            const authHeader = test.invalidSecret ? "Bearer wrong_secret" : `Bearer ${SECRET}`;

            const response = await fetch(ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authHeader
                },
                body: JSON.stringify(test.payload)
            });

            console.log(`Status: ${response.status}`);
            const data = await response.json();
            console.log("Result:", JSON.stringify(data, null, 2));
            console.log("-----------------------------------\n");
        } catch (error: any) {
            console.error(`Error testing ${test.name}:`, error.message);
            console.log("Make sure your local server is running on http://localhost:3000\n");
        }
    }
}

runTests();
