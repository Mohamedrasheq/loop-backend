/**
 * Service Definition Base
 * 
 * Every integration plugin implements this interface.
 * Adding a new service = creating one file that exports a ServiceDefinition.
 */

import { z } from "zod";

/**
 * Describes a credential field the user must provide to connect a service.
 */
export interface CredentialField {
    key: string;           // Internal key, e.g. "token"
    label: string;         // User-facing label, e.g. "Personal Access Token"
    type: "text" | "password" | "oauth";
    required: boolean;
    helpUrl?: string;      // Link to docs on how to generate the credential
    placeholder?: string;  // Example value hint
}

/**
 * Describes a tool that a service exposes to the Claude agent.
 */
export interface ToolDefinition {
    name: string;                           // Unique tool name, e.g. "github_create_issue"
    description: string;                    // Claude reads this to decide when to use the tool
    inputSchema: z.ZodObject<any>;          // Zod schema for input validation
}

/**
 * Result of executing a tool.
 */
export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
    displayMessage?: string;  // Human-readable summary for the user
}

/**
 * The contract every service plugin must implement.
 */
export interface ServiceDefinition {
    /** Unique identifier, e.g. "github" */
    name: string;

    /** User-facing name, e.g. "GitHub" */
    displayName: string;

    /** Description of what this service does */
    description: string;

    /** Fields needed to connect this service */
    credentialFields: CredentialField[];

    /** Tools this service exposes to the agent */
    tools: ToolDefinition[];

    /**
     * Execute a tool with the given parameters and user's decrypted credentials.
     * 
     * @param toolName - Which tool to run (matches ToolDefinition.name)
     * @param params - Validated input (matches the tool's inputSchema)
     * @param credentials - User's decrypted credentials for this service
     */
    execute: (
        toolName: string,
        params: Record<string, any>,
        credentials: Record<string, string>
    ) => Promise<ToolResult>;
}
