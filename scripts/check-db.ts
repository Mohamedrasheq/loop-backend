
import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log("❌ Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey.trim());

async function checkNotifications() {
    const userId = "user_39jrDsaXG29ev4r0k3mBAC69aeW";

    console.log(`Checking notifications for user: ${userId}...`);

    const { data, error, count } = await supabase
        .from("notifications")
        .select("*", { count: 'exact' })
        .eq("user_id", userId);

    if (error) {
        console.error("❌ Error querying Supabase:", error.message);
    } else {
        console.log(`✅ Found ${count} notification(s) in the database.`);
        if (data && data.length > 0) {
            console.log("First entry title:", data[0].title);
        }
    }
}

checkNotifications();
