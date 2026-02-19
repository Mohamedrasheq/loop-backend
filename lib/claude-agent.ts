/**
 * Claude Agent Module
 * 
 * Uses the Claude Agent SDK to run an AI agent with dynamically loaded tools
 * based on the user's connected services.
 * 
 * Flow:
 * 1. Fetch user's connected services from DB
 * 2. Build tool list from service registry (only connected services)
 * 3. Run Claude agent with those tools
 * 4. Each tool handler: decrypt user credentials → call service → return result
 */

import Anthropic from "@anthropic-ai/sdk";
import { getUserCredential, getUserConnectedServices } from "@/lib/supabase";
import { decryptCredentials } from "@/lib/credentials";
import { getToolsForConnectedServices, getAvailableServicesInfo, getService } from "@/lib/services/registry";
import type { AgentResponse } from "@/types";

const MODEL = "claude-haiku-4-5-20251001";

// Lazy initialization
let anthropicInstance: Anthropic | null = null;

function getAnthropic(): Anthropic {
    if (anthropicInstance) return anthropicInstance;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error("Missing ANTHROPIC_API_KEY. Please set it in .env.local");
    }

    anthropicInstance = new Anthropic({ apiKey });
    return anthropicInstance;
}

/**
 * Build the system prompt with context about connected services.
 */
function buildSystemPrompt(
    connectedServiceNames: string[],
    availableServices: ReturnType<typeof getAvailableServicesInfo>
): string {
    const connectedList = connectedServiceNames.length > 0
        ? connectedServiceNames.join(", ")
        : "none";

    const disconnectedServices = availableServices
        .filter((s) => !connectedServiceNames.includes(s.name))
        .map((s) => `- **${s.displayName}**: ${s.description}`)
        .join("\n");

    return `You are Loop, a calm and supportive personal productivity assistant.

CONNECTED SERVICES: ${connectedList}
You can ONLY use tools from connected services. If the user asks you to do something with a disconnected service, politely tell them how to connect it.

${disconnectedServices ? `AVAILABLE TO CONNECT:\n${disconnectedServices}\n\nTo connect a service, the user can go to Settings > Integrations in the app.` : "All available services are connected!"}

PERSONALITY:
- Be calm, professional, and supportive
- Keep responses concise and actionable
- When using tools, explain what you're doing briefly
- If a tool fails, explain the error clearly and suggest next steps
- Don't use urgency language (ASAP, urgent, immediately)

RULES:
- Always use the user's connected service tools when appropriate
- For Linear: always call linear_get_context first to get valid team IDs before creating issues
- For GitHub: confirm the repository name with the user if uncertain
- When creating issues or drafts, generate detailed, production-ready content
- Don't make up data or placeholder text

TASK EXTRACTION:
At the END of your reply, if the user's message contains something ACTIONABLE (a task, follow-up, or note to remember), append a JSON block on a new line:
<extracted>{"type":"task","title":"...","context":"...","due_at":null,"urgency":"medium"}</extracted>
- type: "task" (something to DO), "follow_up" (something to CHECK ON), or "note" (info to REMEMBER)
- due_at: ISO 8601 date string or null
- urgency: "low", "medium", or "high"
- Do NOT extract items for general questions, casual conversation, or greetings
- Only include this block when there is a genuine actionable item`;
}

/**
 * Convert a ToolDefinition's Zod schema to JSON Schema for the Anthropic API.
 * Uses Zod's built-in JSON schema generation via manual introspection.
 */
function toolSchemaToJsonSchema(toolDef: { inputSchema: any }): Anthropic.Tool.InputSchema {
    const schema = toolDef.inputSchema;
    // Support both _def.shape (object or function) and direct .shape
    let shape: Record<string, any> = {};
    if (schema._def?.shape) {
        shape = typeof schema._def.shape === 'function' ? schema._def.shape() : schema._def.shape;
    } else if (schema.shape) {
        shape = typeof schema.shape === 'function' ? schema.shape() : schema.shape;
    }

    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
        const field = value as any;
        const def = field?._def ?? {};
        const desc = def.description ?? field?.description ?? "";

        // Unwrap optional/default
        let inner = field;
        let isOptional = false;

        // Check for Zod v3 style (typeName) or v4 style (type)
        const fieldType = def.typeName ?? def.type ?? "";

        if (fieldType === "ZodOptional" || fieldType === "ZodDefault" || fieldType === "optional" || fieldType === "default") {
            isOptional = true;
            inner = def.innerType ?? def.inner ?? field;
        }

        const innerDef = inner?._def ?? {};
        const innerType = innerDef.typeName ?? innerDef.type ?? "";

        let jsonType: Record<string, any> = { type: "string" };
        if (innerType.toLowerCase().includes("number") || innerType.toLowerCase().includes("int") || innerType.toLowerCase().includes("float")) {
            jsonType = { type: "number" };
        } else if (innerType.toLowerCase().includes("boolean") || innerType.toLowerCase().includes("bool")) {
            jsonType = { type: "boolean" };
        } else if (innerType.toLowerCase().includes("array")) {
            jsonType = { type: "array", items: { type: "string" } };
        }

        properties[key] = { ...jsonType, description: desc };
        if (!isOptional) required.push(key);
    }

    return {
        type: "object" as const,
        properties,
        required,
    };
}

/**
 * Run the Claude agent for a user message.
 * Dynamically loads tools based on the user's connected services.
 */
export async function runAgent(
    userId: string,
    message: string,
    timezone: string
): Promise<AgentResponse> {
    const anthropic = getAnthropic();

    // 1. Fetch connected services
    const connectedServices = await getUserConnectedServices(userId);
    const connectedServiceNames = connectedServices.map((s) => s.service);

    // 2. Build tools from connected services
    const serviceTools = getToolsForConnectedServices(connectedServiceNames);
    const availableServices = getAvailableServicesInfo();

    // 3. Build Anthropic tools array
    const tools: Anthropic.Tool[] = [
        // Meta tool: list available integrations
        {
            name: "list_available_integrations",
            description: "List all available integrations and their connection status. Use when the user asks about connecting services or what integrations are available.",
            input_schema: {
                type: "object" as const,
                properties: {},
                required: [],
            },
        },
        // Service-specific tools
        ...serviceTools.map(({ tool }) => ({
            name: tool.name,
            description: tool.description,
            input_schema: toolSchemaToJsonSchema(tool),
        })),
    ];

    // 4. Build system prompt
    const systemPrompt = buildSystemPrompt(connectedServiceNames, availableServices);

    // 5. Run conversation with tool use loop
    const messages: Anthropic.MessageParam[] = [
        {
            role: "user",
            content: `[Current time: ${new Date().toISOString()}, Timezone: ${timezone}]\n\n${message}`,
        },
    ];

    const toolResults: AgentResponse["tool_results"] = [];
    let finalReply = "";

    // Tool use loop (max 5 iterations to prevent infinite loops)
    for (let i = 0; i < 5; i++) {
        const response = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 1200,
            system: systemPrompt,
            tools,
            messages,
        });

        // Collect text blocks for the reply
        const textBlocks = response.content.filter(
            (block): block is Anthropic.TextBlock => block.type === "text"
        );
        if (textBlocks.length > 0) {
            finalReply = textBlocks.map((b) => b.text).join("\n");
        }

        // Check if there are tool use blocks
        const toolUseBlocks = response.content.filter(
            (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
        );

        // If no tool calls, we're done
        if (toolUseBlocks.length === 0 || response.stop_reason === "end_turn") {
            break;
        }

        // Process each tool call
        const toolResultsForMessage: Anthropic.ToolResultBlockParam[] = [];

        for (const toolUse of toolUseBlocks) {
            let toolResultContent: string;

            if (toolUse.name === "list_available_integrations") {
                // Meta tool: return integration status
                const status = {
                    connected: connectedServices.map((s) => ({
                        service: s.service,
                        metadata: s.metadata,
                    })),
                    available: availableServices.map((s) => ({
                        name: s.name,
                        displayName: s.displayName,
                        description: s.description,
                        connected: connectedServiceNames.includes(s.name),
                    })),
                };
                toolResultContent = JSON.stringify(status);
                toolResults?.push({
                    tool: "list_available_integrations",
                    success: true,
                    data: status,
                    displayMessage: "Listed available integrations.",
                });
            } else {
                // Find which service this tool belongs to
                const matchingServiceTool = serviceTools.find(
                    (st) => st.tool.name === toolUse.name
                );

                if (!matchingServiceTool) {
                    toolResultContent = JSON.stringify({ error: `Unknown tool: ${toolUse.name}` });
                    toolResults?.push({
                        tool: toolUse.name,
                        success: false,
                        error: `Unknown tool: ${toolUse.name}`,
                    });
                } else {
                    // Fetch and decrypt credentials
                    const credential = await getUserCredential(userId, matchingServiceTool.service.name);
                    if (!credential) {
                        toolResultContent = JSON.stringify({
                            error: `No credentials found for ${matchingServiceTool.service.displayName}. Please connect it first.`,
                        });
                        toolResults?.push({
                            tool: toolUse.name,
                            success: false,
                            error: `Service ${matchingServiceTool.service.displayName} not connected.`,
                        });
                    } else {
                        try {
                            const decrypted = decryptCredentials({
                                encrypted: credential.encrypted_credentials,
                                iv: credential.iv,
                                authTag: credential.auth_tag,
                            });

                            console.log(`[Agent] Tool: ${toolUse.name}, Service: ${matchingServiceTool.service.name}`);

                            // Execute the tool
                            const result = await matchingServiceTool.service.execute(
                                toolUse.name,
                                toolUse.input as Record<string, any>,
                                decrypted
                            );

                            if (!result.success) {
                                console.log(`[Agent] Tool FAILED: ${result.error}`);
                            }

                            toolResultContent = JSON.stringify(result);
                            toolResults?.push({
                                tool: toolUse.name,
                                success: result.success,
                                data: result.data,
                                displayMessage: result.displayMessage,
                                error: result.error,
                            });
                        } catch (decryptError: any) {
                            toolResultContent = JSON.stringify({
                                error: `Authentication failed for ${matchingServiceTool.service.displayName}. Please disconnect and reconnect it in Settings > Integrations.`,
                            });
                            toolResults?.push({
                                tool: toolUse.name,
                                success: false,
                                error: `Decryption failed: ${decryptError.message}`,
                            });
                        }
                    }
                }
            }

            toolResultsForMessage.push({
                type: "tool_result",
                tool_use_id: toolUse.id,
                content: toolResultContent,
            });
        }

        // Add assistant response and tool results to messages for next iteration
        messages.push({ role: "assistant", content: response.content });
        messages.push({ role: "user", content: toolResultsForMessage });
    }

    // Parse extracted task from reply (if any)
    let capturedItem = null;
    const extractedMatch = finalReply.match(/<extracted>([\s\S]*?)<\/extracted>/);
    if (extractedMatch) {
        try {
            capturedItem = JSON.parse(extractedMatch[1]);
        } catch {
            // Ignore malformed extraction
        }
        // Strip the extracted block from the visible reply
        finalReply = finalReply.replace(/<extracted>[\s\S]*?<\/extracted>/, "").trim();
    }

    return {
        reply: finalReply || "I processed your request.",
        captured_item: capturedItem,
        proposed_actions: [],
        tool_results: toolResults.length > 0 ? toolResults : undefined,
    };
}
