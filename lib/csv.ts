import { Lead } from "./types"

export function parseCSV(csvText: string): Lead[] {
  // Parse entire CSV respecting quoted fields (handles multi-line cells)
  const rows = parseCSVRows(csvText)

  if (rows.length < 2) {
    throw new Error("CSV file must have a header row and at least one data row")
  }

  // Parse header
  const headers = rows[0].map((h) => h.toLowerCase().trim())

  // Find required column indices
  const findColumnIndex = (names: string[]) => {
    for (const name of names) {
      const idx = headers.findIndex(
        (h) => h.includes(name.toLowerCase()) || h.replace(/\s+/g, "") === name.replace(/\s+/g, "")
      )
      if (idx !== -1) return idx
    }
    return -1
  }

  const firstNameIdx = findColumnIndex(["first", "firstname", "given"])
  const lastNameIdx = findColumnIndex(["last", "lastname", "surname", "family"])
  const emailIdx = findColumnIndex(["email", "email address", "e-mail"])
  const jobTitleIdx = findColumnIndex(["job", "title", "jobtitle", "position", "role"])
  const companyIdx = findColumnIndex(["company", "companyname", "organisation", "organization"])
  const websiteIdx = findColumnIndex(["website", "web", "url", "domain"])
  const industryIdx = findColumnIndex(["industry", "sector"])
  const descriptionIdx = findColumnIndex(["description", "company description", "about"])
  const sizeIdx = findColumnIndex(["size", "company size", "employees"])
  const techStackIdx = findColumnIndex(["tech", "technology", "stack", "technologies"])

  if (firstNameIdx === -1 || emailIdx === -1 || jobTitleIdx === -1 || companyIdx === -1) {
    throw new Error(
      "CSV must have columns: First Name, Email, Job Title, Company. Got: " + headers.join(", ")
    )
  }

  // Parse data rows
  const leads: Lead[] = []
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i]

    const firstName = (values[firstNameIdx] || "").trim()
    const lastName = lastNameIdx !== -1 ? (values[lastNameIdx] || "").trim() : ""
    const email = (values[emailIdx] || "").trim()
    const jobTitle = (values[jobTitleIdx] || "").trim()
    const company = (values[companyIdx] || "").trim()

    // Skip if required fields are missing
    if (!firstName || !email || !jobTitle || !company) {
      continue
    }

    leads.push({
      id: `${i}`,
      firstName,
      lastName: lastName || undefined,
      email,
      jobTitle,
      company,
      website: websiteIdx !== -1 ? (values[websiteIdx] || "").trim() || undefined : undefined,
      industry: industryIdx !== -1 ? (values[industryIdx] || "").trim() || undefined : undefined,
      companyDescription: descriptionIdx !== -1 ? (values[descriptionIdx] || "").trim() || undefined : undefined,
      companySize: sizeIdx !== -1 ? (values[sizeIdx] || "").trim() || undefined : undefined,
      techStack: techStackIdx !== -1 ? (values[techStackIdx] || "").trim() || undefined : undefined,
      status: "pending",
    })
  }

  if (leads.length === 0) {
    throw new Error("No valid leads found in CSV (missing required fields)")
  }

  if (leads.length > 200) {
    throw new Error("Maximum 200 leads per upload. Found: " + leads.length)
  }

  return leads
}

// Parse entire CSV text, respecting quoted fields with newlines
function parseCSVRows(csvText: string): string[][] {
  const rows: string[][] = []
  let current = ""
  let insideQuotes = false

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i]
    const nextChar = csvText[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        insideQuotes = !insideQuotes
      }
      current += char
    } else if (char === "\n" && !insideQuotes) {
      // Row boundary
      const row = parseCSVLine(current.trim())
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row)
      }
      current = ""
    } else {
      current += char
    }
  }

  // Final row
  if (current.trim()) {
    rows.push(parseCSVLine(current.trim()))
  }

  return rows
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}
