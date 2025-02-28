import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
  Font,
  Section,
  Hr,
  Text,
  Img,
} from '@react-email/components';

// Define brand colors for white label
export const BRAND = {
  primary: '#4F46E5', // Indigo
  primaryDark: '#4338CA',
  secondary: '#0EA5E9', // Sky
  accent: '#8B5CF6', // Violet
  background: '#FFFFFF',
  foreground: '#18181B',
  mutedBackground: '#F4F4F5',
  mutedForeground: '#71717A',
  border: '#E4E4E7',
};

interface BaseEmailProps {
  children: React.ReactNode;
  previewText: string;
}

export const BaseEmail: React.FC<BaseEmailProps> = ({
  children,
  previewText,
}) => {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto my-8 max-w-[600px] rounded-lg bg-white p-8 shadow-sm">
            <Section>
              <Img
                src="https://placehold.co/200x60/4F46E5/FFFFFF?text=LOGO"
                alt="Company Logo"
                width="150"
                height="45"
                className="mx-auto mb-6"
              />
            </Section>
            
            {children}
            
            <Hr className="my-6 border-gray-200" />
            
            <Section>
              <Text className="text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Your Company. All rights reserved.
              </Text>
              <Text className="text-center text-sm text-gray-500">
                123 Main St, Anytown, ST 12345
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BaseEmail; 