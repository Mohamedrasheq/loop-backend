/**
 * Linear Service Layer
 * Full integration with all IssueCreateInput parameters.
 */

interface CreateLinearIssueParams {
    title: string;
    description?: string;
    teamId: string;
    assigneeId?: string;
    priority?: number;
    labelIds?: string[];
    projectId?: string;
    projectMilestoneId?: string;
    cycleId?: string;
    stateId?: string;
    dueDate?: string;        // format: "YYYY-MM-DD"
    estimate?: number;
    subscriberIds?: string[];
    parentId?: string;
}

export async function createLinearIssue(params: CreateLinearIssueParams) {
    const token = process.env.LINEAR_API_KEY;
    if (!token) {
        throw new Error("Missing LINEAR_API_KEY in environment variables.");
    }

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

    // Build the input, stripping undefined values
    const input: Record<string, any> = {
        title: params.title,
        teamId: params.teamId,
    };
    if (params.description) input.description = params.description;
    if (params.assigneeId) input.assigneeId = params.assigneeId;
    if (params.priority != null && params.priority > 0) input.priority = Number(params.priority);
    if (params.labelIds?.length) input.labelIds = params.labelIds;
    if (params.projectId) input.projectId = params.projectId;
    if (params.projectMilestoneId) input.projectMilestoneId = params.projectMilestoneId;
    if (params.cycleId) input.cycleId = params.cycleId;
    if (params.stateId) input.stateId = params.stateId;
    if (params.dueDate) input.dueDate = params.dueDate;
    if (params.estimate != null && params.estimate > 0) input.estimate = Number(params.estimate);
    if (params.subscriberIds?.length) input.subscriberIds = params.subscriberIds;
    if (params.parentId) input.parentId = params.parentId;

    const response = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token,
        },
        body: JSON.stringify({
            query,
            variables: { input },
        }),
    });

    const result = await response.json();

    if (result.errors) {
        throw new Error(`Linear API Error: ${result.errors[0].message}`);
    }

    if (!result.data?.issueCreate?.success) {
        throw new Error("Linear issue creation failed.");
    }

    return result.data.issueCreate.issue;
}

/**
 * Fetch full context from Linear for populating UI dropdowns.
 * Returns: teams, users, labels, projects, cycles, workflowStates.
 */
export async function getLinearContext() {
    const token = process.env.LINEAR_API_KEY;
    if (!token) {
        throw new Error("Missing LINEAR_API_KEY in environment variables.");
    }

    const query = `
        query {
            teams {
                nodes {
                    id
                    name
                    key
                }
            }
            users {
                nodes {
                    id
                    name
                    displayName
                    active
                }
            }
            issueLabels {
                nodes {
                    id
                    name
                    color
                    team { id }
                }
            }
            projects {
                nodes {
                    id
                    name
                    state
                    teams {
                        nodes { id }
                    }
                }
            }
            cycles {
                nodes {
                    id
                    name
                    number
                    startsAt
                    endsAt
                    team { id }
                }
            }
            workflowStates {
                nodes {
                    id
                    name
                    type
                    team { id }
                }
            }
        }
    `;

    const response = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token,
        },
        body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.errors) {
        throw new Error(`Linear API Error: ${result.errors[0].message}`);
    }

    return {
        teams: result.data.teams.nodes,
        users: result.data.users.nodes.filter((u: any) => u.active !== false),
        labels: result.data.issueLabels.nodes,
        projects: result.data.projects.nodes,
        cycles: result.data.cycles.nodes,
        workflowStates: result.data.workflowStates.nodes,
    };
}
