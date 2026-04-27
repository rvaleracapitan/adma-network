'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import HeaderADMA from '../../../components/HeaderADMA'

const BLU = '#1A7AB8'
const AZZURRO = '#29ABE2'

export default function ProfiloGruppo({ params }: { params: { id: string } }) {
  const [group, setGroup] = useState<any>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return; }
      const { data: g } = await supabase.from('groups').select('*').eq('id', params.id).single()
      setGroup(g)
      const { data: b } = await supabase.from('badges').select('*').eq('group_id', params.id).order('anno', { ascending: true })
      setBadges(b || [])
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F0F7FC' }}>
      <HeaderADMA />
      <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Caricamento...</div>
    </div>
  )

  if (!group) return (
    <div style={{ minHeight: '100vh', background: '#F0F7FC' }}>
      <HeaderADMA />
      <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Gruppo non trovato.</div>
    </div>
  )

  const isAttivo = group?.scadenza && new Date(group.scadenza) >= new Date()
  const annoFondazione = group?.data_aggregazione_originale ? new Date(group.data_aggregazione_originale).getFullYear() : null
  const anniNellaRete = annoFondazione ? new Date().getFullYear() - annoFondazione : 0

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FC' }}>
      <HeaderADMA />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1.5rem 1rem' }}>

        <div style={{ marginBottom: '1rem' }}>
          <a href="/dashboard/mappa" style={{ fontSize: 13, color: BLU, textDecoration: 'none' }}>← Torna alla mappa</a>
        </div>

        {/* Card identità */}
        <div style={{
          background: `linear-gradient(135deg, ${BLU} 0%, ${AZZURRO} 100%)`,
          borderRadius: 14, padding: '1.75rem',
          marginBottom: '1rem', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: 'white', fontWeight: 700, flexShrink: 0,
            }}>
              {group?.nome?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 2 }}>{group?.nome}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{group?.citta}, {group?.paese}</div>
              {anniNellaRete > 0 && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                  Aggregato all'ADMA Primaria da {anniNellaRete} anni
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: 8, position: 'relative' }}>
            <span style={{
              background: isAttivo ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              color: isAttivo ? 'white' : 'rgba(255,255,255,0.5)',
              padding: '3px 12px', borderRadius: 999, fontSize: 11, fontWeight: 500,
              border: '0.5px solid rgba(255,255,255,0.3)',
            }}>
              {isAttivo ? '✓ Attivo' : 'Non attivo'}
            </span>
            <span style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)',
              padding: '3px 12px', borderRadius: 999, fontSize: 11,
              border: '0.5px solid rgba(255,255,255,0.2)',
            }}>
              Scadenza: {group?.scadenza || '—'}
            </span>
          </div>
        </div>

        {/* Dati */}
        <div style={{ background: 'white', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: BLU, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${AZZURRO}` }}>
            Dati del gruppo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['N. di Erezione', group?.numero_erezione],
              ['N. di aggregazione', group?.numero_aggregazione],
              ['Data aggregazione', group?.data_aggregazione_originale],
              ['Data erezione', group?.data_erezione],
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
          <div style={{ fontSize: 11, fontWeight: 600, color: BLU, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, paddingBottom: '0.5rem', borderBottom: `2px solid ${AZZURRO}` }}>
            Timbri di rinnovo annuale
          </div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: '1.1rem' }}>
            Ogni timbro rappresenta un anno di rinnovo confermato nella rete ADMA.
          </div>
          {badges.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#bbb', fontSize: 13, padding: '1.5rem 0' }}>
              Nessun timbro ancora.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {badges.map(b => (
                <div key={b.id} style={{
                  width: 76, height: 76, borderRadius: '50%',
                  border: `3px solid ${AZZURRO}`,
                  background: 'white',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 3px 10px rgba(41,171,226,0.3)`,
                  overflow: 'hidden', position: 'relative',
                }}>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Torino-Basilica_Maria_Ausiliatrice.jpg/320px-Torino-Basilica_Maria_Ausiliatrice.jpg"
                    style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }}
                  />
                  <div style={{ position: 'relative', textAlign: 'center' }}>
                    <div style={{ fontSize: 8, color: BLU, fontWeight: 700, letterSpacing: '0.1em' }}>ADMA</div>
                    <div style={{ fontSize: 17, color: BLU, fontWeight: 800, lineHeight: 1.1 }}>{b.anno}</div>
                    <div style={{ fontSize: 7, color: AZZURRO, marginTop: 1 }}>✓ rinnovato</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}