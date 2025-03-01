import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Settings",
  description: "Settings and configuration for administrators"
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 