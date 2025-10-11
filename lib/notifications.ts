import { Resend } from "resend"
import { RequisitionStatus } from "@prisma/client"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface NotificationContext {
  requisitionId: string
  locationName: string
  createdByName: string
  fromStatus?: RequisitionStatus
  toStatus?: RequisitionStatus
  message?: string
}

export async function notifyEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("Resend not configured, skipping email notification")
    return { success: false, error: "Email service not configured" }
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@procurement.app",
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to send email:", error)
    return { success: false, error: String(error) }
  }
}

export async function notifySlack(
  message: string
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn("Slack webhook not configured, skipping Slack notification")
    return { success: false, error: "Slack webhook not configured" }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: message }),
    })

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to send Slack notification:", error)
    return { success: false, error: String(error) }
  }
}

export async function notifyRequisitionStatusChange(
  context: NotificationContext,
  recipientEmail: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const requisitionUrl = `${appUrl}/requisitions/${context.requisitionId}`

  const subject = `Requisition Status Updated: ${context.toStatus}`
  const html = `
    <h2>Requisition Status Update</h2>
    <p>The requisition for <strong>${context.locationName}</strong> has been updated.</p>
    <ul>
      <li><strong>Created by:</strong> ${context.createdByName}</li>
      ${context.fromStatus ? `<li><strong>Previous status:</strong> ${context.fromStatus}</li>` : ""}
      <li><strong>New status:</strong> ${context.toStatus}</li>
      ${context.message ? `<li><strong>Comment:</strong> ${context.message}</li>` : ""}
    </ul>
    <p><a href="${requisitionUrl}">View Requisition</a></p>
  `

  await notifyEmail(recipientEmail, subject, html)

  // Also send to Slack
  const slackMessage = `📋 *Requisition Update*\nLocation: ${context.locationName}\nStatus: ${context.fromStatus || "N/A"} → ${context.toStatus}\n${context.message ? `Comment: ${context.message}` : ""}\n<${requisitionUrl}|View Details>`
  await notifySlack(slackMessage)
}

export async function notifyRequisitionSubmitted(
  context: NotificationContext,
  procurementEmail: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const requisitionUrl = `${appUrl}/requisitions/${context.requisitionId}`

  const subject = `New Requisition Submitted: ${context.locationName}`
  const html = `
    <h2>New Requisition Submitted</h2>
    <p>A new requisition has been submitted for <strong>${context.locationName}</strong>.</p>
    <ul>
      <li><strong>Created by:</strong> ${context.createdByName}</li>
      <li><strong>Status:</strong> SUBMITTED</li>
    </ul>
    <p><a href="${requisitionUrl}">View Requisition</a></p>
  `

  await notifyEmail(procurementEmail, subject, html)

  const slackMessage = `📋 *New Requisition*\nLocation: ${context.locationName}\nCreated by: ${context.createdByName}\n<${requisitionUrl}|Review Now>`
  await notifySlack(slackMessage)
}

export async function notifyRequisitionEdited(
  context: NotificationContext,
  requesterEmail: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const requisitionUrl = `${appUrl}/requisitions/${context.requisitionId}`

  const subject = `Your Requisition Has Been Edited`
  const html = `
    <h2>Requisition Edited</h2>
    <p>Your requisition for <strong>${context.locationName}</strong> has been edited by the procurement team.</p>
    ${context.message ? `<p><strong>Comment:</strong> ${context.message}</p>` : ""}
    <p><a href="${requisitionUrl}">View Changes</a></p>
  `

  await notifyEmail(requesterEmail, subject, html)
}

