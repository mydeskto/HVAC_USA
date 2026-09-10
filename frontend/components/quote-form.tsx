'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { company } from '@/lib/site'

const services = [
  'Emergency heating',
  'Emergency cooling',
  'Furnace repair',
  'AC repair',
  'Installation / quote',
  'Maintenance plan',
  'Indoor air quality',
  'Other',
]

export function QuoteForm({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="form-success">
        <h3>Request received</h3>
        <p>
          Thank you. A member of the team will follow up shortly. For emergencies, call{' '}
          <a href={`tel:${company.phoneTel}`}>{company.phoneDisplay}</a> now.
        </p>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <label>
        Name
        <input name="name" required placeholder="Your name" />
      </label>
      <label>
        Phone
        <input name="phone" required type="tel" placeholder="(224) 000-0000" />
      </label>
      <label>
        Service needed
        <select name="service" required defaultValue="">
          <option value="" disabled>
            Select a service
          </option>
          {services.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        How can we help? <span className="optional">Optional</span>
        <textarea name="message" rows={compact ? 3 : 4} placeholder="Tell us a little about what is happening..." />
      </label>
      <button className="button button-accent button-large" type="submit">
        Request service <ArrowRight size={17} />
      </button>
      <small className="form-note">
        By submitting, you agree to be contacted about your request. We do not sell your information.
      </small>
    </form>
  )
}
