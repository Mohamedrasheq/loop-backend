/**
 * POST /api/credentials/disconnect
 * 
 * Disconnect a service by removing its credentials.
 * Body: { userId, service }
 */

import { NextResponse } from "next/server";
import { deleteUserCredential } from "@/lib/supabase";
import { getService } from "@/lib/services/registry";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, service } = body;

        if (!userId || !service) {
            return NextResponse.json(
                { error: "Missing required fields: userId, service" },
                { status: 400 }
            );
        }

        // Validate service exists
        const serviceDef = getService(service);
        if (!serviceDef) {
            return NextResponse.json(
                { error: `Unknown service: ${service}` },
                { status: 400 }
            );
        }

        const success = await deleteUserCredential(userId, service);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to disconnect service" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `${serviceDef.displayName} disconnected successfully.`,
        });
    } catch (error: any) {
        console.error("Error disconnecting service:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
