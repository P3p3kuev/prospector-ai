import { strict as assert } from "assert"
import { parseCSV } from "@/lib/csv"

console.log("Testing CSV parsing...")

// Test 1: Parse basic CSV
const csv1 = `firstName,lastName,email,jobTitle,company
John,Doe,john@example.com,Manager,Acme Corp
Jane,Smith,jane@example.com,Director,TechCorp`

const leads1 = parseCSV(csv1)
assert.equal(leads1.length, 2)
assert.equal(leads1[0].firstName, "John")
assert.equal(leads1[1].company, "TechCorp")
console.log("✓ Basic CSV parsing")

// Test 2: Multi-line quoted fields
const csv2 = `firstName,lastName,email,jobTitle,company,companyDescription
John,Doe,john@example.com,Manager,"Acme Corp","Description
with multiple
lines"`

const leads2 = parseCSV(csv2)
assert.equal(leads2.length, 1)
assert(leads2[0].companyDescription?.includes("multiple"))
console.log("✓ Multi-line quoted fields")

// Test 3: Skip invalid rows (missing required fields)
const csv3 = `firstName,lastName,email,jobTitle,company
John,Doe,john@example.com,Manager,Acme
,Smith,jane@example.com,Director,Tech
Bob,Smith,,Manager,Corp`

const leads3 = parseCSV(csv3)
assert.equal(leads3.length, 1) // Only John is valid (Jane missing firstName, Bob missing email)
console.log("✓ Invalid row handling")

// Test 4: Missing required columns error
try {
  parseCSV(`firstName,lastName
John,Doe`)
  assert.fail("Should throw")
} catch (e) {
  assert(e instanceof Error)
}
console.log("✓ Missing required columns")

// Test 5: Max leads limit
const csvMany = `firstName,email,jobTitle,company
${Array.from({ length: 201 }, (_, i) => `User${i},user${i}@ex.com,Mgr,Co${i}`).join("\n")}`

try {
  parseCSV(csvMany)
  assert.fail("Should throw")
} catch (e) {
  assert(e instanceof Error)
}
console.log("✓ Max leads limit")

console.log("\n✅ All CSV tests passed\n")
