import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

type Action = 'get_leads' | 'create_lead' | 'update_email' | 'delete_lead' | 'send_email'

const VALID_ACTIONS: Action[] = [
  'get_leads',
  'create_lead',
  'update_email',
  'delete_lead',
  'send_email',
]

function isValidAction(a: unknown): a is Action {
  return typeof a === 'string' && VALID_ACTIONS.includes(a as Action)
}

type ParsedIntent = {
  action?: unknown
  name: string | null
  email: string | null
  company: string | null
  message: string | null
}

type UpdateEmailInput = Omit<ParsedIntent, 'email'> & { new_email: string | null }

async function parseWithAI(input: string): Promise<ParsedIntent | null> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `
You are an AI CRM assistant.

Extract structured data from the user input.

Return ONLY JSON in this format:

{
  "action": "get_leads | create_lead | update_email | delete_lead | send_email",
  "name": string | null,
  "email": string | null,
  "company": string | null,
  "message": string | null
}

Rules:
- Detect intent correctly
- Extract names properly
- Extract valid emails
- If not present → null
- No explanation, only JSON
        `,
      },
      {
        role: 'user',
        content: input,
      },
    ],
    temperature: 0,
  })

  const text = response.choices[0].message.content || '{}'

  try {
    return JSON.parse(text) as ParsedIntent
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  let action: Action | null = null
  try {
    const body = await req.json()
    const { goal, user_id } = body
    const userInput = String(goal ?? '')
    if (!user_id || user_id === '') {
      console.warn('Missing user_id, using demo UUID')
    }

    const run_id = `run_${Date.now()}`

    const parsed = await parseWithAI(userInput)

    if (!parsed) {
      return NextResponse.json(
        { success: false, error: 'Parsing failed', action },
        { status: 400 }
      )
    }

    const parsedAction = parsed.action
    if (!isValidAction(parsedAction)) {
      return NextResponse.json(
        { success: false, error: 'Parsing failed', action },
        { status: 400 }
      )
    }
    action = parsedAction

    let input: ParsedIntent | UpdateEmailInput
    if (action === 'update_email') {
      const { email, ...rest } = parsed
      input = { ...rest, new_email: email }
    } else {
      input = parsed
    }

    const details: Record<string, string[]> = {}
    if (action === 'create_lead') {
      const missing: string[] = []
      if (!parsed.name) missing.push('name')
      if (!parsed.email) missing.push('email')
      if (missing.length > 0) details.create_lead = missing
    } else if (action === 'update_email') {
      const updateInput = input as UpdateEmailInput
      const missing: string[] = []
      if (!updateInput.name) missing.push('name')
      if (!updateInput.new_email) missing.push('new_email')
      if (missing.length > 0) details.update_email = missing
    } else if (action === 'delete_lead') {
      const missing: string[] = []
      if (!parsed.name) missing.push('name')
      if (missing.length > 0) details.delete_lead = missing
    } else if (action === 'send_email') {
      const missing: string[] = []
      if (!parsed.name) missing.push('name')
      if (!parsed.message) missing.push('message')
      if (missing.length > 0) details.send_email = missing
    }

    if (Object.keys(details).length > 0) {
      console.log('VALIDATION FAILED:', details)
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          action,
          details,
        },
        { status: 400 }
      )
    }

    const payload = {
      run_id,
      action,
      user_id: String(user_id ?? ''),
      input,
    }

    console.log('USER INPUT:', userInput)
    console.log('RESOLVED ACTION:', action)
    console.log('RUN_ID:', run_id)
    console.log('Sending to webhook:', payload)

    const response = await fetch(process.env.MAKE_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const text = await response.text()

    console.log('MAKE RESPONSE STATUS:', response.status)
    console.log('MAKE RESPONSE BODY:', text)

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Webhook request failed', action },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true, run_id, action })
  } catch (err) {
    console.error('RUN AGENT ERROR:', err)
    return NextResponse.json(
      { success: false, error: 'Something went wrong', action },
      { status: 500 }
    )
  }
}
