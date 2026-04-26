'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import dynamic from 'next/dynamic'

const MappaLeaflet = dynamic(() => import('../../components/MappaLeaflet'), { ssr: false })

export default function Mappa() {
  const [groups, setGroups] = useState<any[]>([])
  const [myGroup, setMyGroup] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'mappa' | 'lista'>('mappa')
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [chatGroup, setChatGroup] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return; }
      const { data: me } = await supabase.from('groups').select('*').eq('user_id', user.id).single()
      setMyGroup(me)
      const { data: all } = await supabase.from('groups').select('*').eq('is_primaria', false)
      setGroups(all || [])
    }
    load()

    // Ricarica i dati ogni volta che la pagina torna visibile
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])
  useEffect(() => {
    if (!chatGroup || !myGroup) return
    loadMessages()
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => loadMessages())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [chatGroup, myGroup])

  async function loadMessages() {
    if (!chatGroup || !myGroup) return
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(from_group_id.eq.${myGroup.id},to_group_id.eq.${chatGroup.id}),and(from_group_id.eq.${chatGroup.id},to_group_id.eq.${myGroup.id})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function sendMessage() {
    if (!newMsg.trim() || !myGroup || !chatGroup) return
    await supabase.from('messages').insert({
      from_group_id: myGroup.id,
      to_group_id: chatGroup.id,
      content: newMsg.trim()
    })
    setNewMsg('')
  }

  const filtered = groups.filter(g =>
    g.nome?.toLowerCase().includes(search.toLowerCase()) ||
    g.paese?.toLowerCase().includes(search.toLowerCase()) ||
    g.referente?.toLowerCase().includes(search.toLowerCase())
  )

  const isAttivo = (g: any) => g.scadenza && new Date(g.scadenza) >= new Date()

  return (
    <main style={{ minHeight: '100vh', background: '#f9f9f7', padding: '1.5rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#534AB7', fontWeight: 500 }}>
              {myGroup?.nome?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{myGroup?.nome}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{myGroup?.is_primaria ? 'Amministratore · Primaria Valdocco' : myGroup?.paese}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <a href="/dashboard/profilo" style={{ fontSize: 12, color: '#185FA5', textDecoration: 'underline' }}>Profilo</a>
            <a href="/dashboard/password" style={{ fontSize: 12, color: '#185FA5', textDecoration: 'underline' }}>Password</a>
            <a href="/dashboard/messaggi" style={{ fontSize: 12, color: '#185FA5', textDecoration: 'underline' }}>Messaggi</a>
            <a href="/dashboard/rinnovo" style={{ fontSize: 12, color: '#185FA5', textDecoration: 'underline' }}>Rinnovo</a>
            {myGroup?.is_primaria && <a href="/dashboard/admin" style={{ fontSize: 12, color: '#185FA5', textDecoration: 'underline' }}>Admin</a>}
            <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }} style={{ background: 'none', border: 'none', color: '#888', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Esci</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: '1rem' }}>
          {[
            { label: 'Gruppi aggregati', value: groups.length },
            { label: 'Attivi', value: groups.filter(isAttivo).length },
            { label: 'Non attivi', value: groups.filter(g => !isAttivo(g)).length },
          ].map(s => (
            <div key={s.label} style={{ background: '#f5f5f3', borderRadius: 8, padding: '0.7rem 0.85rem' }}>
              <div style={{ fontSize: 11, color: '#888' }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 500, marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', background: '#f5f5f3', borderRadius: 8, padding: 3 }}>
            {(['mappa', 'lista'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '5px 13px', fontSize: 13, border: view === v ? '0.5px solid #e5e5e5' : 'none', background: view === v ? 'white' : 'none', borderRadius: 6, cursor: 'pointer', fontWeight: view === v ? 500 : 400 }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca nome, paese, referente..."
          style={{ width: '100%', padding: '8px 12px', fontSize: 14, border: '0.5px solid #ddd', borderRadius: 8, marginBottom: '0.6rem', boxSizing: 'border-box' }}
        />

        {/* Mappa */}
        {view === 'mappa' && (
          <div style={{ height: 340, borderRadius: 12, overflow: 'hidden', border: '0.5px solid #e5e5e5', marginBottom: '0.75rem' }}>
            <MappaLeaflet
  groups={groups}
  searchTerm={search}
  onSelectGroup={(g) => setChatGroup(g)}
/>
          </div>
        )}

        {/* Lista */}
        {view === 'lista' && (
          <div>
            {filtered.map(g => (
              <div key={g.id} style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '0.85rem 1rem', marginBottom: 7, cursor: 'pointer' }}
                onClick={() => setSelectedGroup(selectedGroup?.id === g.id ? null : g)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>
                      {g.id === myGroup?.id && <span style={{ color: '#534AB7', fontSize: 11, marginRight: 5 }}>◆ IO</span>}
                      {g.nome}
                    </div>
                    <div style={{ fontSize: 13, color: '#888' }}>{g.paese}</div>
                  </div>
                  <span style={{ background: isAttivo(g) ? '#EAF3DE' : '#f5f5f3', color: isAttivo(g) ? '#3B6D11' : '#888', padding: '2px 9px', borderRadius: 999, fontSize: 12 }}>
                    {isAttivo(g) ? 'Attivo' : 'Non attivo'}
                  </span>
                </div>
                {selectedGroup?.id === g.id && (
                  <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      ['Referente', g.referente],
                      ['Membri', g.numero_membri],
                      ['Email', g.email],
                      ['Telefono', g.telefono],
                      ['N. Erezione', g.numero_erezione],
                      ['N. Aggregazione', g.numero_aggregazione],
                      ['Aggregato dal', g.data_aggregazione_originale],
                      ['Rinnovo fino al', g.scadenza],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <div style={{ fontSize: 11, color: '#888' }}>{label}</div>
                        <div style={{ fontSize: 13 }}>{value || '—'}</div>
                      </div>
                    ))}
                    {g.id !== myGroup?.id && isAttivo(g) && (
                      <div style={{ gridColumn: '1/-1', marginTop: 4 }}>
                        <button onClick={(e) => { e.stopPropagation(); setChatGroup(g); setView('mappa') }}
                          style={{ background: 'none', color: '#185FA5', border: '0.5px solid #85B7EB', padding: '4px 11px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                          Apri chat
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', color: '#888', fontSize: 14, padding: '2rem' }}>Nessun gruppo trovato.</div>
            )}
          </div>
        )}

        {/* Chat */}
        {chatGroup && (
          <div style={{ border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden', marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem', borderBottom: '0.5px solid #e5e5e5', background: '#f5f5f3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#3B6D11' }}>
                  {chatGroup.nome.split(' ').slice(-1)[0].slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{chatGroup.nome}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{chatGroup.paese} · {chatGroup.referente}</div>
                </div>
              </div>
              <button onClick={() => setChatGroup(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888' }}>×</button>
            </div>
            <div style={{ height: 180, overflowY: 'auto', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: 8, background: 'white' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#888', fontSize: 13, marginTop: '2rem' }}>Nessun messaggio ancora. Inizia la conversazione!</div>
              )}
              {messages.map(m => (
                <div key={m.id}>
                  <div style={{
                    alignSelf: m.from_group_id === myGroup?.id ? 'flex-end' : 'flex-start',
                    background: m.from_group_id === myGroup?.id ? '#1D9E75' : '#f5f5f3',
                    color: m.from_group_id === myGroup?.id ? 'white' : 'inherit',
                    borderRadius: m.from_group_id === myGroup?.id ? '10px 10px 0 10px' : '0 10px 10px 10px',
                    padding: '6px 11px', maxWidth: '72%', fontSize: 13, lineHeight: 1.5,
                    marginLeft: m.from_group_id === myGroup?.id ? 'auto' : 0,
                  }}>{m.content}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', borderTop: '0.5px solid #e5e5e5' }}>
              <input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Scrivi un messaggio..."
                style={{ flex: 1, padding: '9px 12px', border: 'none', fontSize: 14, background: 'white' }}
              />
              <button onClick={sendMessage} style={{ padding: '9px 15px', background: 'none', border: 'none', borderLeft: '0.5px solid #e5e5e5', cursor: 'pointer', color: '#1D9E75', fontWeight: 500 }}>Invia</button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}