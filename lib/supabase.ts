import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { MemoryItem, Notification, NotificationStatus, UserCredential } from "@/types";

// Lazy initialization to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
    if (supabaseInstance) return supabaseInstance;

    const supabaseUrl = process.env.SUPABASE_URL;
    // For backend operations, we prefer the service role key to bypass RLS
    // Fall back to anon key if service role is not provided
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            "Missing Supabase credentials. Please set SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in .env.local"
        );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    return supabaseInstance;
}

// Database operations for memory items
export async function createMemoryItem(
    item: Omit<MemoryItem, "id" | "created_at">
): Promise<MemoryItem | null> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("memory_items")
            .insert(item)
            .select()
            .single();

        if (error) {
            console.error("Error creating memory item:", error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Supabase connection error:", error);
        return null;
    }
}

/**
 * Update a memory item (e.g., to add the scheduled_message_id)
 */
export async function updateMemoryItem(
    id: string,
    updates: Partial<MemoryItem>
): Promise<boolean> {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from("memory_items")
            .update(updates)
            .eq("id", id);

        if (error) {
            console.error("Error updating memory item:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Supabase connection error:", error);
        return false;
    }
}


export async function getOpenItemsDueWithin24Hours(
    userId: string
): Promise<MemoryItem[]> {
    try {
        const supabase = getSupabase();
        const now = new Date();
        const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const { data, error } = await supabase
            .from("memory_items")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "open")
            .or(`due_at.is.null,due_at.lte.${next24Hours.toISOString()}`)
            .order("urgency", { ascending: false }) // high > medium > low
            .order("due_at", { ascending: true, nullsFirst: false });

        if (error) {
            console.error("Error fetching daily brief items:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Supabase connection error:", error);
        return [];
    }
}

export async function getMemoryItemById(
    memoryItemId: string
): Promise<MemoryItem | null> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("memory_items")
            .select("*")
            .eq("id", memoryItemId)
            .single();

        if (error) {
            console.error("Error fetching memory item:", error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Supabase connection error:", error);
        return null;
    }
}

export async function closeMemoryItem(memoryItemId: string): Promise<boolean> {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from("memory_items")
            .update({ status: "closed" })
            .eq("id", memoryItemId);

        if (error) {
            console.error("Error closing memory item:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Supabase connection error:", error);
        return false;
    }
}

export async function getAllMemoryItems(userId: string): Promise<MemoryItem[]> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("memory_items")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching all memory items:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Supabase connection error:", error);
        return [];
    }
}

export async function upsertUser(
    id: string,
    email: string,
    fullName?: string | null,
    avatarUrl?: string | null
): Promise<boolean> {
    try {
        const supabase = getSupabase();

        const updates = {
            id,
            email,
            full_name: fullName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('users')
            .upsert(updates)
            .select();

        if (error) {
            console.error('Error upserting user:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Supabase connection error:', error);
        return false;
    }
}

export async function deleteUser(userId: string): Promise<boolean> {
    try {
        const supabase = getSupabase();

        // This will cascade delete all related memory items due to foreign key constraint
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) {
            console.error('Error deleting user:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Supabase connection error:', error);
        return false;
    }
}

export async function updateMemoryItemContext(
    memoryItemId: string,
    context: string
): Promise<boolean> {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from("memory_items")
            .update({ context })
            .eq("id", memoryItemId);

        if (error) {
            console.error("Error updating memory item context:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Supabase connection error:", error);
        return false;
    }
}

// ── Device Token Operations (Push Notifications) ──

export async function upsertDeviceToken(
    userId: string,
    pushToken: string,
    platform: string = "unknown",
    deviceToken?: string
): Promise<boolean> {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from("device_tokens")
            .upsert(
                {
                    user_id: userId,
                    push_token: pushToken,
                    device_token: deviceToken,
                    platform,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
            );

        if (error) {
            console.error("Error upserting device token:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Supabase connection error:", error);
        return false;
    }
}

export async function getUserPushToken(
    userId: string
): Promise<string | null> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("device_tokens")
            .select("push_token")
            .eq("user_id", userId)
            .single();

        if (error || !data) {
            return null;
        }

        return data.push_token;
    } catch (error) {
        console.error("Supabase connection error:", error);
        return null;
    }
}

// ── Notification Operations ──

export async function createNotification(
    notification: Omit<Notification, "id" | "created_at">
): Promise<Notification | null> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("notifications")
            .insert(notification)
            .select()
            .single();

        if (error) {
            console.error("Error creating notification log:", error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Supabase connection error:", error);
        return null;
    }
}

export async function getNotificationsByUserId(
    userId: string
): Promise<Notification[]> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("scheduled_at", { ascending: false });

        if (error) {
            console.error("Error fetching notification history:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Supabase connection error:", error);
        return [];
    }
}

export async function updateNotificationStatus(
    scheduledMessageId: string,
    status: NotificationStatus
): Promise<boolean> {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from("notifications")
            .update({ status })
            .eq("scheduled_message_id", scheduledMessageId);

        if (error) {
            console.error("Error updating notification status:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Supabase connection error:", error);
        return false;
    }
}

// ── User Credential Operations ──

/**
 * Upsert encrypted credentials for a user + service combination.
 */
export async function upsertUserCredential(
    userId: string,
    service: string,
    encryptedCredentials: string,
    iv: string,
    authTag: string,
    metadata: Record<string, any> = {}
): Promise<boolean> {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from("user_credentials")
            .upsert(
                {
                    user_id: userId,
                    service,
                    encrypted_credentials: encryptedCredentials,
                    iv,
                    auth_tag: authTag,
                    metadata,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id,service" }
            );

        if (error) {
            console.error("Error upserting user credential:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Supabase connection error:", error);
        return false;
    }
}

/**
 * Get encrypted credential for a specific user + service.
 */
export async function getUserCredential(
    userId: string,
    service: string
): Promise<UserCredential | null> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("user_credentials")
            .select("*")
            .eq("user_id", userId)
            .eq("service", service)
            .single();

        if (error || !data) {
            return null;
        }

        return data;
    } catch (error) {
        console.error("Supabase connection error:", error);
        return null;
    }
}

/**
 * Delete a user's credential for a specific service.
 */
export async function deleteUserCredential(
    userId: string,
    service: string
): Promise<boolean> {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from("user_credentials")
            .delete()
            .eq("user_id", userId)
            .eq("service", service);

        if (error) {
            console.error("Error deleting user credential:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Supabase connection error:", error);
        return false;
    }
}

/**
 * Get all connected services for a user (service names + metadata only, no credentials).
 */
export async function getUserConnectedServices(
    userId: string
): Promise<Array<{ service: string; metadata: Record<string, any>; connected_at: string }>> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("user_credentials")
            .select("service, metadata, connected_at")
            .eq("user_id", userId)
            .order("connected_at", { ascending: true });

        if (error) {
            console.error("Error fetching connected services:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Supabase connection error:", error);
        return [];
    }
}


// ── RevenueCat / Subscription Operations ──

/**
 * Update or create a user's pro status in the profiles table.
 */
export async function updateUserProStatus(
    userId: string,
    isPro: boolean
): Promise<boolean> {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from("profiles")
            .upsert(
                {
                    user_id: userId,
                    is_pro: isPro,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
            );

        if (error) {
            console.error("Error updating user pro status:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Supabase connection error:", error);
        return false;
    }
}

/**
 * Log a RevenueCat webhook event for auditing.
 */
export async function logRevenueCatEvent(
    userId: string,
    eventType: string,
    payload: any
): Promise<boolean> {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from("revenuecat_events")
            .insert({
                user_id: userId,
                event_type: eventType,
                payload,
            });

        if (error) {
            console.error("Error logging RevenueCat event:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Supabase connection error:", error);
        return false;
    }
}
