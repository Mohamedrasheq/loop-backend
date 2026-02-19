/**
 * GitHub Service Plugin
 * 
 * Tools: create issues, list repos, draft PR descriptions.
 * Requires: Personal Access Token (PAT) from the user.
 */

import { z } from "zod";
import type { ServiceDefinition, ToolResult } from "./base";

const githubService: ServiceDefinition = {
    name: "github",
    displayName: "GitHub",
    description: "Create issues, list repositories, and draft PR descriptions on GitHub.",

    credentialFields: [
        {
            key: "token",
            label: "Personal Access Token",
            type: "password",
            required: true,
            helpUrl: "https://github.com/settings/tokens/new",
            placeholder: "ghp_xxxxxxxxxxxx",
        },
    ],

    tools: [
        {
            name: "github_create_issue",
            description: "Create a new issue in a GitHub repository. Use when the user wants to file a bug, feature request, or task on GitHub.",
            inputSchema: z.object({
                repo: z.string().describe("Repository in owner/repo format, e.g. 'octocat/hello-world'"),
                title: z.string().describe("Issue title"),
                body: z.string().describe("Issue body in Markdown format"),
            }),
        },
        {
            name: "github_list_repos",
            description: "List the user's GitHub repositories. Use when the user asks about their repos or you need to find the correct repo name.",
            inputSchema: z.object({}),
        },
        {
            name: "github_draft_pr",
            description: "Draft a pull request description for a GitHub repository. Use when the user wants to prepare PR documentation.",
            inputSchema: z.object({
                repo: z.string().describe("Repository in owner/repo format"),
                title: z.string().describe("PR title"),
                body: z.string().describe("PR description in Markdown format"),
            }),
        },
    ],

    async execute(toolName, params, credentials): Promise<ToolResult> {
        const token = credentials.token;
        if (!token) {
            return { success: false, error: "GitHub token not found. Please reconnect GitHub." };
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Loop-Backend",
        };

        try {
            switch (toolName) {
                case "github_create_issue": {
                    const response = await fetch(`https://api.github.com/repos/${params.repo}/issues`, {
                        method: "POST",
                        headers,
                        body: JSON.stringify({ title: params.title, body: params.body }),
                    });
                    if (!response.ok) {
                        const err = await response.json();
                        return { success: false, error: `GitHub API Error: ${err.message || response.statusText}` };
                    }
                    const issue = await response.json();
                    return {
                        success: true,
                        data: { url: issue.html_url, number: issue.number },
                        displayMessage: `Issue #${issue.number} created: ${issue.html_url}`,
                    };
                }

                case "github_list_repos": {
                    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=30", {
                        headers,
                    });
                    if (!response.ok) {
                        const err = await response.json();
                        return { success: false, error: `GitHub API Error: ${err.message || response.statusText}` };
                    }
                    const repos = await response.json();
                    const repoList = repos.map((r: any) => ({
                        full_name: r.full_name,
                        name: r.name,
                        private: r.private,
                        updated_at: r.updated_at,
                    }));
                    return {
                        success: true,
                        data: repoList,
                        displayMessage: `Found ${repoList.length} repositories.`,
                    };
                }

                case "github_draft_pr": {
                    // Validate repo exists
                    const response = await fetch(`https://api.github.com/repos/${params.repo}`, { headers });
                    if (!response.ok) {
                        return { success: false, error: `Repository not found: ${params.repo}` };
                    }
                    return {
                        success: true,
                        data: { repo: params.repo, title: params.title, body: params.body },
                        displayMessage: `PR description drafted for ${params.repo}: "${params.title}"`,
                    };
                }

                default:
                    return { success: false, error: `Unknown tool: ${toolName}` };
            }
        } catch (error: any) {
            return { success: false, error: `GitHub error: ${error.message}` };
        }
    },
};

export default githubService;
