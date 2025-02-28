import * as React from 'react';
import { BaseEmail, BRAND } from './BaseEmail';
import { Section, Text } from '@react-email/components';

interface PasswordChangedEmailProps {
  userName?: string;
  changeTime?: string;
}

export const PasswordChangedEmail: React.FC<PasswordChangedEmailProps> = ({
  userName,
  changeTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
}) => {
  return (
    <BaseEmail previewText="Your password has been changed">
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
          Password Changed Successfully
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: 1.5, margin: '24px 0' }}>
          Hello {userName ? <span style={{ color: BRAND.primary, fontWeight: 600 }}>{userName}</span> : 'there'},
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: 1.5, margin: '24px 0' }}>
          Your password was successfully changed on {changeTime}.
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: 1.5, margin: '24px 0' }}>
          If you did not initiate this password change, please contact our support team immediately
          or reset your password using the &quot;Forgot Password&quot; option on our login page.
        </Text>

        <Text style={{ fontSize: '14px', color: BRAND.mutedForeground, margin: '24px 0' }}>
          For security purposes, this is an automated notification that cannot be replied to.
        </Text>
      </Section>
    </BaseEmail>
  );
}; 