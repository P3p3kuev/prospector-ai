import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, jobTitle, company, companyDescription } = body

    const prompt = `You are an expert sales outreach specialist. Analyze this prospect and generate a personalized outreach email.

Prospect Details:
- Name: ${firstName} ${lastName || ""}
- Email: ${email}
- Job Title: ${jobTitle}
- Company: ${company}
- Company Description: ${companyDescription || "Not provided"}

Generate ONLY a JSON response with NO markdown, NO code blocks, just raw JSON:
{
  "companyContext": "2-3 sentence overview of the company's business situation and relevance",
  "painPoint": "1-2 sentence hypothesis about their business challenge",
  "personalizationHook": "1-2 sentence specific angle for outreach",
  "subjectLine": "Compelling email subject line (max 60 characters)",
  "emailBody": "Professional personalized email body (max 120 words)"
}

Keep the response concise and actionable.`

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
      throw new Error("Unexpected response type from Claude API")
    }

    const result = JSON.parse(content.text)

    return NextResponse.json({
      companyContext: result.companyContext,
      painPoint: result.painPoint,
      personalizationHook: result.personalizationHook,
      subjectLine: result.subjectLine.slice(0, 60),
      emailBody: result.emailBody.slice(0, 500),
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process lead",
      },
      { status: 500 }
    )
  }
}
