import { company } from '@/lib/site'

export function ServiceAreaMap({ className = 'map-photo' }: { className?: string }) {
  const query = encodeURIComponent(company.address)
  // Zoom 9 shows roughly a 20-mile radius around Addison, IL 60101
  const src = `https://maps.google.com/maps?q=${query}&z=9&hl=en&output=embed`

  return (
    <div className={`map-embed ${className}`}>
      <iframe
        title={`${company.name} ${company.serviceRadiusMiles}-mile service area around ${company.address}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <p className="map-caption">
        {company.serviceRadiusMiles}-mile service area across {company.address}
      </p>
    </div>
  )
}
