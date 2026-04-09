import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

const CATEGORIES = [
  'Coffee Shops',
  'Restaurants',
  'Bars & Alcohol',
  'Food Delivery',
  'Rideshare',
  'Shopping',
  'Entertainment',
  'Software / Subscriptions',
  'Health & Fitness',
  'Utilities',
  'Housing',
  'Groceries',
  'Travel',
  'Other',
]

const GRAD = 'linear-gradient(135deg, #7C3AED, #EC4899)'

// ── Keyword → category guesser ────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  'Coffee Shops':             ['starbucks','coffee','dunkin','philz','blue bottle','peet','espresso','cafe'],
  'Restaurants':              ['chipotle','mcdonalds','mcdonald','shake shack','chick-fil-a','subway','sushi','pizza','burger','taco','thai','restaurant','grill','diner','kitchen','bistro','five guys','sonic','wendy','panera'],
  'Bars & Alcohol':           ['bar','tavern','pub','brewery','wine','beer','liquor','total wine','drizly','spirits'],
  'Food Delivery':            ['doordash','uber eats','ubereats','grubhub','instacart','postmates','seamless','delivery'],
  'Rideshare':                ['uber','lyft','waymo'],
  'Shopping':                 ['amazon','target','walmart','zara','h&m','hm','asos','nike','adidas','shein','gap','old navy','tj maxx','nordstrom','macys','bestbuy','best buy','etsy','ebay'],
  'Entertainment':            ['netflix','spotify','hulu','disney','apple tv','youtube','twitch','steam','playstation','xbox','amc','cinemark','fandango','ticketmaster'],
  'Software / Subscriptions': ['adobe','microsoft','google','dropbox','notion','slack','zoom','github','canva','figma','1password','lastpass'],
  'Health & Fitness':         ['gym','planet fitness','la fitness','equinox','peloton','cvs','walgreens','pharmacy','dental','doctor','clinic','medical'],
  'Utilities':                ['electric','gas','water','internet','comcast','xfinity','verizon','at&t','t-mobile','spectrum','utility'],
  'Groceries':                ['whole foods','trader joe','safeway','kroger','publix','aldi','wegmans','sprouts','grocery','supermarket','market'],
  'Travel':                   ['airbnb','vrbo','marriott','hilton','hyatt','delta','united','american airlines','southwest','expedia','kayak','booking','hotel'],
}

function guessCategory(description) {
  const lower = description.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat
  }
  return 'Other'
}

// ── PDF text extraction + transaction parser ──────────────────────────────────

async function extractPDFTransactions(file) {
  // Dynamically import pdfjs to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist')

  // Use CDN worker — avoids Vite bundling complexity
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  // Extract all text, preserving line structure via y-position grouping
  let lines = []
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()

    // Group text items by approximate y-position (same line = within 3pt)
    const byY = {}
    for (const item of content.items) {
      if (!item.str?.trim()) continue
      const y = Math.round(item.transform[5] / 3) * 3
      if (!byY[y]) byY[y] = []
      byY[y].push({ x: item.transform[4], text: item.str })
    }

    // Sort each line left-to-right, then sort lines top-to-bottom (descending y)
    const pageLines = Object.entries(byY)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([, items]) =>
        items.sort((a, b) => a.x - b.x).map(i => i.text).join(' ')
      )

    lines.push(...pageLines)
  }

  return parseTransactionLines(lines)
}

function parseTransactionLines(lines) {
  const transactions = []

  // Date patterns commonly found in bank statements
  const DATE_RE = [
    /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,   // 01/15/2024, 1-15-24
    /^(\d{1,2}[\/\-]\d{1,2})(?!\d)/,             // 01/15 (no year)
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}/i, // Jan 15
  ]

  // Amount: optional minus/plus, optional $, digits with commas, decimal
  const AMOUNT_RE = /[-+]?\$?\s*\d{1,3}(?:,\d{3})*\.\d{2}/g

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length < 6) continue

    // Must start with a date
    let dateStr = null
    for (const re of DATE_RE) {
      const m = trimmed.match(re)
      if (m) { dateStr = m[0]; break }
    }
    if (!dateStr) continue

    // Find all dollar amounts on this line
    const amounts = [...trimmed.matchAll(AMOUNT_RE)]
    if (!amounts.length) continue

    // Use first amount (usually the transaction, not the running balance)
    const rawAmount = amounts[0][0].replace(/[$,\s]/g, '')
    const amount = Math.abs(parseFloat(rawAmount))
    if (isNaN(amount) || amount <= 0 || amount > 50000) continue

    // Description = everything between the date and first amount, cleaned up
    const amountIdx = trimmed.indexOf(amounts[0][0])
    let desc = trimmed
      .slice(dateStr.length, amountIdx)
      .replace(/\s+/g, ' ')
      .trim()

    // Strip trailing noise (transaction IDs, reference numbers)
    desc = desc.replace(/\s+\d{6,}$/, '').trim()
    if (!desc || desc.length < 2) continue

    // Normalize the date to YYYY-MM-DD for the form
    const year = new Date().getFullYear()
    let isoDate = new Date().toISOString().split('T')[0]
    try {
      const parsed = new Date(`${dateStr.includes('/') && dateStr.split('/').length === 2
        ? dateStr + '/' + year
        : dateStr}`)
      if (!isNaN(parsed)) {
        isoDate = parsed.toISOString().split('T')[0]
        // Fix future dates (statement from last year)
        if (parsed > new Date()) {
          parsed.setFullYear(year - 1)
          isoDate = parsed.toISOString().split('T')[0]
        }
      }
    } catch { /* keep today's date */ }

    transactions.push({
      id: Date.now() + Math.random(),
      date: isoDate,
      merchant: desc.slice(0, 60),
      amount,
      category: guessCategory(desc),
      note: '',
    })
  }

  // Deduplicate: same date + merchant + amount within $0.01
  const seen = new Set()
  return transactions.filter(t => {
    const key = `${t.date}|${t.merchant.toLowerCase()}|${t.amount.toFixed(2)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ── Review modal — shown after PDF parse ─────────────────────────────────────

function PDFReviewModal({ extracted, onConfirm, onClose }) {
  const [selected, setSelected] = useState(new Set(extracted.map(t => t.id)))

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const kept = extracted.filter(t => selected.has(t.id))

  return (
    <div className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(6,4,15,0.97)', backdropFilter: 'blur(20px)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <button onClick={onClose} className="text-white/40 text-sm hover:text-white/70">✕ Cancel</button>
        <div className="text-center">
          <p className="text-white font-bold text-sm">Review Transactions</p>
          <p className="text-white/40 text-xs">{selected.size} of {extracted.length} selected</p>
        </div>
        <button
          onClick={() => onConfirm(kept)}
          disabled={kept.length === 0}
          className="text-sm font-bold px-3 py-1.5 rounded-xl disabled:opacity-30 transition-all"
          style={{ background: GRAD, color: 'white' }}
        >
          Add {kept.length}
        </button>
      </div>

      {/* Toggle all */}
      <div className="px-4 py-2 flex-shrink-0 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button
          className="text-xs text-white/40 hover:text-white/70"
          onClick={() =>
            selected.size === extracted.length
              ? setSelected(new Set())
              : setSelected(new Set(extracted.map(t => t.id)))
          }
        >
          {selected.size === extracted.length ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      {/* Transaction list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {extracted.map(t => {
          const on = selected.has(t.id)
          return (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              className="w-full flex items-center gap-3 glass rounded-2xl px-4 py-3 text-left transition-all"
              style={{ opacity: on ? 1 : 0.4 }}
            >
              {/* Checkbox */}
              <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all"
                style={{ background: on ? GRAD : 'rgba(255,255,255,0.08)', border: on ? 'none' : '1px solid rgba(255,255,255,0.2)' }}>
                {on && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{t.merchant}</p>
                <p className="text-white/40 text-xs">{t.category} · {t.date}</p>
              </div>
              <span className="text-white font-bold text-sm flex-shrink-0">${t.amount.toFixed(2)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ManualEntryPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [tab, setTab] = useState('upload')
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [extracted, setExtracted] = useState(null) // null = not parsed yet

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    amount: '',
    category: 'Other',
    note: '',
  })
  const [entries, setEntries] = useState([])
  const [formError, setFormError] = useState('')

  function handleFileDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files[0] ?? e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setExtracted(null)
      setParseError('')
    }
  }

  async function handleProcess() {
    if (!uploadedFile) return
    setParsing(true)
    setParseError('')
    try {
      const txns = await extractPDFTransactions(uploadedFile)
      if (txns.length === 0) {
        setParseError('No transactions found. This PDF may be a scanned image — try downloading a text-based statement from your bank.')
      } else {
        setExtracted(txns)
      }
    } catch (err) {
      setParseError('Could not read this PDF. Make sure it\'s a text-based statement (not a scanned image).')
      console.error(err)
    } finally {
      setParsing(false)
    }
  }

  function handleReviewConfirm(kept) {
    setEntries(prev => [...prev, ...kept])
    setExtracted(null)
    setUploadedFile(null)
    setTab('manual')
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    if (!form.merchant.trim()) { setFormError('Merchant name is required'); return }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setFormError('Enter a valid amount greater than 0'); return
    }
    setFormError('')
    setEntries(prev => [
      { ...form, amount: Number(form.amount), id: Date.now() },
      ...prev,
    ])
    setForm(prev => ({ ...prev, merchant: '', amount: '', note: '' }))
  }

  function removeEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="min-h-screen">

      {extracted && (
        <PDFReviewModal
          extracted={extracted}
          onConfirm={handleReviewConfirm}
          onClose={() => setExtracted(null)}
        />
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate('/dashboard')}
          className="text-white/40 text-sm flex items-center gap-1 hover:text-white/70 transition-colors">
          ← Back
        </button>
        <span className="text-white font-bold text-base">Add Transactions</span>
        <div className="w-12" />
      </header>

      <div className="px-4 py-6 max-w-lg mx-auto">

        {/* Tabs */}
        <div className="glass rounded-2xl p-1 flex mb-6">
          {[
            { id: 'upload', label: 'Upload PDF' },
            { id: 'manual', label: 'Enter Manually' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={tab === t.id ? { background: GRAD, color: 'white' } : { color: 'rgba(255,255,255,0.4)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Upload tab ─────────────────────────────────────────────────── */}
        {tab === 'upload' && (
          <div>
            {/* Drop zone */}
            <div
              className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center px-6 py-10 mb-4 cursor-pointer transition-all"
              style={{
                borderColor: dragOver ? '#7C3AED' : 'rgba(255,255,255,0.12)',
                background: dragOver ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)',
              }}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.csv"
                className="hidden" onChange={handleFileDrop} />

              {uploadedFile ? (
                <>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(52,211,153,0.15)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">{uploadedFile.name}</p>
                  <p className="text-white/40 text-xs mb-3">
                    {(uploadedFile.size / 1024).toFixed(1)} KB · Ready to scan
                  </p>
                  <button onClick={e => { e.stopPropagation(); setUploadedFile(null); setParseError('') }}
                    className="text-white/30 text-xs underline">
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(139,92,246,0.15)' }}>
                    <span style={{ fontSize: 28 }}>📄</span>
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">Drop your bank statement</p>
                  <p className="text-white/40 text-xs mb-1">PDF or CSV · tap to browse</p>
                  <p className="text-white/25 text-xs">Download from your bank's app → Statements</p>
                </>
              )}
            </div>

            {parseError && (
              <div className="rounded-2xl px-4 py-3 mb-4 flex items-start gap-2"
                style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                <span className="text-red-400 text-xs mt-0.5">!</span>
                <p className="text-red-300 text-xs leading-relaxed">{parseError}</p>
              </div>
            )}

            {uploadedFile && (
              <button
                onClick={handleProcess}
                disabled={parsing}
                className="w-full text-white font-bold py-4 rounded-2xl mb-6 transition-transform active:scale-95 disabled:opacity-60"
                style={{ background: GRAD, boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}
              >
                {parsing ? 'Scanning PDF...' : 'Scan for Transactions →'}
              </button>
            )}

            {/* How to export guide */}
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3 px-1">
              How to get your statement
            </p>
            <div className="glass rounded-2xl overflow-hidden mb-6">
              {[
                { bank: 'Chase', steps: 'Account → Statements → Download PDF' },
                { bank: 'Bank of America', steps: 'Accounts → Statements → View/Download' },
                { bank: 'Wells Fargo', steps: 'Accounts → Statements & Documents' },
                { bank: 'Any bank', steps: 'Look for "Statements" in your banking app or website' },
              ].map((item, i, arr) => (
                <div key={item.bank} className="px-4 py-3"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <p className="text-white/80 text-xs font-semibold mb-0.5">{item.bank}</p>
                  <p className="text-white/40 text-xs">{item.steps}</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl px-4 py-3 flex items-start gap-2">
              <span className="text-amber-400 text-xs mt-0.5">⚠</span>
              <p className="text-white/50 text-xs leading-relaxed">
                Only text-based PDFs work — if your statement is a scanned image, use the CSV export from your bank instead.
              </p>
            </div>
          </div>
        )}

        {/* ── Manual entry tab ──────────────────────────────────────────── */}
        {tab === 'manual' && (
          <div>
            {entries.length > 0 && (
              <div className="glass rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
                <p className="text-white/50 text-sm">{entries.length} transaction{entries.length !== 1 ? 's' : ''} added</p>
                {entries.length >= 3 && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-white font-bold text-sm px-4 py-2 rounded-xl transition-transform active:scale-95"
                    style={{ background: GRAD }}>
                    Analyze →
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="glass rounded-2xl px-4 py-4 mb-4 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-white/40 text-xs mb-1.5 block">Date</label>
                  <input type="date" value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-violet-500 transition-colors"
                    style={{ colorScheme: 'dark' }} />
                </div>
                <div className="flex-1">
                  <label className="text-white/40 text-xs mb-1.5 block">Amount ($)</label>
                  <input type="number" placeholder="0.00" step="0.01" min="0" value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-violet-500 transition-colors" />
                </div>
              </div>

              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Merchant / Description</label>
                <input type="text" placeholder="e.g. Starbucks, Netflix, Amazon..." value={form.merchant}
                  onChange={e => setForm(p => ({ ...p, merchant: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-violet-500 transition-colors placeholder-white/20" />
              </div>

              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Category</label>
                <select value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-violet-500 transition-colors"
                  style={{ colorScheme: 'dark' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Note <span className="text-white/25">(optional)</span></label>
                <input type="text" placeholder="Any extra detail..." value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-violet-500 transition-colors placeholder-white/20" />
              </div>

              {formError && <p className="text-red-400 text-xs">{formError}</p>}

              <button type="submit"
                className="w-full text-white font-bold py-3.5 rounded-xl transition-transform active:scale-95"
                style={{ background: GRAD }}>
                Add Transaction
              </button>
            </form>

            {entries.length > 0 && (
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3 px-1">
                  Added ({entries.length})
                </p>
                <div className="glass rounded-2xl overflow-hidden">
                  {entries.map((entry, i) => (
                    <div key={entry.id} className="flex items-center gap-3 px-4 py-3.5"
                      style={{ borderBottom: i < entries.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{entry.merchant}</p>
                        <p className="text-white/40 text-xs">{entry.category} · {entry.date}</p>
                      </div>
                      <span className="text-white font-semibold text-sm flex-shrink-0">${Number(entry.amount).toFixed(2)}</span>
                      <button onClick={() => removeEntry(entry.id)}
                        className="text-white/25 hover:text-red-400 transition-colors flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                {entries.length < 3 && (
                  <p className="text-white/30 text-xs text-center mt-3">
                    Add at least 3 transactions to analyze
                  </p>
                )}
              </div>
            )}
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  )
}
