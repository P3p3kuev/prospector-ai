// Shared validation logic used by both server action and tests

export function validateLeadFields(
  firstName: unknown,
  email: unknown,
  jobTitle: unknown,
  company: unknown
): boolean {
  return !firstName || !email || !jobTitle || !company ? false : true
}

export function enforceOutputLimits(subjectLine: string, emailBody: string) {
  return {
    subject: subjectLine.slice(0, 60),
    body: emailBody.split(" ").slice(0, 120).join(" "),
  }
}
