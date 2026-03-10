import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "dev-key-change-in-production"

// Internal tool API — validates shared secret between frontend and backend
export async function POST(request: NextRequest) {
  try {
    // Validate API key from Authorization header
    const authHeader = request.headers.get("authorization") || ""
    const providedKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader

    if (providedKey !== INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, email, jobTitle, company, companyDescription } = body

    // Validate required fields
    if (!firstName || !email || !jobTitle || !company) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const prompt = `You are an expert sales outreach specialist. Analyze this prospect and generate a personalized outreach email.

Prospect Details:
- Name: ${firstName} ${lastName || ""}
- Email: ${email}
- Job Title: ${jobTitle}
- Company: ${company}
- Company Description: ${companyDescription || "Not provided"}

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
      console.error("Unexpected response type from Claude API")
      return NextResponse.json({ error: "Email generation failed" }, { status: 500 })
    }

    const result = JSON.parse(content.text)

    // Enforce output limits
    const subjectLine = (result.subjectLine || "").slice(0, 60)
    const emailBody = (result.emailBody || "").split(" ").slice(0, 120).join(" ")

    return NextResponse.json({
      companyContext: result.companyContext || "",
      painPoint: result.painPoint || "",
      personalizationHook: result.personalizationHook || "",
      subjectLine,
      emailBody,
    })
  } catch (error) {
    // Log detailed error server-side only
    console.error("API error:", error instanceof Error ? error.message : String(error))
    // Return generic error to client
    return NextResponse.json(
      { error: "Email generation failed" },
      { status: 500 }
    )
  }
}
