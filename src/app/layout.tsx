import './globals.css'

import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next'
import { chillax, satoshi } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Reverse Lookup with AI',
  description: 'Reverse lookup dictionary powered by GPT 4',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <html lang="en" className={`${chillax.variable} ${satoshi.variable}`}>
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="icon" href="/favicon.png" type="image/png" />
        </head>
        <body className={`${chillax.className}`}>{children}</body>
        <Analytics />
      </html>
    </>
  )
}
