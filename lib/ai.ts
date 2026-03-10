"use server"

import Anthropic from "@anthropic-ai/sdk"
import { Lead } from "./types"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateEmails(lead: Lead) {
  // Validate required fields
  if (!lead.firstName || !lead.email || !lead.jobTitle || !lead.company) {
    throw new Error("Missing required fields")
  }

  const prompt = `You are an expert sales outreach specialist. Analyze this prospect and generate a personalized outreach email.

Prospect Details:
- Name: ${lead.firstName} ${lead.lastName || ""}
- Email: ${lead.email}
- Job Title: ${lead.jobTitle}
- Company: ${lead.company}
- Company Description: ${lead.companyDescription || "Not provided"}

Generate ONLY a JSON response with NO markdown, NO code blocks, just raw JSON:
{
  "companyContext": "2-3 sentence overview",
  "painPoint": "1-2 sentence hypothesis",
  "personalizationHook": "1-2 sentence angle",
  "subjectLine": "Subject line (max 60 chars)",
  "emailBody": "Email body (max 120 words)"
}

IMPORTANT: Keep emailBody under 120 words. Keep subjectLine under 60 chars.`

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== "text") {
    throw new Error("Email generation failed")
  }

  const result = JSON.parse(content.text)

  // Enforce output limits
  const subjectLine = (result.subjectLine || "").slice(0, 60)
  const emailBody = (result.emailBody || "").split(" ").slice(0, 120).join(" ")

  return {
    companyContext: result.companyContext || "",
    painPoint: result.painPoint || "",
    personalizationHook: result.personalizationHook || "",
    subjectLine,
    emailBody,
  }
}
