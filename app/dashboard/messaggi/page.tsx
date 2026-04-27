'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import HeaderADMA from '../../components/HeaderADMA'

const BLU = '#1A7AB8'
const AZZURRO = '#29ABE2'

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
    const map = new Map()
    data.forEach(m => {
      const other = m.from_group_id === myId ? m.to_group : m.from_group
      if (!other) return
      if (!map.has(other.id)) {
        map.set(other.id, { group: other, lastMessage: m, unread: m.from_group_id !== myId && !m.read ? 1 : 0 })
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
    await supabase.from('messages').update({ read: true })
      .eq('to_group_id', myGroup.id).eq('from_group_id', conv.group.id).eq('read', false)
    await loadConversazioni(myGroup.id)
  }

  async function loadMessages(otherId: string) {
    const { data } = await supabase
      .from('messages').select('*')
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

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F0F7FC' }}>
      <HeaderADMA />
      <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Caricamento...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FC' }}>
      <HeaderADMA />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem' }}>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: BLU }}>
            Messaggi
            {totalUnread > 0 && (
              <span style={{ background: AZZURRO, color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: 12, marginLeft: 8 }}>
                {totalUnread}
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: '#888' }}>Conversazioni con altri gruppi ADMA nel mondo</div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>

          {/* Lista conversazioni */}
          <div style={{ width: 220, flexShrink: 0 }}>
            {conversazioni.length === 0 && (
              <div style={{ fontSize: 13, color: '#aaa', textAlign: 'center', padding: '2rem 0', background: 'white', borderRadius: 10 }}>
                Nessuna conversazione ancora
              </div>
            )}
            {conversazioni.map(conv => (
              <div key={conv.group.id} onClick={() => openConversazione(conv)} style={{
                background: selected?.group.id === conv.group.id ? '#E3F4FC' : 'white',
                border: `0.5px solid ${selected?.group.id === conv.group.id ? AZZURRO : '#dce8f0'}`,
                borderRadius: 10, padding: '0.75rem',
                marginBottom: 6, cursor: 'pointer', position: 'relative',
              }}>
                <div style={{ fontSize: 13, fontWeight: conv.unread > 0 ? 600 : 400, color: BLU }}>{conv.group.nome}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{conv.group.paese}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conv.lastMessage?.content}
                </div>
                {conv.unread > 0 && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: AZZURRO, color: 'white', width: 18, height: 18, borderRadius: '50%', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {conv.unread}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat */}
          <div style={{ flex: 1 }}>
            {!selected ? (
              <div style={{ background: 'white', borderRadius: 12, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14, border: '0.5px solid #dce8f0' }}>
                Seleziona una conversazione
              </div>
            ) : (
              <div style={{ border: `0.5px solid #dce8f0`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ padding: '0.6rem 1rem', background: BLU }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{selected.group.nome}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{selected.group.paese}</div>
                </div>
                <div style={{ height: 300, overflowY: 'auto', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: 8, background: '#F0F7FC' }}>
                  {messages.map(m => (
                    <div key={m.id}>
                      <div style={{
                        alignSelf: m.from_group_id === myGroup?.id ? 'flex-end' : 'flex-start',
                        background: m.from_group_id === myGroup?.id ? BLU : 'white',
                        color: m.from_group_id === myGroup?.id ? 'white' : '#333',
                        border: m.from_group_id === myGroup?.id ? 'none' : '0.5px solid #dce8f0',
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
                <div style={{ display: 'flex', borderTop: '0.5px solid #dce8f0', background: 'white' }}>
                  <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Scrivi un messaggio..."
                    style={{ flex: 1, padding: '10px 14px', border: 'none', fontSize: 14, outline: 'none', background: 'transparent', color: '#333' }}
                  />
                  <button onClick={sendMessage} style={{ padding: '10px 16px', background: 'none', border: 'none', borderLeft: '0.5px solid #dce8f0', cursor: 'pointer', color: BLU, fontWeight: 600 }}>
                    Invia
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}