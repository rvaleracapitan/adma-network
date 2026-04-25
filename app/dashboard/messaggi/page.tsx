'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function Messaggi() {
  const [myGroup, setMyGroup] = useState<any>(null)
  const [conversazioni, setConversazioni] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return; }
      const { data: me } = await supabase.from('groups').select('*').eq('user_id', user.id).single()
      setMyGroup(me)
      await loadConversazioni(me.id)
      setLoading(false)
    }
    load()
  }, [])

  async function loadConversazioni(myId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*, from_group:from_group_id(id, nome, paese), to_group:to_group_id(id, nome, paese)')
      .or(`from_group_id.eq.${myId},to_group_id.eq.${myId}`)
      .order('created_at', { ascending: false })

    if (!data) return

    // Raggruppa per interlocutore
    const map = new Map()
    data.forEach(m => {
      const other = m.from_group_id === myId ? m.to_group : m.from_group
      if (!other) return
      if (!map.has(other.id)) {
        map.set(other.id, {
          group: other,
          lastMessage: m,
          unread: m.from_group_id !== myId && !m.read ? 1 : 0
        })
      } else {
        const conv = map.get(other.id)
        if (m.from_group_id !== myId && !m.read) conv.unread++
      }
    })
    setConversazioni(Array.from(map.values()))
  }

  async function openConversazione(conv: any) {
    setSelected(conv)
    await loadMessages(conv.group.id)

    // Marca come letti
    await supabase.from('messages')
      .update({ read: true })
      .eq('to_group_id', myGroup.id)
      .eq('from_group_id', conv.group.id)
      .eq('read', false)

    await loadConversazioni(myGroup.id)
  }

  async function loadMessages(otherId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(from_group_id.eq.${myGroup.id},to_group_id.eq.${otherId}),and(from_group_id.eq.${otherId},to_group_id.eq.${myGroup.id})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function sendMessage() {
    if (!newMsg.trim() || !selected) return
    await supabase.from('messages').insert({
      from_group_id: myGroup.id,
      to_group_id: selected.group.id,
      content: newMsg.trim()
    })
    setNewMsg('')
    await loadMessages(selected.group.id)
  }

  const totalUnread = conversazioni.reduce((s, c) => s + c.unread, 0)

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento...</div>

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
              <div style={{ fontSize: 12, color: '#888' }}>{myGroup?.paese}</div>
            </div>
          </div>
          <a href="/dashboard/mappa" style={{ fontSize: 12, color: '#185FA5', textDecoration: 'underline' }}>← Mappa</a>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>

          {/* Lista conversazioni */}
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#888', marginBottom: '0.5rem' }}>
              Conversazioni {totalUnread > 0 && <span style={{ background: '#FAEEDA', color: '#854F0B', padding: '1px 6px', borderRadius: 999, fontSize: 11, marginLeft: 4 }}>{totalUnread}</span>}
            </div>
            {conversazioni.length === 0 && (
              <div style={{ fontSize: 13, color: '#aaa', textAlign: 'center', padding: '2rem 0' }}>Nessuna conversazione</div>
            )}
            {conversazioni.map(conv => (
              <div key={conv.group.id}
                onClick={() => openConversazione(conv)}
                style={{
                  background: selected?.group.id === conv.group.id ? '#EEEDFE' : 'white',
                  border: '0.5px solid #e5e5e5',
                  borderRadius: 10,
                  padding: '0.7rem 0.85rem',
                  marginBottom: 6,
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                <div style={{ fontSize: 13, fontWeight: conv.unread > 0 ? 500 : 400 }}>{conv.group.nome}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{conv.group.paese}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conv.lastMessage?.content}
                </div>
                {conv.unread > 0 && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: '#1D9E75', color: 'white', width: 18, height: 18, borderRadius: '50%', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {conv.unread}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat */}
          <div style={{ flex: 1 }}>
            {!selected ? (
              <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14 }}>
                Seleziona una conversazione
              </div>
            ) : (
              <div style={{ border: '0.5px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '0.6rem 1rem', borderBottom: '0.5px solid #e5e5e5', background: '#f5f5f3' }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{selected.group.nome}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{selected.group.paese}</div>
                </div>
                <div style={{ height: 300, overflowY: 'auto', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: 8, background: 'white' }}>
                  {messages.map(m => (
                    <div key={m.id}>
                      <div style={{
                        alignSelf: m.from_group_id === myGroup?.id ? 'flex-end' : 'flex-start',
                        background: m.from_group_id === myGroup?.id ? '#1D9E75' : '#f5f5f3',
                        color: m.from_group_id === myGroup?.id ? 'white' : 'inherit',
                        borderRadius: m.from_group_id === myGroup?.id ? '10px 10px 0 10px' : '0 10px 10px 10px',
                        padding: '6px 11px',
                        maxWidth: '72%',
                        fontSize: 13,
                        lineHeight: 1.5,
                        marginLeft: m.from_group_id === myGroup?.id ? 'auto' : 0,
                      }}>{m.content}</div>
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 2, textAlign: m.from_group_id === myGroup?.id ? 'right' : 'left' }}>
                        {new Date(m.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </div>
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
        </div>
      </div>
    </main>
  )
}