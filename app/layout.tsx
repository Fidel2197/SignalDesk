import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://signaldesk-pink-two.vercel.app"),
  applicationName: "SignalDesk",
  title: "SignalDesk | Incident Response Practice",
  description:
    "Practice incident response with browser-saved scenarios, runbook checklists, and separate live public status checks.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "SignalDesk | Incident Response Practice",
    description:
      "Practice response scenarios, save progress in your browser, and check public provider status.",
    url: "/",
    siteName: "SignalDesk",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "SignalDesk incident response workspace",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SignalDesk | Incident Response Practice",
    description:
      "Practice response scenarios, save progress in your browser, and check public provider status.",
    images: ["/og.png"],
  },
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
