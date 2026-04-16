import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

type CsvLead = {
  name?: string
  email?: string
  company?: string
}

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  return authorization.slice('Bearer '.length).trim()
}

function normalizeLead(lead: CsvLead, userId: string) {
  const name = lead.name?.trim()
  const email = lead.email?.trim().toLowerCase()

  if (!name || !email) {
    return null
  }

  return {
    user_id: userId,
    name,
    email,
    company: lead.company?.trim() ?? '',
    status: 'inactive',
  }
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase environment variables are missing.' }, { status: 500 })
  }

  const token = getBearerToken(request)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const body = (await request.json()) as { leads?: CsvLead[] }
  const leads = Array.isArray(body.leads) ? body.leads : []
  const rows = leads
    .map((lead) => normalizeLead(lead, user.id))
    .filter((lead): lead is NonNullable<ReturnType<typeof normalizeLead>> => lead !== null)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No valid leads found in CSV.' }, { status: 400 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error } = await adminClient.from('leads').insert(rows)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, inserted: rows.length })
}
