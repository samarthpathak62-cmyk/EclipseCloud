# Email notifications setup

The notification dispatcher now supports optional email delivery through EmailJS.

## 1. Create an EmailJS account

Create an Email Service and an Email Template in EmailJS.

## 2. Template variables

The template should use these variables:

- `{{to_email}}` — recipient email
- `{{to_name}}` — recipient name
- `{{notification_title}}` — notification title
- `{{notification_message}}` — notification body
- `{{notification_type}}` — System / Announcement / Promotion / Account
- `{{website_name}}` — website name

Set the template's recipient/To field to `{{to_email}}`.

## 3. Add deployment variables

Copy `.env.example` and set:

```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
```

These are EmailJS browser/public values; do not put SMTP passwords or private API keys in VITE variables.

## 4. Admin usage

Open Admin Panel → Notifications, compose the notification, enable **Also send by email**, then dispatch it.

- Single User: email goes to that selected user's email.
- Broadcast: email goes to every registered user with an email address.
- In-app Firestore notification is still created separately.
