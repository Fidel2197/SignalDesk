import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://signaldesk-pink-two.vercel.app"),
  applicationName: "SignalDesk",
  title: "SignalDesk | Incident Response Workspace",
  description:
    "A response workspace for tracking active incidents by service, location, owner, risk, and next step.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "SignalDesk | Incident Response Workspace",
    description:
      "Track active incidents by service, location, owner, risk, and next step.",
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
    title: "SignalDesk | Incident Response Workspace",
    description:
      "Track active incidents by service, location, owner, risk, and next step.",
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
