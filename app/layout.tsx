import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans'
})

const fraunces = Fraunces({ 
  subsets: ["latin"],
  weight: ['300', '400', '700'],
  variable: '--font-serif'
})

export const metadata: Metadata = {
  title: 'Solid Marketing – Meta Ads for Håndverksbedrifter',
  description: 'Vi hjelper rørleggere, elektrikere og andre håndverksbedrifter i Oslo og Akershus å hente inn nye kunder via Meta Ads – forutsigbart og målbart.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="no" className={`${plusJakarta.variable} ${fraunces.variable} bg-background`}>
      <body className="font-sans antialiased overflow-x-hidden">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
