import * as React from 'react';
import { BaseEmail, BRAND } from './BaseEmail';
import { Section, Text } from '@react-email/components';

interface VerificationEmailProps {
  userName?: string;
  verificationCode: string;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  userName,
  verificationCode,
}) => {
  return (
    <BaseEmail previewText="Verify your email address">
      <Section style={{ padding: '0 24px' }}>
        <Text
          style={{
            color: BRAND.primary,
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            margin: '24px 0',
          }}
        >
          Verify Your Email
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: 1.5, margin: '24px 0' }}>
          Hello {userName ? <span style={{ color: BRAND.primary, fontWeight: 600 }}>{userName}</span> : 'there'},
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: 1.5, margin: '24px 0' }}>
          Thank you for signing up. To verify your email address, please enter the following verification code:
        </Text>

        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Text
            style={{
              fontFamily: 'monospace',
              fontSize: '32px',
              fontWeight: 'bold',
              letterSpacing: '0.5em',
              color: BRAND.foreground,
              background: BRAND.mutedBackground,
              padding: '16px 24px',
              borderRadius: '8px',
              display: 'inline-block',
              margin: '0 auto',
            }}
          >
            {verificationCode}
          </Text>
        </Section>

        <Text style={{ fontSize: '16px', lineHeight: 1.5, margin: '24px 0' }}>
          If you didn&apos;t create an account, you can safely ignore this email.
        </Text>

        <Text style={{ fontSize: '14px', color: BRAND.mutedForeground, margin: '24px 0' }}>
          This code will expire in 30 minutes.
        </Text>
      </Section>
    </BaseEmail>
  );
}; 