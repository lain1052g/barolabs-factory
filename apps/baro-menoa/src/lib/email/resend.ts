import { Resend } from 'resend';

// Lazy initialization — prevents build-time failure when env var is not set
export function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}
