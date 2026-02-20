import React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

const geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BUAP - Control de Acceso Vehicular',
  description: 'Sistema de control de acceso vehicular - Benemerita Universidad Autonoma de Puebla',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0078D4',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
