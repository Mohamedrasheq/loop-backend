/**
 * Notion Service Plugin
 *
 * Tools: create pages, search pages, create database entries, list databases.
 * Requires: Internal Integration Token from the user.
 */

import { z } from "zod";
import type { ServiceDefinition, ToolResult } from "./base";

const notionService: ServiceDefinition = {
    name: "notion",
    displayName: "Notion",
    description: "Create pages, search your workspace, and manage databases in Notion.",

    credentialFields: [
        {
            key: "token",
            label: "Internal Integration Token",
            type: "password",
            required: true,
            helpUrl: "https://www.notion.so/my-integrations",
            placeholder: "ntn_xxxxxxxxxxxx",
        },
    ],

    tools: [
        {
            name: "notion_create_page",
            description: "Create a new page in Notion under a parent page or database. Use when the user wants to create notes, documentation, or wiki pages.",
            inputSchema: z.object({
                parentId: z.string().describe("Parent page or database ID to create under"),
                title: z.string().describe("Page title"),
                content: z.string().describe("Page content in plain text (will be converted to blocks)"),
            }),
        },
        {
            name: "notion_search",
            description: "Search across the user's Notion workspace. Use when the user wants to find pages, databases, or specific content.",
            inputSchema: z.object({
                query: z.string().describe("Search query"),
            }),
        },
        {
            name: "notion_list_databases",
            description: "List all databases in the user's Notion workspace. Use to find database IDs for adding entries.",
            inputSchema: z.object({}),
        },
        {
            name: "notion_add_database_entry",
            description: "Add a new entry (row) to a Notion database. Use when the user wants to add items to a tracker, table, or project board.",
            inputSchema: z.object({
                databaseId: z.string().describe("The database ID to add the entry to"),
                title: z.string().describe("Title/name property value for the new entry"),
                properties: z.string().optional().describe("JSON string of additional properties to set, e.g. '{\"Status\": \"In Progress\"}'"),
            }),
        },
    ],

    async execute(toolName, params, credentials): Promise<ToolResult> {
        const token = credentials.token;
        if (!token) return { success: false, error: "Notion token not found. Please reconnect Notion." };

        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
        };

        try {
            switch (toolName) {
                case "notion_create_page": {
                    const body: any = {
                        parent: { page_id: params.parentId },
                        properties: { title: [{ text: { content: params.title } }] },
                        children: [
                            {
                                object: "block",
                                type: "paragraph",
                                paragraph: {
                                    rich_text: [{ type: "text", text: { content: params.content } }],
                                },
                            },
                        ],
                    };
                    // Try as page parent first, fallback to database parent
                    let res = await fetch("https://api.notion.com/v1/pages", {
                        method: "POST", headers, body: JSON.stringify(body),
                    });
                    if (!res.ok && res.status === 400) {
                        body.parent = { database_id: params.parentId };
                        body.properties = { Name: { title: [{ text: { content: params.title } }] } };
                        res = await fetch("https://api.notion.com/v1/pages", {
                            method: "POST", headers, body: JSON.stringify(body),
                        });
                    }
                    if (!res.ok) {
                        const err = await res.json();
                        return { success: false, error: `Notion Error: ${err.message || res.statusText}` };
                    }
                    const page = await res.json();
                    return {
                        success: true,
                        data: { id: page.id, url: page.url },
                        displayMessage: `Page created: ${page.url}`,
                    };
                }

                case "notion_search": {
                    const res = await fetch("https://api.notion.com/v1/search", {
                        method: "POST", headers,
                        body: JSON.stringify({ query: params.query, page_size: 10 }),
                    });
                    if (!res.ok) {
                        const err = await res.json();
                        return { success: false, error: `Notion Error: ${err.message}` };
                    }
                    const data = await res.json();
                    const results = data.results.map((r: any) => ({
                        id: r.id,
                        type: r.object,
                        title: r.properties?.title?.title?.[0]?.plain_text
                            || r.properties?.Name?.title?.[0]?.plain_text
                            || r.title?.[0]?.plain_text
                            || "Untitled",
                        url: r.url,
                    }));
                    return {
                        success: true,
                        data: results,
                        displayMessage: `Found ${results.length} results for "${params.query}".`,
                    };
                }

                case "notion_list_databases": {
                    const res = await fetch("https://api.notion.com/v1/search", {
                        method: "POST", headers,
                        body: JSON.stringify({ filter: { value: "database", property: "object" }, page_size: 20 }),
                    });
                    if (!res.ok) {
                        const err = await res.json();
                        return { success: false, error: `Notion Error: ${err.message}` };
                    }
                    const data = await res.json();
                    const databases = data.results.map((db: any) => ({
                        id: db.id,
                        title: db.title?.[0]?.plain_text || "Untitled",
                        url: db.url,
                    }));
                    return {
                        success: true,
                        data: databases,
                        displayMessage: `Found ${databases.length} databases.`,
                    };
                }

                case "notion_add_database_entry": {
                    const props: any = {
                        Name: { title: [{ text: { content: params.title } }] },
                    };
                    if (params.properties) {
                        try {
                            const extra = JSON.parse(params.properties);
                            for (const [key, value] of Object.entries(extra)) {
                                props[key] = { rich_text: [{ text: { content: String(value) } }] };
                            }
                        } catch { /* ignore parse errors for extra props */ }
                    }
                    const res = await fetch("https://api.notion.com/v1/pages", {
                        method: "POST", headers,
                        body: JSON.stringify({
                            parent: { database_id: params.databaseId },
                            properties: props,
                        }),
                    });
                    if (!res.ok) {
                        const err = await res.json();
                        return { success: false, error: `Notion Error: ${err.message}` };
                    }
                    const entry = await res.json();
                    return {
                        success: true,
                        data: { id: entry.id, url: entry.url },
                        displayMessage: `Entry added: ${entry.url}`,
                    };
                }

                default:
                    return { success: false, error: `Unknown tool: ${toolName}` };
            }
        } catch (error: any) {
            return { success: false, error: `Notion error: ${error.message}` };
        }
    },
};

export default notionService;
