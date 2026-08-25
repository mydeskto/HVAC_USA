import { company } from './site'

export type PageBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'cta' }
  | { type: 'form' }
  | { type: 'faq'; items: [string, string][] }

export type PageContent = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  headline: string
  intro: string
  blocks: PageBlock[]
  kind?: 'service' | 'article' | 'about' | 'quote' | 'contact' | 'areas' | 'reviews' | 'blog' | 'faq' | 'shop'
}

const loc = `${company.city} and nearby ${company.region} communities`

function page(
  slug: string,
  title: string,
  intro: string,
  extra: Partial<PageContent> & { blocks: PageBlock[] },
): PageContent {
  return {
    slug,
    title,
    metaTitle: `${title} | ${company.name}`,
    metaDescription: intro.slice(0, 155),
    headline: title,
    intro,
    kind: 'service',
    ...extra,
  }
}

export const pages: Record<string, PageContent> = {
  heating: page(
    'heating',
    `Heating Services in ${company.city}`,
    `When temperatures drop across ${loc}, Addison Air Solutions keeps homes warm with expert furnace, boiler, and heat pump service. From emergency repairs to planned replacements, our technicians arrive prepared and explain every option before work begins.`,
    {
      blocks: [
        { type: 'h2', text: 'Complete heating care for every system' },
        { type: 'p', text: 'A heating breakdown in a Chicagoland winter is not a wait-and-see problem. We diagnose the root cause, stock common parts on our vans, and complete most repairs in a single visit.' },
        { type: 'ul', items: [
          'Emergency heating repair, 24/7',
          'Furnace repair, maintenance, and installation',
          'Boiler repair, maintenance, and installation',
          'Heat pump service and replacements',
          'Seasonal tune-ups and maintenance plans',
          'Zone control systems for room-by-room comfort',
        ]},
        { type: 'cta' },
        { type: 'h2', text: 'Signs your heating system needs attention' },
        { type: 'ul', items: [
          'Uneven rooms or weak airflow',
          'Strange noises, odors, or cycling on and off',
          'A sudden spike in energy bills',
          'The system is more than 12–15 years old',
        ]},
      ],
    },
  ),
  'heating/emergency-heating-repair': page(
    'heating/emergency-heating-repair',
    'Emergency Heating Repair',
    `Heat out in the middle of the night? Addison Air Solutions answers heating emergencies around the clock across ${loc}. Call us and a real person will help you get a technician on the way.`,
    {
      blocks: [
        { type: 'h2', text: 'What to do while you wait' },
        { type: 'ul', items: [
          'Check the thermostat is set to heat and the batteries are fresh',
          'Confirm the furnace switch and breaker are on',
          'Replace a dirty filter if you can do so safely',
          'Do not attempt gas or electrical repairs yourself',
        ]},
        { type: 'h2', text: 'Why homeowners call us first' },
        { type: 'p', text: 'Our vans are stocked for the most common winter failures. You get a clear diagnosis, upfront pricing, and a repair — not a runaround.' },
        { type: 'cta' },
      ],
    },
  ),
  'heating/repairs': page(
    'heating/repairs',
    'Heating Repairs',
    `From no-heat calls to noisy blowers, Addison Air Solutions repairs furnaces, boilers, and heat pumps throughout ${loc}. We fix the real issue and tell you honestly if a repair still makes sense.`,
    {
      blocks: [
        { type: 'h2', text: 'Heating problems we solve every day' },
        { type: 'ul', items: [
          'No heat, weak heat, or short cycling',
          'Ignition, pilot, and flame sensor issues',
          'Blower motors, limit switches, and control boards',
          'Leaking boilers and noisy radiators',
        ]},
        { type: 'cta' },
      ],
    },
  ),
  'heating/tune-up': page(
    'heating/tune-up',
    'Heating Tune Up',
    `A professional heating tune-up is the simplest way to prevent a mid-winter breakdown. Addison Air Solutions cleans, tests, and calibrates your system so it runs safely and efficiently all season.`,
    {
      blocks: [
        { type: 'h2', text: 'What a tune-up includes' },
        { type: 'ul', items: [
          'Safety inspection of heat exchanger, gas connections, and venting',
          'Cleaning of burners, flame sensor, and key components',
          'Filter check and airflow evaluation',
          'Thermostat and control testing',
          'A written report of what we found',
        ]},
        { type: 'cta' },
      ],
    },
  ),
  'heating/furnace-repair': page(
    'heating/furnace-repair',
    `Furnace Repair in ${company.city}`,
    `When your furnace falters in a Chicagoland winter, Addison Air Solutions is here to help. We provide reliable furnace repair for every major brand — with transparent pricing before any work begins.`,
    {
      blocks: [
        { type: 'h2', text: 'Common furnace issues in local homes' },
        { type: 'ul', items: [
          'Frozen condensate lines in extreme cold',
          'System overload from continuous winter use',
          'Dust and debris that restrict airflow',
          'Ignition failures, dirty flame sensors, and weak blowers',
          'Installation issues that cause repeated malfunctions',
        ]},
        { type: 'h2', text: 'How our furnace repair visit works' },
        { type: 'ul', items: [
          'Diagnosis: we identify the root cause, not just the symptom',
          'Explanation: your technician outlines options in plain language',
          'Upfront pricing: a clear estimate with no hidden fees',
          'Repair: most jobs are completed on the first visit',
          'Follow-up: we make sure the system is running the way it should',
        ]},
        { type: 'cta' },
      ],
    },
  ),
  'heating/furnace-maintenance': page(
    'heating/furnace-maintenance',
    'Furnace Maintenance',
    'Regular furnace maintenance catches small problems before they become no-heat emergencies. Our seasonal visits keep your equipment safer, cleaner, and more efficient.',
    {
      blocks: [
        { type: 'h2', text: 'Why maintenance matters' },
        { type: 'p', text: 'A well-maintained furnace uses less energy, lasts longer, and is far less likely to fail on the coldest night of the year. It also protects manufacturer warranties.' },
        { type: 'ul', items: ['Priority scheduling for plan members', '15% off parts and repairs', 'Two seasonal visits each year'] },
        { type: 'cta' },
      ],
    },
  ),
  'heating/furnace-installation': page(
    'heating/furnace-installation',
    'Furnace Installation',
    `Ready for a quieter, more efficient furnace? Addison Air Solutions sizes, installs, and commissions new systems for homes across ${loc} — with financing options when you need them.`,
    {
      blocks: [
        { type: 'h2', text: 'A replacement done right' },
        { type: 'ul', items: [
          'Load calculation so the furnace is sized for your home — not guessed',
          'Clean removal of the old unit and respectful job-site practices',
          'Professional venting, gas, and electrical connections',
          'Walkthrough so you know how to use the new system',
        ]},
        { type: 'cta' },
      ],
    },
  ),
  'heating/boiler-repair': page(
    'heating/boiler-repair',
    'Boiler Repairs',
    'Boilers heat many older and larger homes in our area. When yours leaks, knocks, or will not fire, our technicians restore reliable heat with parts and expertise for gas boilers of every major brand.',
    {
      blocks: [
        { type: 'h2', text: 'Boiler problems we repair' },
        { type: 'ul', items: ['No heat or lukewarm radiators', 'Leaks, pressure loss, and kettling', 'Circulator pump and zone valve failures', 'Pilot, ignition, and control issues'] },
        { type: 'cta' },
      ],
    },
  ),
  'heating/boiler-maintenance': page(
    'heating/boiler-maintenance',
    'Boiler Maintenance',
    'Annual boiler maintenance keeps pressure, combustion, and safety controls in spec. We inspect, clean, and test so your boiler is ready before the first freeze.',
    {
      blocks: [
        { type: 'h2', text: 'A thorough boiler visit' },
        { type: 'ul', items: ['Combustion analysis and safety testing', 'Expansion tank and pressure check', 'Flush and inspect as needed', 'Zone and thermostat verification'] },
        { type: 'cta' },
      ],
    },
  ),
  'heating/boiler-installation': page(
    'heating/boiler-installation',
    'Boiler Installations',
    'A new high-efficiency boiler can transform comfort and lower heating bills. We design the right replacement for your radiators or hydronic system and install it to code.',
    {
      blocks: [
        { type: 'h2', text: 'What you can expect' },
        { type: 'p', text: 'We evaluate your existing piping, venting, and domestic hot water needs, then recommend equipment that fits the home — not a one-size-fits-all box.' },
        { type: 'cta' },
      ],
    },
  ),
  'heating/heat-pumps': page(
    'heating/heat-pumps',
    'Heat Pumps',
    'Heat pumps deliver efficient heating and cooling in one system. Addison Air Solutions installs and services air-source and dual-fuel heat pumps sized for Chicagoland winters.',
    {
      blocks: [
        { type: 'h2', text: 'Is a heat pump right for your home?' },
        { type: 'p', text: 'Many homes can heat efficiently with a modern cold-climate heat pump, sometimes paired with a furnace for the coldest days. We will show you the numbers before you decide.' },
        { type: 'ul', items: ['Year-round comfort from one system', 'Lower operating costs in the right application', 'Compatible with many existing duct systems', 'Ductless options for additions and problem rooms'] },
        { type: 'cta' },
      ],
    },
  ),
  cooling: page(
    'cooling',
    `Cooling Services in ${company.city}`,
    `Stay comfortable when summer humidity hits. Addison Air Solutions repairs, maintains, and installs air conditioners and ductless systems across ${loc}, with 24/7 support when your AC fails.`,
    {
      blocks: [
        { type: 'h2', text: 'Cooling services we provide' },
        { type: 'ul', items: [
          'Emergency AC repair',
          'Air conditioner repair, maintenance, and installation',
          'Ductless mini-split systems',
          'Seasonal tune-ups and maintenance plans',
          'Zone control for better upstairs comfort',
        ]},
        { type: 'cta' },
      ],
    },
  ),
  'cooling/emergency-ac-repair': page(
    'cooling/emergency-ac-repair',
    'Emergency AC Repair',
    'When the air conditioner dies on a 90-degree day, you should not wait until Monday. We offer emergency cooling repair around the clock so your home is livable again fast.',
    {
      blocks: [
        { type: 'h2', text: 'Fast help for no-cool calls' },
        { type: 'p', text: 'From capacitor failures to frozen coils, we diagnose quickly and carry common parts so most emergency repairs finish the same visit.' },
        { type: 'cta' },
      ],
    },
  ),
  'cooling/tune-up': page(
    'cooling/tune-up',
    'AC Tune Up',
    'A spring AC tune-up is the best way to avoid a mid-July breakdown. We clean, test, and optimize your cooling system before you need it most.',
    {
      blocks: [
        { type: 'h2', text: 'Included in your cooling tune-up' },
        { type: 'ul', items: ['Coil inspection and cleaning as needed', 'Refrigerant and electrical checks', 'Capacitor, contactor, and blower testing', 'Thermostat calibration and airflow review'] },
        { type: 'cta' },
      ],
    },
  ),
  'cooling/air-conditioner-repair': page(
    'cooling/air-conditioner-repair',
    'Air Conditioning Repair',
    `Warm air from the vents, ice on the lines, or a system that will not start — Addison Air Solutions repairs central air conditioners throughout ${loc} with honest options and upfront pricing.`,
    {
      blocks: [
        { type: 'h2', text: 'AC issues we repair' },
        { type: 'ul', items: ['No cooling or weak airflow', 'Frozen evaporator coils', 'Strange noises from the outdoor unit', 'Short cycling and high humidity indoors', 'Thermostat and control failures'] },
        { type: 'cta' },
      ],
    },
  ),
  'cooling/air-conditioner-maintenance': page(
    'cooling/air-conditioner-maintenance',
    'Air Conditioning Maintenance',
    'Protect your investment with professional AC maintenance. Clean coils and healthy refrigerant levels keep energy bills down and prevent compressor failures.',
    {
      blocks: [
        { type: 'p', text: 'Join a maintenance plan and you will get seasonal visits, priority scheduling, and discounts on repairs — plus a system that is ready when the first heat wave arrives.' },
        { type: 'cta' },
      ],
    },
  ),
  'cooling/air-conditioner-installation': page(
    'cooling/air-conditioner-installation',
    'Air Conditioning Installation',
    'A correctly sized air conditioner cools evenly, runs quietly, and lasts longer. We handle the full replacement — from load calculation to final performance check.',
    {
      blocks: [
        { type: 'h2', text: 'Installation you can feel' },
        { type: 'ul', items: ['Right-sized equipment for your home', 'Clean, professional install with respect for your property', 'Matching indoor and outdoor components', 'Financing available for qualified homeowners'] },
        { type: 'cta' },
      ],
    },
  ),
  'cooling/ductless-air-conditioning': page(
    'cooling/ductless-air-conditioning',
    'Ductless Air Conditioning',
    'Ductless mini-splits are the smart answer for additions, garages, sunrooms, and rooms that never feel right. Quiet, efficient comfort without the cost of new ductwork.',
    {
      blocks: [
        { type: 'h2', text: 'Why homeowners choose ductless' },
        { type: 'ul', items: ['Room-by-room temperature control', 'High efficiency heating and cooling', 'Minimal disruption during install', 'Great for older homes without ducts'] },
        { type: 'cta' },
      ],
    },
  ),
  'indoor-air-quality': page(
    'indoor-air-quality',
    'Indoor Air Quality',
    'Comfort is more than temperature. Addison Air Solutions improves the air you breathe with humidifiers, dehumidifiers, purifiers, and professional coil cleaning.',
    {
      blocks: [
        { type: 'h2', text: 'Solutions for healthier air' },
        { type: 'ul', items: ['Whole-home humidifiers for dry winter air', 'Dehumidifiers that take the stickiness out of summer', 'Air purifiers that reduce dust, pollen, and odors', 'AC coil and condenser cleaning for better efficiency'] },
        { type: 'cta' },
      ],
    },
  ),
  'indoor-air-quality/humidifiers': page(
    'indoor-air-quality/humidifiers',
    'Whole Home Humidifiers',
    'Dry winter air leads to static, sore throats, and wood flooring that cracks. A whole-home humidifier adds the right moisture through your existing HVAC system.',
    {
      blocks: [
        { type: 'p', text: 'We install and service bypass, fan-powered, and steam humidifiers matched to your furnace and home size. Set it and forget it — no portable tanks to refill.' },
        { type: 'cta' },
      ],
    },
  ),
  'indoor-air-quality/dehumidifiers': page(
    'indoor-air-quality/dehumidifiers',
    'Whole Home Dehumidifiers',
    'If your home feels clammy even when the AC is running, a whole-home dehumidifier can pull excess moisture out of the air and protect against musty odors.',
    {
      blocks: [
        { type: 'p', text: 'These systems work with your ductwork to keep humidity in the healthy range, which also helps your air conditioner run less.' },
        { type: 'cta' },
      ],
    },
  ),
  'indoor-air-quality/air-purifiers': page(
    'indoor-air-quality/air-purifiers',
    'Air Purifiers',
    'Whole-home air purifiers reduce allergens, dust, and airborne particles as air moves through your HVAC system — a stronger solution than a portable unit in one room.',
    {
      blocks: [
        { type: 'ul', items: ['Media filters and high-MERV upgrades', 'In-duct purifiers including REME HALO®', 'Better results for pets, pollen, and household dust'] },
        { type: 'cta' },
      ],
    },
  ),
  'indoor-air-quality/ac-coil-cleaning': page(
    'indoor-air-quality/ac-coil-cleaning',
    'AC Coil & Condenser Cleaning',
    'Dirty coils force your system to work harder, raise energy bills, and can even freeze the AC. Professional coil and condenser cleaning restores airflow and efficiency.',
    {
      blocks: [
        { type: 'p', text: 'We clean indoor evaporator coils and outdoor condensers using methods that protect the equipment while removing the buildup that chokes performance.' },
        { type: 'cta' },
      ],
    },
  ),
  products: page(
    'products',
    'HVAC Products',
    'We install proven equipment from trusted manufacturers. Browse the brands and packages we recommend for Addison-area homes — then request a quote tailored to your house.',
    {
      kind: 'about',
      blocks: [
        { type: 'ul', items: [
          'Carrier heating and cooling equipment',
          'Ecobee smart thermostats',
          'Whole-home humidifiers',
          'REME HALO® in-duct air purifiers',
          'Bundled product packages',
          'Replacement filters in our filter shop',
        ]},
        { type: 'cta' },
      ],
    },
  ),
  'products/carrier-hvac-products': page(
    'products/carrier-hvac-products',
    'Carrier HVAC Products',
    'Carrier builds dependable furnaces, air conditioners, and heat pumps for Midwest climates. We help you choose the right efficiency level and install it to factory standards.',
    {
      blocks: [
        { type: 'p', text: 'From value-tier systems to high-efficiency communicating equipment, we will match Carrier products to your comfort goals and budget — with warranties you can count on.' },
        { type: 'cta' },
      ],
    },
  ),
  'products/ecobee-smart-thermostat': page(
    'products/ecobee-smart-thermostat',
    'Ecobee Smart Thermostat',
    'An Ecobee thermostat learns your schedule, uses room sensors, and can lower energy use without sacrificing comfort. We install and configure it with your HVAC system.',
    {
      blocks: [
        { type: 'ul', items: ['Remote access from your phone', 'Room sensors that even out hot and cold spots', 'Compatible with many furnaces, ACs, and heat pumps'] },
        { type: 'cta' },
      ],
    },
  ),
  'products/humidifiers': page(
    'products/humidifiers',
    'Humidifiers',
    'Choose a whole-home humidifier that integrates with your furnace. We stock and install quality units sized for your square footage and local winter dryness.',
    {
      blocks: [
        { type: 'p', text: 'Ask us which style fits your system — bypass, fan-powered, or steam — and we will handle the plumbing, wiring, and humidistat setup.' },
        { type: 'cta' },
      ],
    },
  ),
  'products/reme-halo': page(
    'products/reme-halo',
    'REME HALO® Whole Home In-Duct Purifier',
    'REME HALO® is an in-duct purifier designed to reduce odors, bacteria, and airborne particles throughout the home as air circulates through your HVAC system.',
    {
      blocks: [
        { type: 'p', text: 'Installed in the ductwork, it works continuously in the background. Ask us whether REME HALO® is a good fit alongside filtration upgrades.' },
        { type: 'cta' },
      ],
    },
  ),
  'products/product-packages': page(
    'products/product-packages',
    'Product Packages',
    'Bundling a new furnace, air conditioner, thermostat, and air-quality upgrade often costs less than buying each piece later. We build packages around your home and budget.',
    {
      blocks: [
        { type: 'ul', items: ['Matched heating and cooling systems', 'Smart thermostat included on many packages', 'Optional humidifier or purifier add-ons', 'Financing for qualified buyers'] },
        { type: 'cta' },
      ],
    },
  ),
  shop: page(
    'shop',
    'Filter Shop',
    'The right filter protects your equipment and your air. Tell us your system size or take a photo of the existing filter and we will point you to the correct replacement.',
    {
      kind: 'shop',
      blocks: [
        { type: 'p', text: 'We can drop off common sizes on a service visit or help you set a reminder so you never run the system on a clogged filter. Prefer a hands-off plan? Ask about filter delivery with a maintenance agreement.' },
        { type: 'cta' },
      ],
    },
  ),
  'about/faq': page(
    'about/faq',
    'FAQ Answers',
    'Straight answers to the questions homeowners ask us most — from response times to maintenance, pricing, and what to do in an emergency.',
    {
      kind: 'faq',
      blocks: [
        {
          type: 'faq',
          items: [
            ['How quickly can you get here?', 'Most calls in our core service area receive same-day options. Emergency heating and cooling calls are answered 24/7, including nights, weekends, and holidays.'],
            ['Do you offer upfront pricing?', 'Yes. After diagnosing the issue, your technician explains the options and price before work begins. No surprise line items.'],
            ['How often should my HVAC system be maintained?', 'We recommend a cooling tune-up in spring and a heating tune-up in fall. A maintenance plan makes seasonal care simple.'],
            ['Do you repair all brands?', 'Our technicians service all major residential brands. If replacement makes more sense, we will show you why — not just sell you a new system.'],
            ['What should I do if my furnace stops working?', 'Check the thermostat and filter first, then call us. Never attempt to repair gas or electrical components yourself.'],
            ['Do you install ductless systems?', 'Yes. Mini-splits are one of our most requested upgrades for additions, bonus rooms, and older homes without ductwork.'],
          ],
        },
      ],
    },
  ),
  'boiler-faqs': page(
    'boiler-faqs',
    'Boiler FAQs',
    'Boilers are different from furnaces. Here are the questions we hear most from homeowners who heat with hot water or steam.',
    {
      kind: 'faq',
      blocks: [
        {
          type: 'faq',
          items: [
            ['Why is my boiler making a knocking sound?', 'Kettling or knocking often points to mineral buildup, air in the system, or a failing pump. It is worth a professional look before a leak develops.'],
            ['How often should a boiler be serviced?', 'Once a year, ideally in fall. We check combustion, pressure, safety controls, and the expansion tank.'],
            ['Is it time to replace my boiler?', 'Age over 15–20 years, frequent repairs, rust, or a cracked heat exchanger are common replacement signals. We will give you a repair-vs-replace comparison.'],
            ['Can you work on steam and hot-water boilers?', 'Yes. We service both, including zone valves, circulators, and related controls.'],
          ],
        },
      ],
    },
  ),
  'the-importance-of-hvac-maintenance': page(
    'the-importance-of-hvac-maintenance',
    'The Importance of HVAC Maintenance',
    'Skipping maintenance is the fastest way to turn a $200 tune-up into a $2,000 repair. Here is why seasonal service is worth it.',
    {
      kind: 'article',
      blocks: [
        { type: 'h2', text: 'Catch problems while they are still small' },
        { type: 'p', text: 'Loose wires, weak capacitors, and dirty coils rarely announce themselves until the system fails. A technician who sees the equipment twice a year notices the trend before you lose heat or cooling.' },
        { type: 'h2', text: 'Lower bills and longer equipment life' },
        { type: 'p', text: 'Clean, calibrated systems move air more easily and run shorter cycles. That means less wear on motors and compressors — and a better chance of reaching the full expected lifespan.' },
        { type: 'h2', text: 'Safety you should not DIY' },
        { type: 'p', text: 'Furnaces and boilers involve combustion. A professional safety inspection checks heat exchangers, venting, and gas connections that a filter change will never catch.' },
        { type: 'cta' },
      ],
    },
  ),
  'how-to-prep-your-hvac-system-for-summer': page(
    'how-to-prep-your-hvac-system-for-summer',
    'How To Prep Your HVAC System For Summer',
    'The first 90-degree day is the wrong time to find out the AC will not start. Use this checklist before cooling season.',
    {
      kind: 'article',
      blocks: [
        { type: 'h2', text: 'Homeowner checklist' },
        { type: 'ul', items: [
          'Replace or clean the filter',
          'Clear leaves and debris from around the outdoor unit — keep 2 feet of space',
          'Make sure supply and return vents are open and unblocked',
          'Test the system on a mild day so you have time to schedule service',
          'Book a professional AC tune-up',
        ]},
        { type: 'p', text: 'If last summer felt humid or uneven, ask us about coil cleaning, refrigerant checks, or a ductless add-on for the hottest rooms.' },
        { type: 'cta' },
      ],
    },
  ),
  'hvac-maintenance-tips-for-pet-owners': page(
    'hvac-maintenance-tips-for-pet-owners',
    'HVAC Maintenance Tips for Pet Owners',
    'Pets make a house a home — and they also load filters with hair faster than you expect. A few habits will keep the system healthier.',
    {
      kind: 'article',
      blocks: [
        { type: 'ul', items: [
          'Change filters more often — every 30–60 days in shedding season',
          'Use a higher-quality filter rated for your system’s static pressure',
          'Keep litter boxes and pet beds away from returns when you can',
          'Schedule professional coil cleaning if you notice dust or odors from vents',
          'Consider a whole-home air purifier if allergies are an issue',
        ]},
        { type: 'cta' },
      ],
    },
  ),
  'extend-life-hvac-system': page(
    'extend-life-hvac-system',
    'How to Extend the Life of Your HVAC System',
    'Most systems last 12–15 years with decent care, and longer with excellent care. These habits make the difference.',
    {
      kind: 'article',
      blocks: [
        { type: 'ul', items: [
          'Stay on a twice-a-year maintenance schedule',
          'Do not ignore odd noises, smells, or weak airflow',
          'Keep the outdoor unit level and clear',
          'Use a programmable or smart thermostat to avoid extreme setbacks',
          'Fix duct leaks and insulation issues that force the system to overwork',
        ]},
        { type: 'p', text: 'When repairs start stacking up, we will give you a straightforward repair-versus-replace picture so you are not throwing good money after bad.' },
        { type: 'cta' },
      ],
    },
  ),
  about: page(
    'about',
    `About ${company.name}`,
    `${company.name} is a local heating and cooling team serving ${loc}. We focus on reliable repairs, honest recommendations, and 24/7 support when comfort cannot wait.`,
    {
      kind: 'about',
      blocks: [
        { type: 'h2', text: 'Comfort you can come home to' },
        { type: 'p', text: 'Our technicians are trained to diagnose first, explain clearly, and only recommend work you genuinely need. Whether it is a midnight no-heat call or a planned system replacement, you will get the same standard of care.' },
        { type: 'h2', text: 'What sets us apart' },
        { type: 'ul', items: [
          '24/7 emergency heating and cooling service',
          'Upfront pricing before work begins',
          'Maintenance plans that actually save you money',
          'Respect for your home — we protect floors and clean up',
        ]},
        { type: 'cta' },
      ],
    },
  ),
  contact: page(
    'contact',
    'Contact Us',
    `Questions? We can help. Call ${company.phoneDisplay}, request service online, or send a note and we will get back to you shortly.`,
    {
      kind: 'contact',
      blocks: [
        { type: 'p', text: `Phone: ${company.phoneDisplay}` },
        { type: 'p', text: `Email: ${company.email}` },
        { type: 'p', text: `Address: ${company.address}` },
        { type: 'p', text: `Service area: ${company.serviceRadiusMiles}-mile radius from ${company.zip}` },
        { type: 'p', text: `Hours: ${company.hours}` },
        { type: 'form' },
      ],
    },
  ),
  'about/finance': page(
    'about/finance',
    'Financing',
    'A new system should not have to wait until you have the full amount in cash. We offer flexible financing for qualified homeowners so you can upgrade comfort now.',
    {
      kind: 'about',
      blocks: [
        { type: 'p', text: 'Ask about promotional terms when you request a quote. Approval, rates, and payments depend on credit. We will walk you through options alongside the equipment recommendation — no pressure.' },
        { type: 'cta' },
      ],
    },
  ),
  'about/special-offers': page(
    'about/special-offers',
    'Special Offers',
    'Seasonal promotions on tune-ups, installations, and indoor air quality upgrades. Ask us what is running when you book.',
    {
      kind: 'about',
      blocks: [
        { type: 'h2', text: 'Current highlights' },
        { type: 'ul', items: [
          'Discounted diagnostic with a completed repair',
          'Seasonal tune-up specials for heating and cooling',
          'Installation packages with thermostat upgrades',
          'Maintenance plan enrollment savings',
        ]},
        { type: 'p', text: 'Offers change with the season and cannot be combined unless noted. Mention the promotion when you schedule.' },
        { type: 'cta' },
      ],
    },
  ),
  'about/guarantees': page(
    'about/guarantees',
    'Guarantees',
    'We stand behind our work. If something does not feel right after a visit, call us and we will make it right.',
    {
      kind: 'about',
      blocks: [
        { type: 'ul', items: [
          'Clear written estimates before work begins',
          'Workmanship warranty on repairs and installations',
          'Manufacturer warranties honored on new equipment',
          'Respectful technicians who treat your home like their own',
        ]},
        { type: 'cta' },
      ],
    },
  ),
  blog: page(
    'blog',
    'Blog',
    'Practical HVAC guidance for Addison-area homeowners — maintenance, seasonal prep, and how to get more years from your system.',
    {
      kind: 'blog',
      blocks: [
        { type: 'p', text: 'Start with our most-read resources, then call if you want the advice applied to your home.' },
      ],
    },
  ),
  'about/careers': page(
    'about/careers',
    'Careers',
    `Addison Air Solutions is hiring technicians and support staff who take pride in showing up, communicating clearly, and doing the job right.`,
    {
      kind: 'about',
      blocks: [
        { type: 'h2', text: 'Why techs stay' },
        { type: 'ul', items: ['Late-model vans and stocked parts', 'Ongoing training', 'A culture that does not sell unnecessary work', 'Room to grow from helper to lead technician'] },
        { type: 'p', text: `Send a note through our contact form or email ${company.email} with a short introduction. We would like to hear from you.` },
        { type: 'form' },
      ],
    },
  ),
  reviews: page(
    'reviews',
    'Customer Reviews',
    'Homeowners across Addison and nearby suburbs trust us with the systems that keep their families comfortable. Here is a sample of recent feedback.',
    {
      kind: 'reviews',
      blocks: [
        { type: 'p', text: 'We are proud of a 4.9-star reputation built on showing up, explaining options, and finishing the job cleanly. If we have been to your home, we would be grateful for a review.' },
        { type: 'cta' },
      ],
    },
  ),
  'service-areas': page(
    'service-areas',
    'Service Areas',
    `Addison Air Solutions proudly serves ${company.address} and a ${company.serviceRadiusMiles}-mile area around ZIP ${company.zip}. If you are nearby and not sure we cover you, call — we will let you know.`,
    {
      kind: 'areas',
      blocks: [
        { type: 'p', text: 'From emergency no-heat calls to planned installations, our technicians run routes through the suburbs and Chicago neighborhoods listed below.' },
        { type: 'cta' },
      ],
    },
  ),
  'get-a-quote': page(
    'get-a-quote',
    'Get A Quote',
    'Tell us a little about your home and what you need. We will follow up with the right technician, a time window, and — for replacements — a clear written quote.',
    {
      kind: 'quote',
      blocks: [{ type: 'form' }],
    },
  ),
  'about/maintenance-plans': page(
    'about/maintenance-plans',
    'Maintenance Plans',
    'Enroll in regular maintenance so we catch problems before they get worse. Members get priority scheduling, seasonal visits, and real discounts on repairs.',
    {
      blocks: [
        { type: 'h2', text: 'Plan benefits' },
        { type: 'ul', items: [
          'Discounted diagnostic charge',
          '15% off parts and repairs',
          'Regular maintenance on covered equipment',
          'Seasonal maintenance visits',
          'Priority scheduling',
          'Discounts on installation',
        ]},
        { type: 'cta' },
      ],
    },
  ),
  'services/zone-control-systems': page(
    'services/zone-control-systems',
    'Zone Control Systems',
    'Hot upstairs, freezing basement? Zone control lets different parts of the home run on their own schedule so you are not blasting the whole house to fix one room.',
    {
      blocks: [
        { type: 'p', text: 'We design and install dampers, additional thermostats, and compatible controls for furnaces and air conditioners. It is one of the most effective comfort upgrades for two-story homes.' },
        { type: 'cta' },
      ],
    },
  ),
  'privacy-policy': page(
    'privacy-policy',
    'Privacy Policy',
    `${company.name} respects your privacy. We use contact details you provide only to respond to service requests and to communicate about your HVAC needs.`,
    {
      kind: 'article',
      blocks: [
        { type: 'p', text: 'We do not sell your information. Form submissions are used to schedule service and follow up on quotes. You may ask us to update or remove your contact record at any time.' },
      ],
    },
  ),
  'terms-of-use': page(
    'terms-of-use',
    'Terms of Use',
    `By using ${company.website}, you agree to use the site for lawful purposes and understand that estimates shared online are informational until confirmed in writing.`,
    {
      kind: 'article',
      blocks: [
        { type: 'p', text: 'Service work is performed under the terms presented at the time of the visit. Promotional pricing is subject to change. Equipment specifications on this site are general and may vary by model and availability.' },
      ],
    },
  ),
  accessibility: page(
    'accessibility',
    'Accessibility Statement',
    `${company.name} is committed to a website that people can use with a range of abilities and assistive technologies.`,
    {
      kind: 'article',
      blocks: [
        { type: 'p', text: `If you have trouble using any part of this site, please call ${company.phoneDisplay} or email ${company.email} and we will help you complete your request another way.` },
      ],
    },
  ),
  sitemap: page(
    'sitemap',
    'Sitemap',
    'Find every page on AddisonAirSolutions.com from one list.',
    {
      kind: 'about',
      blocks: [{ type: 'p', text: 'Use the navigation above or the links in the footer to jump to heating, cooling, air quality, products, resources, and company pages.' }],
    },
  ),
}

export function getPage(slug: string) {
  return pages[slug]
}

export function allSlugs() {
  return Object.keys(pages)
}
