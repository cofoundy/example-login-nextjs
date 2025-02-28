import { Resend } from 'resend';
import { VerificationEmail } from '@/components/emails/VerificationEmail';
import * as React from 'react';

// Make sure to set RESEND_API_KEY in your .env file
if (!process.env.RESEND_API_KEY) {
  console.warn('Missing RESEND_API_KEY environment variable');
}

// Initialize Resend with API key (or empty string if not available, which will fail gracefully)
const resend = new Resend(process.env.RESEND_API_KEY || '');

// Using Resend's test domain for development or your own domain for production
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const FROM_NAME = process.env.FROM_NAME || 'Your App';
const SENDER = `${FROM_NAME} <${FROM_EMAIL}>`;

/**
 * Generate a random verification code
 * @param length Length of the verification code
 * @returns A random verification code
 */
export const generateVerificationCode = (length: number = 6): string => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
};

/**
 * Send a verification email with a code
 */
export const sendVerificationEmail = async ({
  to,
  userName,
  verificationCode,
}: {
  to: string;
  userName?: string;
  verificationCode: string;
}) => {
  try {
    // Skip sending emails if Resend API key is not set
    if (!process.env.RESEND_API_KEY) {
      console.warn('Skipping email send: No RESEND_API_KEY');
      return { success: true, id: 'dev-mode-no-email-sent' };
    }

    const { data, error } = await resend.emails.send({
      from: SENDER,
      to,
      subject: 'Verify your email address',
      react: React.createElement(VerificationEmail, { 
        userName, 
        verificationCode
      }) as React.ReactElement,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      throw new Error(error.message || 'Error sending verification email');
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Verification email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}; 