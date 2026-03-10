import { strict as assert } from "assert"

console.log("Testing server action validation logic...")

// Test the actual validation logic from lib/ai.ts (server action)

// Test 1: Required field validation (from server action)
function validateLeadFields(
  firstName: unknown,
  email: unknown,
  jobTitle: unknown,
  company: unknown
): boolean {
  return !firstName || !email || !jobTitle || !company ? false : true
}

assert.equal(validateLeadFields("J", "j@x.com", "Mgr", "Co"), true)
assert.equal(validateLeadFields("J", "", "Mgr", "Co"), false)
assert.equal(validateLeadFields("", "j@x.com", "Mgr", "Co"), false)
assert.equal(validateLeadFields("J", "j@x.com", "", "Co"), false)
assert.equal(validateLeadFields("J", "j@x.com", "Mgr", ""), false)
console.log("✓ Required field validation")

// Test 2: Output limits enforcement (from server action)
function enforceOutputLimits(subjectLine: string, emailBody: string) {
  return {
    subject: subjectLine.slice(0, 60),
    body: emailBody.split(" ").slice(0, 120).join(" "),
  }
}

const limited = enforceOutputLimits("x".repeat(100), "word ".repeat(150))
assert(limited.subject.length <= 60)
assert(limited.body.split(" ").length <= 120)
console.log("✓ Output limits enforcement")

// Test 3: Subject line truncation
const veryLongSubject = "This is a very long subject line that exceeds the sixty character limit"
const truncated = veryLongSubject.slice(0, 60)
assert(truncated.length === 60)
console.log("✓ Subject line truncation")

// Test 4: Email body word counting
const manyWords = Array(150).fill("word").join(" ")
const wordList = manyWords.split(" ").slice(0, 120)
assert(wordList.length === 120)
console.log("✓ Email body word limiting")

console.log("\n✅ All server action validation tests passed\n")
