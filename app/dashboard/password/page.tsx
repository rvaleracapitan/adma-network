'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function CambioPassword() {
  const [form, setForm] = useState({
    nuova: '',
    conferma: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.nuova || !form.conferma) {
      setError('Compila tutti i campi.')
      return
    }
    if (form.nuova.length < 8) {
      setError('La password deve essere di almeno 8 caratteri.')
      return
    }
    if (form.nuova !== form.conferma) {
      setError('Le password non coincidono.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password: form.nuova })
    if (error) {
      setError('Errore: ' + error.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', fontSize: 14,
    border: '0.5px solid #ddd', borderRadius: 8, boxSizing: 'border-box' as const,
  }
  const labelStyle = { display: 'block' as const, fontSize: 13, color: '#888', marginBottom: 4 }

  return (
    <main style={{ minHeight: '100vh', background: '#f9f9f7', padding: '1.5rem' }}>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Cambia password</div>
          <a href="/dashboard/mappa" style={{ fontSize: 12, color: '#185FA5', textDecoration: 'underline' }}>← Mappa</a>
        </div>

        {!success ? (
          <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.5rem' }}>
            {error && (
              <div style={{ background: '#FCEBEB', border: '0.5px solid #F7C1C1', color: '#A32D2D', borderRadius: 8, padding: '0.6rem 0.85rem', fontSize: 13, marginBottom: '1rem' }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: '0.9rem' }}>
              <label style={labelStyle}>Nuova password *</label>
              <input
                type="password"
                style={inputStyle}
                value={form.nuova}
                onChange={e => setForm({ ...form, nuova: e.target.value })}
                placeholder="Almeno 8 caratteri"
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Conferma nuova password *</label>
              <input
                type="password"
                style={inputStyle}
                value={form.conferma}
                onChange={e => setForm({ ...form, conferma: e.target.value })}
                placeholder="Ripeti la password"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', background: '#1a1a1a', color: 'white', border: 'none', padding: 10, borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Salvataggio...' : 'Aggiorna password'}
            </button>
          </div>
        ) : (
          <div style={{ background: '#EAF3DE', border: '0.5px solid #9FE1CB', borderRadius: 12, padding: '1.5rem', fontSize: 14, color: '#3B6D11' }}>
            <div style={{ fontWeight: 500, marginBottom: 6 }}>Password aggiornata!</div>
            La tua nuova password è attiva da subito.
            <div style={{ marginTop: '1rem' }}>
              <a href="/dashboard/mappa" style={{ color: '#3B6D11', fontSize: 13 }}>← Torna alla mappa</a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}