/**
 * Gmail Service Plugin
 * 
 * Tools: create drafts, list recent emails.
 * Requires: OAuth2 credentials (clientId, clientSecret, refreshToken) from the user.
 */

import { z } from "zod";
import { google } from "googleapis";
import type { ServiceDefinition, ToolResult } from "./base";

const gmailService: ServiceDefinition = {
    name: "gmail",
    displayName: "Gmail",
    description: "Create email drafts and browse recent emails in Gmail.",

    credentialFields: [
        {
            key: "clientId",
            label: "Google OAuth Client ID",
            type: "text",
            required: true,
            helpUrl: "https://console.cloud.google.com/apis/credentials",
        },
        {
            key: "clientSecret",
            label: "Google OAuth Client Secret",
            type: "password",
            required: true,
        },
        {
            key: "refreshToken",
            label: "Refresh Token",
            type: "password",
            required: true,
            helpUrl: "https://developers.google.com/oauthplayground/",
        },
    ],

    tools: [
        {
            name: "gmail_create_draft",
            description: "Create a draft email in the user's Gmail. Use when the user wants to draft or compose an email.",
            inputSchema: z.object({
                to: z.string().describe("Recipient email address"),
                subject: z.string().describe("Email subject line"),
                body: z.string().describe("Email body (HTML supported)"),
            }),
        },
        {
            name: "gmail_list_recent",
            description: "List the user's recent emails. Use when the user asks about their inbox or recent messages.",
            inputSchema: z.object({
                maxResults: z.number().optional().default(10).describe("Number of emails to fetch (default 10)"),
            }),
        },
    ],

    async execute(toolName, params, credentials): Promise<ToolResult> {
        const { clientId, clientSecret, refreshToken } = credentials;
        if (!clientId || !clientSecret || !refreshToken) {
            return { success: false, error: "Gmail OAuth credentials incomplete. Please reconnect Gmail." };
        }

        try {
            const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
            oAuth2Client.setCredentials({ refresh_token: refreshToken });
            const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

            switch (toolName) {
                case "gmail_create_draft": {
                    const utf8Subject = `=?utf-8?B?${Buffer.from(params.subject).toString("base64")}?=`;
                    const messageParts = [
                        `To: ${params.to}`,
                        "Content-Type: text/html; charset=utf-8",
                        "MIME-Version: 1.0",
                        `Subject: ${utf8Subject}`,
                        "",
                        params.body,
                    ];
                    const message = messageParts.join("\n");
                    const encodedMessage = Buffer.from(message)
                        .toString("base64")
                        .replace(/\+/g, "-")
                        .replace(/\//g, "_")
                        .replace(/=+$/, "");

                    const res = await gmail.users.drafts.create({
                        userId: "me",
                        requestBody: { message: { raw: encodedMessage } },
                    });

                    return {
                        success: true,
                        data: { draftId: res.data.id },
                        displayMessage: `Gmail draft created for ${params.to}: "${params.subject}"`,
                    };
                }

                case "gmail_list_recent": {
                    const res = await gmail.users.messages.list({
                        userId: "me",
                        maxResults: params.maxResults || 10,
                    });

                    const messages = res.data.messages || [];
                    const detailed = await Promise.all(
                        messages.map(async (msg) => {
                            const detail = await gmail.users.messages.get({ userId: "me", id: msg.id! });
                            const headers = detail.data.payload?.headers || [];
                            return {
                                id: detail.data.id,
                                threadId: detail.data.threadId,
                                subject: headers.find((h) => h.name === "Subject")?.value || "(No Subject)",
                                from: headers.find((h) => h.name === "From")?.value || "(Unknown)",
                                snippet: detail.data.snippet,
                            };
                        })
                    );

                    return {
                        success: true,
                        data: detailed,
                        displayMessage: `Found ${detailed.length} recent emails.`,
                    };
                }

                default:
                    return { success: false, error: `Unknown tool: ${toolName}` };
            }
        } catch (error: any) {
            return { success: false, error: `Gmail error: ${error.message}` };
        }
    },
};

export default gmailService;
