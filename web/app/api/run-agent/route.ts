import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_STEPS = 5;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userInput = body.input;

    let messages: any[] = [
      {
        role: "system",
        content: `You are Pilo — an AI CRM automation agent.

You follow a strict ReAct loop:
Reason → Act → Observe

You MUST always extract parameters from user input.

vailable actions:
- create_lead (name, email)
- get_leads (name REQUIRED)
- update_email (name, new_email)
- delete_lead (name)
- send_email (email, message)
- create new row in a table.

Rules:
- Always return JSON
- Max 5 steps
- After each action, wait for observation
- When task is complete, return action: "finish"
- Always use "update_email" action for updates
- Always include "name" and "email" in parameters

If action is "send_email":
Return parameters:
{
  "email": "<recipient email>",
  "message": "<email content>"
}

Output format:
{
  "action": "...",
  "parameters": {},
  "reasoning": "...",
  "step": 1
}`
      },
      {
        role: "user",
        content: userInput
      }
    ];

    let step = 1;
    let lastResult: any = null;

    while (step <= MAX_STEPS) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        messages,
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content || "{}");

      // ✅ If finished → return
      if (parsed.action === "finish") {
        return NextResponse.json(parsed);
      }

      // ✅ CALL MAKE WEBHOOK (TOOL EXECUTION)
      const toolResponse = await fetch(process.env.MAKE_WEBHOOK_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed),
      });

      let toolResult;

      try {
        toolResult = await toolResponse.json();
      } catch {
        toolResult = { message: "No JSON returned from tool" };
      }

      // ✅ ADD OBSERVATION BACK TO AI
      messages.push({
        role: "assistant",
        content: JSON.stringify(parsed),
      });

      messages.push({
        role: "user",
        content: `Observation: ${JSON.stringify(toolResult)}`,
      });

      step++;
    }

    return NextResponse.json({
      action: "finish",
      reasoning: "Max steps reached",
      step: MAX_STEPS,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json({
      error: "Something went wrong",
    });
  }
}