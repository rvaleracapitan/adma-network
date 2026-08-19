'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import HeaderADMA from '../../components/HeaderADMA'

const BLU = '#1A7AB8'
const AZZURRO = '#29ABE2'

export default function Rinnovo() {
  const [group, setGroup] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    referente: '', email: '', telefono: '', numero_membri: '',
    nome_presidente: '', cognome_presidente: '',
    nome_animatore: '', cognome_animatore: '', ispettoria: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return; }
      const { data } = await supabase.from('groups').select('*').eq('user_id', user.id).single()
      setGroup(data)
      setForm({
        referente: data?.referente || '',
        email: data?.email || '',
        telefono: data?.telefono || '',
        numero_membri: data?.numero_membri?.toString() || '',
        nome_presidente: data?.nome_presidente || '',
        cognome_presidente: data?.cognome_presidente || '',
        nome_animatore: data?.nome_animatore || '',
        cognome_animatore: data?.cognome_animatore || '',
        ispettoria: data?.ispettoria || '',
      })
      setLoading(false)
    }
    load()
  }, [])

  const oggi = new Date()
  const anno = oggi.getFullYear()
  const inizioFinestra = new Date(anno, 0, 1)
  const fineFinestra = new Date(anno, 2, 31)
  const finestraAperta = oggi >= inizioFinestra && oggi <= fineFinestra
  const haGiaRinnovato = group?.scadenza && group.scadenza === `${anno}-12-31`
  const prossimaFinestra = new Date(anno + 1, 0, 1)
  const giorniAllaProssima = Math.round((prossimaFinestra.getTime() - oggi.getTime()) / 86400000)

  async function handleSubmit() {
    if (!form.email || !form.numero_membri || !form.nome_presidente || !form.cognome_presidente || !form.nome_animatore || !form.cognome_animatore) {
      alert('Compila tutti i campi obbligatori.')
      return
    }
    setSending(true)
    await supabase.from('renewals').insert({
      group_id: group.id,
      referente: form.referente,
      email: form.email,
      telefono: form.telefono,
      numero_membri: parseInt(form.numero_membri),
      nome_presidente: form.nome_presidente,
      cognome_presidente: form.cognome_presidente,
      nome_animatore: form.nome_animatore,
      cognome_animatore: form.cognome_animatore,
      ispettoria: form.ispettoria,
    })
    setSending(false)
    setSent(true)
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', fontSize: 14,
    border: '0.5px solid #dce8f0', borderRadius: 8,
    background: '#F8FBFD', color: '#333',
    boxSizing: 'border-box' as const, outline: 'none',
  }
  const labelStyle = { display: 'block' as const, fontSize: 12, color: '#888', marginBottom: 4, letterSpacing: '0.04em' }
  const lockedStyle = {
    padding: '9px 12px', background: '#F0F7FC',
    border: '0.5px solid #dce8f0', borderRadius: 8,
    fontSize: 14, color: '#aaa', width: '100%',
  }
  const sectionTitle = {
    fontSize: 11, fontWeight: 600 as const, color: BLU,
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
    marginBottom: '0.75rem', paddingBottom: '0.5rem',
    borderBottom: `2px solid ${AZZURRO}`,
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F0F7FC' }}>
      <HeaderADMA />
      <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Caricamento...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FC' }}>
      <HeaderADMA />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Alert stato */}
        {haGiaRinnovato && !sent && (
          <div style={{ background: '#E3F4FC', border: `0.5px solid ${AZZURRO}`, borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1rem', color: BLU }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>✓ Rinnovo {anno} già effettuato</div>
            <div style={{ fontSize: 13 }}>Il prossimo periodo aprirà il <strong>1 gennaio {anno + 1}</strong> e si chiuderà il <strong>31 marzo {anno + 1}</strong>.</div>
            <div style={{ marginTop: 8, fontSize: 12, color: AZZURRO }}>Mancano <strong>{giorniAllaProssima} giorni</strong> alla prossima finestra.</div>
          </div>
        )}
        {!finestraAperta && !haGiaRinnovato && !sent && (
          <div style={{ background: '#E3F4FC', border: `0.5px solid ${AZZURRO}`, borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1rem', color: BLU }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>✓ Registrazione attiva</div>
            <div style={{ fontSize: 13 }}>Il periodo di rinnovo è <strong>dal 1 gennaio al 31 marzo</strong>. Il prossimo aprirà il <strong>1 gennaio {anno + 1}</strong>.</div>
            <div style={{ marginTop: 8, fontSize: 12, color: AZZURRO }}>Mancano <strong>{giorniAllaProssima} giorni</strong>.</div>
          </div>
        )}
        {finestraAperta && !haGiaRinnovato && !sent && (
          <div style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1rem', color: '#854F0B' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>⚠ Periodo di rinnovo aperto</div>
            <div style={{ fontSize: 13 }}>Il rinnovo {anno} è aperto fino al <strong>31 marzo {anno}</strong>. Completa il rinnovo per rimanere nella rete ADMA.</div>
          </div>
        )}

        {/* Form */}
        {finestraAperta && !haGiaRinnovato && !sent && (
          <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={sectionTitle}>Dati identificativi — non modificabili</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div><label style={labelStyle}>Nome del gruppo</label><div style={lockedStyle}>{group?.nome}</div></div>
                <div><label style={labelStyle}>Paese</label><div style={lockedStyle}>{group?.paese}</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>N. di Erezione</label><div style={lockedStyle}>{group?.numero_erezione}</div></div>
                <div><label style={labelStyle}>N. di aggregazione</label><div style={lockedStyle}>{group?.numero_aggregazione}</div></div>
              </div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
                Per correzioni scrivi a <span style={{ color: BLU }}>primaria@adma.it</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={sectionTitle}>Responsabili e contatti — aggiornabili</div>

              <div style={{ marginBottom: '0.4rem', fontSize: 12, color: BLU, fontWeight: 500 }}>Presidente</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div><label style={labelStyle}>Nome *</label><input style={inputStyle} value={form.nome_presidente} onChange={e => setForm({ ...form, nome_presidente: e.target.value })} /></div>
                <div><label style={labelStyle}>Cognome *</label><input style={inputStyle} value={form.cognome_presidente} onChange={e => setForm({ ...form, cognome_presidente: e.target.value })} /></div>
              </div>

              <div style={{ marginBottom: '0.4rem', fontSize: 12, color: BLU, fontWeight: 500 }}>Animatore spirituale locale</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div><label style={labelStyle}>Nome *</label><input style={inputStyle} value={form.nome_animatore} onChange={e => setForm({ ...form, nome_animatore: e.target.value })} /></div>
                <div><label style={labelStyle}>Cognome *</label><input style={inputStyle} value={form.cognome_animatore} onChange={e => setForm({ ...form, cognome_animatore: e.target.value })} /></div>
              </div>

              <div style={{ marginBottom: '0.8rem' }}>
                <label style={labelStyle}>Referente *</label>
                <input style={inputStyle} value={form.referente} onChange={e => setForm({ ...form, referente: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div><label style={labelStyle}>Email *</label><input type="email" style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div><label style={labelStyle}>Telefono</label><input style={inputStyle} value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></div>
              </div>
              <div>
                <label style={labelStyle}>Numero di membri *</label>
                <input type="number" style={inputStyle} value={form.numero_membri} onChange={e => setForm({ ...form, numero_membri: e.target.value })} min="1" />
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                <label style={labelStyle}>Ispettoria</label>
                <input style={inputStyle} value={form.ispettoria} onChange={e => setForm({ ...form, ispettoria: e.target.value })} placeholder="es. Ispettoria Salesiana Italia Centrale" />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={sending} style={{
              width: '100%', background: sending ? '#93C8E8' : BLU,
              color: 'white', border: 'none', padding: 11, borderRadius: 8,
              fontSize: 14, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer',
            }}>
              {sending ? 'Invio in corso...' : 'Conferma rinnovo'}
            </button>
          </div>
        )}

        {sent && (
          <div style={{ background: '#E3F4FC', border: `0.5px solid ${AZZURRO}`, borderRadius: 12, padding: '1.5rem', color: BLU }}>
            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 15 }}>✓ Rinnovo {anno} inviato!</div>
            <div style={{ fontSize: 13 }}>La richiesta è trasmessa alla Primaria. Una volta approvata riceverai il timbro {anno} sul tuo profilo.</div>
            <div style={{ marginTop: '1rem' }}>
              <a href="/dashboard/mappa" style={{ color: BLU, fontSize: 13, fontWeight: 500 }}>← Torna alla mappa</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}