import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
          message: 'Analyzing goal...',
        },
        {
          step: 2,
          type: 'executing',
          message: 'Fetching leads...',
        },
        {
          step: 3,
          type: 'success',
          message: 'Done',
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
        message: log.message,
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