import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_STYLES = `font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0e0e0e; color: #e5e2e1; border-radius: 12px; border: 1px solid #464555;`;
const HEADING_STYLE = `color: #4F46E5; font-size: 24px; margin-bottom: 20px;`;
const BODY_STYLE = `font-size: 16px; line-height: 1.5; color: #918fa1;`;
const FOOTER_STYLE = `font-size: 12px; color: #918fa1; opacity: 0.5;`;
const HR_STYLE = `border: none; border-top: 1px solid #464555; margin: 20px 0;`;

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Tool Research <noreply@aitoolresearch.com>',
      to: email,
      subject: 'Reset your password - AI Tool Research',
      html: `
        <div style="${BASE_STYLES}">
          <h1 style="${HEADING_STYLE}">AI Tool Research</h1>
          <p style="${BODY_STYLE}">You requested a password reset for your AI Tool Research account. Click the button below to set a new password.</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">Reset Password</a>
          <p style="font-size: 14px; color: #918fa1; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="${HR_STYLE}" />
          <p style="${FOOTER_STYLE}">© 2026 AI Tool Research. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending reset email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error('Exception sending reset email:', error);
    return { success: false, error };
  }
}

/**
 * Notify a tool submitter that their tool was approved and moved to DRAFT.
 * The admin edit URL is included so the admin context is clear in the email.
 * Never throws — email failure must not block the approve action.
 */
export async function sendSubmissionApprovedEmail(
  email: string,
  toolName: string,
) {
  try {
    const { error } = await resend.emails.send({
      from: 'AI Tool Research <noreply@aitoolresearch.com>',
      to: email,
      subject: `Your tool "${toolName}" was approved — AI Tool Research`,
      html: `
        <div style="${BASE_STYLES}">
          <h1 style="${HEADING_STYLE}">AI Tool Research</h1>
          <p style="${BODY_STYLE}">Great news! Your tool submission has been reviewed and <strong style="color: #10B981;">approved</strong>.</p>
          <div style="margin: 24px 0; padding: 16px; background-color: #0a0a0a; border-radius: 8px; border: 1px solid #464555;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #e5e2e1;">${toolName}</p>
            <p style="margin: 8px 0 0; font-size: 14px; color: #918fa1;">Our team will enrich the listing and publish it to the directory shortly.</p>
          </div>
          <p style="${BODY_STYLE}">Thank you for contributing to the open-source ecosystem. We'll reach out once your tool is live.</p>
          <hr style="${HR_STYLE}" />
          <p style="${FOOTER_STYLE}">© 2026 AI Tool Research. All rights reserved.</p>
        </div>
      `,
    });

    if (error) console.error('Error sending approval email:', error);
  } catch (err) {
    console.error('Exception sending approval email:', err);
  }
}

/**
 * Notify a tool submitter that their tool was rejected.
 * reason is optional — admin may or may not include one.
 * Never throws — email failure must not block the reject action.
 */
export async function sendSubmissionRejectedEmail(
  email: string,
  toolName: string,
  reason?: string,
) {
  try {
    const reasonBlock = reason
      ? `<div style="margin: 24px 0; padding: 16px; background-color: #0a0a0a; border-radius: 8px; border: 1px solid #464555;">
           <p style="margin: 0; font-size: 13px; color: #918fa1; text-transform: uppercase; letter-spacing: 0.05em;">Reason</p>
           <p style="margin: 8px 0 0; font-size: 14px; color: #e5e2e1;">${reason}</p>
         </div>`
      : '';

    const { error } = await resend.emails.send({
      from: 'AI Tool Research <noreply@aitoolresearch.com>',
      to: email,
      subject: `Your tool submission was not accepted — AI Tool Research`,
      html: `
        <div style="${BASE_STYLES}">
          <h1 style="${HEADING_STYLE}">AI Tool Research</h1>
          <p style="${BODY_STYLE}">Thank you for submitting <strong style="color: #e5e2e1;">${toolName}</strong>. After review, we were unable to add it to the directory at this time.</p>
          ${reasonBlock}
          <p style="${BODY_STYLE}">We carefully curate tools to keep the directory premium and high-quality. Feel free to re-submit if your tool evolves, or reach out if you have questions.</p>
          <hr style="${HR_STYLE}" />
          <p style="${FOOTER_STYLE}">© 2026 AI Tool Research. All rights reserved.</p>
        </div>
      `,
    });

    if (error) console.error('Error sending rejection email:', error);
  } catch (err) {
    console.error('Exception sending rejection email:', err);
  }
}
