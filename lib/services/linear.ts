/**
 * Linear Service Plugin
 * 
 * Tools: create issues, fetch workspace context (teams, users, labels, etc.)
 * Requires: API Key from the user.
 */

import { z } from "zod";
import type { ServiceDefinition, ToolResult } from "./base";

const linearService: ServiceDefinition = {
    name: "linear",
    displayName: "Linear",
    description: "Create issues and manage work in Linear project management.",

    credentialFields: [
        {
            key: "apiKey",
            label: "API Key",
            type: "password",
            required: true,
            helpUrl: "https://linear.app/settings/api",
            placeholder: "lin_api_xxxxxxxxxxxx",
        },
    ],

    tools: [
        {
            name: "linear_create_issue",
            description: "Create a new issue in Linear. Use when the user wants to create a task, bug, or feature request in Linear.",
            inputSchema: z.object({
                title: z.string().describe("Issue title"),
                description: z.string().optional().describe("Issue description in Markdown"),
                teamId: z.string().describe("Team ID to create the issue in"),
                assigneeId: z.string().optional().describe("User ID to assign the issue to"),
                priority: z.number().optional().describe("Priority: 0=None, 1=Urgent, 2=High, 3=Medium, 4=Low"),
                labelIds: z.array(z.string()).optional().describe("Label IDs to apply"),
                projectId: z.string().optional().describe("Project ID to add the issue to"),
                stateId: z.string().optional().describe("Workflow state ID"),
                dueDate: z.string().optional().describe("Due date in YYYY-MM-DD format"),
            }),
        },
        {
            name: "linear_get_context",
            description: "Fetch the user's Linear workspace context including teams, users, labels, projects, cycles, and workflow states. Use this FIRST before creating issues to get valid IDs.",
            inputSchema: z.object({}),
        },
    ],

    async execute(toolName, params, credentials): Promise<ToolResult> {
        const apiKey = credentials.apiKey;
        if (!apiKey) {
            return { success: false, error: "Linear API key not found. Please reconnect Linear." };
        }

        const headers = {
            "Content-Type": "application/json",
            Authorization: apiKey,
        };

        try {
            switch (toolName) {
                case "linear_create_issue": {
                    const query = `
                        mutation IssueCreate($input: IssueCreateInput!) {
                            issueCreate(input: $input) {
                                success
                                issue {
                                    id
                                    identifier
                                    title
                                    url
                                }
                            }
                        }
                    `;

                    const input: Record<string, any> = { title: params.title, teamId: params.teamId };
                    if (params.description) input.description = params.description;
                    if (params.assigneeId) input.assigneeId = params.assigneeId;
                    if (params.priority != null && params.priority > 0) input.priority = Number(params.priority);
                    if (params.labelIds?.length) input.labelIds = params.labelIds;
                    if (params.projectId) input.projectId = params.projectId;
                    if (params.stateId) input.stateId = params.stateId;
                    if (params.dueDate) input.dueDate = params.dueDate;

                    const response = await fetch("https://api.linear.app/graphql", {
                        method: "POST",
                        headers,
                        body: JSON.stringify({ query, variables: { input } }),
                    });

                    const result = await response.json();
                    if (result.errors) {
                        return { success: false, error: `Linear API Error: ${result.errors[0].message}` };
                    }
                    if (!result.data?.issueCreate?.success) {
                        return { success: false, error: "Linear issue creation failed." };
                    }

                    const issue = result.data.issueCreate.issue;
                    return {
                        success: true,
                        data: issue,
                        displayMessage: `Linear issue ${issue.identifier} created: ${issue.url}`,
                    };
                }

                case "linear_get_context": {
                    const query = `
                        query {
                            teams { nodes { id name key } }
                            users { nodes { id name displayName active } }
                            issueLabels { nodes { id name color team { id } } }
                            projects { nodes { id name state teams { nodes { id } } } }
                            cycles { nodes { id name number startsAt endsAt team { id } } }
                            workflowStates { nodes { id name type team { id } } }
                        }
                    `;

                    const response = await fetch("https://api.linear.app/graphql", {
                        method: "POST",
                        headers,
                        body: JSON.stringify({ query }),
                    });

                    const result = await response.json();
                    if (result.errors) {
                        return { success: false, error: `Linear API Error: ${result.errors[0].message}` };
                    }

                    return {
                        success: true,
                        data: {
                            teams: result.data.teams.nodes,
                            users: result.data.users.nodes.filter((u: any) => u.active !== false),
                            labels: result.data.issueLabels.nodes,
                            projects: result.data.projects.nodes,
                            cycles: result.data.cycles.nodes,
                            workflowStates: result.data.workflowStates.nodes,
                        },
                        displayMessage: "Fetched Linear workspace context.",
                    };
                }

                default:
                    return { success: false, error: `Unknown tool: ${toolName}` };
            }
        } catch (error: any) {
            return { success: false, error: `Linear error: ${error.message}` };
        }
    },
};

export default linearService;
