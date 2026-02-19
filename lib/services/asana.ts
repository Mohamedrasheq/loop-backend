/**
 * Asana Service Plugin
 *
 * Tools: create tasks, list projects, search tasks, add comments.
 * Requires: Personal Access Token from the user.
 */

import { z } from "zod";
import type { ServiceDefinition, ToolResult } from "./base";

const asanaService: ServiceDefinition = {
    name: "asana",
    displayName: "Asana",
    description: "Create tasks, manage projects, and track work in Asana.",

    credentialFields: [
        {
            key: "token",
            label: "Personal Access Token",
            type: "password",
            required: true,
            helpUrl: "https://app.asana.com/0/my-apps",
            placeholder: "1/12345:abcdef...",
        },
    ],

    tools: [
        {
            name: "asana_create_task",
            description: "Create a new task in Asana. Use when the user wants to add a task to their Asana project.",
            inputSchema: z.object({
                projectId: z.string().describe("Project GID to add the task to"),
                name: z.string().describe("Task name"),
                notes: z.string().optional().describe("Task description/notes"),
                due_on: z.string().optional().describe("Due date in YYYY-MM-DD format"),
                assignee: z.string().optional().describe("Assignee email or 'me'"),
            }),
        },
        {
            name: "asana_list_projects",
            description: "List all Asana projects in the user's default workspace. Use to find project IDs.",
            inputSchema: z.object({}),
        },
        {
            name: "asana_search_tasks",
            description: "Search for tasks in Asana. Use when the user wants to find specific tasks.",
            inputSchema: z.object({
                query: z.string().describe("Search query text"),
                projectId: z.string().optional().describe("Limit search to a specific project GID"),
            }),
        },
        {
            name: "asana_add_comment",
            description: "Add a comment to an Asana task. Use when the user wants to leave a note on a task.",
            inputSchema: z.object({
                taskId: z.string().describe("Task GID"),
                text: z.string().describe("Comment text"),
            }),
        },
        {
            name: "asana_complete_task",
            description: "Mark an Asana task as complete. Use when the user has finished a task.",
            inputSchema: z.object({
                taskId: z.string().describe("Task GID to complete"),
            }),
        },
    ],

    async execute(toolName, params, credentials): Promise<ToolResult> {
        const token = credentials.token;
        if (!token) return { success: false, error: "Asana token not found. Please reconnect Asana." };

        const baseUrl = "https://app.asana.com/api/1.0";
        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        };

        try {
            switch (toolName) {
                case "asana_create_task": {
                    const data: any = {
                        name: params.name,
                        projects: [params.projectId],
                    };
                    if (params.notes) data.notes = params.notes;
                    if (params.due_on) data.due_on = params.due_on;
                    if (params.assignee) data.assignee = params.assignee;

                    const res = await fetch(`${baseUrl}/tasks`, {
                        method: "POST", headers, body: JSON.stringify({ data }),
                    });
                    if (!res.ok) {
                        const err = await res.json();
                        return { success: false, error: `Asana Error: ${err.errors?.[0]?.message || res.statusText}` };
                    }
                    const task = await res.json();
                    const url = `https://app.asana.com/0/0/${task.data.gid}`;
                    return { success: true, data: { gid: task.data.gid, url }, displayMessage: `Task created: ${url}` };
                }

                case "asana_list_projects": {
                    // Get default workspace first
                    const meRes = await fetch(`${baseUrl}/users/me?opt_fields=workspaces.name`, { headers });
                    if (!meRes.ok) return { success: false, error: "Failed to get Asana user info" };
                    const me = await meRes.json();
                    const workspace = me.data.workspaces?.[0];
                    if (!workspace) return { success: false, error: "No Asana workspace found" };

                    const res = await fetch(`${baseUrl}/workspaces/${workspace.gid}/projects?opt_fields=name,created_at&limit=50`, { headers });
                    if (!res.ok) return { success: false, error: "Failed to list projects" };
                    const projects = await res.json();
                    const list = projects.data.map((p: any) => ({ gid: p.gid, name: p.name }));
                    return { success: true, data: list, displayMessage: `Found ${list.length} projects.` };
                }

                case "asana_search_tasks": {
                    const meRes = await fetch(`${baseUrl}/users/me?opt_fields=workspaces`, { headers });
                    const me = await meRes.json();
                    const workspace = me.data.workspaces?.[0];
                    if (!workspace) return { success: false, error: "No Asana workspace found" };

                    let url = `${baseUrl}/workspaces/${workspace.gid}/tasks/search?text=${encodeURIComponent(params.query)}&opt_fields=name,completed,due_on,assignee.name&limit=20`;
                    if (params.projectId) url += `&projects.any=${params.projectId}`;
                    const res = await fetch(url, { headers });
                    if (!res.ok) return { success: false, error: "Search failed" };
                    const tasks = await res.json();
                    return { success: true, data: tasks.data, displayMessage: `Found ${tasks.data.length} tasks.` };
                }

                case "asana_add_comment": {
                    const res = await fetch(`${baseUrl}/tasks/${params.taskId}/stories`, {
                        method: "POST", headers,
                        body: JSON.stringify({ data: { text: params.text } }),
                    });
                    if (!res.ok) return { success: false, error: "Failed to add comment" };
                    return { success: true, data: {}, displayMessage: `Comment added to task.` };
                }

                case "asana_complete_task": {
                    const res = await fetch(`${baseUrl}/tasks/${params.taskId}`, {
                        method: "PUT", headers,
                        body: JSON.stringify({ data: { completed: true } }),
                    });
                    if (!res.ok) return { success: false, error: "Failed to complete task" };
                    return { success: true, data: {}, displayMessage: `Task marked as complete.` };
                }

                default:
                    return { success: false, error: `Unknown tool: ${toolName}` };
            }
        } catch (error: any) {
            return { success: false, error: `Asana error: ${error.message}` };
        }
    },
};

export default asanaService;
