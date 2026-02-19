/**
 * Discord Service Plugin
 *
 * Tools: send messages, list channels, list servers.
 * Requires: Bot Token from the user.
 */

import { z } from "zod";
import type { ServiceDefinition, ToolResult } from "./base";

const discordService: ServiceDefinition = {
    name: "discord",
    displayName: "Discord",
    description: "Send messages, manage channels, and interact with your Discord servers.",

    credentialFields: [
        {
            key: "botToken",
            label: "Bot Token",
            type: "password",
            required: true,
            helpUrl: "https://discord.com/developers/applications",
            placeholder: "MTExxx.Gxxxx.xxxx",
        },
    ],

    tools: [
        {
            name: "discord_send_message",
            description: "Send a message to a Discord channel. Use when the user wants to post to a Discord channel.",
            inputSchema: z.object({
                channelId: z.string().describe("The channel ID to send the message to"),
                content: z.string().describe("Message content (supports Markdown)"),
            }),
        },
        {
            name: "discord_list_servers",
            description: "List Discord servers (guilds) the bot is in. Use to find server and channel IDs.",
            inputSchema: z.object({}),
        },
        {
            name: "discord_list_channels",
            description: "List channels in a Discord server. Use to find channel IDs for sending messages.",
            inputSchema: z.object({
                guildId: z.string().describe("Server (guild) ID"),
            }),
        },
        {
            name: "discord_create_thread",
            description: "Create a thread in a Discord channel. Use when the user wants to start a discussion in a channel.",
            inputSchema: z.object({
                channelId: z.string().describe("Channel ID to create the thread in"),
                name: z.string().describe("Thread name"),
                message: z.string().describe("Initial message content"),
            }),
        },
    ],

    async execute(toolName, params, credentials): Promise<ToolResult> {
        const token = credentials.botToken;
        if (!token) return { success: false, error: "Discord bot token not found. Please reconnect Discord." };

        const baseUrl = "https://discord.com/api/v10";
        const headers = {
            Authorization: `Bot ${token}`,
            "Content-Type": "application/json",
        };

        try {
            switch (toolName) {
                case "discord_send_message": {
                    const res = await fetch(`${baseUrl}/channels/${params.channelId}/messages`, {
                        method: "POST", headers,
                        body: JSON.stringify({ content: params.content }),
                    });
                    if (!res.ok) {
                        const err = await res.json();
                        return { success: false, error: `Discord Error: ${err.message || res.statusText}` };
                    }
                    const msg = await res.json();
                    return { success: true, data: { id: msg.id }, displayMessage: `Message sent to channel.` };
                }

                case "discord_list_servers": {
                    const res = await fetch(`${baseUrl}/users/@me/guilds`, { headers });
                    if (!res.ok) return { success: false, error: `Discord Error: ${res.statusText}` };
                    const guilds = await res.json();
                    return {
                        success: true,
                        data: guilds.map((g: any) => ({ id: g.id, name: g.name })),
                        displayMessage: `Found ${guilds.length} servers.`,
                    };
                }

                case "discord_list_channels": {
                    const res = await fetch(`${baseUrl}/guilds/${params.guildId}/channels`, { headers });
                    if (!res.ok) return { success: false, error: `Discord Error: ${res.statusText}` };
                    const channels = await res.json();
                    // Filter to text channels (type 0)
                    const textChannels = channels
                        .filter((c: any) => c.type === 0)
                        .map((c: any) => ({ id: c.id, name: c.name, position: c.position }));
                    return { success: true, data: textChannels, displayMessage: `Found ${textChannels.length} text channels.` };
                }

                case "discord_create_thread": {
                    // First send a message, then create a thread from it
                    const msgRes = await fetch(`${baseUrl}/channels/${params.channelId}/messages`, {
                        method: "POST", headers,
                        body: JSON.stringify({ content: params.message }),
                    });
                    if (!msgRes.ok) return { success: false, error: `Failed to send initial message` };
                    const msg = await msgRes.json();

                    const threadRes = await fetch(`${baseUrl}/channels/${params.channelId}/messages/${msg.id}/threads`, {
                        method: "POST", headers,
                        body: JSON.stringify({ name: params.name }),
                    });
                    if (!threadRes.ok) return { success: false, error: `Failed to create thread` };
                    const thread = await threadRes.json();
                    return { success: true, data: { id: thread.id, name: thread.name }, displayMessage: `Thread "${params.name}" created.` };
                }

                default:
                    return { success: false, error: `Unknown tool: ${toolName}` };
            }
        } catch (error: any) {
            return { success: false, error: `Discord error: ${error.message}` };
        }
    },
};

export default discordService;
