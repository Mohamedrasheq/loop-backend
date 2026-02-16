import { NextRequest, NextResponse } from "next/server";
import { getUserRepositories } from "@/lib/github";

/**
 * GET /api/github/repos
 * 
 * Purpose: Fetch the user's GitHub repositories for selection in the Assistant UI.
 */
export async function GET(request: NextRequest) {
    try {
        const repos = await getUserRepositories();
        return NextResponse.json(repos);
    } catch (error: any) {
        console.error("Error fetching GitHub repos:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch repositories" },
            { status: 500 }
        );
    }
}
