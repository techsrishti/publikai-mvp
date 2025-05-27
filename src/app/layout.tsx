import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Frito - Deploy & Monetize AI Models',
  description: 'The first India-focused platform for AI developers to host, manage, and monetize their fine-tuned models via API',
  icons: {
    icon: '/icons/frito_icon.png' 
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} antialiased`}>
          {children}
          <Toaster position="top-right" />
        </body>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </html>
    </ClerkProvider>
  )
}