import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalDesk | AI Incident Response Dashboard",
  description:
    "A portfolio-ready incident response dashboard for service health, AI triage, evidence logs, and resolution tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
