import { Resend } from 'resend';
import { VerificationEmail } from '@/components/emails/VerificationEmail';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';
import { ForgotPasswordEmail } from '@/components/emails/ForgotPasswordEmail';
import { PasswordChangedEmail } from '@/components/emails/PasswordChangedEmail';
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

/**
 * Send a welcome email after account verification
 */
export const sendWelcomeEmail = async ({
  to,
  userName,
}: {
  to: string;
  userName?: string;
}) => {
  try {
    // Skip sending emails if Resend API key is not set
    if (!process.env.RESEND_API_KEY) {
      console.warn('Skipping welcome email: No RESEND_API_KEY');
      return { success: true, id: 'dev-mode-no-email-sent' };
    }

    const { data, error } = await resend.emails.send({
      from: SENDER,
      to,
      subject: 'Welcome to our platform!',
      react: React.createElement(WelcomeEmail, { 
        userName
      }) as React.ReactElement,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw new Error(error.message || 'Error sending welcome email');
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Welcome email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Send a forgot password email with a reset code
 */
export const sendForgotPasswordEmail = async ({
  to,
  userName,
  resetCode,
}: {
  to: string;
  userName?: string;
  resetCode: string;
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
      subject: 'Reset your password',
      react: React.createElement(ForgotPasswordEmail, { 
        userName, 
        resetCode
      }) as React.ReactElement,
    });

    if (error) {
      console.error('Error sending forgot password email:', error);
      throw new Error(error.message || 'Error sending forgot password email');
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Forgot password email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Send a password changed notification email
 */
export const sendPasswordChangedEmail = async ({
  to,
  userName,
}: {
  to: string;
  userName?: string;
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
      subject: 'Your password has been changed',
      react: React.createElement(PasswordChangedEmail, { 
        userName,
        changeTime: new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }) as React.ReactElement,
    });

    if (error) {
      console.error('Error sending password changed email:', error);
      throw new Error(error.message || 'Error sending password changed email');
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Password changed email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}; 