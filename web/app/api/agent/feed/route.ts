import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function toActionKey(action: unknown): string {
  if (typeof action !== 'string') return ''
  return action.trim().toLowerCase()
}

function getNameFromLog(log: Record<string, unknown>): string | null {
  if (typeof log.name === 'string' && log.name.trim().length > 0) {
    return log.name.trim()
  }

  if (log.input && typeof log.input === 'object') {
    const input = log.input as Record<string, unknown>
    if (typeof input.name === 'string' && input.name.trim().length > 0) {
      return input.name.trim()
    }
  }

  return null
}

function toFriendlyMessage(action: unknown, name: string | null, fallback: unknown): string {
  const actionKey = toActionKey(action)

  if (actionKey === 'create_lead') {
    return 'Creating a new lead...'
  }
  if (actionKey === 'update_email') {
    return name ? `Updating ${name}'s email...` : 'Updating email...'
  }
  if (actionKey === 'delete_lead') {
    return name ? `Deleting ${name}'s lead...` : 'Deleting lead...'
  }
  if (actionKey === 'send_email') {
    return name ? `Sending email to ${name}...` : 'Sending email...'
  }
  if (actionKey === 'get_leads') {
    return 'Fetching leads...'
  }

  if (typeof fallback === 'string' && fallback.trim().length > 0) {
    return fallback
  }
  return 'Working on your request...'
}

export async function GET(req: Request) {
  console.log("🔥 FEED API HIT")

  try {
    const { searchParams } = new URL(req.url)
    const run_id = searchParams.get('run_id')
    const mode = searchParams.get('mode')

    if (!run_id) {
      return NextResponse.json({ error: 'Missing run_id' }, { status: 400 })
    }

    // ================= DEMO MODE =================
    if (mode === 'demo') {
      const now = new Date().toISOString()

      const steps = [
        {
          step: 1,
          type: 'thinking',
          message: 'Fetching leads...',
        },
        {
          step: 2,
          type: 'executing',
          message: 'Fetching leads...',
        },
        {
          step: 3,
          type: 'success',
          message: 'Fetching leads...',
        },
      ]

      return NextResponse.json(steps)
    }

    // ================= LIVE MODE =================
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log("SERVICE KEY EXISTS:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log("RUN_ID RECEIVED:", run_id)

    const { data, error } = await supabase
      .from('agent_logs')
      .select('*')
      .eq('run_id', run_id)
      .order('step', { ascending: true })

    console.log("SUPABASE DATA:", data)
    console.log("SUPABASE ERROR:", error)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      (data || []).map(log => ({
        step: log.step,
        type: log.type,
        message: toFriendlyMessage(log.action, getNameFromLog(log), log.message),
      }))
    )

  } catch (err) {
    console.error("FEED API ERROR:", err)
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    )
  }
}