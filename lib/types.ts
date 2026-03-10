export interface Lead {
  id: string
  firstName: string
  lastName?: string
  email: string
  jobTitle: string
  company: string
  website?: string
  industry?: string
  companyDescription?: string
  companySize?: string
  techStack?: string
  companyContext?: string
  painPoint?: string
  personalizationHook?: string
  subjectLine?: string
  emailBody?: string
  status: "pending" | "processing" | "generated" | "error"
  error?: string
}
