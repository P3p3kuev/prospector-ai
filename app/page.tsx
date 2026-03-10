"use client"

import { useState, useRef } from "react"
import { Lead } from "@/lib/types"
import { parseCSV } from "@/lib/csv"
import { generateEmails } from "@/lib/ai"

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setIsProcessing(true)

    try {
      const text = await file.text()
      const parsed = parseCSV(text)
      setLeads(parsed)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to parse CSV file"
      )
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleGenerateEmails = async () => {
    setIsProcessing(true)
    setError(null)

    const updatedLeads = [...leads]

    for (let i = 0; i < updatedLeads.length; i++) {
      if (updatedLeads[i].status === "pending") {
        updatedLeads[i].status = "processing"
        setLeads([...updatedLeads])

        try {
          const result = await generateEmails(updatedLeads[i])
          updatedLeads[i] = { ...updatedLeads[i], ...result, status: "generated" }
        } catch (err) {
          updatedLeads[i].status = "error"
          updatedLeads[i].error =
            err instanceof Error ? err.message : "Unknown error"
        }

        setLeads([...updatedLeads])
      }
    }

    setIsProcessing(false)
  }

  const handleEditField = (
    id: string,
    field: keyof Lead,
    value: string
  ) => {
    setLeads(
      leads.map((lead) =>
        lead.id === id ? { ...lead, [field]: value } : lead
      )
    )
  }

  const handleExport = () => {
    if (leads.length === 0) {
      setError("No leads to export")
      return
    }

    const headers = [
      "firstName",
      "lastName",
      "email",
      "jobTitle",
      "company",
      "subjectLine",
      "emailBody",
    ]
    const rows = leads.map((lead) =>
      headers.map((h) => {
        const value = lead[h as keyof Lead]
        const strValue = String(value || "")
        return `"${strValue.replace(/"/g, '""')}"`
      })
    )

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `prospector-ai-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Prospector AI</h1>
          <p className="text-lg text-gray-600">
            Transform Cognism lead lists into personalized outbound emails
          </p>
        </div>

        {/* Upload Section */}
        {leads.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 mb-8 border-2 border-dashed border-gray-300">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Upload Your Lead List
              </h2>
              <p className="text-gray-600 mb-6">
                Export a CSV from Cognism with columns: firstName, lastName, email,
                jobTitle, company, website, industry, companyDescription, companySize,
                techStack
              </p>
              <label className="inline-block">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isProcessing ? "Processing..." : "Choose CSV File"}
                </button>
              </label>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Results Section */}
        {leads.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {leads.length} Leads Loaded
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {leads.filter((l) => l.status === "generated").length} generated
                  </p>
                </div>
                <div className="flex gap-4">
                  {leads.some((l) => l.status === "pending") && (
                    <button
                      onClick={handleGenerateEmails}
                      disabled={isProcessing}
                      className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {isProcessing ? "Generating..." : "Generate Emails"}
                    </button>
                  )}
                  {leads.some((l) => l.status === "generated") && (
                    <button
                      onClick={handleExport}
                      className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                    >
                      Export CSV
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Clear all leads? This cannot be undone.")) {
                        setLeads([])
                      }
                    }}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Subject Line
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Email Body
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{lead.email}</td>
                      <td className="px-6 py-4 text-gray-700">{lead.company}</td>
                      <td className="px-6 py-4">
                        {lead.status === "generated" ? (
                          <input
                            type="text"
                            value={lead.subjectLine || ""}
                            onChange={(e) =>
                              handleEditField(lead.id, "subjectLine", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                            maxLength={60}
                          />
                        ) : (
                          <span className="text-gray-500">{lead.subjectLine}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {lead.status === "generated" ? (
                          <textarea
                            value={lead.emailBody || ""}
                            onChange={(e) =>
                              handleEditField(lead.id, "emailBody", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 text-xs h-20"
                          />
                        ) : (
                          <span className="text-gray-500 text-xs">
                            {lead.emailBody?.slice(0, 50)}...
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            lead.status === "generated"
                              ? "bg-green-100 text-green-800"
                              : lead.status === "processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : lead.status === "error"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {lead.status}
                        </span>
                        {lead.error && (
                          <div className="text-xs text-red-600 mt-1">{lead.error}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
