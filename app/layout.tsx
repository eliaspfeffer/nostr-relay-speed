import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nostr Relay Speed",
  description: "Measure relay speed using NIP-66 relay discovery",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans">
        {children}
      </body>
    </html>
  );
}
