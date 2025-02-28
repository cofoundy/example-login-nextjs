import * as React from 'react';
import { BaseEmail, BRAND } from './BaseEmail';
import { Section, Text, Button } from '@react-email/components';

interface WelcomeEmailProps {
  userName?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName,
}) => {
  return (
    <BaseEmail previewText="Welcome to our platform">
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
          Welcome to Our Platform!
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: 1.5, margin: '24px 0' }}>
          Hello {userName ? <span style={{ color: BRAND.primary, fontWeight: 600 }}>{userName}</span> : 'there'},
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: 1.5, margin: '24px 0' }}>
          Thank you for verifying your email address! Your account is now fully activated and you can 
          start using all features of our platform.
        </Text>

        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button
            href={process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'}
            style={{
              backgroundColor: BRAND.primary,
              color: '#FFFFFF',
              padding: '12px 24px',
              borderRadius: '4px',
              fontWeight: 'bold',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Get Started
          </Button>
        </Section>

        <Text style={{ fontSize: '16px', lineHeight: 1.5, margin: '24px 0' }}>
          Here are some quick tips to get started:
        </Text>

        <ul style={{ fontSize: '16px', lineHeight: 1.5, margin: '24px 0', paddingLeft: '20px' }}>
          <li style={{ margin: '8px 0' }}>Complete your profile information</li>
          <li style={{ margin: '8px 0' }}>Explore our dashboard</li>
          <li style={{ margin: '8px 0' }}>Check out available features</li>
        </ul>

        <Text style={{ fontSize: '16px', lineHeight: 1.5, margin: '24px 0' }}>
          If you have any questions or need assistance, feel free to reply to this email or contact our support team.
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: 1.5, margin: '24px 0' }}>
          We&apos;re excited to have you on board!
        </Text>

        <Text style={{ fontSize: '16px', lineHeight: 1.5, margin: '24px 0', fontStyle: 'italic' }}>
          The Team
        </Text>
      </Section>
    </BaseEmail>
  );
};

export default WelcomeEmail; 