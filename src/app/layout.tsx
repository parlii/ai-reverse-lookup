import './globals.css'

import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { chillax, satoshi } from '@/lib/fonts';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reverse Lookup with AI',
  description: 'Reverse lookup dictionary powered by GPT 4',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <html lang="en" className={`${chillax.variable} ${satoshi.variable}`}>
        <body className={`${chillax.className}`}>{children}</body>
        <Analytics />
      </html>
    </>
  )
}
