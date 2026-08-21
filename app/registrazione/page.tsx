'use client'
import { useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import { supabase } from '../../lib/supabase'

const BLU = '#1A7AB8'
const AZZURRO = '#29ABE2'

export default function Registrazione() {
  const [sending, setSending] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [gdprAccepted, setGdprAccepted] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [diploma, setDiploma] = useState<File | null>(null)
  const [form, setForm] = useState({
    nome: '', citta: '', paese: '',
    numero_erezione: '', data_erezione: '',
    numero_aggregazione: '', data_aggregazione_originale: '',
    opera: '', tipo_appartenenza: '', congregazione: '', diocesi: '',
    nome_presidente: '', cognome_presidente: '',
    nome_animatore: '', cognome_animatore: '',
    email: '', telefono: '', numero_membri: '', ispettoria: '',
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

  async function handleSubmit() {
    if (!form.nome || !form.citta || !form.paese || !form.numero_erezione || !form.data_erezione || !form.numero_aggregazione || !form.data_aggregazione_originale || !form.opera || !form.tipo_appartenenza || !form.nome_presidente || !form.cognome_presidente || !form.nome_animatore || !form.cognome_animatore || !form.email || !form.numero_membri) {
      setError('Compila tutti i campi obbligatori (*).')
      return
    }
    if (form.tipo_appartenenza === 'congregazione' && !form.congregazione) {
      setError('Seleziona la congregazione di appartenenza.')
      return
    }
    if (form.tipo_appartenenza === 'diocesi' && !form.diocesi) {
      setError('Inserisci la diocesi di appartenenza.')
      return
    }
    if (!gdprAccepted) {
      setError('Devi accettare il trattamento dei dati personali per procedere.')
      return
    }
    if (!captchaToken) {
      setError('Completa la verifica di sicurezza.')
      return
    }
    setSending(true)
    setError('')
    let diplomaUrl = null
    if (diploma) diplomaUrl = await uploadDiploma(diploma, form.nome)
    const { error } = await supabase.from('registration_requests').insert({
      ...form,
      referente: `${form.nome_presidente} ${form.cognome_presidente}`,
      numero_membri: form.numero_membri ? parseInt(form.numero_membri) : null,
      ispettoria: form.ispettoria || null,
      congregazione: form.tipo_appartenenza === 'congregazione' ? form.congregazione : null,
      diocesi: form.tipo_appartenenza === 'diocesi' ? form.diocesi : null,
      diploma_url: diplomaUrl,
    })
    if (error) { setError('Errore durante l\'invio. Riprova.'); setSending(false); return; }
    setSent(true)
    setSending(false)
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', fontSize: 14,
    border: '0.5px solid #dce8f0', borderRadius: 8,
    background: '#F8FBFD', color: '#333',
    boxSizing: 'border-box' as const, outline: 'none',
  }
  const labelStyle = { display: 'block' as const, fontSize: 12, color: '#888', marginBottom: 4, letterSpacing: '0.04em' }
  const sectionTitle = {
    fontSize: 11, fontWeight: 600 as const, color: BLU,
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
    marginBottom: '0.75rem', paddingBottom: '0.5rem',
    borderBottom: `2px solid ${AZZURRO}`,
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F0F7FC', padding: '1.5rem' }}>
      <div style={{ maxWidth: 540, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img src="/adma-logo.png" alt="ADMA" style={{ width: 140, margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: BLU }}>Richiesta di registrazione</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
            Compila il modulo per richiedere la registrazione alla Primaria di Valdocco
          </div>
        </div>

        {!sent ? (
          <div style={{ background: 'white', borderRadius: 14, padding: '1.75rem', boxShadow: '0 2px 12px rgba(26,122,184,0.08)' }}>

            {error && (
              <div style={{ background: '#FCEBEB', border: '0.5px solid #F7C1C1', color: '#A32D2D', borderRadius: 8, padding: '0.6rem 0.85rem', fontSize: 13, marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {/* Dati identificativi */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={sectionTitle}>Dati identificativi — non modificabili dopo l'approvazione</div>

              <div style={{ marginBottom: '0.8rem' }}>
                <label style={labelStyle}>Nome del gruppo *</label>
                <input style={inputStyle} value={form.nome} onChange={e => update('nome', e.target.value)} placeholder="es. ADMA Barcellona" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div><label style={labelStyle}>Città *</label><input style={inputStyle} value={form.citta} onChange={e => update('citta', e.target.value)} placeholder="es. Barcellona" /></div>
                <div><label style={labelStyle}>Paese *</label><input style={inputStyle} value={form.paese} onChange={e => update('paese', e.target.value)} placeholder="es. Spagna" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div><label style={labelStyle}>N. di Erezione *</label><input style={inputStyle} value={form.numero_erezione} onChange={e => update('numero_erezione', e.target.value)} placeholder="es. ES-2024-001" /></div>
                <div><label style={labelStyle}>Data di Erezione *</label><input type="date" style={inputStyle} value={form.data_erezione} onChange={e => update('data_erezione', e.target.value)} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div><label style={labelStyle}>N. di aggregazione *</label><input style={inputStyle} value={form.numero_aggregazione} onChange={e => update('numero_aggregazione', e.target.value)} placeholder="es. 2024-047" /></div>
                <div><label style={labelStyle}>Data di aggregazione *</label><input type="date" style={inputStyle} value={form.data_aggregazione_originale} onChange={e => update('data_aggregazione_originale', e.target.value)} /></div>
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                <label style={labelStyle}>Opera presso cui il gruppo è eretto *</label>
                <input style={inputStyle} value={form.opera} onChange={e => update('opera', e.target.value)} placeholder="es. Parrocchia Maria Ausiliatrice" />
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                <label style={labelStyle}>Appartenenza *</label>
                <div style={{ display: 'flex', gap: 16, marginBottom: form.tipo_appartenenza ? '0.6rem' : 0 }}>
                  {[{ val: 'congregazione', label: 'Congregazione religiosa' }, { val: 'diocesi', label: 'Diocesi' }].map(opt => (
                    <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer', color: '#333' }}>
                      <input type="radio" name="tipo_appartenenza" value={opt.val}
                        checked={form.tipo_appartenenza === opt.val}
                        onChange={e => update('tipo_appartenenza', e.target.value)} />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {form.tipo_appartenenza === 'congregazione' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={labelStyle}>Congregazione *</label>
                    <select style={{ ...inputStyle, background: 'white' }} value={form.congregazione} onChange={e => update('congregazione', e.target.value)}>
                      <option value="">Seleziona...</option>
                      <option value="SDB">SDB — Salesiani di Don Bosco</option>
                      <option value="FMA">FMA — Figlie di Maria Ausiliatrice</option>
                    </select>
                  </div>
                )}
                {form.tipo_appartenenza === 'diocesi' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={labelStyle}>Diocesi *</label>
                    <input style={inputStyle} value={form.diocesi} onChange={e => update('diocesi', e.target.value)} placeholder="es. Diocesi di Roma" />
                  </div>
                )}
              </div>
            </div>

            {/* Responsabili e contatti */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={sectionTitle}>Responsabili e contatti — aggiornabili ad ogni rinnovo</div>

              <div style={{ marginBottom: '0.4rem', fontSize: 12, color: BLU, fontWeight: 600 }}>Presidente</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div><label style={labelStyle}>Nome *</label><input style={inputStyle} value={form.nome_presidente} onChange={e => update('nome_presidente', e.target.value)} placeholder="Nome" /></div>
                <div><label style={labelStyle}>Cognome *</label><input style={inputStyle} value={form.cognome_presidente} onChange={e => update('cognome_presidente', e.target.value)} placeholder="Cognome" /></div>
              </div>

              <div style={{ marginBottom: '0.4rem', fontSize: 12, color: BLU, fontWeight: 600 }}>Animatore spirituale locale</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div><label style={labelStyle}>Nome *</label><input style={inputStyle} value={form.nome_animatore} onChange={e => update('nome_animatore', e.target.value)} placeholder="Nome" /></div>
                <div><label style={labelStyle}>Cognome *</label><input style={inputStyle} value={form.cognome_animatore} onChange={e => update('cognome_animatore', e.target.value)} placeholder="Cognome" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '0.8rem' }}>
                <div><label style={labelStyle}>Email del gruppo *</label><input type="email" style={inputStyle} value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@esempio.com" /></div>
                <div><label style={labelStyle}>Telefono</label><input style={inputStyle} value={form.telefono} onChange={e => update('telefono', e.target.value)} placeholder="+1 ..." /></div>
              </div>
              <div>
                <label style={labelStyle}>Numero di membri *</label>
                <input type="number" style={inputStyle} value={form.numero_membri} onChange={e => update('numero_membri', e.target.value)} placeholder="es. 30" min="1" />
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                <label style={labelStyle}>Ispettoria</label>
                <input style={inputStyle} value={form.ispettoria} onChange={e => update('ispettoria', e.target.value)} placeholder="es. Ispettoria Salesiana Italia Centrale" />
              </div>
            </div>

            {/* Documentazione */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={sectionTitle}>Documentazione</div>
              <label style={labelStyle}>Diploma di aggregazione <span style={{ fontSize: 11, color: '#aaa' }}>(facoltativo · JPG, PNG o PDF)</span></label>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 12,
                border: diploma ? `1px solid ${AZZURRO}` : '1px dashed #dce8f0',
                borderRadius: 8, padding: '12px 16px', cursor: 'pointer',
                background: diploma ? '#E3F4FC' : '#F8FBFD', marginTop: 4,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: diploma ? AZZURRO : '#eef5fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {diploma ? '✓' : '📎'}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: diploma ? BLU : '#888' }}>
                    {diploma ? diploma.name : 'Clicca per allegare il diploma'}
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                    {diploma ? `${(diploma.size / 1024).toFixed(0)} KB` : 'JPG, PNG o PDF · max 5MB'}
                  </div>
                </div>
                <input type="file" accept="image/*,.pdf" onChange={e => setDiploma(e.target.files?.[0] || null)} style={{ display: 'none' }} />
              </label>
              {diploma && (
                <button onClick={() => setDiploma(null)} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 12, cursor: 'pointer', marginTop: 4, padding: 0 }}>
                  × Rimuovi file
                </button>
              )}
            </div>

            <div style={{ background: '#E3F4FC', borderRadius: 8, padding: '0.75rem 1rem', fontSize: 12, color: BLU, marginBottom: '1.25rem' }}>
              Dopo l'approvazione della Primaria riceverete via email le credenziali di accesso. La registrazione sarà valida fino al 31 dicembre dell'anno corrente.
            </div>

            <button onClick={handleSubmit} disabled={sending} style={{
              width: '100%', background: sending ? '#93C8E8' : BLU,
              color: 'white', border: 'none', padding: 11, borderRadius: 8,
              fontSize: 14, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer',
            }}>
              {sending ? 'Invio in corso...' : 'INVIA RICHIESTA DI REGISTRAZIONE'}
            </button>
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              style={{ marginBottom: '1rem' }}
            />
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                checked={gdprAccepted}
                onChange={e => setGdprAccepted(e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0, width: 16, height: 16, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>
                Ho preso visione e acconsento al trattamento dei miei dati personali da parte dell'Associazione di Maria Ausiliatrice (ADMA) - Primaria di Valdocco, Torino, ai sensi del Regolamento UE 2016/679 (GDPR). I dati raccolti saranno utilizzati esclusivamente per la gestione della rete mondiale dei gruppi ADMA e non saranno ceduti a terzi. Hai diritto di accesso, rettifica e cancellazione dei tuoi dati scrivendo a{' '}
                <a href="mailto:primaria@admadonbosco.org" style={{ color: '#1A7AB8' }}>primaria@admadonbosco.org</a>. *
              </span>
            </label>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: 13, color: '#888' }}>
              Hai già un account?{' '}
              <a href="/" style={{ color: BLU, fontWeight: 600, textDecoration: 'none' }}>Accedi</a>
            </div>
          </div>
        ) : (
          <div style={{ background: '#E3F4FC', border: `0.5px solid ${AZZURRO}`, borderRadius: 14, padding: '2rem', textAlign: 'center', color: BLU }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>Richiesta inviata con successo!</div>
            <div style={{ fontSize: 13, color: '#555' }}>
              La domanda è stata trasmessa alla Primaria di Valdocco.<br />
              Riceverete le credenziali di accesso via email una volta approvata.
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <a href="/" style={{ color: BLU, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>← Torna al login</a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}