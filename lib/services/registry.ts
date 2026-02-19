/**
 * Service Registry
 * 
 * Auto-registers all service plugins and provides lookup utilities.
 * To add a new service: create a file in lib/services/, import and register it here.
 */

import type { ServiceDefinition, ToolDefinition } from "./base";

// Import all service plugins
import githubService from "./github";
import linearService from "./linear";
import gmailService from "./gmail";
import slackService from "./slack";
import notionService from "./notion";
import jiraService from "./jira";
import googleCalendarService from "./google-calendar";
import trelloService from "./trello";
import asanaService from "./asana";
import todoistService from "./todoist";
import confluenceService from "./confluence";
import discordService from "./discord";

// ── Registry ──

const serviceMap = new Map<string, ServiceDefinition>();

function register(service: ServiceDefinition) {
    if (serviceMap.has(service.name)) {
        throw new Error(`Duplicate service registration: ${service.name}`);
    }
    serviceMap.set(service.name, service);
}

// Register all services
register(githubService);
register(linearService);
register(gmailService);
register(slackService);
register(notionService);
register(jiraService);
register(googleCalendarService);
register(trelloService);
register(asanaService);
register(todoistService);
register(confluenceService);
register(discordService);

// ── Public API ──

/**
 * Get a service definition by name.
 */
export function getService(name: string): ServiceDefinition | undefined {
    return serviceMap.get(name);
}

/**
 * Get all registered services.
 */
export function getAllServices(): ServiceDefinition[] {
    return Array.from(serviceMap.values());
}

/**
 * Get all registered service names.
 */
export function getAllServiceNames(): string[] {
    return Array.from(serviceMap.keys());
}

/**
 * Get tools only for services the user has connected.
 * Returns a flat list of tools with service context.
 */
export function getToolsForConnectedServices(
    connectedServiceNames: string[]
): Array<{ service: ServiceDefinition; tool: ToolDefinition }> {
    const tools: Array<{ service: ServiceDefinition; tool: ToolDefinition }> = [];

    for (const name of connectedServiceNames) {
        const service = serviceMap.get(name);
        if (service) {
            for (const tool of service.tools) {
                tools.push({ service, tool });
            }
        }
    }

    return tools;
}

/**
 * Get info about all available services (for displaying to users).
 */
export function getAvailableServicesInfo() {
    return getAllServices().map((s) => ({
        name: s.name,
        displayName: s.displayName,
        description: s.description,
        credentialFields: s.credentialFields,
    }));
}
