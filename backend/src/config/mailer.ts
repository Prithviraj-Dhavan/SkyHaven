import nodemailer from 'nodemailer';
import { env } from './env.js';

let transporter: nodemailer.Transporter | null = null;

export function getMailerTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  if (env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  } else {
    // Create ethereal or in-memory console logger
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  }

  return transporter;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  try {
    const mail = getMailerTransporter();
    const info = await mail.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || subject,
    });

    console.log(`📧 [Notification] Email sent to ${to} | Subject: "${subject}" | MessageId: ${info.messageId || 'local-stream'}`);
    return true;
  } catch (error) {
    console.error(`❌ [Notification] Failed to send email to ${to}:`, error);
    return false;
  }
}
