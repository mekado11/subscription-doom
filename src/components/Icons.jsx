// Category icons — emoji for rich, colorful rendering on iOS/Android
// Emoji render as full-color 3D-style images natively on all platforms

const CATEGORY_EMOJI = {
  'Shopping':       '🛍️',
  'Coffee Shops':   '☕',
  'Restaurants':    '🍽️',
  'Food Delivery':  '🛵',
  'Rideshare':      '🚗',
  'Bars & Alcohol': '🍺',
  'Travel':         '✈️',
  'Hotels':         '🏨',
  'Gym':            '💪',
  'Groceries':      '🛒',
  'Entertainment':  '🎬',
  'Health':         '💊',
}

/**
 * Rounded square icon for a habit category — emoji on tinted background.
 */
export function CategoryIcon({ category, color, size = 40 }) {
  const emoji = CATEGORY_EMOJI[category] ?? '💸'
  const fontSize = Math.round(size * 0.48)
  return (
    <div
      className="rounded-xl flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: color + '18',
        border: `1px solid ${color}35`,
        fontSize,
        lineHeight: 1,
      }}
    >
      {emoji}
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
