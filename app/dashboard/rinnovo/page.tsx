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
      })
      setLoading(false)
    }
    load()
  }, [])

  const isAttivo = group?.scadenza && new Date(group.scadenza) >= new Date()
  const daysLeft = group?.scadenza ? Math.round((new Date(group.scadenza).getTime() - new Date().getTime()) / 86400000) : null

  async function handleSubmit() {
    setSending(true)
    await supabase.from('renewals').insert({
      group_id: group.id,
      referente: form.referente,
      email: form.email,
      telefono: form.telefono,
      numero_membri: parseInt(form.numero_membri),
    })
    setSending(false)
    setSent(true)
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

        {/* Alert stato */}
        {isAttivo && daysLeft !== null && daysLeft <= 30 && (
          <div style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 8, padding: '0.75rem 1rem', fontSize: 13, color: '#854F0B', marginBottom: '1rem', display: 'flex', gap: 8 }}>
            <span>⚠</span>
            <div>Il rinnovo scade tra <strong>{daysLeft} giorni</strong> ({group.scadenza}). Confermalo prima della scadenza.</div>
          </div>
        )}
        {!isAttivo && (
          <div style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 8, padding: '0.75rem 1rem', fontSize: 13, color: '#854F0B', marginBottom: '1rem', display: 'flex', gap: 8 }}>
            <span>⚠</span>
            <div>Il rinnovo è scaduto il <strong>{group?.scadenza}</strong>. Rinnovalo per accedere a tutti i servizi.</div>
          </div>
        )}
        {isAttivo && daysLeft !== null && daysLeft > 30 && (
          <div style={{ background: '#EAF3DE', border: '0.5px solid #C0DD97', borderRadius: 8, padding: '0.75rem 1rem', fontSize: 13, color: '#3B6D11', marginBottom: '1rem', display: 'flex', gap: 8 }}>
            <span>✓</span>
            <div>Aggregazione attiva fino al <strong>{group?.scadenza}</strong>. Puoi rinnovare in anticipo.</div>
          </div>
        )}

        {!sent ? (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.5rem' }}>

            {/* Dati bloccati */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', paddingBottom: '0.4rem', borderBottom: '0.5px solid #e5e5e5' }}>
                Dati identificativi — non modificabili
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['Nome del gruppo', group?.nome],
                  ['Paese', group?.paese],
                  ['N. di Erezione', group?.numero_erezione],
                  ['N. di aggregazione', group?.numero_aggregazione],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 3 }}>{label}</div>
                    <div style={{ padding: '9px 12px', background: '#f5f5f3', border: '0.5px solid #e5e5e5', borderRadius: 8, fontSize: 14, color: '#888' }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>Per correzioni scrivi a <span style={{ color: '#185FA5' }}>primaria@adma.it</span></div>
            </div>

            {/* Dati aggiornabili */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', paddingBottom: '0.4rem', borderBottom: '0.5px solid #e5e5e5' }}>
                Dati aggiornabili
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 3 }}>Referente / Responsabile *</label>
                <input value={form.referente} onChange={e => setForm({ ...form, referente: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', fontSize: 14, border: '0.5px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 3 }}>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', fontSize: 14, border: '0.5px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 3 }}>Telefono</label>
                  <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', fontSize: 14, border: '0.5px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 3 }}>Numero di membri *</label>
                <input type="number" value={form.numero_membri} onChange={e => setForm({ ...form, numero_membri: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', fontSize: 14, border: '0.5px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={sending}
              style={{ width: '100%', background: '#1a1a1a', color: 'white', border: 'none', padding: 10, borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}>
              {sending ? 'Invio in corso...' : 'Conferma rinnovo'}
            </button>
          </div>
        ) : (
          <div style={{ background: '#EAF3DE', border: '0.5px solid #9FE1CB', borderRadius: 12, padding: '1.5rem', fontSize: 14, color: '#3B6D11' }}>
            <div style={{ fontWeight: 500, marginBottom: 6 }}>Rinnovo inviato con successo!</div>
            La richiesta è stata trasmessa alla Primaria di Valdocco. Una volta approvata, la tua aggregazione sarà attiva per altri 12 mesi.
            <div style={{ marginTop: '1rem' }}>
              <a href="/dashboard/mappa" style={{ color: '#3B6D11', fontSize: 13 }}>← Torna alla mappa</a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}