'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import dynamic from 'next/dynamic'

const MappaLeaflet = dynamic(() => import('../../components/MappaLeaflet'), { ssr: false })

const ADMA_BLU = '#1A3A6B'
const ADMA_ORO = '#C9A84C'

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

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) return
          supabase.from('groups').select('*').eq('is_primaria', false).then(({ data }) => setGroups(data || []))
          supabase.from('groups').select('*').eq('user_id', user.id).single().then(({ data }) => setMyGroup(data))
        })
      }
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

  const navLinks = [
    { href: '/dashboard/profilo', label: 'Profilo' },
    { href: '/dashboard/messaggi', label: 'Messaggi' },
    { href: '/dashboard/rinnovo', label: 'Rinnovo' },
    { href: '/dashboard/password', label: 'Password' },
    ...(myGroup?.is_primaria ? [{ href: '/dashboard/admin', label: 'Admin' }] : []),
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#F4F6FA', fontFamily: 'var(--font-sans)' }}>

      {/* Header ADMA */}
      <div style={{
        background: ADMA_BLU,
        padding: '0 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56, position: 'sticky', top: 0, zIndex: 100,
        borderBottom: `2px solid ${ADMA_ORO}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(201,168,76,0.15)',
            border: `1.5px solid ${ADMA_ORO}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: ADMA_ORO, fontWeight: 700, fontFamily: 'serif',
          }}>A</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: ADMA_ORO, letterSpacing: '0.1em', fontFamily: 'serif' }}>ADMA</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
              {myGroup?.nome || ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
              {l.label}
            </a>
          ))}
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Esci
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.25rem 1rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1.1rem' }}>
          {[
            { label: 'Gruppi aggregati', value: groups.length, color: ADMA_BLU },
            { label: 'Attivi (rinnovati)', value: groups.filter(isAttivo).length, color: '#1D6A3A' },
            { label: 'Non attivi', value: groups.filter(g => !isAttivo(g)).length, color: '#888' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'white', borderRadius: 10, padding: '0.75rem 1rem',
              borderTop: `3px solid ${s.color}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Toggle + Search */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', background: 'white', borderRadius: 8, padding: 3, border: '0.5px solid #e0e0e0' }}>
            {(['mappa', 'lista'] as const).map(v => (
              <button key={v} onClick={() => { setView(v); }} style={{
                padding: '5px 16px', fontSize: 13,
                background: view === v ? ADMA_BLU : 'none',
                color: view === v ? 'white' : '#888',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: view === v ? 500 : 400,
              }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca gruppo, paese, referente..."
            style={{
              flex: 1, padding: '8px 12px', fontSize: 14,
              border: '0.5px solid #e0e0e0', borderRadius: 8,
              background: 'white', outline: 'none',
            }}
          />
        </div>

        {/* Legenda */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 11, color: '#888', marginBottom: '0.5rem', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: ADMA_ORO, border: '2px solid white', boxShadow: '0 0 0 1.5px '+ADMA_ORO }} />
            Primaria Valdocco
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: ADMA_BLU, border: '2px solid white' }} />
            Il mio gruppo
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#4A90D9', border: '2px solid white' }} />
            Attivo
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#B4B2A9', border: '2px solid white' }} />
            Non attivo
          </span>
          <span style={{ fontStyle: 'italic' }}>Clicca un gruppo per la chat</span>
        </div>

        {/* Mappa */}
        {view === 'mappa' && (
          <div style={{ height: 340, borderRadius: 12, overflow: 'hidden', border: '0.5px solid #ddd', marginBottom: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <MappaLeaflet
              groups={groups}
              searchTerm={search}
              onSelectGroup={(g) => setChatGroup(g)}
            />
          </div>
        )}

        {/* Lista */}
        {view === 'lista' && (
          <div style={{ marginTop: '0.25rem' }}>
            {filtered.filter(g => !g.is_primaria).map(g => {
              const att = isAttivo(g)
              const isMe = g.id === myGroup?.id
              return (
                <div key={g.id} style={{
                  background: 'white', borderRadius: 10, padding: '0.85rem 1rem',
                  marginBottom: 7, cursor: 'pointer',
                  borderLeft: `3px solid ${isMe ? ADMA_BLU : att ? '#4A90D9' : '#ccc'}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
                    onClick={() => setSelectedGroup(selectedGroup?.id === g.id ? null : g)}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: ADMA_BLU }}>
                        {isMe && <span style={{ color: ADMA_ORO, fontSize: 11, marginRight: 6 }}>◆ IO</span>}
                        {g.nome}
                      </div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}>{g.paese}{g.citta ? ` · ${g.citta}` : ''}</div>
                    </div>
                    <span style={{
                      background: att ? '#EAF3DE' : '#f0f0ee',
                      color: att ? '#1D6A3A' : '#888',
                      padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500,
                    }}>
                      {att ? 'Attivo' : 'Non attivo'}
                    </span>
                  </div>
                  {selectedGroup?.id === g.id && (
                    <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
                          <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                          <div style={{ fontSize: 13, color: '#333', marginTop: 1 }}>{value || '—'}</div>
                        </div>
                      ))}
                      {!isMe && att && (
                        <div style={{ gridColumn: '1/-1', marginTop: 4 }}>
                          <button onClick={e => { e.stopPropagation(); setChatGroup(g); setView('mappa') }}
                            style={{ background: ADMA_BLU, color: 'white', border: 'none', padding: '5px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>
                            Apri chat
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Chat */}
        {chatGroup && (
          <div style={{ border: '0.5px solid #ddd', borderRadius: 12, overflow: 'hidden', marginTop: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem', background: ADMA_BLU }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(201,168,76,0.2)', border: `1px solid ${ADMA_ORO}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: ADMA_ORO, fontWeight: 700 }}>
                  {chatGroup.nome.split(' ').slice(-1)[0].slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>{chatGroup.nome}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{chatGroup.paese}</div>
                </div>
              </div>
              <button onClick={() => setChatGroup(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 18, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ height: 180, overflowY: 'auto', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: 8, background: '#F8F9FB' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13, marginTop: '2rem' }}>Inizia la conversazione!</div>
              )}
              {messages.map(m => (
                <div key={m.id}>
                  <div style={{
                    alignSelf: m.from_group_id === myGroup?.id ? 'flex-end' : 'flex-start',
                    background: m.from_group_id === myGroup?.id ? ADMA_BLU : 'white',
                    color: m.from_group_id === myGroup?.id ? 'white' : '#333',
                    border: m.from_group_id === myGroup?.id ? 'none' : '0.5px solid #e0e0e0',
                    borderRadius: m.from_group_id === myGroup?.id ? '10px 10px 0 10px' : '0 10px 10px 10px',
                    padding: '7px 12px', maxWidth: '72%', fontSize: 13, lineHeight: 1.5,
                    marginLeft: m.from_group_id === myGroup?.id ? 'auto' : 0,
                  }}>{m.content}</div>
                  <div style={{ fontSize: 10, color: '#bbb', marginTop: 2, textAlign: m.from_group_id === myGroup?.id ? 'right' : 'left' }}>
                    {new Date(m.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', borderTop: '0.5px solid #e0e0e0', background: 'white' }}>
              <input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Scrivi un messaggio..."
                style={{ flex: 1, padding: '10px 14px', border: 'none', fontSize: 14, outline: 'none', background: 'transparent' }}
              />
              <button onClick={sendMessage} style={{ padding: '10px 16px', background: 'none', border: 'none', borderLeft: '0.5px solid #e0e0e0', cursor: 'pointer', color: ADMA_BLU, fontWeight: 600 }}>
                Invia
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}