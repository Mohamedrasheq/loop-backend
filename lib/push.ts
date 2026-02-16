/**
 * Expo Push Notification Helper
 *
 * Sends push notifications via the Expo Push API.
 * Works with both iOS (APNS) and Android (FCM) through Expo's unified service.
 *
 * Flow: Backend → Expo Push API → APNS/FCM → User's device
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export interface PushNotificationPayload {
    to: string;           // ExponentPushToken[...]
    title: string;
    body: string;
    sound?: "default" | null;
    data?: Record<string, any>;  // Custom data (e.g. { screen: "chat", itemId: "..." })
    badge?: number;
    categoryId?: string;
}

/**
 * Send a push notification to a single device.
 */
export async function sendPushNotification(
    pushToken: string,
    title: string,
    body: string,
    data?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
    try {
        const payload: PushNotificationPayload = {
            to: pushToken,
            title,
            body,
            sound: "default",
            data,
        };

        const response = await fetch(EXPO_PUSH_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.data?.status === "error") {
            console.error("Push notification error:", result.data.message);
            return { success: false, error: result.data.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error sending push notification:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Send push notifications to multiple devices at once.
 * Expo Push API supports batching up to 100 notifications per request.
 */
export async function sendBatchPushNotifications(
    notifications: PushNotificationPayload[]
): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(EXPO_PUSH_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
            },
            body: JSON.stringify(notifications),
        });

        const result = await response.json();
        return { success: true };
    } catch (error: any) {
        console.error("Error sending batch push notifications:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Send a push notification to a user by looking up their device token.
 * Convenience wrapper that handles the Supabase lookup.
 */
export async function notifyUser(
    getUserPushToken: () => Promise<string | null>,
    title: string,
    body: string,
    data?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
    const pushToken = await getUserPushToken();

    if (!pushToken) {
        return { success: false, error: "No push token found for user" };
    }

    return sendPushNotification(pushToken, title, body, data);
}
