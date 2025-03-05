import './globals.css'

import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next'
import { chillax, satoshi } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Word Finder',
  description: 'Word finder powered by GPT 4',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
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
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        </head>
        <body className={`${chillax.className}`}>{children}</body>
        <Analytics />
      </html>
    </>
  )
}
