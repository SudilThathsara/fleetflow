// Provider-based email service adapter for FleetFlow Lanka

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  type?:
    | 'verification'
    | 'password_reset'
    | 'enquiry_received'
    | 'quote_available'
    | 'booking_received'
    | 'booking_confirmed'
    | 'invoice_issued'
    | 'payment_receipt'
    | 'support_update';
}

export interface EmailResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
  mode: 'live' | 'development_audit';
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const resendApiKey = process.env.RESEND_API_KEY;

  // 1. If Resend API Key is provided
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'FleetFlow Lanka <noreply@fleetflow.lk>',
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.subject,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, provider: 'Resend', messageId: data.id, mode: 'live' };
      }
      return { success: false, provider: 'Resend', error: data.message || 'Resend error', mode: 'live' };
    } catch (err: any) {
      return { success: false, provider: 'Resend', error: err.message, mode: 'live' };
    }
  }

  // 2. Fallback / Development Audit Log
  // In development, or when external SMTP is not yet wired, record delivery safely to server logs
  console.log(`[EMAIL AUDIT - ${options.type || 'standard'}] To: ${options.to} | Subject: "${options.subject}"`);
  
  return {
    success: true,
    provider: 'System Audit Dispatcher (Local)',
    messageId: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    mode: 'development_audit',
  };
}

// ----------------- EMAIL TEMPLATE GENERATORS -----------------

export function getVerificationEmailHtml(name: string, verifyUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0f172a; margin: 0;">Verify Your Email Address</h2>
        <p style="color: #64748b; font-size: 14px;">Welcome to Lanka Premier Transport & Vehicle Hire</p>
      </div>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for registering your customer portal account. Please verify your email address to activate your quotation and booking access:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="color: #64748b; font-size: 13px;">Or copy and paste this link into your browser:<br/><a href="${verifyUrl}" style="color: #0284c7;">${verifyUrl}</a></p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">This link will expire in 24 hours. If you did not create this account, please ignore this email.</p>
    </div>
  `;
}

export function getPasswordResetEmailHtml(name: string, resetUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0f172a; margin: 0;">Reset Your Password</h2>
        <p style="color: #64748b; font-size: 14px;">Security Request</p>
      </div>
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset the password for your customer account. Click the button below to choose a new password:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #64748b; font-size: 13px;">Or copy and paste this link into your browser:<br/><a href="${resetUrl}" style="color: #0284c7;">${resetUrl}</a></p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">This link is single-use and will expire in 1 hour. If you did not request this, your account remains secure.</p>
    </div>
  `;
}

export function getEnquiryReceivedHtml(name: string, enquiryId: string, summary: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h3 style="color: #0f172a; margin-top: 0;">Thank You for Your Enquiry</h3>
      <p>Dear ${name},</p>
      <p>We have received your transport enquiry (Ref: <strong>${enquiryId}</strong>). Our operations coordinator is reviewing your requirements:</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 6px; font-size: 14px; margin: 20px 0;">
        ${summary}
      </div>
      <p>We will contact you shortly with availability and indicative rates.</p>
      <p style="color: #64748b; font-size: 12px;">Fleet Operations & Customer Desk</p>
    </div>
  `;
}

export function getQuotationAvailableHtml(name: string, quotationNumber: string, validUntil: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h3 style="color: #0f172a; margin-top: 0;">Your Formal Quotation is Ready</h3>
      <p>Dear ${name},</p>
      <p>An official quotation (<strong>${quotationNumber}</strong>) has been generated and published to your customer portal. It is valid until <strong>${validUntil}</strong>.</p>
      <p>You can review the itemized rates, kilometre allowances, and terms directly in your customer portal.</p>
      <div style="margin: 24px 0;">
        <a href="/portal/quotations" style="background: #0284c7; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">View Quotation</a>
      </div>
    </div>
  `;
}

export function getBookingStatusHtml(name: string, bookingRef: string, status: string, details: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h3 style="color: #0f172a; margin-top: 0;">Booking Update: ${status}</h3>
      <p>Dear ${name},</p>
      <p>Your booking request (Ref: <strong>${bookingRef}</strong>) has been updated to: <strong>${status}</strong>.</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 6px; font-size: 14px; margin: 20px 0;">
        ${details}
      </div>
      <p>Log in to your customer portal anytime to track current assignments.</p>
    </div>
  `;
}
