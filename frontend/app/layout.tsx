import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { company } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  title: `${company.name} | Local HVAC Service, Done Right`,
  description: `Fast, honest HVAC repair, installation, and maintenance for homes and businesses across ${company.city}. Available 24/7 for emergencies.`,
  icons: {
    icon: '/siteicon.jpeg',
    shortcut: '/siteicon.jpeg',
    apple: '/siteicon.jpeg',
  },
  openGraph: {
    title: company.name,
    description: 'Comfort you can count on. Every season.',
    type: 'website',
    images: [{ url: '/vanpic-removebg-preview.png' }],
  },
  twitter: { card: 'summary_large_image', images: ['/vanpic-removebg-preview.png'] },
}
export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0f1419',
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
