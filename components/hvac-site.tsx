'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, BadgeCheck, BarChart3, Bolt, BriefcaseBusiness, Check, ChevronDown, Clock3, CloudSun, Droplets, Flame, Phone, ShieldCheck, Snowflake, Sparkles, Thermometer, Wrench } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { QuoteForm } from '@/components/quote-form'
import { ServiceAreaMap } from '@/components/service-area-map'
import { company, suburbs } from '@/lib/site'

const phone = company.phoneDisplay
const areas = suburbs.slice(0, 8)
const services = [
  { title: 'AC Repair & Installation', desc: 'Fast, precise cooling repairs and right-sized replacements for comfortable summers.', icon: Snowflake, image: '/images/service-ac.jpg', alt: 'Technician servicing a central air conditioner', href: '/cooling/air-conditioner-repair' },
  { title: 'Heating & Furnace', desc: 'Keep winter safe and steady with expert furnace diagnostics, repairs, and installs.', icon: Flame, image: '/images/service-furnace.jpg', alt: 'Technician inspecting a furnace', href: '/heating/furnace-repair' },
  { title: 'Heat Pumps', desc: 'Efficient year-round comfort with modern heat pump systems built for your home.', icon: Thermometer, image: '/images/service-heat-pump.jpg', alt: 'Modern heat pump outdoor unit', href: '/heating/heat-pumps' },
  { title: 'Ductless Mini-Splits', desc: 'Quiet, efficient comfort for additions, garages, and rooms that never feel right.', icon: CloudSun, image: '/images/service-minisplit.jpg', alt: 'Ductless mini split installed in home', href: '/cooling/ductless-air-conditioning' },
  { title: 'Indoor Air Quality', desc: 'Breathe easier with filtration, humidity control, and ventilation solutions.', icon: Droplets, image: '/images/service-iaq.jpg', alt: 'Air quality monitor in a bright home', href: '/indoor-air-quality' },
  { title: 'Duct Cleaning & Repair', desc: 'Clean, balanced ductwork helps every room feel better while lowering energy waste.', icon: Wrench, image: '/images/service-duct.jpg', alt: 'HVAC ductwork being repaired', href: '/indoor-air-quality/ac-coil-cleaning' },
  { title: 'Maintenance Plans', desc: 'Seasonal tune-ups that catch small issues before they become expensive surprises.', icon: Wrench, image: '/images/service-maintenance.jpg', alt: 'Technician reviewing an HVAC maintenance checklist', href: '/about/maintenance-plans' },
  { title: 'Commercial HVAC', desc: 'Reliable comfort and uptime for offices, shops, restaurants, and facilities.', icon: BriefcaseBusiness, image: '/images/service-commercial.jpg', alt: 'Commercial rooftop HVAC equipment', href: '/get-a-quote' },
]
const testimonials = [
  ['“They arrived when they said they would, explained everything clearly, and had our AC running before dinner.”', 'Maya R.', 'Addison'],
  ['“No pressure, no mystery invoice. Just excellent work from a technician who treated our home with respect.”', 'Thomas K.', 'Elmhurst'],
  ['“Our upstairs finally stays comfortable. The mini-split install was clean, quiet, and finished in one afternoon.”', 'Jordan S.', 'Lombard'],
]
const faqs = [
  ['How quickly can you get here?', 'Most calls in our core service area receive same-day options. Emergency calls are answered 24/7, including nights, weekends, and holidays.'],
  ['Do you offer upfront pricing?', 'Yes. After diagnosing the issue, your technician explains the options and price before work begins. No surprise line items.'],
  ['How often should my HVAC system be maintained?', 'We recommend a cooling tune-up in spring and a heating tune-up in fall. Our membership makes seasonal care simple.'],
  ['Do you repair all brands?', 'Our technicians service all major residential and light commercial brands. If replacement makes more sense, we will show you why.'],
  ['What should I do if my furnace stops working?', 'Check your thermostat and filter first, then call us. Never attempt to repair gas or electrical components yourself.'],
]

function Media({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} className={`media-photo ${className}`} />
}
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 22 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: .55, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}
function SectionHeading({ eyebrow, title, text, light = false }: { eyebrow: string; title: string; text?: string; light?: boolean }) {
  return (
    <div className={`section-heading ${light ? 'section-heading-light' : ''}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {text && <p className="section-lead">{text}</p>}
    </div>
  )
}

export default function HVACSite() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="site-shell" id="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main>
        <section className="hero">
          <div className="hero-video">
            <video autoPlay muted loop playsInline poster="/images/hero-poster.jpg" aria-label="Technician walking to a home and starting work">
              <source src="/hero-loop.mp4?v=walk" type="video/mp4" />
            </video>
          </div>
          <div className="hero-overlay" />
          <SiteHeader overlay />
          <div className="container hero-content">
            <Reveal>
              <div className="hero-copy">
                <p className="eyebrow eyebrow-accent"><span className="live-dot" /> Local comfort, done right</p>
                <h1>Comfort you can count on. <em>Every season.</em></h1>
                <p className="hero-text">Fast, honest HVAC service for homes and businesses across {company.city} and the surrounding communities.</p>
                <div className="hero-ctas">
                  <a href={`tel:${company.phoneTel}`} className="button button-accent button-large">
                    <Phone size={18} /> Call Now <span className="button-sub">{phone}</span>
                  </a>
                  <Link href="/contact" className="button button-ghost button-large">
                    Schedule Online <ArrowRight size={18} />
                  </Link>
                </div>
                <div className="hero-proof">
                  <span><span className="stars">★★★★★</span><b> 4.9 Google rating</b></span>
                  <span><ShieldCheck size={16} /> Licensed & insured</span>
                  <span><Clock3 size={16} /> 24/7 emergency</span>
                </div>
              </div>
            </Reveal>
          </div>
          <div className="scroll-cue">Scroll to explore <span /></div>
        </section>

        <section className="trust-bar">
          <div className="container trust-inner">
            <span className="trust-label">Trusted by homeowners across the community</span>
            <div className="trust-logos">
              <span><BadgeCheck /> BBB A+ Accredited</span>
              <span><ShieldCheck /> NATE Certified</span>
              <span><Check /> Google Guaranteed</span>
              <span><Wrench /> Factory Trained</span>
            </div>
          </div>
        </section>

        <section className="section section-muted" id="services">
          <div className="container">
            <SectionHeading eyebrow="What we do" title="One call for every comfort problem." text="From a midnight breakdown to a planned replacement, our team brings the tools, training, and straight answers to get it handled." />
            <div className="service-grid">
              {services.map(({ title, desc, icon: Icon, image, alt, href }) => (
                <Reveal key={title}>
                  <article className="service-card">
                    <Media src={image} alt={alt} />
                    <div className="service-card-body">
                      <div className="icon-box"><Icon size={20} /></div>
                      <h3>{title}</h3>
                      <p>{desc}</p>
                      <Link href={href}>Learn more <ArrowRight size={15} /></Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="why-us">
          <div className="container">
            <div className="split-heading">
              <SectionHeading eyebrow="Why Addison Air" title="The kind of service you tell your neighbors about." text="Good HVAC work is more than getting the system running. It is showing up, communicating clearly, and leaving the space cleaner than we found it." />
              <Link href="/about" className="text-link">Meet the team <ArrowRight size={16} /></Link>
            </div>
            <div className="diff-grid">
              {([['Same-day service', 'When comfort cannot wait, we make room on the schedule.', Bolt], ['Upfront pricing', 'Clear options and a clear price before any work begins.', BarChart3], ['Certified technicians', 'Skilled professionals who respect your home and your time.', BadgeCheck], ['Satisfaction guaranteed', 'We stand behind the work and the comfort we deliver.', ShieldCheck]] as const).map(([title, text, Icon]) => (
                <Reveal key={title}>
                  <div className="diff-item">
                    <Icon size={24} />
                    <div><h3>{title}</h3><p>{text}</p></div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="stats-row">
              {[['2,400+', 'Homes made comfortable'], ['24/7', 'Emergency service'], ['Same-day', 'Repair options'], ['4.9★', 'Google rating']].map(([num, label]) => (
                <div className="stat" key={label}><strong>{num}</strong><span>{label}</span></div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-muted">
          <div className="container">
            <SectionHeading eyebrow="How it works" title="Comfort, without the runaround." />
            <div className="process-grid">
              {[['01', 'Call or book', 'Tell us what is going on and choose a time that works.'], ['02', 'We diagnose', 'A trained technician finds the real issue, not just the symptom.'], ['03', 'You approve', 'We explain your options and price everything up front.'], ['04', 'We fix it', 'Most repairs are completed in one visit, with a clean workspace.']].map(([num, title, text], i) => (
                <Reveal key={num}>
                  <div className="process-item">
                    <span className="process-num">{num}</span>
                    {i < 3 && <span className="process-line" />}
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="video-band">
          <div className="container video-layout">
            <div className="video-copy">
              <p className="eyebrow eyebrow-accent">On the road for you</p>
              <h2>Real work. Real people. No shortcuts.</h2>
              <p>Our branded vans are stocked and ready for 24/7 heating and cooling calls across Addison and nearby communities — with respect for your home and pride in the details.</p>
              <Link href="/contact" className="button button-accent">Talk to a technician <ArrowRight size={16} /></Link>
            </div>
            <div className=" van-frame">
              <Media src="/vanpic-removebg-preview.png" alt="Addison Air Solutions service van offering 24/7 heating and cooling" />
            </div>
          </div>
        </section>

        <section className="section section-muted">
          <div className="container">
            <SectionHeading eyebrow="Our work" title="Built to last. Installed to look right." text="A few examples of the care and craftsmanship we bring to every home, from first visit to final walkthrough." />
            <div className="gallery-grid">
              <Media src="/images/gallery-furnace.jpg" alt="High-efficiency furnace installation" className="gallery-large" />
              <Media src="/images/gallery-walkthrough.jpg" alt="Technician and homeowner walkthrough" />
              <Media src="/images/gallery-duct.jpg" alt="Clean ductwork repair" />
              <Media src="/images/gallery-rooftop.jpg" alt="Commercial rooftop unit" />
              <Media src="/images/gallery-team.jpg" alt="Addison Air Solutions service team" />
            </div>
          </div>
        </section>

        <section className="section" id="reviews">
          <div className="container reviews-layout">
            <div className="review-summary">
              <p className="eyebrow">Customer stories</p>
              <strong>4.9<span>★</span></strong>
              <div className="stars">★★★★★</div>
              <p>from 500+ Google reviews</p>
              <Link href="/reviews" className="text-link">Read all reviews <ArrowRight size={16} /></Link>
            </div>
            <div className="testimonial-grid">
              {testimonials.map(([quote, name, area]) => (
                <Reveal key={name}>
                  <figure className="testimonial">
                    <div className="stars">★★★★★</div>
                    <blockquote>{quote}</blockquote>
                    <figcaption>
                      <span className="avatar">{name[0]}</span>
                      <span><b>{name}</b><small>{area} homeowner</small></span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-muted" id="area">
          <div className="container area-layout">
            <div>
              <SectionHeading eyebrow="Where we work" title={`Proudly keeping ${company.city} comfortable.`} text={`We serve a ${company.serviceRadiusMiles}-mile area across ${company.address}, covering nearby neighborhoods and suburbs.`} />
              <div className="area-list">{areas.map((area) => <span key={area}><Check size={15} />{area}</span>)}</div>
              <Link href="/service-areas" className="text-link">Check your address <ArrowRight size={16} /></Link>
            </div>
            <ServiceAreaMap />
          </div>
        </section>

        <section className="section plans-section">
          <div className="container">
            <div className="plans-intro">
              <SectionHeading eyebrow="Plan ahead" title="Comfort that pays you back." text="Flexible financing for new systems, plus seasonal maintenance that helps prevent the next emergency." />
              <Link href="/about/finance" className="button button-ghost">Ask about financing <ArrowRight size={16} /></Link>
            </div>
            <div className="plans-grid">
              <article className="plan-card plan-featured">
                <span className="plan-tag">Most popular</span>
                <h3>Addison Air Care</h3>
                <p>Seasonal maintenance and priority service for year-round peace of mind.</p>
                <strong>$19<span>/month</span></strong>
                <ul>
                  <li><Check /> Two seasonal tune-ups</li>
                  <li><Check /> Priority scheduling</li>
                  <li><Check /> 15% off repairs</li>
                </ul>
                <Link href="/about/maintenance-plans" className="button button-accent">Join the plan <ArrowRight size={16} /></Link>
              </article>
              <article className="plan-card">
                <h3>Comfort Plus</h3>
                <p>Extra protection for homes that need a little more attention.</p>
                <strong>$29<span>/month</span></strong>
                <ul>
                  <li><Check /> Everything in Addison Air Care</li>
                  <li><Check /> Filter delivery</li>
                  <li><Check /> No overtime diagnostic fees</li>
                </ul>
                <Link href="/about/maintenance-plans" className="button button-outline">Get details <ArrowRight size={16} /></Link>
              </article>
              <article className="plan-card plan-finance">
                <Sparkles size={24} />
                <h3>Flexible financing</h3>
                <p>Upgrade your comfort now with payment options that fit your budget. Subject to approved credit.</p>
                <Link href="/about/finance" className="text-link">Explore options <ArrowRight size={16} /></Link>
              </article>
            </div>
          </div>
        </section>

        <section className="emergency-band">
          <div className="container emergency-inner">
            <div>
              <p className="eyebrow">Here when it matters most</p>
              <h2>HVAC emergency? We are available 24/7.</h2>
              <p>One call connects you with a real person who can help.</p>
            </div>
            <a href={`tel:${company.phoneTel}`} className="button button-dark button-large"><Phone size={18} /> Call {phone}</a>
          </div>
        </section>

        <section className="section section-muted" id="faq">
          <div className="container faq-layout">
            <SectionHeading eyebrow="Questions, answered" title="The details matter." text="Have a question we did not cover? Give us a call — we are happy to help." />
            <div className="faq-list">
              {faqs.map(([q, answer], i) => (
                <div className={`faq-item ${openFaq === i ? 'is-open' : ''}`} key={q}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                    <span>{q}</span>
                    <ChevronDown size={19} />
                  </button>
                  {openFaq === i && <p>{answer}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div className="container contact-layout">
            <div>
              <SectionHeading eyebrow="Let’s get comfortable" title="Tell us what is going on." text="A few details help us bring the right solution. We will be in touch shortly." />
              <div className="contact-details">
                <a href={`tel:${company.phoneTel}`}><Phone size={20} /><span><small>Call or text</small>{phone}</span></a>
                <div><Clock3 size={20} /><span><small>Hours</small>24/7 emergency service</span></div>
                <div><Wrench size={20} /><span><small>Serving</small>{company.address}</span></div>
              </div>
            </div>
            <QuoteForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

export const businessSchema = {
  '@context': 'https://schema.org',
  '@type': 'HVACBusiness',
  name: company.name,
  telephone: company.phoneDisplay,
  url: `https://${company.website}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Addison',
    addressRegion: 'IL',
    postalCode: company.zip,
    addressCountry: 'US',
  },
  areaServed: suburbs,
  openingHours: 'Mo-Su 00:00-23:59',
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '500' },
}
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })),
}
