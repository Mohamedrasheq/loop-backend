import { NextRequest, NextResponse } from "next/server";
import { updateMemoryItemContext, getUserCredential } from "@/lib/supabase";
import { decryptCredentials } from "@/lib/credentials";
import { getService } from "@/lib/services/registry";

/**
 * POST /api/execute
 * 
 * Execute an action after user approval.
 * Now uses per-user credentials from the database, NOT env vars.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, action, memoryItemId } = body;

        if (!userId || !action?.type) {
            return NextResponse.json(
                { error: "Missing required fields: userId, action" },
                { status: 400 }
            );
        }

        console.log(`Executing action: ${action.type} for user: ${userId}`);

        // Map action types to service names and tool names
        const actionToService: Record<string, { service: string; tool: string }> = {
            create_github_issue: { service: "github", tool: "github_create_issue" },
            draft_pr_description: { service: "github", tool: "github_draft_pr" },
            create_linear_issue: { service: "linear", tool: "linear_create_issue" },
            draft_gmail_reply: { service: "gmail", tool: "gmail_create_draft" },
        };

        const mapping = actionToService[action.type];
        if (!mapping) {
            return NextResponse.json(
                { error: `Unsupported action type: ${action.type}` },
                { status: 400 }
            );
        }

        // Fetch user's credentials for this service
        const credential = await getUserCredential(userId, mapping.service);
        if (!credential) {
            return NextResponse.json(
                { error: `${mapping.service} is not connected. Please connect it in Settings > Integrations first.` },
                { status: 403 }
            );
        }

        // Decrypt credentials
        let decrypted;
        try {
            decrypted = decryptCredentials({
                encrypted: credential.encrypted_credentials,
                iv: credential.iv,
                authTag: credential.auth_tag,
            });
        } catch (authError: any) {
            return NextResponse.json(
                { error: `Authentication failed for ${mapping.service}. Your credentials could not be decrypted (likely due to a security key change). Please disconnect and reconnect this service in Settings > Integrations.` },
                { status: 403 }
            );
        }

        // Get service and execute
        const serviceDef = getService(mapping.service);
        if (!serviceDef) {
            return NextResponse.json(
                { error: `Service not found: ${mapping.service}` },
                { status: 500 }
            );
        }

        const result = await serviceDef.execute(mapping.tool, action.payload, decrypted);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Action execution failed" },
                { status: 500 }
            );
        }

        // Update memory item context with link/info
        if (memoryItemId && result.displayMessage) {
            await updateMemoryItemContext(memoryItemId, result.displayMessage);
        }

        console.log(`Execution success: ${action.type}`);
        return NextResponse.json({
            success: true,
            result: result.data,
            successMessage: result.displayMessage || "Action executed successfully!",
        });
    } catch (error: any) {
        console.error("Error executing action:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
