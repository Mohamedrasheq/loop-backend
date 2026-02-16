import { google } from "googleapis";

/**
 * Gmail Service Layer
 * Level 2: Simple draft creation via OAuth2.
 */

function getOAuth2Client() {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error("Missing Google OAuth2 credentials in environment variables.");
    }

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    return oAuth2Client;
}

export async function createGmailDraft(to: string, subject: string, body: string) {
    const auth = getOAuth2Client();
    const gmail = google.gmail({ version: "v1", auth });

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
    const messageParts = [
        `To: ${to}`,
        "Content-Type: text/html; charset=utf-8",
        "MIME-Version: 1.0",
        `Subject: ${utf8Subject}`,
        "",
        body,
    ];
    const message = messageParts.join("\n");

    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    const res = await gmail.users.drafts.create({
        userId: "me",
        requestBody: {
            message: {
                raw: encodedMessage,
            },
        },
    });

    return res.data;
}

export async function listRecentEmails() {
    const auth = getOAuth2Client();
    const gmail = google.gmail({ version: "v1", auth });

    const res = await gmail.users.messages.list({
        userId: "me",
        maxResults: 10,
    });

    const messages = res.data.messages || [];
    const detailedMessages = await Promise.all(
        messages.map(async (msg) => {
            const detail = await gmail.users.messages.get({
                userId: "me",
                id: msg.id!,
            });
            return detail.data;
        })
    );

    return detailedMessages.map((msg) => {
        const headers = msg.payload?.headers || [];
        const subject = headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
        const from = headers.find((h) => h.name === "From")?.value || "(Unknown)";
        return {
            id: msg.id,
            threadId: msg.threadId,
            subject,
            from,
            snippet: msg.snippet,
        };
    });
}
