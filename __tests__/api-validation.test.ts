import { strict as assert } from "assert"

console.log("Testing API validation...")

// Test 1: Authorization check
function validateAuth(authHeader: string | null, expectedToken: string) {
  return !expectedToken || authHeader !== `Bearer ${expectedToken}` ? 401 : 200
}

const token = "secret-key-123"
assert.equal(validateAuth(null, token), 401)
assert.equal(validateAuth("Bearer wrong", token), 401)
assert.equal(validateAuth(`Bearer ${token}`, token), 200)
console.log("✓ Authorization validation")

// Test 2: Required field validation
function validateFields(data: any) {
  const { firstName, email, jobTitle, company } = data
  return !firstName || !email || !jobTitle || !company ? 400 : 200
}

assert.equal(validateFields({ firstName: "J", email: "j@x.com", jobTitle: "Mgr", company: "Co" }), 200)
assert.equal(validateFields({ firstName: "J", email: "", jobTitle: "Mgr", company: "Co" }), 400)
assert.equal(validateFields({ firstName: "", email: "j@x.com", jobTitle: "Mgr", company: "Co" }), 400)
console.log("✓ Field validation")

// Test 3: Output limits
function enforceOutputLimits(subject: string, body: string) {
  return {
    subject: subject.slice(0, 60),
    body: body.split(" ").slice(0, 120).join(" "),
  }
}

const r1 = enforceOutputLimits("x".repeat(100), "word ".repeat(150))
assert(r1.subject.length <= 60)
assert(r1.body.split(" ").length <= 120)
console.log("✓ Output limits")

// Test 4: Error masking
function maskError(err: Error): string {
  // Log internally, return generic to client
  console.debug(err.message)
  return "Email generation failed"
}

const masked = maskError(new Error("API key: xyz"))
assert.equal(masked, "Email generation failed")
console.log("✓ Error masking")

console.log("\n✅ All API validation tests passed\n")
