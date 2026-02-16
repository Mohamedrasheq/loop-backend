import { sendPushNotification } from "./lib/push";
import { getUserPushToken } from "./lib/supabase";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 3) {
        console.log("\nUsage: npx tsx send-notification.ts <userId> <title> <body>");
        console.log('Example: npx tsx send-notification.ts user_123 "Hello" "This is a test"\n');
        process.exit(1);
    }

    const [userId, title, body] = args;

    console.log(`\n🔍 Looking up push token for user: ${userId}...`);

    try {
        const pushToken = await getUserPushToken(userId);

        if (!pushToken) {
            console.error(`❌ FAILED: No push token found for user ID: ${userId}`);
            console.log("Tip: Ensure the user has registered their device in the app.");
            process.exit(1);
        }

        console.log(`✅ Found token: ${pushToken}`);
        console.log(`🚀 Sending notification: "${title}" - "${body}"...`);

        const result = await sendPushNotification(pushToken, title, body, {
            sentVia: "Terminal Script",
            timestamp: new Date().toISOString()
        });

        if (result.success) {
            console.log("✨ SUCCESS! Notification sent.\n");
        } else {
            console.error(`❌ FAILED: ${result.error}\n`);
        }
    } catch (error: any) {
        console.error("💥 CRITICAL ERROR:");
        console.error(error.message);
        process.exit(1);
    }
}

main();
