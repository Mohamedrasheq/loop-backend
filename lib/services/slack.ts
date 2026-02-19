/**
 * Slack Service Plugin
 * 
 * Tools: send messages, list channels.
 * Requires: Bot User OAuth Token from the user.
 * 
 * This plugin demonstrates extensibility — adding a new service
 * requires only this single file + importing it in registry.ts.
 */

import { z } from "zod";
import type { ServiceDefinition, ToolResult } from "./base";

const slackService: ServiceDefinition = {
    name: "slack",
    displayName: "Slack",
    description: "Send messages and browse channels in Slack.",

    credentialFields: [
        {
            key: "botToken",
            label: "Bot User OAuth Token",
            type: "password",
            required: true,
            helpUrl: "https://api.slack.com/apps",
            placeholder: "xoxb-xxxxxxxxxxxx",
        },
    ],

    tools: [
        {
            name: "slack_send_message",
            description: "Send a message to a Slack channel. Use when the user wants to post a message to a Slack channel or DM.",
            inputSchema: z.object({
                channel: z.string().describe("Channel ID or name (e.g. '#general' or 'C01234ABCDE')"),
                text: z.string().describe("Message text (supports Slack Markdown/mrkdwn)"),
            }),
        },
        {
            name: "slack_list_channels",
            description: "List available Slack channels. Use when you need to find the right channel to post to.",
            inputSchema: z.object({
                limit: z.number().optional().default(50).describe("Max channels to return (default 50)"),
            }),
        },
    ],

    async execute(toolName, params, credentials): Promise<ToolResult> {
        const token = credentials.botToken;
        if (!token) {
            return { success: false, error: "Slack bot token not found. Please reconnect Slack." };
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=utf-8",
        };

        try {
            switch (toolName) {
                case "slack_send_message": {
                    const response = await fetch("https://slack.com/api/chat.postMessage", {
                        method: "POST",
                        headers,
                        body: JSON.stringify({
                            channel: params.channel,
                            text: params.text,
                        }),
                    });

                    const result = await response.json();
                    if (!result.ok) {
                        return { success: false, error: `Slack API Error: ${result.error}` };
                    }

                    return {
                        success: true,
                        data: { channel: result.channel, ts: result.ts },
                        displayMessage: `Message sent to ${params.channel}.`,
                    };
                }

                case "slack_list_channels": {
                    const response = await fetch(
                        `https://slack.com/api/conversations.list?limit=${params.limit || 50}&types=public_channel,private_channel`,
                        { headers }
                    );

                    const result = await response.json();
                    if (!result.ok) {
                        return { success: false, error: `Slack API Error: ${result.error}` };
                    }

                    const channels = result.channels.map((c: any) => ({
                        id: c.id,
                        name: c.name,
                        is_private: c.is_private,
                        num_members: c.num_members,
                    }));

                    return {
                        success: true,
                        data: channels,
                        displayMessage: `Found ${channels.length} channels.`,
                    };
                }

                default:
                    return { success: false, error: `Unknown tool: ${toolName}` };
            }
        } catch (error: any) {
            return { success: false, error: `Slack error: ${error.message}` };
        }
    },
};

export default slackService;
