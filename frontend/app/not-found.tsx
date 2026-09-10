import Link from 'next/link'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export default function NotFound() {
  return (
    <div className="site-shell inner-shell">
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container">
            <h1>Page not found</h1>
            <p className="hero-text">That page does not exist. Head home or request a quote.</p>
            <div className="cta-row">
              <Link href="/" className="button button-accent">Back to home</Link>
              <Link href="/get-a-quote" className="button button-ghost">Get A Quote</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
