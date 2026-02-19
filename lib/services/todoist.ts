/**
 * Todoist Service Plugin
 *
 * Tools: create tasks, list tasks, complete tasks, list projects.
 * Requires: API Token from the user.
 */

import { z } from "zod";
import type { ServiceDefinition, ToolResult } from "./base";

const todoistService: ServiceDefinition = {
    name: "todoist",
    displayName: "Todoist",
    description: "Create tasks, manage projects, and stay organized with Todoist.",

    credentialFields: [
        {
            key: "token",
            label: "API Token",
            type: "password",
            required: true,
            helpUrl: "https://todoist.com/prefs/integrations",
            placeholder: "Your Todoist API token",
        },
    ],

    tools: [
        {
            name: "todoist_create_task",
            description: "Create a new task in Todoist. Use when the user wants to add a todo item.",
            inputSchema: z.object({
                content: z.string().describe("Task content/title"),
                description: z.string().optional().describe("Task description"),
                project_id: z.string().optional().describe("Project ID to add to (uses Inbox if omitted)"),
                due_string: z.string().optional().describe("Natural language due date, e.g. 'tomorrow', 'next Monday', 'Jan 25'"),
                priority: z.number().optional().describe("Priority 1-4 (4 is urgent, 1 is natural)"),
                labels: z.string().optional().describe("Comma-separated label names"),
            }),
        },
        {
            name: "todoist_list_tasks",
            description: "List active tasks in Todoist, optionally filtered by project. Use when the user asks about their todos.",
            inputSchema: z.object({
                project_id: z.string().optional().describe("Filter by project ID"),
                filter: z.string().optional().describe("Todoist filter query, e.g. 'today', 'overdue', 'p1'"),
            }),
        },
        {
            name: "todoist_complete_task",
            description: "Mark a task as complete in Todoist. Use when the user has finished a task.",
            inputSchema: z.object({
                taskId: z.string().describe("Task ID to complete"),
            }),
        },
        {
            name: "todoist_list_projects",
            description: "List all Todoist projects. Use to find project IDs.",
            inputSchema: z.object({}),
        },
        {
            name: "todoist_create_project",
            description: "Create a new Todoist project. Use when the user wants to organize tasks into a new project.",
            inputSchema: z.object({
                name: z.string().describe("Project name"),
                color: z.string().optional().describe("Color name: berry_red, red, orange, yellow, olive_green, lime_green, green, mint_green, teal, sky_blue, light_blue, blue, grape, violet, lavender, magenta, salmon, charcoal"),
            }),
        },
    ],

    async execute(toolName, params, credentials): Promise<ToolResult> {
        const token = credentials.token;
        if (!token) return { success: false, error: "Todoist token not found. Please reconnect Todoist." };

        const baseUrl = "https://api.todoist.com/rest/v2";
        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        try {
            switch (toolName) {
                case "todoist_create_task": {
                    const body: any = { content: params.content };
                    if (params.description) body.description = params.description;
                    if (params.project_id) body.project_id = params.project_id;
                    if (params.due_string) body.due_string = params.due_string;
                    if (params.priority) body.priority = params.priority;
                    if (params.labels) body.labels = params.labels.split(",").map((l: string) => l.trim());

                    const res = await fetch(`${baseUrl}/tasks`, { method: "POST", headers, body: JSON.stringify(body) });
                    if (!res.ok) return { success: false, error: `Todoist Error: ${res.statusText}` };
                    const task = await res.json();
                    return { success: true, data: { id: task.id, url: task.url }, displayMessage: `Task created: ${task.url}` };
                }

                case "todoist_list_tasks": {
                    let url = `${baseUrl}/tasks`;
                    const queryParams: string[] = [];
                    if (params.project_id) queryParams.push(`project_id=${params.project_id}`);
                    if (params.filter) queryParams.push(`filter=${encodeURIComponent(params.filter)}`);
                    if (queryParams.length > 0) url += `?${queryParams.join("&")}`;

                    const res = await fetch(url, { headers });
                    if (!res.ok) return { success: false, error: `Todoist Error: ${res.statusText}` };
                    const tasks = await res.json();
                    const list = tasks.map((t: any) => ({
                        id: t.id, content: t.content, priority: t.priority,
                        due: t.due?.string, url: t.url, labels: t.labels,
                    }));
                    return { success: true, data: list, displayMessage: `Found ${list.length} tasks.` };
                }

                case "todoist_complete_task": {
                    const res = await fetch(`${baseUrl}/tasks/${params.taskId}/close`, { method: "POST", headers });
                    if (!res.ok) return { success: false, error: `Todoist Error: ${res.statusText}` };
                    return { success: true, data: {}, displayMessage: `Task completed!` };
                }

                case "todoist_list_projects": {
                    const res = await fetch(`${baseUrl}/projects`, { headers });
                    if (!res.ok) return { success: false, error: `Todoist Error: ${res.statusText}` };
                    const projects = await res.json();
                    return { success: true, data: projects.map((p: any) => ({ id: p.id, name: p.name, color: p.color, url: p.url })), displayMessage: `Found ${projects.length} projects.` };
                }

                case "todoist_create_project": {
                    const body: any = { name: params.name };
                    if (params.color) body.color = params.color;
                    const res = await fetch(`${baseUrl}/projects`, { method: "POST", headers, body: JSON.stringify(body) });
                    if (!res.ok) return { success: false, error: `Todoist Error: ${res.statusText}` };
                    const project = await res.json();
                    return { success: true, data: { id: project.id, url: project.url }, displayMessage: `Project "${params.name}" created: ${project.url}` };
                }

                default:
                    return { success: false, error: `Unknown tool: ${toolName}` };
            }
        } catch (error: any) {
            return { success: false, error: `Todoist error: ${error.message}` };
        }
    },
};

export default todoistService;
