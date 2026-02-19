/**
 * Jira Service Plugin
 *
 * Tools: create issues, search issues, list projects, add comments.
 * Requires: API Token + email + Jira domain from the user.
 */

import { z } from "zod";
import type { ServiceDefinition, ToolResult } from "./base";

const jiraService: ServiceDefinition = {
    name: "jira",
    displayName: "Jira",
    description: "Create issues, search tickets, and manage projects in Jira.",

    credentialFields: [
        {
            key: "domain",
            label: "Jira Domain",
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
            name: "jira_create_issue",
            description: "Create a new Jira issue (bug, task, story, etc). Use when the user wants to file a ticket in Jira.",
            inputSchema: z.object({
                projectKey: z.string().describe("Project key, e.g. 'PROJ'"),
                summary: z.string().describe("Issue summary/title"),
                description: z.string().describe("Issue description"),
                issueType: z.string().optional().describe("Issue type: Task, Bug, Story, Epic. Defaults to 'Task'."),
                priority: z.string().optional().describe("Priority: Highest, High, Medium, Low, Lowest"),
            }),
        },
        {
            name: "jira_search",
            description: "Search for Jira issues using JQL or a text query. Use when the user wants to find tickets.",
            inputSchema: z.object({
                query: z.string().describe("JQL or text to search for, e.g. 'project = PROJ AND status = Open' or just plain text"),
            }),
        },
        {
            name: "jira_list_projects",
            description: "List all Jira projects. Use to find project keys before creating issues.",
            inputSchema: z.object({}),
        },
        {
            name: "jira_add_comment",
            description: "Add a comment to an existing Jira issue. Use when the user wants to update a ticket.",
            inputSchema: z.object({
                issueKey: z.string().describe("Issue key, e.g. 'PROJ-123'"),
                comment: z.string().describe("Comment text"),
            }),
        },
    ],

    async execute(toolName, params, credentials): Promise<ToolResult> {
        const { domain, email, apiToken } = credentials;
        if (!domain || !email || !apiToken) {
            return { success: false, error: "Jira credentials incomplete. Please reconnect Jira." };
        }

        const baseUrl = `https://${domain}/rest/api/3`;
        const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");
        const headers = {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        };

        try {
            switch (toolName) {
                case "jira_create_issue": {
                    const body = {
                        fields: {
                            project: { key: params.projectKey },
                            summary: params.summary,
                            description: {
                                type: "doc", version: 1,
                                content: [{ type: "paragraph", content: [{ type: "text", text: params.description }] }],
                            },
                            issuetype: { name: params.issueType || "Task" },
                            ...(params.priority ? { priority: { name: params.priority } } : {}),
                        },
                    };
                    const res = await fetch(`${baseUrl}/issue`, { method: "POST", headers, body: JSON.stringify(body) });
                    if (!res.ok) {
                        const err = await res.json();
                        return { success: false, error: `Jira Error: ${JSON.stringify(err.errors || err.errorMessages)}` };
                    }
                    const issue = await res.json();
                    const url = `https://${domain}/browse/${issue.key}`;
                    return { success: true, data: { key: issue.key, url }, displayMessage: `Issue created: ${url}` };
                }

                case "jira_search": {
                    const jql = params.query.includes("=") ? params.query : `text ~ "${params.query}"`;
                    const res = await fetch(`${baseUrl}/search?jql=${encodeURIComponent(jql)}&maxResults=15&fields=summary,status,priority,assignee`, { headers });
                    if (!res.ok) {
                        const err = await res.json();
                        return { success: false, error: `Jira Error: ${err.errorMessages?.join(", ") || res.statusText}` };
                    }
                    const data = await res.json();
                    const issues = data.issues.map((i: any) => ({
                        key: i.key,
                        summary: i.fields.summary,
                        status: i.fields.status?.name,
                        priority: i.fields.priority?.name,
                        url: `https://${domain}/browse/${i.key}`,
                    }));
                    return { success: true, data: issues, displayMessage: `Found ${issues.length} issues.` };
                }

                case "jira_list_projects": {
                    const res = await fetch(`${baseUrl}/project?maxResults=50`, { headers });
                    if (!res.ok) return { success: false, error: "Failed to list projects" };
                    const projects = await res.json();
                    const list = projects.map((p: any) => ({
                        key: p.key, name: p.name, style: p.style,
                    }));
                    return { success: true, data: list, displayMessage: `Found ${list.length} projects.` };
                }

                case "jira_add_comment": {
                    const body = {
                        body: {
                            type: "doc", version: 1,
                            content: [{ type: "paragraph", content: [{ type: "text", text: params.comment }] }],
                        },
                    };
                    const res = await fetch(`${baseUrl}/issue/${params.issueKey}/comment`, { method: "POST", headers, body: JSON.stringify(body) });
                    if (!res.ok) {
                        const err = await res.json();
                        return { success: false, error: `Jira Error: ${err.errorMessages?.join(", ")}` };
                    }
                    return { success: true, data: {}, displayMessage: `Comment added to ${params.issueKey}.` };
                }

                default:
                    return { success: false, error: `Unknown tool: ${toolName}` };
            }
        } catch (error: any) {
            return { success: false, error: `Jira error: ${error.message}` };
        }
    },
};

export default jiraService;
