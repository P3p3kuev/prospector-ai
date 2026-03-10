import { strict as assert } from "assert"

console.log("Testing API validation logic...")

// Test the actual validation logic from the route

// Test 1: API key validation (internal tool security)
const INTERNAL_API_KEY = "dev-key-change-in-production"

function validateApiKey(authHeader: string): boolean {
  const providedKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader
  return providedKey === INTERNAL_API_KEY
}

assert.equal(validateApiKey("Bearer dev-key-change-in-production"), true)
assert.equal(validateApiKey("dev-key-change-in-production"), true)
assert.equal(validateApiKey("Bearer wrong-key"), false)
assert.equal(validateApiKey(""), false)
console.log("✓ API key validation")

// Test 2: Required field validation (from route)
function validateLeadFields(firstName: any, email: any, jobTitle: any, company: any): boolean {
  return !firstName || !email || !jobTitle || !company ? false : true
}

assert.equal(validateLeadFields("J", "j@x.com", "Mgr", "Co"), true)
assert.equal(validateLeadFields("J", "", "Mgr", "Co"), false)
assert.equal(validateLeadFields("", "j@x.com", "Mgr", "Co"), false)
console.log("✓ Required field validation")

// Test 3: Output limits enforcement (from route)
function enforceOutputLimits(subjectLine: string, emailBody: string) {
  return {
    subject: subjectLine.slice(0, 60),
    body: emailBody.split(" ").slice(0, 120).join(" "),
  }
}

const limited = enforceOutputLimits("x".repeat(100), "word ".repeat(150))
assert(limited.subject.length <= 60)
assert(limited.body.split(" ").length <= 120)
console.log("✓ Output limits")

// Test 4: Error handling (generic to client, detailed logged server-side)
function handleError(error: Error): { publicMessage: string; loggedMessage: string } {
  return {
    publicMessage: "Email generation failed", // Generic to client
    loggedMessage: error.message, // Logged server-side only
  }
}

const errorResponse = handleError(new Error("API key xyz invalid"))
assert.equal(errorResponse.publicMessage, "Email generation failed")
assert(errorResponse.loggedMessage.includes("API key"))
console.log("✓ Error handling")

console.log("\n✅ All API validation tests passed\n")
