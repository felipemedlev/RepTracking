import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { BottomNav } from "@/components/layout/BottomNav"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { Toaster } from "@/components/ui/toaster"
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RepTracking",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#3b82f6",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-gray-50`}>
        <SessionProvider>
          <div className="flex flex-col h-full">
            <main className="flex-1 overflow-auto pb-nav">
              {children}
            </main>
            <BottomNav />
          </div>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
