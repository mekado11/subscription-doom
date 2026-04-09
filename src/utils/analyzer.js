// Core transaction analysis logic

const SUBSCRIPTION_MERCHANTS = new Set([
  'netflix', 'spotify', 'adobe', 'hulu', 'disney', 'apple', 'icloud',
  'amazon prime', 'youtube premium', 'gym', 'fitness', 'crunchfit',
  'peloton', 'duolingo', 'notion', 'slack', 'dropbox', 'microsoft',
  'google one', 'linkedin premium', 'paramount', 'hbo', 'peacock',
])

const HABIT_CATEGORIES = new Set([
  'Coffee Shops',
  'Restaurants',
  'Bars & Alcohol',
  'Food Delivery',
  'Rideshare',
  'Shopping',
])

// Updated palette to match glassmorphism design
const CATEGORY_META = {
  'Coffee Shops':   { label: 'Coffee',       color: '#FBBF24' },
  'Restaurants':    { label: 'Eating Out',    color: '#F87171' },
  'Bars & Alcohol': { label: 'Alcohol',       color: '#C084FC' },
  'Food Delivery':  { label: 'Food Delivery', color: '#34D399' },
  'Rideshare':      { label: 'Rideshare',     color: '#60A5FA' },
  'Shopping':       { label: 'Shopping',      color: '#A78BFA' },
}

// Letter-avatar metadata for subscription brands
const SUB_META = {
  'Netflix':              { letter: 'N',  color: '#E50914' },
  'Spotify':              { letter: 'S',  color: '#1DB954' },
  'Adobe Creative Cloud': { letter: 'Ac', color: '#FF4500' },
  'Gym & Fitness':        { letter: 'Gm', color: '#F59E0B' },
  'iCloud Storage':       { letter: 'iC', color: '#3B82F6' },
  'YouTube Premium':      { letter: 'YT', color: '#FF0000' },
}

/**
 * Detect if a merchant is subscription-like by name OR by
 * recurring pattern (same merchant, same amount ±10%, monthly interval).
 */
function detectSubscriptions(transactions) {
  const byMerchant = {}

  for (const t of transactions) {
    const key = t.merchant.toLowerCase()
    if (!byMerchant[key]) byMerchant[key] = []
    byMerchant[key].push(t)
  }

  const subscriptions = []

  for (const [key, txns] of Object.entries(byMerchant)) {
    txns.sort((a, b) => new Date(a.date) - new Date(b.date))

    const isNamedSub = [...SUBSCRIPTION_MERCHANTS].some(s => key.includes(s))
    const amounts = txns.map(t => t.amount)
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const allSimilarAmount = amounts.every(a => Math.abs(a - avgAmount) / avgAmount < 0.1)

    let isRecurring = false
    if (txns.length >= 2) {
      const gaps = []
      for (let i = 1; i < txns.length; i++) {
        const days = (new Date(txns[i].date) - new Date(txns[i - 1].date)) / (1000 * 60 * 60 * 24)
        gaps.push(days)
      }
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
      isRecurring = avgGap >= 25 && avgGap <= 35
    }

    if (isNamedSub || (allSimilarAmount && isRecurring)) {
      const merchant = txns[0].merchant
      const meta = SUB_META[merchant]
      subscriptions.push({
        merchant,
        letter: meta?.letter ?? merchant[0].toUpperCase(),
        color: meta?.color ?? '#8B5CF6',
        monthlyAvg: +avgAmount.toFixed(2),
        yearlyTotal: +(avgAmount * 12).toFixed(2),
        txnCount: txns.length,
        type: 'subscription',
      })
    }
  }

  return subscriptions.sort((a, b) => b.monthlyAvg - a.monthlyAvg)
}

/**
 * Detect habit spending: categories with high frequency or total.
 */
function detectHabits(transactions) {
  const byCategory = {}

  for (const t of transactions) {
    if (!HABIT_CATEGORIES.has(t.category)) continue
    if (!byCategory[t.category]) byCategory[t.category] = []
    byCategory[t.category].push(t)
  }

  const habits = []

  for (const [category, txns] of Object.entries(byCategory)) {
    const totalSpend = txns.reduce((s, t) => s + t.amount, 0)
    const monthCount = 6
    const monthlyAvg = totalSpend / monthCount
    const meta = CATEGORY_META[category]

    habits.push({
      category,
      label: meta?.label ?? category,
      color: meta?.color ?? '#8B5CF6',
      monthlyAvg: +monthlyAvg.toFixed(2),
      yearlyTotal: +(monthlyAvg * 12).toFixed(2),
      txnCount: txns.length,
      monthlyTxnCount: +(txns.length / monthCount).toFixed(1),
      type: 'habit',
    })
  }

  return habits.sort((a, b) => b.monthlyAvg - a.monthlyAvg)
}

/**
 * Full analysis result from a transaction list.
 */
export function analyzeTransactions(transactions) {
  const subscriptions = detectSubscriptions(
    transactions.filter(t => t.type === 'subscription')
  )
  const habits = detectHabits(transactions)

  const subMonthly = subscriptions.reduce((s, x) => s + x.monthlyAvg, 0)
  const habitMonthly = habits.reduce((s, x) => s + x.monthlyAvg, 0)
  const totalMonthly = subMonthly + habitMonthly

  const allItems = [...subscriptions, ...habits]
  const topLeaks = [...allItems].sort((a, b) => b.monthlyAvg - a.monthlyAvg).slice(0, 3)

  return {
    subscriptions,
    habits,
    topLeaks,
    summary: {
      totalMonthly: +totalMonthly.toFixed(2),
      totalYearly: +(totalMonthly * 12).toFixed(2),
      subMonthly: +subMonthly.toFixed(2),
      habitMonthly: +habitMonthly.toFixed(2),
    },
  }
}
