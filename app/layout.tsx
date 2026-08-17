import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Northstar Heating + Air | Local HVAC Service, Done Right',
  description: 'Fast, honest HVAC repair, installation, and maintenance for homes and businesses across [CITY, STATE]. Available 24/7 for emergencies.',
  generator: 'v0.app',
  openGraph: { title: 'Northstar Heating + Air', description: 'Comfort you can count on. Every season.', type: 'website', images: [{ url: '/images/og-share.jpg' }] },
  twitter: { card: 'summary_large_image', images: ['/images/og-share.jpg'] },
}
export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#0f1419', width: 'device-width', initialScale: 1, userScalable: false }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
