export const company = {
  name: 'Addison Air Solutions',
  shortName: 'Addison Air',
  phoneDisplay: '+1 (224) 323-3538',
  phoneTel: '+12243233538',
  email: 'service@addisonairsolutions.com',
  website: 'AddisonAirSolutions.com',
  city: 'Addison, IL',
  zip: '60101',
  region: 'Chicagoland',
  address: 'Addison, IL 60101',
  hours: '24/7 emergency service',
  tagline: 'Heating and cooling you can count on — every season.',
  serviceRadiusMiles: 20,
}

export const suburbs = [
  'Addison',
  'Elmhurst',
  'Lombard',
  'Villa Park',
  'Glen Ellyn',
  'Wheaton',
  'Downers Grove',
  'Oak Brook',
  'Bensenville',
  'Wood Dale',
  'Itasca',
  'Bloomingdale',
  'Glendale Heights',
  'Carol Stream',
  'Schaumburg',
  'Elk Grove Village',
  'Des Plaines',
  'Park Ridge',
  'Oak Park',
  'Naperville',
  'Arlington Heights',
  'Mount Prospect',
  'Niles',
  'Skokie',
]

export const neighborhoods = [
  'Albany Park',
  'Avondale',
  'Bucktown',
  'Edgewater',
  'Edison Park',
  'Irving Park',
  'Jefferson Park',
  'Lakeview',
  'Lincoln Park',
  'Lincoln Square',
  'Logan Square',
  'Portage Park',
  'Ravenswood',
  'Roscoe Village',
  'Uptown',
  'West Loop',
  'West Town',
  'Wicker Park',
]

export type NavChild = { label: string; href: string }
export type NavItem = { label: string; href: string; children?: NavChild[]; cta?: boolean }

export const nav: NavItem[] = [
  {
    label: 'Heating',
    href: '/heating',
    children: [
      { label: 'Emergency Heating Repair', href: '/heating/emergency-heating-repair' },
      { label: 'Heating Repairs', href: '/heating/repairs' },
      { label: 'Heating Tune Up', href: '/heating/tune-up' },
      { label: 'Furnace Repairs', href: '/heating/furnace-repair' },
      { label: 'Furnace Maintenance', href: '/heating/furnace-maintenance' },
      { label: 'Furnace Installation', href: '/heating/furnace-installation' },
      { label: 'Boiler Repairs', href: '/heating/boiler-repair' },
      { label: 'Boiler Maintenance', href: '/heating/boiler-maintenance' },
      { label: 'Boiler Installations', href: '/heating/boiler-installation' },
      { label: 'Heat Pumps', href: '/heating/heat-pumps' },
      { label: 'Maintenance Plans', href: '/about/maintenance-plans' },
      { label: 'Zone Control Systems', href: '/services/zone-control-systems' },
    ],
  },
  {
    label: 'Cooling',
    href: '/cooling',
    children: [
      { label: 'Emergency AC Repair', href: '/cooling/emergency-ac-repair' },
      { label: 'AC Tune Up', href: '/cooling/tune-up' },
      { label: 'Air Conditioning Repair', href: '/cooling/air-conditioner-repair' },
      { label: 'Air Conditioning Maintenance', href: '/cooling/air-conditioner-maintenance' },
      { label: 'Air Conditioning Installation', href: '/cooling/air-conditioner-installation' },
      { label: 'Ductless Air Conditioning', href: '/cooling/ductless-air-conditioning' },
      { label: 'Maintenance Plans', href: '/about/maintenance-plans' },
      { label: 'Zone Control Systems', href: '/services/zone-control-systems' },
    ],
  },
  {
    label: 'Air Quality',
    href: '/indoor-air-quality',
    children: [
      { label: 'Whole Home Humidifiers', href: '/indoor-air-quality/humidifiers' },
      { label: 'Whole Home Dehumidifiers', href: '/indoor-air-quality/dehumidifiers' },
      { label: 'Air Purifiers', href: '/indoor-air-quality/air-purifiers' },
      { label: 'AC Coil & Condenser Cleaning', href: '/indoor-air-quality/ac-coil-cleaning' },
    ],
  },
  {
    label: 'Products',
    href: '/products',
    children: [
      { label: 'Carrier HVAC Products', href: '/products/carrier-hvac-products' },
      { label: 'Ecobee Smart Thermostat', href: '/products/ecobee-smart-thermostat' },
      { label: 'Humidifiers', href: '/products/humidifiers' },
      { label: 'REME HALO® Whole Home In-Duct Purifier', href: '/products/reme-halo' },
      { label: 'Product Packages', href: '/products/product-packages' },
      { label: 'Filter Shop', href: '/shop' },
    ],
  },
  {
    label: 'Resources',
    href: '/about/faq',
    children: [
      { label: 'FAQ Answers', href: '/about/faq' },
      { label: 'Boiler FAQs', href: '/boiler-faqs' },
      { label: 'The Importance of HVAC Maintenance', href: '/the-importance-of-hvac-maintenance' },
      { label: 'How To Prep Your HVAC System For Summer', href: '/how-to-prep-your-hvac-system-for-summer' },
      { label: 'HVAC Maintenance Tips for Pet Owners', href: '/hvac-maintenance-tips-for-pet-owners' },
      { label: 'How to Extend the Life of Your HVAC System', href: '/extend-life-hvac-system' },
    ],
  },
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Contact', href: '/contact' },
      { label: 'Finance', href: '/about/finance' },
      { label: 'Special Offers', href: '/about/special-offers' },
      { label: 'Guarantees', href: '/about/guarantees' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/about/careers' },
      { label: 'Customer Reviews', href: '/reviews' },
      { label: 'Service Areas', href: '/service-areas' },
    ],
  },
  { label: 'Get A Quote', href: '/get-a-quote', cta: true },
]

export const heatingCards = [
  { title: 'Heating Maintenance', href: '/heating/tune-up', icon: 'wrench' as const },
  { title: 'Heating Installations', href: '/heating/furnace-installation', icon: 'tools' as const },
  { title: 'Emergency Heating Services', href: '/heating/emergency-heating-repair', icon: 'bolt' as const },
  { title: 'Heating Promotions', href: '/about/special-offers', icon: 'tag' as const },
]

export const coolingCards = [
  { title: 'Cooling Maintenance', href: '/cooling/tune-up', icon: 'wrench' as const },
  { title: 'Cooling Installations', href: '/cooling/air-conditioner-installation', icon: 'tools' as const },
  { title: 'Emergency Cooling Services', href: '/cooling/emergency-ac-repair', icon: 'bolt' as const },
  { title: 'Cooling Promotions', href: '/about/special-offers', icon: 'tag' as const },
]

export const testimonials = [
  {
    quote:
      'Addison Air Solutions was awesome to work with. As a first-time homeowner, I really appreciated how clearly they explained everything and answered all my questions. From the quote to the install and follow-up, the service was top-notch.',
    name: 'Lindsey A.',
    area: 'Addison, IL',
  },
  {
    quote:
      'Matt did an amazing job. He serviced our home and our rental property. He gave us options to help our systems run more efficiently and never pushed an upsell. He is great!',
    name: 'Jordan R.',
    area: 'Elmhurst, IL',
  },
  {
    quote:
      'We had a problem with our humidifier and called Addison Air. The technician was extremely knowledgeable, detail oriented, and courteous. Amazing customer experience!',
    name: 'Jeff C.',
    area: 'Lombard, IL',
  },
  {
    quote:
      'The team was extremely helpful and knowledgeable. We would 100% work with them again. They were professional and efficiently fixed our heating system.',
    name: 'Emily L.',
    area: 'Villa Park, IL',
  },
  {
    quote:
      'Shout out to the technician who came out and serviced our furnace and air conditioner. Addison Air provides a great service and we are glad to trust them with HVAC for our small business.',
    name: 'Lauren H.',
    area: 'Bloomingdale, IL',
  },
]

export const stats = [
  { value: '2,400+', label: 'homes kept comfortable' },
  { value: '24/7', label: 'emergency service' },
  { value: '4.9★', label: 'customer rating' },
  { value: 'Same-day', label: 'repair options' },
]
