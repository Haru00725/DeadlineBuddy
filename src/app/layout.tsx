import type { Metadata, Viewport } from "next";
import { Poppins, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/providers/ServiceWorkerRegistration";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeadlineBuddy — Your deadlines, under control",
  description:
    "Turn college chaos into a clear plan. DeadlineBuddy helps you manage assignments, exams, and projects with AI-powered notice scanning.",
  keywords: [
    "deadline manager",
    "student productivity",
    "assignment tracker",
    "college planner",
    "exam scheduler",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DeadlineBuddy",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#111318",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
      </head>
      <body className="font-sans">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
