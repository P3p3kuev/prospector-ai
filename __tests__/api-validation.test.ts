import { strict as assert } from "assert"
import Anthropic from "@anthropic-ai/sdk"
import { validateLeadFields, enforceOutputLimits } from "../lib/validation"
import { generateEmailsCore } from "../lib/ai"

console.log("Testing server action with mocked Anthropic client...")

// Test 1: Required field validation invariant
assert.equal(validateLeadFields("J", "j@x.com", "Mgr", "Co"), true)
assert.equal(validateLeadFields("J", "", "Mgr", "Co"), false)
console.log("✓ Required field validation invariant")

// Test 2: Output limits enforcement invariant
const limited = enforceOutputLimits("x".repeat(100), "word ".repeat(150))
assert(limited.subject.length <= 60)
assert(limited.body.split(" ").length <= 120)
console.log("✓ Output limits enforcement invariant")

// Test 3 & 4: Async tests with mocked Anthropic client
;(async () => {
  const mockAnthropicClient = {
    messages: {
      create: async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              companyContext: "This is a test company context.",
              painPoint: "They need better outreach tools.",
              personalizationHook: "You're in the same space as competitors.",
              subjectLine: "This is a very long subject line that should be truncated to 60 chars max",
              emailBody: Array(150).fill("word").join(" "),
            }),
          },
        ],
      }),
    },
  }

  const testLead = {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    jobTitle: "Manager",
    company: "Acme Corp",
    companyDescription: "Test company",
    status: "pending" as const,
  }

  const result = await generateEmailsCore(testLead, mockAnthropicClient as unknown as Anthropic)

  // Verify output limits are enforced
  assert(result.subjectLine.length <= 60, `Subject too long: ${result.subjectLine.length}`)
  assert(
    result.emailBody.split(" ").length <= 120,
    `Email body too long: ${result.emailBody.split(" ").length} words`
  )
  console.log("✓ generateEmailsCore enforces output limits")

  // Test 4: Missing required fields throws error
  try {
    await generateEmailsCore(
      { ...testLead, firstName: "" }, // Missing firstName
      mockAnthropicClient as unknown as Anthropic
    )
    assert.fail("Should throw for missing firstName")
  } catch (error) {
    assert(error instanceof Error)
    assert(error.message.includes("Missing required fields"))
  }
  console.log("✓ generateEmailsCore validates required fields")

  console.log("\n✅ All server action behavior tests passed\n")
})()
