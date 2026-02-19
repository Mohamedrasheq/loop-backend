/**
 * Google Calendar Service Plugin
 *
 * Tools: create events, list upcoming events, find free slots.
 * Requires: OAuth2 credentials (access_token, refresh_token, client_id, client_secret).
 */

import { z } from "zod";
import type { ServiceDefinition, ToolResult } from "./base";

async function getValidAccessToken(credentials: Record<string, string>): Promise<string> {
    // If we have a refresh token + client credentials, try to refresh
    if (credentials.refresh_token && credentials.client_id && credentials.client_secret) {
        const res = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: credentials.client_id,
                client_secret: credentials.client_secret,
                refresh_token: credentials.refresh_token,
                grant_type: "refresh_token",
            }),
        });
        if (res.ok) {
            const data = await res.json();
            return data.access_token;
        }
    }
    return credentials.access_token || "";
}

const googleCalendarService: ServiceDefinition = {
    name: "google_calendar",
    displayName: "Google Calendar",
    description: "Create events, view upcoming meetings, and check your schedule.",

    credentialFields: [
        {
            key: "access_token",
            label: "Access Token",
            type: "password",
            required: true,
            placeholder: "ya29.xxxx",
        },
        {
            key: "refresh_token",
            label: "Refresh Token",
            type: "password",
            required: false,
            placeholder: "1//xxxx",
        },
        {
            key: "client_id",
            label: "OAuth Client ID",
            type: "text",
            required: false,
            helpUrl: "https://console.cloud.google.com/apis/credentials",
            placeholder: "xxxx.apps.googleusercontent.com",
        },
        {
            key: "client_secret",
            label: "OAuth Client Secret",
            type: "password",
            required: false,
        },
    ],

    tools: [
        {
            name: "gcal_create_event",
            description: "Create a new event on Google Calendar. Use when the user wants to schedule a meeting, reminder, or event.",
            inputSchema: z.object({
                summary: z.string().describe("Event title"),
                startTime: z.string().describe("Start time in ISO 8601 format, e.g. '2025-03-01T14:00:00+05:30'"),
                endTime: z.string().describe("End time in ISO 8601 format"),
                description: z.string().optional().describe("Event description"),
                attendees: z.string().optional().describe("Comma-separated email addresses of attendees"),
                location: z.string().optional().describe("Event location"),
            }),
        },
        {
            name: "gcal_list_events",
            description: "List upcoming events from the user's Google Calendar. Use when the user asks about their schedule.",
            inputSchema: z.object({
                maxResults: z.number().optional().describe("Maximum events to return (default: 10)"),
                daysAhead: z.number().optional().describe("How many days ahead to look (default: 7)"),
            }),
        },
        {
            name: "gcal_find_free_slots",
            description: "Find free time slots in the user's calendar. Use when the user wants to know when they're available.",
            inputSchema: z.object({
                daysAhead: z.number().optional().describe("How many days ahead to check (default: 3)"),
                minDuration: z.number().optional().describe("Minimum free slot duration in minutes (default: 30)"),
            }),
        },
    ],

    async execute(toolName, params, credentials): Promise<ToolResult> {
        const accessToken = await getValidAccessToken(credentials);
        if (!accessToken) return { success: false, error: "Google Calendar credentials missing. Please reconnect." };

        const baseUrl = "https://www.googleapis.com/calendar/v3";
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        };

        try {
            switch (toolName) {
                case "gcal_create_event": {
                    const event: any = {
                        summary: params.summary,
                        start: { dateTime: params.startTime },
                        end: { dateTime: params.endTime },
                    };
                    if (params.description) event.description = params.description;
                    if (params.location) event.location = params.location;
                    if (params.attendees) {
                        event.attendees = params.attendees.split(",").map((e: string) => ({ email: e.trim() }));
                    }
                    const res = await fetch(`${baseUrl}/calendars/primary/events`, {
                        method: "POST", headers, body: JSON.stringify(event),
                    });
                    if (!res.ok) {
                        const err = await res.json();
                        return { success: false, error: `Google Calendar Error: ${err.error?.message || res.statusText}` };
                    }
                    const created = await res.json();
                    return {
                        success: true,
                        data: { id: created.id, htmlLink: created.htmlLink },
                        displayMessage: `Event created: ${created.htmlLink}`,
                    };
                }

                case "gcal_list_events": {
                    const now = new Date();
                    const max = new Date(now.getTime() + (params.daysAhead || 7) * 86400000);
                    const url = `${baseUrl}/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${max.toISOString()}&maxResults=${params.maxResults || 10}&singleEvents=true&orderBy=startTime`;
                    const res = await fetch(url, { headers });
                    if (!res.ok) {
                        const err = await res.json();
                        return { success: false, error: `Google Calendar Error: ${err.error?.message}` };
                    }
                    const data = await res.json();
                    const events = (data.items || []).map((e: any) => ({
                        summary: e.summary,
                        start: e.start?.dateTime || e.start?.date,
                        end: e.end?.dateTime || e.end?.date,
                        location: e.location,
                        htmlLink: e.htmlLink,
                    }));
                    return { success: true, data: events, displayMessage: `Found ${events.length} upcoming events.` };
                }

                case "gcal_find_free_slots": {
                    const now = new Date();
                    const max = new Date(now.getTime() + (params.daysAhead || 3) * 86400000);
                    const minMin = params.minDuration || 30;
                    // Fetch all events in range
                    const url = `${baseUrl}/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${max.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=50`;
                    const res = await fetch(url, { headers });
                    if (!res.ok) return { success: false, error: "Failed to fetch calendar events" };
                    const data = await res.json();
                    const events = (data.items || [])
                        .filter((e: any) => e.start?.dateTime)
                        .map((e: any) => ({
                            start: new Date(e.start.dateTime).getTime(),
                            end: new Date(e.end.dateTime).getTime(),
                        }))
                        .sort((a: any, b: any) => a.start - b.start);

                    // Find gaps (work hours: 9am-6pm)
                    const freeSlots: Array<{ start: string; end: string; duration: number }> = [];
                    for (let day = 0; day < (params.daysAhead || 3); day++) {
                        const dayStart = new Date(now);
                        dayStart.setDate(dayStart.getDate() + day);
                        dayStart.setHours(9, 0, 0, 0);
                        const dayEnd = new Date(dayStart);
                        dayEnd.setHours(18, 0, 0, 0);

                        const dayEvents = events.filter((e: any) => e.start < dayEnd.getTime() && e.end > dayStart.getTime());
                        let cursor = dayStart.getTime();

                        for (const ev of dayEvents) {
                            if (ev.start > cursor) {
                                const duration = Math.round((ev.start - cursor) / 60000);
                                if (duration >= minMin) {
                                    freeSlots.push({
                                        start: new Date(cursor).toISOString(),
                                        end: new Date(ev.start).toISOString(),
                                        duration,
                                    });
                                }
                            }
                            cursor = Math.max(cursor, ev.end);
                        }
                        if (dayEnd.getTime() > cursor) {
                            const duration = Math.round((dayEnd.getTime() - cursor) / 60000);
                            if (duration >= minMin) {
                                freeSlots.push({
                                    start: new Date(cursor).toISOString(),
                                    end: dayEnd.toISOString(),
                                    duration,
                                });
                            }
                        }
                    }
                    return { success: true, data: freeSlots, displayMessage: `Found ${freeSlots.length} free slots.` };
                }

                default:
                    return { success: false, error: `Unknown tool: ${toolName}` };
            }
        } catch (error: any) {
            return { success: false, error: `Google Calendar error: ${error.message}` };
        }
    },
};

export default googleCalendarService;
