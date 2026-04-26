'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Registrazione() {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [diploma, setDiploma] = useState<File | null>(null)
  const [form, setForm] = useState({
    nome: '',
    citta: '',
    paese: '',
    numero_erezione: '',
    data_erezione: '',
    numero_aggregazione: '',
    data_aggregazione_originale: '',
    nome_presidente: '',
    cognome_presidente: '',
    nome_animatore: '',
    cognome_animatore: '',
    email: '',
    telefono: '',
    numero_membri: '',
  })

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function uploadDiploma(file: File, nomeGruppo: string): Promise<string | null> {
  const estensione = file.name.split('.').pop()
  const path = `${nomeGruppo.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${estensione}`
  const { error } = await supabase.storage.from('diplomi').upload(path, file)
  if (error) { console.error('Upload error:', error); return null }
  const { data } = supabase.storage.from('diplomi').getPublicUrl(path)
  return data.publicUrl
}
    setSending(true)
  setError('')

  let diplomaUrl = null
  if (diploma) {
    diplomaUrl = await uploadDiploma(diploma, form.nome)
  }

  const { error } = await supabase.from('registration_requests').insert({
    nome: form.nome,
    citta: form.citta,
    paese: form.paese,
    numero_erezione: form.numero_erezione,
    data_erezione: form.data_erezione,
    numero_aggregazione: form.numero_aggregazione,
    data_aggregazione_originale: form.data_aggregazione_originale,
    referente: `${form.nome_presidente} ${form.cognome_presidente}`,
    nome_presidente: form.nome_presidente,
    cognome_presidente: form.cognome_presidente,
    nome_animatore: form.nome_animatore,
    cognome_animatore: form.cognome_animatore,
    email: form.email,
    telefono: form.telefono,
    numero_membri: form.numero_membri ? parseInt(form.numero_membri) : null,
    diploma_url: diplomaUrl,
  })
  if (error) {
    setError('Errore durante l\'invio. Riprova.')
    setSending(false)
    return
  }
  setSent(true)
  setSending(false)

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
    marginBottom: 4,
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

  return (
    <main style={{ minHeight: '100vh', background: '#f9f9f7', padding: '1.5rem' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#534AB7', fontWeight: 500, margin: '0 auto 10px' }}>A</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>Richiesta di registrazione</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Compila il modulo per richiedere la registrazione alla Primaria di Valdocco</div>
        </div>

        {!sent ? (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.5rem' }}>

            {error && (
              <div style={{ background: '#FCEBEB', border: '0.5px solid #F7C1C1', color: '#A32D2D', borderRadius: 8, padding: '0.6rem 0.85rem', fontSize: 13, marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {/* Dati identificativi */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={sectionTitle}>Dati identificativi — non modificabili dopo l'approvazione</div>

              <div style={{ marginBottom: '0.8rem' }}>
                <label style={labelStyle}>Nome del gruppo *</label>
                <input style={inputStyle} value={form.nome} onChange={e => update('nome', e.target.value)} placeholder="es. ADMA Barcellona" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div>
                  <label style={labelStyle}>Città *</label>
                  <input style={inputStyle} value={form.citta} onChange={e => update('citta', e.target.value)} placeholder="es. Barcellona" />
                </div>
                <div>
                  <label style={labelStyle}>Paese *</label>
                  <input style={inputStyle} value={form.paese} onChange={e => update('paese', e.target.value)} placeholder="es. Spagna" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div>
                  <label style={labelStyle}>N. di Erezione *</label>
                  <input style={inputStyle} value={form.numero_erezione} onChange={e => update('numero_erezione', e.target.value)} placeholder="es. ES-2024-001" />
                </div>
                <div>
                  <label style={labelStyle}>Data di Erezione *</label>
                  <input type="date" style={inputStyle} value={form.data_erezione} onChange={e => update('data_erezione', e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>N. di aggregazione *</label>
                  <input style={inputStyle} value={form.numero_aggregazione} onChange={e => update('numero_aggregazione', e.target.value)} placeholder="es. 2024-047" />
                </div>
                <div>
                  <label style={labelStyle}>Data di aggregazione *</label>
                  <input type="date" style={inputStyle} value={form.data_aggregazione_originale} onChange={e => update('data_aggregazione_originale', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Responsabili e contatti */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={sectionTitle}>Responsabili e contatti — aggiornabili ad ogni rinnovo</div>

              <div style={{ marginBottom: '0.5rem', fontSize: 12, color: '#555', fontWeight: 500 }}>Presidente</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div>
                  <label style={labelStyle}>Nome *</label>
                  <input style={inputStyle} value={form.nome_presidente} onChange={e => update('nome_presidente', e.target.value)} placeholder="Nome" />
                </div>
                <div>
                  <label style={labelStyle}>Cognome *</label>
                  <input style={inputStyle} value={form.cognome_presidente} onChange={e => update('cognome_presidente', e.target.value)} placeholder="Cognome" />
                </div>
              </div>

              <div style={{ marginBottom: '0.5rem', fontSize: 12, color: '#555', fontWeight: 500 }}>Animatore spirituale locale</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div>
                  <label style={labelStyle}>Nome *</label>
                  <input style={inputStyle} value={form.nome_animatore} onChange={e => update('nome_animatore', e.target.value)} placeholder="Nome" />
                </div>
                <div>
                  <label style={labelStyle}>Cognome *</label>
                  <input style={inputStyle} value={form.cognome_animatore} onChange={e => update('cognome_animatore', e.target.value)} placeholder="Cognome" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div>
                  <label style={labelStyle}>Email del gruppo *</label>
                  <input type="email" style={inputStyle} value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@esempio.com" />
                </div>
                <div>
                  <label style={labelStyle}>Telefono</label>
                  <input style={inputStyle} value={form.telefono} onChange={e => update('telefono', e.target.value)} placeholder="+1 ..." />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Numero di membri *</label>
                <input type="number" style={inputStyle} value={form.numero_membri} onChange={e => update('numero_membri', e.target.value)} placeholder="es. 30" min="1" />
              </div>
            </div>

            <div style={{ background: '#f5f5f3', borderRadius: 8, padding: '0.7rem 0.9rem', fontSize: 12, color: '#888', marginBottom: '1rem' }}>
              Dopo l'approvazione della Primaria riceverete via email le credenziali di accesso. La registrazione sarà valida per 12 mesi.
            </div>
<div style={{ marginBottom: '1.25rem' }}>
  <div style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.6rem', paddingBottom: '0.4rem', borderBottom: '0.5px solid #e5e5e5' }}>
    Documentazione
  </div>
  <label style={{ display: 'block' as const, fontSize: 13, color: '#888', marginBottom: 4 }}>
    Diploma di aggregazione <span style={{ fontSize: 11 }}>(facoltativo · JPG, PNG o PDF)</span>
  </label>
  <input
    type="file"
    accept="image/*,.pdf"
    onChange={e => setDiploma(e.target.files?.[0] || null)}
    style={{ width: '100%', fontSize: 13, color: '#888' }}
  />
  {diploma && <div style={{ fontSize: 12, color: '#3B6D11', marginTop: 4 }}>✓ {diploma.name}</div>}
</div>
            <button onClick={handleSubmit} disabled={sending}
              style={{ width: '100%', background: '#1a1a1a', color: 'white', border: 'none', padding: 10, borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}>
              {sending ? 'Invio in corso...' : 'Invia richiesta di registrazione'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: 13, color: '#888' }}>
              Hai già un account? <a href="/" style={{ color: '#185FA5', textDecoration: 'underline' }}>Accedi</a>
            </div>
          </div>
        ) : (
          <div style={{ background: '#EAF3DE', border: '0.5px solid #9FE1CB', borderRadius: 12, padding: '1.5rem', fontSize: 14, color: '#3B6D11' }}>
            <div style={{ fontWeight: 500, marginBottom: 6 }}>Richiesta inviata con successo!</div>
            La domanda è stata trasmessa alla Primaria di Valdocco. Riceverete le credenziali di accesso via email una volta approvata.
            <div style={{ marginTop: '1rem' }}>
              <a href="/" style={{ color: '#3B6D11', fontSize: 13 }}>← Torna al login</a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}