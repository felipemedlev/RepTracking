import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { BottomNav } from "@/components/layout/BottomNav"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "RepTracking - Gym Workout Tracker",
  description: "Mobile-first gym workout tracking app for tracking your progress, managing workout plans, and achieving your fitness goals.",
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RepTracking",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-gray-50`}>
        <div className="flex flex-col h-full">
          <main className="flex-1 overflow-auto pb-nav">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
