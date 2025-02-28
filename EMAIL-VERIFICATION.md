# Email Verification with Resend

This project integrates email verification using Resend, a modern email API. When users register with email/password, a verification code is sent to their email address to confirm their identity.

## Features

- OTP (One-Time Password) verification for email signups
- Beautiful, responsive email templates using React Email
- 6-digit verification codes with 30-minute expiration
- Google OAuth users are automatically verified (no email verification needed)
- Verification code resend functionality with rate limiting
- Mobile-friendly verification page with OTP input

## Setup

1. **Install dependencies**

```bash
pnpm add resend @react-email/components
pnpm add -D dotenv
```

2. **Configure environment variables**

Copy `.env.example` to `.env` and fill in the required values:

```
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=onboarding@resend.dev
FROM_NAME="Your App"
TEST_EMAIL=your-email@example.com
```

3. **Apply database migrations**

```bash
pnpm dlx prisma migrate dev
```

## Testing Emails

To test the email templates without sending real emails during development:

```bash
pnpm tsx scripts/test-emails.tsx
```

This will send a test verification email to the address specified in your `.env` file.

## How It Works

1. **User Registration Flow**:
   - User registers with email/password
   - System generates a 6-digit verification code
   - Verification email is sent to the user
   - User is redirected to the verification page

2. **Verification Page**:
   - User enters the 6-digit code from their email
   - System validates the code
   - On success, the user's account is marked as verified
   - User is redirected to the dashboard

3. **Google OAuth Flow**:
   - User signs up with Google OAuth
   - Account is automatically marked as verified
   - User is redirected to the dashboard

## Customization

### Email Template

Email templates are located in `src/components/emails/`. You can modify:

- `BaseEmail.tsx`: The base email template with branding colors and layout
- `VerificationEmail.tsx`: The verification code email template

### Verification Page

The verification page is located at `src/app/verify/page.tsx` and can be customized to match your branding.

### Verification Code Settings

You can adjust verification code length and expiration in:

- `src/lib/email.ts`: Modify the `generateVerificationCode` function
- API routes: Change the expiration time in the API routes

## White Labeling

This project follows a white label approach, making it easy to customize with your own branding:

1. Update the brand colors in `src/components/emails/BaseEmail.tsx`
2. Replace the placeholder logo with your own
3. Update the company name and address in the email footer
4. Customize text and messaging to match your brand voice 