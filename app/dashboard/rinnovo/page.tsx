'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function Rinnovo() {
  const [group, setGroup] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    referente: '',
    email: '',
    telefono: '',
    numero_membri: '',
    nome_presidente: '',
    cognome_presidente: '',
    nome_animatore: '',
    cognome_animatore: '',
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
      })
      setLoading(false)
    }
    load()
  }, [])

  const oggi = new Date()
  const scadenza = group?.scadenza ? new Date(group.scadenza) : null
  const daysLeft = scadenza ? Math.round((scadenza.getTime() - oggi.getTime()) / 86400000) : null
  const isAttivo = scadenza && scadenza >= oggi
  const isScaduto = scadenza && scadenza < oggi
  const rinnovoAperto = isScaduto || (daysLeft !== null && daysLeft <= 30)
  const giorniAllaFinestra = daysLeft !== null && daysLeft > 30 ? daysLeft - 30 : 0

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
    })
    setSending(false)
    setSent(true)
  }

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    fontSize: 14,
    border: '0.5px solid #ddd',
    borderRadius: 8,
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block' as const,
    fontSize: 13,
    color: '#888',
    marginBottom: 3,
  }

  const lockedStyle = {
    padding: '9px 12px',
    background: '#f5f5f3',
    border: '0.5px solid #e5e5e5',
    borderRadius: 8,
    fontSize: 14,
    color: '#888',
    width: '100%',
  }

  const sectionTitle = {
    fontSize: 11,
    fontWeight: 500,
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.6rem',
    paddingBottom: '0.4rem',
    borderBottom: '0.5px solid #e5e5e5',
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento...</div>

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

        {/* Registrazione ancora valida — rinnovo non ancora disponibile */}
        {isAttivo && !rinnovoAperto && (
          <div style={{ background: '#EAF3DE', border: '0.5px solid #C0DD97', borderRadius: 12, padding: '1.5rem', fontSize: 14, color: '#3B6D11' }}>
            <div style={{ fontWeight: 500, marginBottom: 8, fontSize: 15 }}>✓ La tua registrazione è attiva</div>
            <p style={{ marginBottom: 8 }}>
              La registrazione è valida fino al <strong>{group?.scadenza}</strong>.
            </p>
            <p style={{ color: '#3B6D11' }}>
              Potrai richiedere il rinnovo a partire dal <strong>
                {new Date(scadenza!.getTime() - 30 * 86400000).toLocaleDateString('it-IT')}
              </strong>, ovvero 30 giorni prima della scadenza.
            </p>
            <div style={{ marginTop: '1rem', padding: '0.7rem 1rem', background: '#d4edda', borderRadius: 8, fontSize: 13 }}>
              Mancano ancora <strong>{giorniAllaFinestra} giorni</strong> prima che si apra la finestra di rinnovo.
            </div>
          </div>
        )}

        {/* Rinnovo scaduto */}
        {isScaduto && !sent && (
          <div style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 8, padding: '0.75rem 1rem', fontSize: 13, color: '#854F0B', marginBottom: '1rem', display: 'flex', gap: 8 }}>
            <span>⚠</span>
            <div>La registrazione è scaduta il <strong>{group?.scadenza}</strong>. Rinnova subito per accedere a tutti i servizi.</div>
          </div>
        )}

        {/* Rinnovo in scadenza entro 30 giorni */}
        {isAttivo && rinnovoAperto && !sent && (
          <div style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 8, padding: '0.75rem 1rem', fontSize: 13, color: '#854F0B', marginBottom: '1rem', display: 'flex', gap: 8 }}>
            <span>⚠</span>
            <div>La registrazione scade tra <strong>{daysLeft} giorni</strong> ({group?.scadenza}). Confermala prima della scadenza.</div>
          </div>
        )}

        {/* Form rinnovo — visibile solo se nella finestra */}
        {rinnovoAperto && !sent && (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.5rem' }}>

            {/* Dati bloccati */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={sectionTitle}>Dati identificativi — non modificabili</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div>
                  <label style={labelStyle}>Nome del gruppo</label>
                  <div style={lockedStyle}>{group?.nome}</div>
                </div>
                <div>
                  <label style={labelStyle}>Paese</label>
                  <div style={lockedStyle}>{group?.paese}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div>
                  <label style={labelStyle}>N. di Erezione</label>
                  <div style={lockedStyle}>{group?.numero_erezione}</div>
                </div>
                <div>
                  <label style={labelStyle}>N. di aggregazione</label>
                  <div style={lockedStyle}>{group?.numero_aggregazione}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                Per correzioni scrivi a <span style={{ color: '#185FA5' }}>primaria@adma.it</span>
              </div>
            </div>

            {/* Dati aggiornabili */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={sectionTitle}>Responsabili e contatti — aggiornabili</div>

              <div style={{ marginBottom: '0.5rem', fontSize: 12, color: '#555', fontWeight: 500 }}>Presidente</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div>
                  <label style={labelStyle}>Nome *</label>
                  <input style={inputStyle} value={form.nome_presidente} onChange={e => setForm({ ...form, nome_presidente: e.target.value })} placeholder="Nome" />
                </div>
                <div>
                  <label style={labelStyle}>Cognome *</label>
                  <input style={inputStyle} value={form.cognome_presidente} onChange={e => setForm({ ...form, cognome_presidente: e.target.value })} placeholder="Cognome" />
                </div>
              </div>

              <div style={{ marginBottom: '0.5rem', fontSize: 12, color: '#555', fontWeight: 500 }}>Animatore spirituale locale</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div>
                  <label style={labelStyle}>Nome *</label>
                  <input style={inputStyle} value={form.nome_animatore} onChange={e => setForm({ ...form, nome_animatore: e.target.value })} placeholder="Nome" />
                </div>
                <div>
                  <label style={labelStyle}>Cognome *</label>
                  <input style={inputStyle} value={form.cognome_animatore} onChange={e => setForm({ ...form, cognome_animatore: e.target.value })} placeholder="Cognome" />
                </div>
              </div>

              <div style={{ marginBottom: '0.8rem' }}>
                <label style={labelStyle}>Referente *</label>
                <input style={inputStyle} value={form.referente} onChange={e => setForm({ ...form, referente: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input type="email" style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Telefono</label>
                  <input style={inputStyle} value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Numero di membri *</label>
                <input type="number" style={inputStyle} value={form.numero_membri} onChange={e => setForm({ ...form, numero_membri: e.target.value })} min="1" />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={sending}
              style={{ width: '100%', background: '#1a1a1a', color: 'white', border: 'none', padding: 10, borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}>
              {sending ? 'Invio in corso...' : 'Conferma rinnovo'}
            </button>
          </div>
        )}

        {/* Successo */}
        {sent && (
          <div style={{ background: '#EAF3DE', border: '0.5px solid #9FE1CB', borderRadius: 12, padding: '1.5rem', fontSize: 14, color: '#3B6D11' }}>
            <div style={{ fontWeight: 500, marginBottom: 6 }}>Rinnovo inviato con successo!</div>
            La richiesta è stata trasmessa alla Primaria di Valdocco. Una volta approvata, la tua registrazione sarà attiva per altri 12 mesi.
            <div style={{ marginTop: '1rem' }}>
              <a href="/dashboard/mappa" style={{ color: '#3B6D11', fontSize: 13 }}>← Torna alla mappa</a>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}