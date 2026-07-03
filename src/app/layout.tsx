import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Would You Rather?",
  description: "A fast, anonymous Would You Rather game backed by PostgreSQL."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
