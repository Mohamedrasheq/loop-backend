# Loop Backend - API Documentation

> **For Expo App Integration**: This backend powers the Loop personal agent. Use these endpoints from your Expo app.

## Base URL

```
Development: http://localhost:3000
Production: https://your-deployed-url.vercel.app
```

---

## Endpoints Summary

| Endpoint | Method | Purpose | LLM Used |
|----------|--------|---------|----------|
| `/api/assistant` | GET | Conversational task logic | ✅ |
| `/api/capture` | POST | Extract & store memories | ✅ |
| `/api/daily-brief` | GET | Get priority items (max 2) | ❌ |
| `/api/draft` | POST | Generate message drafts | ✅ |
| `/api/close` | POST | Close a memory loop | ❌ |
| `/api/memories` | GET | Get all user memories | ❌ |

---

## 1. GET `/api/assistant`

Frontend-facing assistant that presents task analysis conversationally.

### Request

```
GET /api/assistant?userId=user-123
```

### Response

```typescript
{
  "message": string // Conversational guidance message
}
```

### Backend Flow

1. Fetches open memory items for the user
2. GPT-4o-mini prioritizes and analyzes tasks
3. Second LLM pass converts analysis into a friendly, supportive message
4. Returns conversational guidance

---

## 2. POST `/api/capture`

Extract user input and store as memory items.

### Request

```typescript
POST /api/capture
Content-Type: application/json

{
  "userId": string,    // Required
  "text": string,      // Required - natural language input
  "timezone": string   // Required - e.g., "Asia/Kolkata"
}
```

### Expo Example

```typescript
const captureMemory = async (text: string) => {
  const response = await fetch('http://localhost:3000/api/capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user-123',
      text: text,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });
  return response.json();
};
```

### Response

```typescript
{
  "agentMessage": string  // e.g., "Got it. I'll keep track of this."
}
```

### Backend Flow

1. Send text to LLM for extraction (JSON only)
2. Filter items with confidence < 0.7
3. Store validated items in database
4. Return calm confirmation

---

## 3. GET `/api/daily-brief`

Get prioritized items for today (max 2).

### Request

```
GET /api/daily-brief?userId=user-123
```

### Expo Example

```typescript
const getDailyBrief = async (userId: string) => {
  const response = await fetch(
    `http://localhost:3000/api/daily-brief?userId=${userId}`
  );
  return response.json();
};
```

### Response

```typescript
{
  "items": [
    {
      "id": string,
      "title": string,
      "type": "task" | "follow_up" | "note",
      "urgency": "low" | "medium" | "high",
      "dueAt": string | null  // ISO 8601
    }
  ]
}
```

### Backend Logic

- `status = 'open'`
- `due_at ≤ 24 hours from now`
- Order by: urgency (high→low), then due_at
- Limit: 2 items

---

## 4. POST `/api/draft`

Generate a professional message draft.

### Request

```typescript
POST /api/draft
Content-Type: application/json

{
  "userId": string,
  "memoryItemId": string,  // UUID from daily-brief or memories
  "tone": "polite" | "professional" | "firm"
}
```

### Expo Example

```typescript
const generateDraft = async (memoryItemId: string, tone: string) => {
  const response = await fetch('http://localhost:3000/api/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user-123',
      memoryItemId: memoryItemId,
      tone: tone,
    }),
  });
  return response.json();
};
```

### Response

```typescript
{
  "draftText": string  // Generated message
}
```

### Draft Rules (Enforced by Backend)

- Calm, professional tone
- NO urgency language
- NO emojis

---

## 5. POST `/api/close`

Mark a memory item as closed.

### Request

```typescript
POST /api/close
Content-Type: application/json

{
  "memoryItemId": string  // UUID
}
```

### Expo Example

```typescript
const closeMemory = async (memoryItemId: string) => {
  const response = await fetch('http://localhost:3000/api/close', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memoryItemId }),
  });
  return response.json();
};
```

### Response

```typescript
{
  "success": boolean
}
```

---

## 6. GET `/api/memories`

Get all memory items for a user.

### Request

```
GET /api/memories?userId=user-123
```

### Expo Example

```typescript
const getAllMemories = async (userId: string) => {
  const response = await fetch(
    `http://localhost:3000/api/memories?userId=${userId}`
  );
  return response.json();
};
```

### Response

```typescript
{
  "items": [
    {
      "id": string,
      "user_id": string,
      "type": "task" | "follow_up" | "note",
      "title": string,
      "context": string | null,
      "source_text": string,
      "due_at": string | null,
      "urgency": "low" | "medium" | "high",
      "status": "open" | "nudged" | "closed" | "ignored",
      "created_at": string
    }
  ]
}
```

---

## 7. POST `/api/users/sync`

Sync user data from frontend/auth provider.

### Request

```typescript
POST /api/users/sync
Content-Type: application/json

{
  "userId": string,     // Required - Auth provider ID
  "email": string,      // Required
  "fullName": string,   // Optional
  "avatarUrl": string   // Optional
}
```

### Expo Example

```typescript
const syncUser = async (user: any) => {
  const response = await fetch('http://localhost:3000/api/users/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      fullName: user.firstName,
      avatarUrl: user.imageUrl,
    }),
  });
  return response.json();
};
```

### Response

```typescript
{
  "success": boolean
}
```

---

## 8. POST `/api/delete-account`

Permanently delete user account and data.

### Request

```typescript
POST /api/delete-account
Content-Type: application/json

{
  "userId": string  // Kinde/Auth provider ID
}
```

### Expo Example

```typescript
const deleteAccount = async (userId: string) => {
  const response = await fetch('http://localhost:3000/api/delete-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return response.json();
};
```

### Response

```typescript
{
  "success": boolean
}
```

---

## TypeScript Types (For Expo)

```typescript
// Copy these to your Expo app

export type MemoryType = 'task' | 'follow_up' | 'note';
export type Urgency = 'low' | 'medium' | 'high';
export type MemoryStatus = 'open' | 'nudged' | 'closed' | 'ignored';
export type DraftTone = 'polite' | 'professional' | 'firm';

export interface DailyBriefItem {
  id: string;
  title: string;
  type: MemoryType;
  urgency: Urgency;
  dueAt: string | null;
}

export interface MemoryItem {
  id: string;
  user_id: string;
  type: MemoryType;
  title: string;
  context: string | null;
  source_text: string;
  due_at: string | null;
  urgency: Urgency;
  status: MemoryStatus;
  created_at: string;
}

export interface UserSyncRequest {
  userId: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

export interface DeleteAccountPayload {
  userId: string;
}
```

---

## Error Responses

All endpoints return errors in this format:

```typescript
{
  "error": string  // Error message
}
```

| Status | Meaning |
|--------|---------|
| 400 | Missing required fields |
| 404 | Resource not found |
| 500 | Server error |

---

## Architecture Principle

**LLM is NOT the brain.** Backend owns:
- Memory (what to store)
- Rules (confidence ≥ 0.7)
- Timing (24h window for brief)
- Decisions (max 2 items)

LLM only does:
- Extract structured data from text
- Draft messages
