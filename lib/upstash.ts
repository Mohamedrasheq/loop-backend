import { Client } from "@upstash/qstash";

const qstashClient = new Client({
    token: process.env.QSTASH_TOKEN || "PLACEHOLDER",
    baseUrl: process.env.QSTASH_URL,
});

export interface ScheduledNotification {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    scheduledFor: Date;
}

/**
 * Schedules a push notification message via Upstash QStash.
 * Returns the messageId from QStash.
 */
export async function scheduleNotification(
    payload: ScheduledNotification
): Promise<string | null> {
    try {
        const { userId, title, body, data, scheduledFor } = payload;

        // Use the absolute URL for the worker endpoint
        // NOTE: In production, this must be a public URL
        const workerUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/push-worker`;

        const response = await qstashClient.publishJSON({
            url: workerUrl,
            body: { userId, title, body, data },
            notBefore: Math.floor(scheduledFor.getTime() / 1000), // QStash uses unix seconds
        });

        return response.messageId;
    } catch (error) {
        console.error("Error scheduling notification with QStash:", error);
        return null;
    }
}
