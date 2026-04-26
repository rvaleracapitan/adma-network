'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function Profilo() {
  const [group, setGroup] = useState<any>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return; }
      const { data: g } = await supabase.from('groups').select('*').eq('user_id', user.id).single()
      setGroup(g)
      const { data: b } = await supabase.from('badges').select('*').eq('group_id', g.id).order('anno', { ascending: true })
      setBadges(b || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento...</div>

  const annoFondazione = group?.data_aggregazione_originale ? new Date(group.data_aggregazione_originale).getFullYear() : null
  const anniNellaRete = annoFondazione ? new Date().getFullYear() - annoFondazione : 0

  return (
    <main style={{ minHeight: '100vh', background: '#f9f9f7', padding: '1.5rem' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#534AB7', fontWeight: 500 }}>
              {group?.nome?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{group?.nome}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{group?.paese}</div>
            </div>
          </div>
          <a href="/dashboard/mappa" style={{ fontSize: 12, color: '#185FA5', textDecoration: 'underline' }}>← Mappa</a>
        </div>

        {/* Card principale */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.5rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#534AB7', fontWeight: 500, flexShrink: 0 }}>
              {group?.nome?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 500 }}>{group?.nome}</div>
              <div style={{ fontSize: 14, color: '#888' }}>{group?.citta}, {group?.paese}</div>
              <div style={{ fontSize: 13, color: '#3B6D11', marginTop: 2 }}>
                Aggregato dal {group?.data_aggregazione_originale ? new Date(group.data_aggregazione_originale).toLocaleDateString('it-IT') : '—'}
                {anniNellaRete > 0 && ` · ${anniNellaRete} anni nella rete`}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1.25rem' }}>
            {[
              ['N. di Erezione', group?.numero_erezione],
              ['N. di aggregazione', group?.numero_aggregazione],
              ['Presidente', group?.nome_presidente ? `${group.nome_presidente} ${group.cognome_presidente}` : '—'],
              ['Animatore spirituale', group?.nome_animatore ? `${group.nome_animatore} ${group.cognome_animatore}` : '—'],
              ['Email', group?.email],
              ['Telefono', group?.telefono || '—'],
              ['Numero di membri', group?.numero_membri],
              ['Registrazione valida fino al', group?.scadenza],
            ].map(([label, value]) => (
              <div key={label as string}>
                <div style={{ fontSize: 11, color: '#888' }}>{label}</div>
                <div style={{ fontSize: 13, marginTop: 2 }}>{value || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Badge */}
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Timbri di rinnovo</div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: '1.25rem' }}>
            Ogni timbro rappresenta un anno di rinnovo confermato nella rete ADMA.
          </div>

          {badges.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13, padding: '1.5rem 0' }}>
              Nessun timbro ancora — il primo arriverà dopo il primo rinnovo approvato.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {badges.map(b => (
                <div key={b.id} style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  border: '2.5px solid #534AB7',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#EEEDFE',
                  position: 'relative',
                }}>
                  <div style={{ fontSize: 10, color: '#534AB7', fontWeight: 500, letterSpacing: '0.05em' }}>ADMA</div>
                  <div style={{ fontSize: 16, color: '#534AB7', fontWeight: 700 }}>{b.anno}</div>
                  <div style={{ fontSize: 9, color: '#7F77DD' }}>✓ rinnovato</div>
                </div>
              ))}
              {/* Timbro prossimo anno — in grigio */}
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                border: '2.5px dashed #ddd',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa',
              }}>
                <div style={{ fontSize: 10, color: '#ccc', fontWeight: 500 }}>ADMA</div>
                <div style={{ fontSize: 16, color: '#ccc', fontWeight: 700 }}>{new Date().getFullYear() + (badges.some(b => b.anno === new Date().getFullYear()) ? 1 : 0)}</div>
                <div style={{ fontSize: 9, color: '#ddd' }}>prossimo</div>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}