import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ramadan Mubarak 2026 | رمضان مبارک",
  description: "Track your Ramadan journey — prayer times, fasting tracker, digital tasbih, daily motivation, and more. Ramazan mübarək!",
  keywords: ["Ramadan", "Ramazan", "Prayer Times", "Fasting", "Tasbih", "Islamic", "2026"],
  authors: [{ name: "Ramadan App" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0a0a12" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
