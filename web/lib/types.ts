// Matches Supabase leads table exactly
export type Lead = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'inactive';
  last_contacted_at: string | null;
  notes: string | null;
  created_at: string;
};

export type WorkflowRunStatus = 'pending' | 'running' | 'completed' | 'failed';

// Matches Supabase workflow_runs table exactly
export type WorkflowRun = {
  id: string;
  user_id: string;
  goal: string;
  status: WorkflowRunStatus;
  steps_taken: number;
  created_at: string;
};

// UI-level run lifecycle — drives all button and feed states
// idle → running → completed | failed | partial_success
export type RunStatus = 'idle' | 'running' | 'completed' | 'failed' | 'partial_success';

// Each entry in the execution feed
// run_start and run_end are UI-only system markers — never stored in DB
export type FeedItem = {
  step: number; // 1–5 for real steps, 0 for system markers
  type: 'thinking' | 'executing' | 'success' | 'failed' | 'run_start' | 'run_end';
  action: string; // e.g. 'Get_Leads', 'Send_Email', 'plan', 'system'
  message: string;
  timestamp: string; // ISO string — set at runtime, not hardcoded
};

// Controls which execution path runs
export type ExecutionMode = 'demo' | 'live';

// Mock user — replace with Supabase session when auth is implemented
export type MockUser = {
  id: string;
  name: string;
  email: string;
};

// Make.com webhook contract (frontend should NOT send Fallback)
// These action values MUST match Make.com Router branch filter names exactly
export type WebhookPayload = {
  action: 'Send_Email' | 'Update_Email' | 'Create_Leads' | 'Get_Leads' | 'Delete_Leads';
  user_id: string;
  run_id: string;
  parameters: Record<string, unknown>;
};

// Standard response wrapper — ALL functions in api.ts must return this shape
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

