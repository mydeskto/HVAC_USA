import Link from 'next/link'
import { company } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href="/" className="brand">
            <img src="/logo1.png" alt={company.name} className="nav-logo" />
          </Link>
          <p>Local comfort experts for every season, every room, and every neighbor.</p>
          <div className="socials">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Instagram">ig</a>
            <a href="#" aria-label="YouTube">yt</a>
          </div>
        </div>
        <div>
          <h3>Services</h3>
          <Link href="/heating">Heating</Link>
          <Link href="/cooling">Cooling</Link>
          <Link href="/indoor-air-quality">Air quality</Link>
          <Link href="/about/maintenance-plans">Maintenance plans</Link>
        </div>
        <div>
          <h3>Company</h3>
          <Link href="/about">About</Link>
          <Link href="/reviews">Reviews</Link>
          <Link href="/service-areas">Service area</Link>
          <Link href="/contact">Contact us</Link>
        </div>
        <div>
          <h3>Contact</h3>
          <a href={`tel:${company.phoneTel}`}>{company.phoneDisplay}</a>
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <p>{company.address}</p>
          <p>{company.website}</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {company.website}. All rights reserved.</span>
        <span>
          <Link href="/privacy-policy">Privacy</Link>
          {' · '}
          <Link href="/terms-of-use">Terms</Link>
          {' · '}
          Licensed • Insured • Locally owned
        </span>
      </div>
    </footer>
  )
}
