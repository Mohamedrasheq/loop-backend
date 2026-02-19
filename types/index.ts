// Memory Item Types
export type MemoryType = "task" | "follow_up" | "note";
export type Urgency = "low" | "medium" | "high";
export type MemoryStatus = "open" | "nudged" | "closed" | "ignored";
export type DraftTone = "polite" | "professional" | "firm";

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
  scheduled_message_id?: string | null;
  created_at: string;
}

// API Request/Response Types
export interface CaptureRequest {
  userId: string;
  text: string;
  timezone: string;
}

export interface CaptureResponse {
  agentMessage: string;
}

export interface DailyBriefItem {
  id: string;
  title: string;
  type: MemoryType;
  urgency: Urgency;
  dueAt: string | null;
}

export interface DailyBriefResponse {
  items: DailyBriefItem[];
}

export interface DraftRequest {
  userId: string;
  memoryItemId: string;
  tone: DraftTone;
}

export interface DraftResponse {
  draftText: string;
}

export interface CloseRequest {
  memoryItemId: string;
}

export interface CloseResponse {
  success: boolean;
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

export interface DeleteAccountResponse {
  success: boolean;
}

// LLM Extraction Types
export interface ExtractedMemoryItem {
  type: MemoryType;
  title: string;
  context: string | null;
  due_at: string | null;
  urgency: Urgency;
  confidence: number;
}

export interface LLMExtractionResult {
  items: ExtractedMemoryItem[];
  overall_confidence: number;
}

// Level 2 Assistant Types
export interface ProposedAction {
  type: "create_github_issue" | "draft_pr_description";
  requires_approval: boolean;
  payload: any;
}

export interface PlannerResponse {
  analysis: string;
  priority_tasks: {
    id: string;
    title: string;
    reason: string;
    suggested_steps: string[]
  }[];
  proposed_actions: ProposedAction[];
}

export interface AssistantResponse {
  message: string;
  priority_tasks?: {
    id: string;
    title: string;
    reason: string;
    suggested_steps: string[];
  }[];
  proposed_actions?: ProposedAction[];
}// Notification Types
export type NotificationStatus = "scheduled" | "sent" | "failed";

export interface Notification {
  id: string;
  user_id: string;
  memory_item_id: string | null;
  title: string;
  body: string;
  scheduled_at: string;
  status: NotificationStatus;
  scheduled_message_id: string | null;
  created_at: string;
}

// ── Per-User Credential Types ──

export interface UserCredential {
  id: string;
  user_id: string;
  service: string;
  encrypted_credentials: string;
  iv: string;
  auth_tag: string;
  metadata: Record<string, any>;
  connected_at: string;
  updated_at: string;
}

export interface CredentialConnectRequest {
  userId: string;
  service: string;
  credentials: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface CredentialStatusResponse {
  connected: Array<{
    service: string;
    metadata: Record<string, any>;
    connected_at: string;
  }>;
  available: Array<{
    name: string;
    displayName: string;
    description: string;
    credentialFields: Array<{
      key: string;
      label: string;
      type: string;
      required: boolean;
      helpUrl?: string;
      placeholder?: string;
    }>;
  }>;
}

// ── Agent Types ──

export interface AgentResponse {
  reply: string;
  captured_item?: any;
  proposed_actions?: ProposedAction[];
  tool_results?: Array<{
    tool: string;
    success: boolean;
    data?: any;
    displayMessage?: string;
    error?: string;
  }>;
}
