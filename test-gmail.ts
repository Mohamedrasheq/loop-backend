import { createGmailDraft } from "./lib/gmail";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testGmail() {
    console.log("🚀 Starting Gmail Integration Test...");

    try {
        const result = await createGmailDraft(
            "test@example.com",
            "Terminal Test: Multiline Draft 🐙",
            "<h1>Hello from the Terminal!</h1><p>This is a test draft to verify the Gmail integration is working correctly after the OAuth2 update.</p>"
        );

        console.log("✅ SUCCESS!");
        console.log("Draft ID:", result.id);
        console.log("Message Details:", JSON.stringify(result.message, null, 2));
    } catch (error: any) {
        console.error("❌ FAILED!");
        console.error("Error Message:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        }
    }
}

testGmail();
