/**
 * POST /api/credentials/connect
 * 
 * Connect a service by storing encrypted credentials.
 * Body: { userId, service, credentials, metadata? }
 */

import { NextResponse } from "next/server";
import { encryptCredentials } from "@/lib/credentials";
import { upsertUserCredential } from "@/lib/supabase";
import { getService } from "@/lib/services/registry";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, service, credentials, metadata } = body;

        // Validate required fields
        if (!userId || !service || !credentials) {
            return NextResponse.json(
                { error: "Missing required fields: userId, service, credentials" },
                { status: 400 }
            );
        }

        // Validate service exists in registry
        const serviceDef = getService(service);
        if (!serviceDef) {
            return NextResponse.json(
                { error: `Unknown service: ${service}. Check available services at GET /api/credentials/status` },
                { status: 400 }
            );
        }

        // Validate required credential fields
        const missingFields = serviceDef.credentialFields
            .filter((f) => f.required && !credentials[f.key])
            .map((f) => f.label);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required credential fields: ${missingFields.join(", ")}` },
                { status: 400 }
            );
        }

        // Encrypt and store
        const encrypted = encryptCredentials(credentials);
        const success = await upsertUserCredential(
            userId,
            service,
            encrypted.encrypted,
            encrypted.iv,
            encrypted.authTag,
            metadata || {}
        );

        if (!success) {
            return NextResponse.json(
                { error: "Failed to store credentials" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `${serviceDef.displayName} connected successfully.`,
        });
    } catch (error: any) {
        console.error("Error connecting service:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
