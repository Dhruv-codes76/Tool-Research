import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Tool Research <noreply@aitoolresearch.com>', // Replace with your verified domain in production
      to: email,
      subject: 'Reset your password - AI Tool Research',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0e0e0e; color: #e5e2e1; border-radius: 12px; border: 1px solid #464555;">
          <h1 style="color: #4F46E5; font-size: 24px; margin-bottom: 20px;">AI Tool Research</h1>
          <p style="font-size: 16px; line-height: 1.5; color: #918fa1;">You requested a password reset for your AI Tool Research account. Click the button below to set a new password.</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">Reset Password</a>
          <p style="font-size: 14px; color: #918fa1; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #464555; margin: 20px 0;" />
          <p style="font-size: 12px; color: #918fa1; opacity: 0.5;">© 2026 AI Tool Research. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending reset email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Exception sending reset email:', error);
    return { success: false, error };
  }
}
