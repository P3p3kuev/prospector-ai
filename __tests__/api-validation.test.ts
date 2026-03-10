import { strict as assert } from "assert"
import { validateLeadFields, enforceOutputLimits } from "../lib/validation"

console.log("Testing shared validation logic...")

// Test 1: Required field validation
assert.equal(validateLeadFields("J", "j@x.com", "Mgr", "Co"), true)
assert.equal(validateLeadFields("J", "", "Mgr", "Co"), false)
assert.equal(validateLeadFields("", "j@x.com", "Mgr", "Co"), false)
assert.equal(validateLeadFields("J", "j@x.com", "", "Co"), false)
assert.equal(validateLeadFields("J", "j@x.com", "Mgr", ""), false)
console.log("✓ Required field validation")

// Test 2: Output limits enforcement
const limited = enforceOutputLimits("x".repeat(100), "word ".repeat(150))
assert(limited.subject.length <= 60)
assert(limited.body.split(" ").length <= 120)
console.log("✓ Output limits enforcement")

// Test 3: Subject line truncation
const veryLongSubject = "This is a very long subject line that exceeds the sixty character limit"
const truncated = enforceOutputLimits(veryLongSubject, "").subject
assert(truncated.length === 60)
console.log("✓ Subject line truncation")

// Test 4: Email body word limiting
const manyWords = Array(150).fill("word").join(" ")
const wordLimited = enforceOutputLimits("", manyWords).body
assert(wordLimited.split(" ").length === 120)
console.log("✓ Email body word limiting")

console.log("\n✅ All validation tests passed\n")
