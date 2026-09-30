interface NotificationEmailOptions {
  to: string;
  recipientName?: string;
  title: string;
  message: string;
  type: string;
  websiteName?: string;
}

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

/**
 * Sends a notification email through EmailJS.
 * EmailJS uses a public browser key, so no SMTP/API secret is shipped to users.
 * Configure the three VITE_EMAILJS_* variables in your deployment environment.
 */
export async function sendNotificationEmail(options: NotificationEmailOptions): Promise<void> {
  const publicKey = (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY as string | undefined;
  const serviceId = (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID as string | undefined;
  const templateId = (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID as string | undefined;

  if (!publicKey || !serviceId || !templateId) {
    throw new Error('Email notifications are not configured. Add VITE_EMAILJS_PUBLIC_KEY, VITE_EMAILJS_SERVICE_ID and VITE_EMAILJS_TEMPLATE_ID.');
  }

  const response = await fetch(EMAILJS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: options.to,
        to_name: options.recipientName || options.to.split('@')[0],
        notification_title: options.title,
        notification_message: options.message,
        notification_type: options.type,
        website_name: options.websiteName || 'Eclipse Cloud',
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => 'Email provider rejected the request.');
    throw new Error(`Email notification failed: ${detail}`);
  }
}
