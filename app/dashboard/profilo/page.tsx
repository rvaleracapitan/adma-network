'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import HeaderADMA from '../../components/HeaderADMA'

const ADMA_BLU = '#1A3A6B'
const ADMA_ORO = '#C9A84C'

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

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F4F6FA' }}>
      <HeaderADMA />
      <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Caricamento...</div>
    </div>
  )

  const annoFondazione = group?.data_aggregazione_originale ? new Date(group.data_aggregazione_originale).getFullYear() : null
  const anniNellaRete = annoFondazione ? new Date().getFullYear() - annoFondazione : 0
  const isAttivo = group?.scadenza && new Date(group.scadenza) >= new Date()

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FA' }}>
      <HeaderADMA />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Card identità */}
        <div style={{
          background: ADMA_BLU, borderRadius: 14, padding: '1.75rem',
          marginBottom: '1rem', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(201,168,76,0.08)',
            border: `1px solid rgba(201,168,76,0.15)`,
          }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(201,168,76,0.15)',
              border: `2px solid ${ADMA_ORO}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: ADMA_ORO, fontWeight: 700, fontFamily: 'serif',
              flexShrink: 0,
            }}>
              {group?.nome?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 2 }}>{group?.nome}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{group?.citta}, {group?.paese}</div>
              {anniNellaRete > 0 && (
                <div style={{ fontSize: 12, color: ADMA_ORO, marginTop: 4 }}>
                  Aggregato all'ADMA Primaria da {anniNellaRete} anni
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: 8 }}>
            <span style={{
              background: isAttivo ? 'rgba(29,106,58,0.4)' : 'rgba(255,255,255,0.1)',
              color: isAttivo ? '#7FD4A0' : 'rgba(255,255,255,0.4)',
              padding: '3px 12px', borderRadius: 999, fontSize: 11, fontWeight: 500,
            }}>
              {isAttivo ? '✓ Attivo' : 'Non attivo'}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '3px 12px', borderRadius: 999, fontSize: 11 }}>
              Scadenza: {group?.scadenza || '—'}
            </span>
          </div>
        </div>

        {/* Dati */}
        <div style={{ background: 'white', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: ADMA_BLU, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${ADMA_ORO}` }}>
            Dati del gruppo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['N. di Erezione', group?.numero_erezione],
              ['N. di aggregazione', group?.numero_aggregazione],
              ['Data aggregazione', group?.data_aggregazione_originale],
              ['Opera', group?.opera],
              ['Appartenenza', group?.congregazione || group?.diocesi || '—'],
              ['Numero di membri', group?.numero_membri],
              ['Presidente', group?.nome_presidente ? `${group.nome_presidente} ${group.cognome_presidente}` : '—'],
              ['Animatore spirituale', group?.nome_animatore ? `${group.nome_animatore} ${group.cognome_animatore}` : '—'],
              ['Email', group?.email],
              ['Telefono', group?.telefono || '—'],
            ].map(([label, value]) => (
              <div key={label as string}>
                <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, color: '#333' }}>{value || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Badge timbri */}
        <div style={{ background: 'white', borderRadius: 12, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: ADMA_BLU, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, paddingBottom: '0.5rem', borderBottom: `2px solid ${ADMA_ORO}` }}>
            Timbri di rinnovo annuale
          </div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: '1.1rem' }}>
            Ogni timbro rappresenta un anno di rinnovo confermato nella rete ADMA.
          </div>
          {badges.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#bbb', fontSize: 13, padding: '1.5rem 0' }}>
              Nessun timbro ancora — arriverà dopo il primo rinnovo approvato.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {badges.map(b => (
                <div key={b.id} style={{
                  width: 76, height: 76, borderRadius: '50%',
                  border: `2.5px solid ${ADMA_ORO}`,
                  background: 'white',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 0 4px rgba(201,168,76,0.1), 0 2px 6px rgba(0,0,0,0.08)`,
                  position: 'relative',
                }}>
                  <div style={{ fontSize: 9, color: ADMA_ORO, fontWeight: 700, letterSpacing: '0.08em', fontFamily: 'serif' }}>ADMA</div>
                  <div style={{ fontSize: 17, color: ADMA_BLU, fontWeight: 800, lineHeight: 1.1 }}>{b.anno}</div>
                  <div style={{ fontSize: 8, color: '#bbb', marginTop: 1 }}>✓ rinnovato</div>
                </div>
              ))}
              {/* Prossimo timbro */}
              <div style={{
                width: 76, height: 76, borderRadius: '50%',
                border: '2px dashed #ddd',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: '#fafafa',
              }}>
                <div style={{ fontSize: 9, color: '#ddd', fontWeight: 700, letterSpacing: '0.08em', fontFamily: 'serif' }}>ADMA</div>
                <div style={{ fontSize: 17, color: '#ddd', fontWeight: 800, lineHeight: 1.1 }}>
                  {badges.some(b => b.anno === new Date().getFullYear()) ? new Date().getFullYear() + 1 : new Date().getFullYear()}
                </div>
                <div style={{ fontSize: 8, color: '#ddd', marginTop: 1 }}>prossimo</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}