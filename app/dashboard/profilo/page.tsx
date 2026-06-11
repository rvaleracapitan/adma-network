'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import HeaderADMA from '../../components/HeaderADMA'

const BLU = '#1A7AB8'
const AZZURRO = '#29ABE2'

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
    <div style={{ minHeight: '100vh', background: '#F0F7FC' }}>
      <HeaderADMA />
      <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Caricamento...</div>
    </div>
  )

  const annoFondazione = group?.data_aggregazione_originale ? new Date(group.data_aggregazione_originale).getFullYear() : null
  const anniNellaRete = annoFondazione ? new Date().getFullYear() - annoFondazione : 0
  const isAttivo = group?.scadenza && new Date(group.scadenza) >= new Date()
  const prossimoBadge = badges.some(b => b.anno === new Date().getFullYear())
    ? new Date().getFullYear() + 1
    : new Date().getFullYear()

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FC' }}>
      <HeaderADMA />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Card identità */}
        <div style={{
          background: `linear-gradient(135deg, ${BLU} 0%, ${AZZURRO} 100%)`,
          borderRadius: 14, padding: '1.75rem',
          marginBottom: '1rem', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 150, height: 150, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute', bottom: -20, left: -20,
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: 'white', fontWeight: 700,
              flexShrink: 0,
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
          <div style={{
            fontSize: 11, fontWeight: 600, color: BLU,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: '1rem', paddingBottom: '0.5rem',
            borderBottom: `2px solid ${AZZURRO}`,
          }}>
            Dati del gruppo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['N. di Erezione', group?.numero_erezione],
              ['Data Erezione', group?.data_erezione],
              ['N. di Aggregazione', group?.numero_aggregazione],
              ['Data Aggregazione', group?.data_aggregazione_originale],
              ['Opera', group?.opera || '—'],
              ['Tipo appartenenza', group?.tipo_appartenenza || '—'],
              ['Congregazione', group?.congregazione || '—'],
              ['Diocesi', group?.diocesi || '—'],
              ['Ispettoria', group?.ispettoria || '—'],
              ['Presidente', group?.nome_presidente ? `${group.nome_presidente} ${group.cognome_presidente}` : '—'],
              ['Animatore spirituale', group?.nome_animatore ? `${group.nome_animatore} ${group.cognome_animatore}` : '—'],
              ['Email', group?.email || '—'],
              ['Telefono', group?.telefono || '—'],
              ['Numero membri', group?.numero_membri || '—'],
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
          <div style={{
            fontSize: 11, fontWeight: 600, color: BLU,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: 4, paddingBottom: '0.5rem',
            borderBottom: `2px solid ${AZZURRO}`,
          }}>
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
    width: 80, height: 80, borderRadius: '50%',
    border: `3px solid ${AZZURRO}`,
    background: 'white',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 3px 12px rgba(41,171,226,0.3)`,
    overflow: 'hidden',
    position: 'relative',
  }}>
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Torino-Basilica_Maria_Ausiliatrice.jpg/320px-Torino-Basilica_Maria_Ausiliatrice.jpg"
      style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }}
    />
    <div style={{ position: 'relative', textAlign: 'center' }}>
      <div style={{ fontSize: 8, color: BLU, fontWeight: 700, letterSpacing: '0.1em' }}>ADMA</div>
      <div style={{ fontSize: 18, color: BLU, fontWeight: 800, lineHeight: 1 }}>{b.anno}</div>
      <div style={{ fontSize: 7, color: AZZURRO, marginTop: 1 }}>✓ rinnovato</div>
    </div>
  </div>
))}
              {/* Prossimo timbro */}
              <div style={{
                width: 76, height: 76, borderRadius: '50%',
                border: `2px dashed ${AZZURRO}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: '#F0F7FC',
              }}>
                <div style={{ fontSize: 9, color: AZZURRO, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.5 }}>ADMA</div>
                <div style={{ fontSize: 17, color: AZZURRO, fontWeight: 800, lineHeight: 1.1, opacity: 0.5 }}>{prossimoBadge}</div>
                <div style={{ fontSize: 8, color: AZZURRO, marginTop: 1, opacity: 0.4 }}>prossimo</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}