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
  'Travel',
])

// health: 'okay' | 'watch' | 'creeping' | 'bleeding'
// benchmark: reasonable monthly spend in $
export const CATEGORY_META = {
  'Coffee Shops':   { label: 'Coffee',        color: '#FBBF24', health: 'watch',    healthLabel: 'Adds up fast',    benchmark: 60  },
  'Restaurants':    { label: 'Eating Out',     color: '#F97316', health: 'creeping', healthLabel: 'Can creep up',    benchmark: 200 },
  'Bars & Alcohol': { label: 'Alcohol',        color: '#C084FC', health: 'watch',    healthLabel: 'Debatable',       benchmark: 80  },
  'Food Delivery':  { label: 'Food Delivery',  color: '#F87171', health: 'bleeding', healthLabel: 'Convenience tax', benchmark: 80  },
  'Rideshare':      { label: 'Rideshare',      color: '#60A5FA', health: 'bleeding', healthLabel: 'Bleeding',        benchmark: 80  },
  'Shopping':       { label: 'Shopping',       color: '#A78BFA', health: 'bleeding', healthLabel: 'Bleeding',        benchmark: 150 },
  'Travel':         { label: 'Travel',         color: '#34D399', health: 'okay',     healthLabel: 'Worth it',        benchmark: 300 },
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

// Cancel instructions per subscription
export const CANCEL_INFO = {
  'Netflix': {
    difficulty: 'Easy',
    steps: [
      'Open netflix.com and sign in',
      'Click your profile icon → Account',
      'Under Membership & Billing → Cancel Membership',
      'Confirm cancellation — takes effect at end of billing period',
    ],
  },
  'Spotify': {
    difficulty: 'Easy',
    steps: [
      'Go to spotify.com/account and sign in',
      'Under Your Plan → Change Plan',
      'Scroll down → Cancel Premium',
      'Follow the confirmation prompts',
    ],
  },
  'Adobe Creative Cloud': {
    difficulty: 'Hard',
    warning: 'Early cancellation fee may apply if on annual plan',
    steps: [
      'Sign in to account.adobe.com',
      'Under Plans → Manage Plan',
      'Select Cancel Plan',
      'Review any fees before confirming — call support if needed',
    ],
  },
  'Gym & Fitness': {
    difficulty: 'Hard',
    warning: 'Usually requires an in-person visit or certified mail',
    steps: [
      'Visit your gym location in person',
      'Request a cancellation form from the front desk',
      'Get written confirmation of your cancellation',
      'Check for remaining contract obligations or freeze options',
    ],
  },
  'iCloud Storage': {
    difficulty: 'Easy',
    steps: [
      'Open Settings on your iPhone',
      'Tap your name → iCloud → Manage Account Storage',
      'Tap Change Storage Plan',
      'Select Free (5 GB) and confirm',
    ],
  },
  'YouTube Premium': {
    difficulty: 'Easy',
    steps: [
      'Go to youtube.com and sign in',
      'Click your profile → Purchases and memberships',
      'Click Manage next to YouTube Premium',
      'Select Deactivate and confirm',
    ],
  },
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
        cancelInfo: CANCEL_INFO[merchant] ?? null,
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
      health: meta?.health ?? 'watch',
      healthLabel: meta?.healthLabel ?? '',
      benchmark: meta?.benchmark ?? 100,
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
 * Calculate Doom Score (0–100). Lower = more financial doom.
 * 0–25: Critical Doom · 26–50: High Doom · 51–75: Moderate · 76–100: Financially Chill
 */
export function calculateDoomScore(analysis) {
  const { summary, subscriptions, habits } = analysis
  const ASSUMED_INCOME = 5000

  let score = 100

  // Spending ratio penalty
  const spendRatio = summary.totalMonthly / ASSUMED_INCOME
  score -= Math.round(spendRatio * 70)

  // Subscription count penalty (> 3 is excessive)
  score -= Math.max(0, subscriptions.length - 3) * 4

  // Bleeding category over-budget penalties
  for (const habit of habits) {
    if (habit.health === 'bleeding') {
      const over = Math.max(0, habit.monthlyAvg - habit.benchmark)
      score -= Math.round(over / 25)
    }
    if (habit.health === 'creeping') {
      const over = Math.max(0, habit.monthlyAvg - habit.benchmark)
      score -= Math.round(over / 50)
    }
  }

  return Math.max(5, Math.min(100, score))
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

  const analysis = {
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

  analysis.doomScore = calculateDoomScore(analysis)
  return analysis
}
