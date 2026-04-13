import { NextResponse } from 'next/server'

type Action = 'get_leads' | 'create_lead' | 'update_email' | 'delete_lead' | 'send_email'

function resolveActionFromGoal(goal: string): Action {
  const input = goal.toLowerCase().trim()

  let action: Action = 'get_leads'

  // ✅ HIGH PRIORITY ACTIONS FIRST

  if (
    input.includes('create') ||
    input.includes('add lead') ||
    input.includes('new lead')
  ) {
    action = 'create_lead'
  }

  else if (
    input.includes('update email') ||
    input.includes('change email')
  ) {
    action = 'update_email'
  }

  else if (
    input.includes('delete') ||
    input.includes('remove lead')
  ) {
    action = 'delete_lead'
  }

  else if (
    input.includes('get leads') ||
    input.includes('show leads') ||
    input.includes('list leads')
  ) {
    action = 'get_leads'
  }

  // ✅ STRICT SEND EMAIL (VERY IMPORTANT)
  else if (
    input.startsWith('send email') ||
    input.includes('send email to') ||
    input.includes('send mail to')
  ) {
    action = 'send_email'
  }

  console.log('Resolved action:', action)
  return action
}

function extractLeadData(input: string): {
  name: string | null
  email: string | null
  company: string | null
} {
  const nameMatch = input.match(/name:\s*([^,]+)/i)
  const emailMatch = input.match(/email:\s*([^,]+)/i)
  const companyMatch = input.match(/company:\s*([^,]+)/i)

  const name = nameMatch ? nameMatch[1].trim() : null
  const email = emailMatch ? emailMatch[1].trim() : null
  const company = companyMatch ? companyMatch[1].trim() : null

  return { name, email, company }
}

function extractUpdateEmailData(input: string): {
  name: string | null
  new_email: string | null
} {
  const emailMatch = input.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/)
  const new_email = emailMatch ? emailMatch[0] : null

  const nameMatch = input.match(/of\s+(.*?)\s+to/i)
  const name = nameMatch ? nameMatch[1].trim() : null

  return { name, new_email }
}

function extractDeleteLeadData(input: string): { name: string | null } {
  const match = input.match(/delete\s+lead\s+(.*)/i)
  const name = match ? match[1].trim() : null

  return { name }
}

function extractSendEmailData(input: string): {
  name: string | null
  message: string | null
} {
  const nameMatch = input.match(/to\s+(.*?)\s+saying/i)
  const messageMatch = input.match(/saying\s+(.*)/i)

  const name = nameMatch ? nameMatch[1].trim() : null
  const message = messageMatch ? messageMatch[1].trim() : null

  return { name, message }
}

export async function POST(req: Request) {
try {
const body = await req.json()
const userInput = String(body.goal ?? '')

const run_id = `run_${Date.now()}`
const action = resolveActionFromGoal(userInput)

console.log("USER INPUT:", userInput)
console.log("RESOLVED ACTION:", action)
console.log("RUN_ID:", run_id)

let payload: {
  run_id: string
  action: Action
  input:
    | { name: string | null; email: string | null; company: string | null }
    | { name: string | null; new_email: string | null }
    | { name: string | null }
    | { name: string | null; message: string | null }
    | string
} = {
  run_id,
  action,
  input: userInput,
}

if (action === 'create_lead') {
  const { name, email, company } = extractLeadData(userInput)
  payload.input = { name, email, company }
} else if (action === 'update_email') {
  const { name, new_email } = extractUpdateEmailData(userInput)
  payload.input = { name, new_email }
} else if (action === 'delete_lead') {
  const { name } = extractDeleteLeadData(userInput)
  payload.input = { name }
} else if (action === 'send_email') {
  const { name, message } = extractSendEmailData(userInput)
  payload.input = { name, message }
} else {
  payload.input = userInput
}

console.log('Sending to webhook:', payload)

const response = await fetch(process.env.MAKE_WEBHOOK_URL!, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

const text = await response.text()

console.log("MAKE RESPONSE STATUS:", response.status)
console.log("MAKE RESPONSE BODY:", text)

return Response.json({ run_id })

} catch (err) {
console.error("RUN AGENT ERROR:", err)
return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
}
}