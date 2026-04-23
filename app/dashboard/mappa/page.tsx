'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function Mappa() {
  const [groups, setGroups] = useState<any[]>([])
  const [myGroup, setMyGroup] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'mappa' | 'lista'>('mappa')
  const [selectedGroup, setSelectedGroup] = useState<any>(null)

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
  }, [])

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
              <div style={{ fontSize: 12, color: '#888' }}>{myGroup?.paese}</div>
            </div>
          </div>
          <a href="/" style={{ fontSize: 12, color: '#185FA5', textDecoration: 'underline' }}>Esci</a>
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

        {/* Toggle + Search */}
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

        {/* Lista */}
        {view === 'lista' && (
          <div>
            {filtered.map(g => (
              <div key={g.id} style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '0.85rem 1rem', marginBottom: 7, cursor: 'pointer' }}
                onClick={() => setSelectedGroup(selectedGroup?.id === g.id ? null : g)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{g.nome}</div>
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
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', color: '#888', fontSize: 14, padding: '2rem' }}>Nessun gruppo trovato.</div>
            )}
          </div>
        )}

        {/* Mappa placeholder */}
        {view === 'mappa' && (
          <div style={{ background: '#dbeeff', border: '0.5px solid #e5e5e5', borderRadius: 12, height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#185FA5', fontSize: 14 }}>
            Mappa interattiva — in arrivo nella prossima sessione
          </div>
        )}

      </div>
    </main>
  )
}