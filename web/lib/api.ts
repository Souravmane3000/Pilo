import { createClient } from '@supabase/supabase-js'
import { buildDemoFeed, MOCK_WORKFLOW_RUNS } from './mockData'
import type {
  ApiResponse,
  FeedItem,
  Lead,
  WebhookPayload,
  WorkflowRun,
} from './types'

// Helper to add timestamps
function withTimestamp(items: Omit<FeedItem, 'timestamp'>[]): FeedItem[] {
  const now = new Date().toISOString()
  return items.map((item) => ({
    ...item,
    timestamp: now,
  }))
}

// ===============================
// RUN AGENT (MOCK FOR NOW)
// ===============================
export async function runAgentRequest(
  payload: WebhookPayload
): Promise<ApiResponse<{ run_id: string }>> {
  try {
    await Promise.resolve()

    return {
      data: { run_id: payload.run_id },
      error: null,
    }
  } catch {
    return {
      data: null,
      error: 'Failed to start agent run.',
    }
  }
}

// ===============================
// FETCH AGENT FEED (MOCK)
// ===============================
export async function fetchAgentFeed(
  run_id: string
): Promise<ApiResponse<FeedItem[]>> {
  try {
    await Promise.resolve()

    const demoFeed = withTimestamp(buildDemoFeed(`Run ${run_id}`))

    return {
      data: demoFeed,
      error: null,
    }
  } catch {
    return {
      data: null,
      error: 'Failed to load execution feed.',
    }
  }
}

// ===============================
// ✅ REAL SUPABASE — LEADS
// ===============================
export async function fetchLeads(): Promise<ApiResponse<Lead[]>> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return { data: null, error: error.message }
    }

    const mappedLeads: Lead[] = (data ?? []).map((lead) => ({
      id: lead.id,
      user_id: lead.user_id,
      name: lead.name,
      email: lead.email,
      company: lead.company ?? '',
      status:
        lead.status === 'cold'
          ? 'new'
          : lead.status === 'contacted'
            ? 'contacted'
            : lead.status === 'qualified'
              ? 'qualified'
              : 'inactive',
      last_contacted_at: lead.last_contacted_at ?? null,
      notes: lead.notes ?? null,
      created_at: lead.created_at,
    }))

    return { data: mappedLeads, error: null }
  } catch {
    return {
      data: null,
      error: 'Something went wrong while fetching leads.',
    }
  }
}

// ===============================
// ✅ REAL SUPABASE — WORKFLOW RUNS
// ===============================
export async function fetchWorkflowRuns(): Promise<ApiResponse<WorkflowRun[]>> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('workflow_runs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return { data: null, error: error.message }
    }

    const mappedRuns: WorkflowRun[] = (data ?? []).map((run) => ({
      id: run.id,
      user_id: run.user_id,
      goal: run.input_prompt ?? 'No goal',
      status:
        run.status === 'success'
          ? 'completed'
          : run.status === 'failed'
            ? 'failed'
            : 'running',
      steps_taken: run.steps_taken ?? 0,
      created_at: run.created_at,
    }))

    return { data: mappedRuns, error: null }
  } catch {
    return {
      data: null,
      error: 'Failed to load workflow history.',
    }
  }
}