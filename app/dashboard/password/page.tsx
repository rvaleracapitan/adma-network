'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import HeaderADMA from '../../components/HeaderADMA'

const BLU = '#1A7AB8'
const AZZURRO = '#29ABE2'

export default function CambioPassword() {
  const [form, setForm] = useState({ nuova: '', conferma: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.nuova || !form.conferma) { setError('Compila tutti i campi.'); return; }
    if (form.nuova.length < 8) { setError('La password deve essere di almeno 8 caratteri.'); return; }
    if (form.nuova !== form.conferma) { setError('Le password non coincidono.'); return; }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password: form.nuova })
    if (error) { setError('Errore: ' + error.message); setLoading(false); return; }
    setSuccess(true)
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', fontSize: 14,
    border: '0.5px solid #dce8f0', borderRadius: 8,
    background: '#F8FBFD', color: '#333',
    boxSizing: 'border-box' as const, outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FC' }}>
      <HeaderADMA />
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '1.5rem 1rem' }}>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: BLU }}>Cambia password</div>
          <div style={{ fontSize: 13, color: '#888' }}>Imposta una nuova password per il tuo account</div>
        </div>

        {!success ? (
          <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {error && (
              <div style={{ background: '#FCEBEB', border: '0.5px solid #F7C1C1', color: '#A32D2D', borderRadius: 8, padding: '0.6rem 0.85rem', fontSize: 13, marginBottom: '1rem' }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6, letterSpacing: '0.04em' }}>NUOVA PASSWORD *</label>
              <input type="password" style={inputStyle} value={form.nuova}
                onChange={e => setForm({ ...form, nuova: e.target.value })}
                placeholder="Almeno 8 caratteri" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6, letterSpacing: '0.04em' }}>CONFERMA PASSWORD *</label>
              <input type="password" style={inputStyle} value={form.conferma}
                onChange={e => setForm({ ...form, conferma: e.target.value })}
                placeholder="Ripeti la password"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', background: loading ? '#93C8E8' : BLU,
              color: 'white', border: 'none', padding: 11, borderRadius: 8,
              fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Salvataggio...' : 'AGGIORNA PASSWORD'}
            </button>
          </div>
        ) : (
          <div style={{ background: '#E3F4FC', border: `0.5px solid ${AZZURRO}`, borderRadius: 12, padding: '1.5rem', color: BLU }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>✓ Password aggiornata!</div>
            <div style={{ fontSize: 13 }}>La tua nuova password è attiva da subito.</div>
            <div style={{ marginTop: '1rem' }}>
              <a href="/dashboard/mappa" style={{ color: BLU, fontSize: 13, fontWeight: 500 }}>← Torna alla mappa</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}