import { NextRequest, NextResponse } from "next/server";
import { getUserCredential } from "@/lib/supabase";
import { decryptCredentials } from "@/lib/credentials";
import { getService } from "@/lib/services/registry";

/**
 * GET /api/github/repos?userId=...
 * 
 * Fetch the user's GitHub repositories using their own credentials.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "Missing required query parameter: userId" },
                { status: 400 }
            );
        }

        // Fetch user's GitHub credentials
        const credential = await getUserCredential(userId, "github");
        if (!credential) {
            return NextResponse.json(
                { error: "GitHub is not connected. Please connect it in Settings > Integrations." },
                { status: 403 }
            );
        }

        let decrypted;
        try {
            decrypted = decryptCredentials({
                encrypted: credential.encrypted_credentials,
                iv: credential.iv,
                authTag: credential.auth_tag,
            });
        } catch (authError: any) {
            return NextResponse.json(
                { error: "Authentication failed. Your integration credentials could not be decrypted (likely due to a security key change). Please disconnect and reconnect GitHub in Settings > Integrations." },
                { status: 403 }
            );
        }

        const service = getService("github");
        if (!service) {
            return NextResponse.json({ error: "GitHub service not found" }, { status: 500 });
        }

        const result = await service.execute("github_list_repos", {}, decrypted);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json(result.data);
    } catch (error: any) {
        console.error("Error fetching GitHub repos:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch repositories" },
            { status: 500 }
        );
    }
}
