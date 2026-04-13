import { Lead, WorkflowRun, MockUser, FeedItem } from './types'

// Mock user — TODO: replace with Supabase Auth session
export const MOCK_USER: MockUser = {
  id: 'demo-user',
  name: 'Sourav',
  email: 'demo@pilo.ai',
}

export const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-01',
    user_id: 'demo-user',
    name: 'Ravi Mehta',
    email: 'ravi@apexretail.in',
    company: 'Apex Retail Pvt Ltd',
    status: 'inactive',
    last_contacted_at: '2024-11-10T10:00:00Z',
    notes: 'Interested in Diwali campaign',
    created_at: '2024-09-01T08:00:00Z',
  },
  {
    id: 'lead-02',
    user_id: 'demo-user',
    name: 'Priya Sharma',
    email: 'priya@bluewave.co.in',
    company: 'BlueWave Logistics',
    status: 'contacted',
    last_contacted_at: '2024-12-01T14:00:00Z',
    notes: null,
    created_at: '2024-09-15T09:00:00Z',
  },
  {
    id: 'lead-03',
    user_id: 'demo-user',
    name: 'Amit Joshi',
    email: 'amit@greenlinefoods.in',
    company: 'Greenline Foods',
    status: 'new',
    last_contacted_at: null,
    notes: 'Referral from Ravi',
    created_at: '2024-12-10T11:00:00Z',
  },
  {
    id: 'lead-04',
    user_id: 'demo-user',
    name: 'Sneha Patil',
    email: 'sneha@urbancraft.in',
    company: 'Urban Craft Co.',
    status: 'qualified',
    last_contacted_at: '2024-12-20T16:00:00Z',
    notes: 'Demo scheduled for Jan',
    created_at: '2024-10-05T07:00:00Z',
  },
]

export const MOCK_WORKFLOW_RUNS: WorkflowRun[] = [
  {
    id: 'run-01',
    user_id: 'demo-user',
    goal: 'Follow up with cold leads',
    status: 'completed',
    steps_taken: 5,
    created_at: '2024-12-28T10:00:00Z',
  },
  {
    id: 'run-02',
    user_id: 'demo-user',
    goal: 'Send intro email to new leads',
    status: 'completed',
    steps_taken: 4,
    created_at: '2024-12-27T14:00:00Z',
  },
  {
    id: 'run-03',
    user_id: 'demo-user',
    goal: 'Update CRM for inactive contacts',
    status: 'failed',
    steps_taken: 2,
    created_at: '2024-12-26T09:00:00Z',
  },
]

// buildDemoFeed MUST be defined and exported from this file
// Timestamps are set at runtime — do not hardcode here
// run_start and run_end use step: 0 — system markers, not real steps
export function buildDemoFeed(goal: string): Omit<FeedItem, 'timestamp'>[] {
  return [
    { step: 0, type: 'run_start',  action: 'system',    message: `Goal received: "${goal}"` },
    { step: 1, type: 'thinking',   action: 'plan',       message: 'Analyzing goal and planning execution steps...' },
    { step: 2, type: 'executing',  action: 'Get_Leads',  message: 'Fetching leads inactive for 7+ days from CRM...' },
    { step: 3, type: 'success',    action: 'Get_Leads',  message: '3 leads found — Ravi Mehta, Priya Sharma, Amit Joshi' },
    { step: 4, type: 'executing',  action: 'Send_Email', message: 'Composing and sending personalized follow-up emails...' },
    { step: 5, type: 'success',    action: 'Send_Email', message: 'All emails sent successfully. Awaiting responses.' },
    { step: 0, type: 'run_end',    action: 'system',     message: 'Run completed in 5 steps.' },
  ]
}
