// SVG icon components — Lucide-style, 1.75px stroke

export function ShoppingIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

export function CoffeeIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 010 8h-1"/>
      <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/>
      <line x1="10" y1="1" x2="10" y2="4"/>
      <line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  )
}

export function UtensilsIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  )
}

export function PackageIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  )
}

export function CarIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17H5a2 2 0 01-2-2V9l2-5h14l2 5v6a2 2 0 01-2 2z"/>
      <circle cx="7.5" cy="17.5" r="1.5"/>
      <circle cx="16.5" cy="17.5" r="1.5"/>
    </svg>
  )
}

export function WineIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22h8"/>
      <path d="M12 11v11"/>
      <path d="M5 3l2 8a5 5 0 0010 0l2-8H5z"/>
    </svg>
  )
}

const CATEGORY_ICONS = {
  'Shopping':      ShoppingIcon,
  'Coffee Shops':  CoffeeIcon,
  'Restaurants':   UtensilsIcon,
  'Food Delivery': PackageIcon,
  'Rideshare':     CarIcon,
  'Bars & Alcohol':WineIcon,
}

/**
 * Rounded square icon for a habit category — SVG icon on tinted background.
 */
export function CategoryIcon({ category, color, size = 40 }) {
  const Icon = CATEGORY_ICONS[category] ?? ShoppingIcon
  const iconSize = Math.round(size * 0.45)
  return (
    <div
      className="rounded-xl flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: color + '20',
        border: `1px solid ${color}40`,
      }}
    >
      <Icon size={iconSize} color={color} />
    </div>
  )
}

/**
 * Brand letter-avatar for subscriptions — solid colored tile with initials.
 * Styled like Revolut / Monzo transaction icons.
 */
export function BrandAvatar({ letter, color, size = 40 }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center font-black text-white flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 2px 14px ${color}55`,
        fontSize: Math.round(size * 0.32),
        letterSpacing: '-0.02em',
      }}
    >
      {letter}
    </div>
  )
}
