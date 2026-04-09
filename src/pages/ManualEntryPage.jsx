import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

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
  'Other',
]

const GRAD = 'linear-gradient(135deg, #7C3AED, #EC4899)'

const ACCEPTED_FORMATS = [
  { ext: 'CSV', desc: 'Most banks offer this in Settings → Download' },
  { ext: 'PDF', desc: 'Your monthly bank or credit card statement' },
  { ext: 'OFX/QFX', desc: 'Quicken / QuickBooks export format' },
]

export default function ManualEntryPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [tab, setTab] = useState('upload') // 'upload' | 'manual'
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)

  // Manual form state
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
    if (file) setUploadedFile(file)
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

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="text-white/40 text-sm flex items-center gap-1 hover:text-white/70 transition-colors"
        >
          ← Back
        </button>
        <span className="text-white font-bold text-base">Add Transactions</span>
        <div className="w-12" />
      </header>

      <div className="px-4 py-6 max-w-lg mx-auto">

        {/* Explainer */}
        <div
          className="glass rounded-2xl px-4 py-4 mb-6 flex gap-3"
          style={{ borderColor: 'rgba(139,92,246,0.2)' }}
        >
          <div className="text-violet-400 mt-0.5 flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-semibold mb-0.5">Your bank not supported yet?</p>
            <p className="text-white/50 text-xs leading-relaxed">
              We're adding more banks every week. For now, download your statement from
              your bank's app and upload it here, or add transactions manually.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass rounded-2xl p-1 flex mb-6">
          {[
            { id: 'upload', label: 'Upload Statement' },
            { id: 'manual', label: 'Enter Manually' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={
                tab === t.id
                  ? { background: GRAD, color: 'white' }
                  : { color: 'rgba(255,255,255,0.4)' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Upload tab ──────────────────────────────────────────────────── */}
        {tab === 'upload' && (
          <div>
            {/* Drop zone */}
            <div
              className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center px-6 py-10 mb-6 cursor-pointer transition-all"
              style={{
                borderColor: dragOver ? '#7C3AED' : 'rgba(255,255,255,0.12)',
                background: dragOver ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)',
              }}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.pdf,.ofx,.qfx"
                className="hidden"
                onChange={handleFileDrop}
              />

              {uploadedFile ? (
                <>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(52,211,153,0.15)' }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">{uploadedFile.name}</p>
                  <p className="text-white/40 text-xs">
                    {(uploadedFile.size / 1024).toFixed(1)} KB · Ready to process
                  </p>
                  <button
                    onClick={e => { e.stopPropagation(); setUploadedFile(null) }}
                    className="mt-3 text-white/30 text-xs underline"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(139,92,246,0.15)' }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">Drop your statement here</p>
                  <p className="text-white/40 text-xs">or tap to browse files</p>
                </>
              )}
            </div>

            {/* Accepted formats */}
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3 px-1">
              Accepted Formats
            </p>
            <div className="glass rounded-2xl overflow-hidden mb-6">
              {ACCEPTED_FORMATS.map((f, i) => (
                <div
                  key={f.ext}
                  className="flex items-center gap-3 px-4 py-3.5"
                  style={{ borderBottom: i < ACCEPTED_FORMATS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                >
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ background: 'rgba(139,92,246,0.2)', color: '#A78BFA' }}
                  >
                    {f.ext}
                  </span>
                  <p className="text-white/60 text-xs">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* How to export guide */}
            <div className="glass rounded-2xl px-4 py-4 mb-6">
              <p className="text-white text-sm font-semibold mb-3">How to get your statement</p>
              {[
                { bank: 'Chase', steps: 'Account → Statements & documents → Download CSV' },
                { bank: 'Bank of America', steps: 'Accounts → Download → Date range → CSV' },
                { bank: 'Wells Fargo', steps: 'Statements → Activity → Download → CSV' },
                { bank: 'Any other bank', steps: 'Look for "Download", "Export", or "Statements" in your online banking settings' },
              ].map((item, i, arr) => (
                <div
                  key={item.bank}
                  className="py-2.5"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                >
                  <p className="text-white/80 text-xs font-semibold mb-0.5">{item.bank}</p>
                  <p className="text-white/40 text-xs">{item.steps}</p>
                </div>
              ))}
            </div>

            {uploadedFile && (
              <button
                className="w-full text-white font-bold py-4 rounded-2xl transition-transform active:scale-95"
                style={{ background: GRAD, boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}
              >
                Process Statement
              </button>
            )}
          </div>
        )}

        {/* ── Manual entry tab ─────────────────────────────────────────────── */}
        {tab === 'manual' && (
          <div>
            <form onSubmit={handleFormSubmit} className="glass rounded-2xl px-4 py-4 mb-4 space-y-4">

              {/* Date + Amount row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-white/40 text-xs mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-white/40 text-xs mb-1.5 block">Amount ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              {/* Merchant */}
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Merchant / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Starbucks, Netflix, Amazon..."
                  value={form.merchant}
                  onChange={e => setForm(p => ({ ...p, merchant: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-violet-500 transition-colors placeholder-white/20"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-violet-500 transition-colors"
                  style={{ colorScheme: 'dark' }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Note (optional) */}
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Note <span className="text-white/25">(optional)</span></label>
                <input
                  type="text"
                  placeholder="Any extra detail..."
                  value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-violet-500 transition-colors placeholder-white/20"
                />
              </div>

              {formError && (
                <p className="text-red-400 text-xs">{formError}</p>
              )}

              <button
                type="submit"
                className="w-full text-white font-bold py-3.5 rounded-xl transition-transform active:scale-95"
                style={{ background: GRAD }}
              >
                Add Transaction
              </button>
            </form>

            {/* Entries list */}
            {entries.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">
                    Added ({entries.length})
                  </p>
                  {entries.length >= 3 && (
                    <button
                      className="text-white font-bold text-sm px-4 py-2 rounded-xl transition-transform active:scale-95"
                      style={{ background: GRAD }}
                    >
                      Analyze These →
                    </button>
                  )}
                </div>
                <div className="glass rounded-2xl overflow-hidden">
                  {entries.map((entry, i) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 px-4 py-3.5"
                      style={{ borderBottom: i < entries.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{entry.merchant}</p>
                        <p className="text-white/40 text-xs">{entry.category} · {entry.date}</p>
                      </div>
                      <span className="text-white font-semibold text-sm flex-shrink-0">
                        ${Number(entry.amount).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="text-white/25 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
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

        <div className="h-8" />
      </div>
    </div>
  )
}
