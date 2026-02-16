import { NextRequest, NextResponse } from "next/server";
import { getLinearContext } from "@/lib/linear";

export async function GET(request: NextRequest) {
    try {
        const context = await getLinearContext();
        return NextResponse.json(context);
    } catch (error: any) {
        console.error("Error fetching Linear context:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch Linear context" },
            { status: 500 }
        );
    }
}
