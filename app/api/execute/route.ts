import { NextRequest, NextResponse } from "next/server";
import { createGithubIssue, draftPRDescription } from "@/lib/github";
import { createLinearIssue } from "@/lib/linear";
import { createGmailDraft } from "@/lib/gmail";
import { updateMemoryItemContext } from "@/lib/supabase";

/**
 * POST /api/execute
 * 
 * Purpose: Execute an action after user approval.
 * Level 2: Human-in-the-loop execution.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, action, memoryItemId } = body;

        console.log(`Executing action: ${action.type} for user: ${userId} in repo: ${action.payload.repo}`);

        let result;
        let successMessage = "Action executed successfully!";

        switch (action.type) {
            case "create_github_issue":
                result = await createGithubIssue(
                    action.payload.repo,
                    action.payload.title,
                    action.payload.body
                );
                successMessage = `Issue created successfully: ${result.html_url}`;
                // Update memory item context with the link to the new issue
                if (memoryItemId) {
                    await updateMemoryItemContext(
                        memoryItemId,
                        `GitHub Issue Created: ${result.html_url}`
                    );
                }
                break;

            case "draft_pr_description":
                result = await draftPRDescription(
                    action.payload.repo,
                    action.payload.title,
                    action.payload.body
                );
                successMessage = "PR Description drafted successfully! (Note: Level 2 only prepares the draft text)";
                if (memoryItemId) {
                    await updateMemoryItemContext(
                        memoryItemId,
                        `PR Description Drafted: ${action.payload.title}`
                    );
                }
                break;

            case "create_linear_issue":
                result = await createLinearIssue({
                    title: action.payload.title,
                    description: action.payload.description,
                    teamId: action.payload.teamId,
                    assigneeId: action.payload.assigneeId,
                    priority: action.payload.priority,
                    labelIds: action.payload.labelIds,
                    projectId: action.payload.projectId,
                    projectMilestoneId: action.payload.projectMilestoneId,
                    cycleId: action.payload.cycleId,
                    stateId: action.payload.stateId,
                    dueDate: action.payload.dueDate,
                    estimate: action.payload.estimate,
                    subscriberIds: action.payload.subscriberIds,
                    parentId: action.payload.parentId,
                });
                successMessage = `Linear issue created successfully: ${result.url}`;
                if (memoryItemId) {
                    await updateMemoryItemContext(
                        memoryItemId,
                        `Linear Issue Created: ${result.url}`
                    );
                }
                break;

            case "draft_gmail_reply":
                result = await createGmailDraft(
                    action.payload.to,
                    action.payload.subject,
                    action.payload.body
                );
                successMessage = "Gmail draft created successfully! Check your Gmail drafts.";
                if (memoryItemId) {
                    await updateMemoryItemContext(
                        memoryItemId,
                        `Gmail Reply Drafted to: ${action.payload.to}`
                    );
                }
                break;

            default:
                return NextResponse.json(
                    { error: `Unsupported action type: ${action.type}` },
                    { status: 400 }
                );
        }

        console.log(`Execution success: ${action.type}`);
        return NextResponse.json({ success: true, result, successMessage });
    } catch (error: any) {
        console.error("Error executing action:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
