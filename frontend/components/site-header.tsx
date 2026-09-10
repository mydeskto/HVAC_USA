'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, ChevronDown, Menu, Phone, X } from 'lucide-react'
import { company, nav } from '@/lib/site'

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(!overlay)

  useEffect(() => {
    if (!overlay) return
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overlay])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className={`site-header ${scrolled || !overlay ? 'is-scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
      <button
        type="button"
        className={`nav-backdrop ${menuOpen ? 'is-open' : ''}`}
        aria-label="Close menu"
        onClick={() => setMenuOpen(false)}
      />
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label={`${company.name} home`} onClick={() => setMenuOpen(false)}>
          <img src="/logo1.png" alt={company.name} className="nav-logo" />
        </Link>
        <nav className={`desktop-nav ${menuOpen ? 'mobile-open' : ''}`} aria-label="Primary navigation">
          {nav.map((item) =>
            item.cta ? (
              <Link key={item.href} href={item.href} className="nav-cta" onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ) : (
              <div
                key={item.href}
                className={`nav-item ${openMenu === item.label ? 'is-open' : ''}`}
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (item.children && menuOpen) {
                      e.preventDefault()
                      setOpenMenu(openMenu === item.label ? null : item.label)
                      return
                    }
                    setMenuOpen(false)
                  }}
                >
                  {item.label}
                  {item.children && <ChevronDown size={14} />}
                </Link>
                {item.children && (
                  <div className="dropdown">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => {
                          setMenuOpen(false)
                          setOpenMenu(null)
                        }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}
        </nav>
        <div className="header-actions">
          <a className="header-phone" href={`tel:${company.phoneTel}`}>
            <Phone size={16} /> <span>{company.phoneDisplay}</span>
          </a>
          <Link href="/get-a-quote" className="button button-small button-accent">
            Book Now <ArrowRight size={15} />
          </Link>
          <button
            className="menu-button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  )
}
