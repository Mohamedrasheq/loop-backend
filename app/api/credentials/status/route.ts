/**
 * GET /api/credentials/status?userId=...
 * 
 * Returns connected services and available integrations.
 */

import { NextResponse } from "next/server";
import { getUserConnectedServices } from "@/lib/supabase";
import { getAvailableServicesInfo } from "@/lib/services/registry";
import type { CredentialStatusResponse } from "@/types";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "Missing required query parameter: userId" },
                { status: 400 }
            );
        }

        const connectedServices = await getUserConnectedServices(userId);
        const allServices = getAvailableServicesInfo();
        const connectedNames = connectedServices.map((s) => s.service);

        const response: CredentialStatusResponse = {
            connected: connectedServices.map((s) => ({
                service: s.service,
                metadata: s.metadata,
                connected_at: s.connected_at,
            })),
            available: allServices.filter((s) => !connectedNames.includes(s.name)),
            all: allServices,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        console.error("Error fetching credential status:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
