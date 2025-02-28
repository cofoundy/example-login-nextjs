/** @jsxImportSource react */
import React from 'react';
import { Resend } from 'resend';
import { VerificationEmail } from '../src/components/emails/VerificationEmail';
import { config } from 'dotenv';

// Load environment variables
config();

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable. Please check your .env file.');
}

// Using Resend's test domain for development
const FROM_EMAIL = 'Your App <onboarding@resend.dev>';
const TO_EMAIL = process.env.TEST_EMAIL || 'your-email@example.com'; // Your verified email for testing

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  try {
    console.log('🚀 Testing email templates...\n');

    // Test Verification Email
    console.log('📧 Sending verification email...');
    const verificationResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: 'Verify your email address',
      react: React.createElement(VerificationEmail, {
        userName: 'Test User',
        verificationCode: '123456',
      }) as React.ReactElement,
    });

    if (verificationResult.error) {
      throw new Error(`Failed to send verification email: ${verificationResult.error.message}`);
    }
    console.log('✅ Verification email sent:', {
      id: verificationResult.data?.id,
      to: TO_EMAIL,
      from: FROM_EMAIL,
    });

    console.log('\n✨ All emails sent successfully!');
  } catch (error) {
    console.error('❌ Error sending emails:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main(); 