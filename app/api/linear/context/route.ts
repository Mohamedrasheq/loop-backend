import { NextRequest, NextResponse } from "next/server";
import { getUserCredential } from "@/lib/supabase";
import { decryptCredentials } from "@/lib/credentials";
import { getService } from "@/lib/services/registry";

/**
 * GET /api/linear/context?userId=...
 * 
 * Fetch the user's Linear workspace context using their own credentials.
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

        // Fetch user's Linear credentials
        const credential = await getUserCredential(userId, "linear");
        if (!credential) {
            return NextResponse.json(
                { error: "Linear is not connected. Please connect it in Settings > Integrations." },
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
                { error: "Authentication failed. Your integration credentials could not be decrypted (likely due to a security key change). Please disconnect and reconnect Linear in Settings > Integrations." },
                { status: 403 }
            );
        }

        const service = getService("linear");
        if (!service) {
            return NextResponse.json({ error: "Linear service not found" }, { status: 500 });
        }

        const result = await service.execute("linear_get_context", {}, decrypted);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json(result.data);
    } catch (error: any) {
        console.error("Error fetching Linear context:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch Linear context" },
            { status: 500 }
        );
    }
}
