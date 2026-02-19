/**
 * Trello Service Plugin
 *
 * Tools: create cards, list boards, list cards, move cards.
 * Requires: API Key + Token from the user.
 */

import { z } from "zod";
import type { ServiceDefinition, ToolResult } from "./base";

const trelloService: ServiceDefinition = {
    name: "trello",
    displayName: "Trello",
    description: "Create cards, manage boards, and organize tasks on Trello.",

    credentialFields: [
        {
            key: "apiKey",
            label: "API Key",
            type: "password",
            required: true,
            helpUrl: "https://trello.com/power-ups/admin",
            placeholder: "Your Trello API Key",
        },
        {
            key: "token",
            label: "Token",
            type: "password",
            required: true,
            helpUrl: "https://trello.com/1/authorize?key=YOUR_KEY&name=Loop&scope=read,write&response_type=token&expiration=never",
            placeholder: "Your Trello Token",
        },
    ],

    tools: [
        {
            name: "trello_create_card",
            description: "Create a new card on a Trello board. Use when the user wants to add a task or item to their Trello board.",
            inputSchema: z.object({
                listId: z.string().describe("ID of the list to add the card to"),
                name: z.string().describe("Card title"),
                desc: z.string().optional().describe("Card description in Markdown"),
                due: z.string().optional().describe("Due date in ISO 8601 format"),
                labels: z.string().optional().describe("Comma-separated label IDs"),
            }),
        },
        {
            name: "trello_list_boards",
            description: "List the user's Trello boards. Use to find board IDs and lists.",
            inputSchema: z.object({}),
        },
        {
            name: "trello_list_cards",
            description: "List cards in a specific Trello list or board. Use when the user asks about tasks on a board.",
            inputSchema: z.object({
                listId: z.string().describe("ID of the list to get cards from"),
            }),
        },
        {
            name: "trello_move_card",
            description: "Move a card to a different list. Use when the user wants to update a card's status.",
            inputSchema: z.object({
                cardId: z.string().describe("ID of the card to move"),
                listId: z.string().describe("ID of the destination list"),
            }),
        },
        {
            name: "trello_get_board_lists",
            description: "Get all lists for a specific Trello board. Use to find list IDs for creating or moving cards.",
            inputSchema: z.object({
                boardId: z.string().describe("ID of the board"),
            }),
        },
    ],

    async execute(toolName, params, credentials): Promise<ToolResult> {
        const { apiKey, token } = credentials;
        if (!apiKey || !token) return { success: false, error: "Trello credentials missing. Please reconnect Trello." };

        const auth = `key=${apiKey}&token=${token}`;
        const baseUrl = "https://api.trello.com/1";

        try {
            switch (toolName) {
                case "trello_create_card": {
                    const body: any = { idList: params.listId, name: params.name };
                    if (params.desc) body.desc = params.desc;
                    if (params.due) body.due = params.due;
                    if (params.labels) body.idLabels = params.labels;
                    const res = await fetch(`${baseUrl}/cards?${auth}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                    });
                    if (!res.ok) return { success: false, error: `Trello Error: ${res.statusText}` };
                    const card = await res.json();
                    return { success: true, data: { id: card.id, url: card.shortUrl }, displayMessage: `Card created: ${card.shortUrl}` };
                }

                case "trello_list_boards": {
                    const res = await fetch(`${baseUrl}/members/me/boards?${auth}&fields=name,url,shortUrl`);
                    if (!res.ok) return { success: false, error: `Trello Error: ${res.statusText}` };
                    const boards = await res.json();
                    return { success: true, data: boards.map((b: any) => ({ id: b.id, name: b.name, url: b.shortUrl })), displayMessage: `Found ${boards.length} boards.` };
                }

                case "trello_list_cards": {
                    const res = await fetch(`${baseUrl}/lists/${params.listId}/cards?${auth}&fields=name,desc,due,shortUrl,labels`);
                    if (!res.ok) return { success: false, error: `Trello Error: ${res.statusText}` };
                    const cards = await res.json();
                    return { success: true, data: cards.map((c: any) => ({ id: c.id, name: c.name, due: c.due, url: c.shortUrl })), displayMessage: `Found ${cards.length} cards.` };
                }

                case "trello_move_card": {
                    const res = await fetch(`${baseUrl}/cards/${params.cardId}?${auth}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ idList: params.listId }),
                    });
                    if (!res.ok) return { success: false, error: `Trello Error: ${res.statusText}` };
                    return { success: true, data: {}, displayMessage: `Card moved successfully.` };
                }

                case "trello_get_board_lists": {
                    const res = await fetch(`${baseUrl}/boards/${params.boardId}/lists?${auth}&fields=name`);
                    if (!res.ok) return { success: false, error: `Trello Error: ${res.statusText}` };
                    const lists = await res.json();
                    return { success: true, data: lists.map((l: any) => ({ id: l.id, name: l.name })), displayMessage: `Found ${lists.length} lists.` };
                }

                default:
                    return { success: false, error: `Unknown tool: ${toolName}` };
            }
        } catch (error: any) {
            return { success: false, error: `Trello error: ${error.message}` };
        }
    },
};

export default trelloService;
