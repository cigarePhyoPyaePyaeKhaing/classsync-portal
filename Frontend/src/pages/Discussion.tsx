import { FormEvent, useEffect, useMemo, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://classsync-portal-production.up.railway.app'
type Scope = 'section' | 'semester'
type Message = { id: number; scope: Scope; semester: string; section: string | null; body: string; created_at: string; sender_id: number; sender_name: string }

function session() {
  try { return JSON.parse(localStorage.getItem('classsync_user') || '{}') } catch { return {} }
}

export default function Discussion({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const user = useMemo(session, [])
  const [scope, setScope] = useState<Scope>('section')
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const semester = user.semester || ''
  const section = user.section || ''
  const dark = isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'

  useEffect(() => {
    if (!semester || (scope === 'section' && !section)) { setLoading(false); return }
    const controller = new AbortController()
    const url = new URL(`${API_BASE_URL}/api/discussions/${scope}/messages`)
    url.searchParams.set('semester', semester)
    if (scope === 'section') url.searchParams.set('section', section)
    fetch(url, { headers: { Authorization: `Bearer ${user.token}` }, signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setMessages(data.messages) })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message || 'Unable to load discussion.') })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [scope, semester, section, user.token])

  useEffect(() => {
    if (!user.token) return
    const controller = new AbortController()
    fetch(`${API_BASE_URL}/api/live`, { headers: { Authorization: `Bearer ${user.token}` }, signal: controller.signal })
      .then(async (response) => {
        if (!response.body) return
        const reader = response.body.getReader(), decoder = new TextDecoder(); let buffer = ''
        while (true) {
          const { value, done } = await reader.read(); if (done) break
          buffer += decoder.decode(value, { stream: true })
          const events = buffer.split('\n\n'); buffer = events.pop() || ''
          for (const event of events) {
            if (!event.startsWith('event: discussion.message')) continue
            const raw = event.split('\n').find((line) => line.startsWith('data: '))?.slice(6)
            if (!raw) continue
            const message: Message = JSON.parse(raw)
            if (message.scope === scope && message.semester === semester && message.section === (scope === 'section' ? section : null)) {
              setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message])
            }
          }
        }
      }).catch(() => {})
    return () => controller.abort()
  }, [scope, semester, section, user.token])

  async function send(event: FormEvent) {
    event.preventDefault(); const text = body.trim(); if (!text) return
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/discussions/${scope}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ semester, section, body: text }),
      })
      const data = await response.json(); if (!response.ok) throw new Error(data.error)
      setMessages((current) => current.some((item) => item.id === data.message.id) ? current : [...current, data.message])
      setBody('')
    } catch (err: any) { setError(err.message || 'Message could not be sent.') }
  }

  if (!semester || !section) return <div className={`rounded-2xl border p-6 ${dark}`}>Profile ထဲတွင် Semester နှင့် Section ကို ဖြည့်ပြီးမှ Discussion ကို အသုံးပြုနိုင်ပါမည်။</div>
  return <section className={`mx-auto flex h-[calc(100vh-10rem)] max-w-4xl flex-col overflow-hidden rounded-2xl border ${dark}`}>
    <header className="border-b border-inherit p-4"><h1 className="font-bold">Class Discussion</h1><p className="mt-1 text-xs opacity-70">{scope === 'section' ? `${semester} · Section ${section}` : `${semester} · All Sections`}</p>
      <div className="mt-3 flex gap-2"><button onClick={() => setScope('section')} className={`rounded-lg px-3 py-2 text-xs ${scope === 'section' ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Section Chat</button><button onClick={() => setScope('semester')} className={`rounded-lg px-3 py-2 text-xs ${scope === 'semester' ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Semester Chat</button></div>
    </header>
    <div className="flex-1 space-y-3 overflow-y-auto p-4">{loading ? <p className="text-sm opacity-70">Loading messages...</p> : messages.length === 0 ? <p className="text-sm opacity-70">No messages yet. Start the discussion.</p> : messages.map((message) => <article key={message.id} className={`max-w-[80%] rounded-2xl p-3 text-sm ${message.sender_id === user.id ? 'ml-auto bg-cyan-600 text-white' : 'bg-slate-100 text-slate-800'}`}><p className="text-xs font-semibold">{message.sender_name}</p><p className="mt-1 whitespace-pre-wrap">{message.body}</p><p className="mt-1 text-[10px] opacity-70">{new Date(message.created_at).toLocaleString()}</p></article>)}</div>
    <form onSubmit={send} className="border-t border-inherit p-3"><p className="mb-2 text-xs text-red-500">{error}</p><div className="flex gap-2"><input value={body} onChange={(event) => setBody(event.target.value)} maxLength={1000} placeholder="Write a message..." className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-sm"/><button className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Send</button></div></form>
  </section>
}
