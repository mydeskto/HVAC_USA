'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Phone } from 'lucide-react'
import { QuoteForm } from '@/components/quote-form'
import { ServiceAreaMap } from '@/components/service-area-map'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { type PageBlock, type PageContent, pages } from '@/lib/pages'
import { company, nav, neighborhoods, suburbs, testimonials } from '@/lib/site'

function Ctas() {
  return (
    <div className="cta-row">
      <a href={`tel:${company.phoneTel}`} className="button button-accent">
        <Phone size={16} /> Call {company.phoneDisplay}
      </a>
      <Link href="/get-a-quote" className="button button-ghost">
        Get A Quote <ArrowRight size={16} />
      </Link>
    </div>
  )
}

function FaqList({ items }: { items: [string, string][] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="faq-list">
      {items.map(([q, a], i) => (
        <div key={q} className={`faq-item ${open === i ? 'is-open' : ''}`}>
          <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            <span>{q}</span>
            <ChevronDown size={19} />
          </button>
          {open === i && <p>{a}</p>}
        </div>
      ))}
    </div>
  )
}

function Blocks({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === 'p') return <p key={i}>{block.text}</p>
        if (block.type === 'h2') return <h2 key={i}>{block.text}</h2>
        if (block.type === 'ul') {
          return (
            <ul key={i} className="content-list">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )
        }
        if (block.type === 'cta') return <Ctas key={i} />
        if (block.type === 'form') return <QuoteForm key={i} />
        if (block.type === 'faq') return <FaqList key={i} items={block.items} />
        return null
      })}
    </>
  )
}

export function InnerPage({ page }: { page: PageContent }) {
  const articles = Object.values(pages).filter(
    (p) => p.kind === 'article' && !['privacy-policy', 'terms-of-use', 'accessibility'].includes(p.slug),
  )

  return (
    <div className="site-shell inner-shell">
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="container">
            <p className="eyebrow eyebrow-accent">{company.name}</p>
            <h1>{page.headline}</h1>
            <p className="hero-text">{page.intro}</p>
            {page.kind !== 'quote' && page.kind !== 'contact' && <Ctas />}
          </div>
        </section>

        <section className="section">
          <div className="container page-layout">
            <div className="page-main">
              <Blocks blocks={page.blocks} />
              {page.slug === 'sitemap' && (
                <div className="sitemap-grid">
                  {nav.map((item) => (
                    <div key={item.href}>
                      <Link href={item.href}>{item.label}</Link>
                      {item.children?.map((child) => (
                        <Link key={child.href} href={child.href}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {page.kind === 'blog' && (
                <div className="blog-list">
                  {articles.map((p) => (
                    <Link key={p.slug} href={`/${p.slug}`} className="blog-card">
                      <h3>{p.title}</h3>
                      <p>{p.intro}</p>
                      <span className="text-link">Read more <ArrowRight size={15} /></span>
                    </Link>
                  ))}
                </div>
              )}
              {page.kind === 'areas' && (
                <>
                  <ServiceAreaMap className="map-photo" />
                  <div className="areas-cols" style={{ marginTop: 28 }}>
                    <div>
                      <h3>Chicago Suburbs</h3>
                      <ul>{suburbs.map((s) => <li key={s}>{s}</li>)}</ul>
                    </div>
                    <div>
                      <h3>Chicago Neighborhoods</h3>
                      <ul>{neighborhoods.map((s) => <li key={s}>{s}</li>)}</ul>
                    </div>
                  </div>
                </>
              )}
              {page.kind === 'reviews' && (
                <div className="testimonial-grid" style={{ marginTop: 28 }}>
                  {testimonials.map((t) => (
                    <figure key={t.name} className="testimonial">
                      <div className="stars">★★★★★</div>
                      <blockquote>{t.quote}</blockquote>
                      <figcaption>
                        <span className="avatar">{t.name[0]}</span>
                        <span><b>{t.name}</b><small>{t.area}</small></span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
            {page.kind !== 'quote' && page.kind !== 'contact' && (
              <aside>
                <div className="side-card">
                  <h3>Get A Quote</h3>
                  <p>Tell us what you need and we will follow up quickly.</p>
                  <QuoteForm compact />
                </div>
              </aside>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
