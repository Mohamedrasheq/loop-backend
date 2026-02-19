/**
 * Confluence Service Plugin
 *
 * Tools: create pages, search content, list spaces.
 * Requires: API Token + email + Confluence domain from the user.
 */

import { z } from "zod";
import type { ServiceDefinition, ToolResult } from "./base";

const confluenceService: ServiceDefinition = {
    name: "confluence",
    displayName: "Confluence",
    description: "Create documentation, search content, and manage pages in Confluence.",

    credentialFields: [
        {
            key: "domain",
            label: "Confluence Domain",
            type: "text",
            required: true,
            placeholder: "yourcompany.atlassian.net",
        },
        {
            key: "email",
            label: "Email Address",
            type: "text",
            required: true,
            placeholder: "you@company.com",
        },
        {
            key: "apiToken",
            label: "API Token",
            type: "password",
            required: true,
            helpUrl: "https://id.atlassian.com/manage-profile/security/api-tokens",
            placeholder: "ATATT3xFfGF0...",
        },
    ],

    tools: [
        {
            name: "confluence_create_page",
            description: "Create a new page in Confluence. Use when the user wants to write documentation, meeting notes, or knowledge base articles.",
            inputSchema: z.object({
                spaceKey: z.string().describe("Space key, e.g. 'ENG' or 'TEAM'"),
                title: z.string().describe("Page title"),
                body: z.string().describe("Page body content in plain text or HTML"),
                parentId: z.string().optional().describe("Parent page ID to nest under"),
            }),
        },
        {
            name: "confluence_search",
            description: "Search Confluence content using CQL or text. Use when the user wants to find documentation.",
            inputSchema: z.object({
                query: z.string().describe("Search query (CQL or plain text)"),
            }),
        },
        {
            name: "confluence_list_spaces",
            description: "List all Confluence spaces. Use to find space keys for creating pages.",
            inputSchema: z.object({}),
        },
        {
            name: "confluence_get_page",
            description: "Get the content of a specific Confluence page. Use when the user wants to read a page.",
            inputSchema: z.object({
                pageId: z.string().describe("Page ID to retrieve"),
            }),
        },
    ],

    async execute(toolName, params, credentials): Promise<ToolResult> {
        const { domain, email, apiToken } = credentials;
        if (!domain || !email || !apiToken) {
            return { success: false, error: "Confluence credentials incomplete. Please reconnect." };
        }

        const baseUrl = `https://${domain}/wiki/api/v2`;
        const legacyUrl = `https://${domain}/wiki/rest/api`;
        const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");
        const headers = {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        };

        try {
            switch (toolName) {
                case "confluence_create_page": {
                    // Use v1 API for page creation with storage format
                    const body: any = {
                        type: "page",
                        title: params.title,
                        space: { key: params.spaceKey },
                        body: {
                            storage: {
                                value: params.body.startsWith("<") ? params.body : `<p>${params.body.replace(/\n/g, "</p><p>")}</p>`,
                                representation: "storage",
                            },
                        },
                    };
                    if (params.parentId) {
                        body.ancestors = [{ id: params.parentId }];
                    }
                    const res = await fetch(`${legacyUrl}/content`, {
                        method: "POST", headers, body: JSON.stringify(body),
                    });
                    if (!res.ok) {
                        const err = await res.json();
                        return { success: false, error: `Confluence Error: ${err.message || res.statusText}` };
                    }
                    const page = await res.json();
                    const url = `https://${domain}/wiki${page._links?.webui || ""}`;
                    return { success: true, data: { id: page.id, url }, displayMessage: `Page created: ${url}` };
                }

                case "confluence_search": {
                    const cql = params.query.includes("=")
                        ? params.query
                        : `text ~ "${params.query}" OR title ~ "${params.query}"`;
                    const res = await fetch(`${legacyUrl}/content/search?cql=${encodeURIComponent(cql)}&limit=15`, { headers });
                    if (!res.ok) return { success: false, error: `Search failed: ${res.statusText}` };
                    const data = await res.json();
                    const results = data.results.map((r: any) => ({
                        id: r.id,
                        title: r.title,
                        type: r.type,
                        url: `https://${domain}/wiki${r._links?.webui || ""}`,
                    }));
                    return { success: true, data: results, displayMessage: `Found ${results.length} results.` };
                }

                case "confluence_list_spaces": {
                    const res = await fetch(`${baseUrl}/spaces?limit=50`, { headers });
                    if (!res.ok) return { success: false, error: `Failed to list spaces: ${res.statusText}` };
                    const data = await res.json();
                    const spaces = data.results.map((s: any) => ({
                        id: s.id, key: s.key, name: s.name, type: s.type,
                    }));
                    return { success: true, data: spaces, displayMessage: `Found ${spaces.length} spaces.` };
                }

                case "confluence_get_page": {
                    const res = await fetch(`${legacyUrl}/content/${params.pageId}?expand=body.view`, { headers });
                    if (!res.ok) return { success: false, error: `Page not found: ${res.statusText}` };
                    const page = await res.json();
                    // Strip HTML tags for readable content
                    const content = page.body?.view?.value?.replace(/<[^>]*>/g, "") || "";
                    return {
                        success: true,
                        data: { id: page.id, title: page.title, content: content.substring(0, 3000) },
                        displayMessage: `Retrieved page: "${page.title}"`,
                    };
                }

                default:
                    return { success: false, error: `Unknown tool: ${toolName}` };
            }
        } catch (error: any) {
            return { success: false, error: `Confluence error: ${error.message}` };
        }
    },
};

export default confluenceService;
