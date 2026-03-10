import { Lead } from "./types"

export async function generateEmails(lead: Lead) {
  const response = await fetch("/api/process-leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer dev-key-change-in-production",
    },
    body: JSON.stringify({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      jobTitle: lead.jobTitle,
      company: lead.company,
      companyDescription: lead.companyDescription,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to generate emails")
  }

  return await response.json()
}
