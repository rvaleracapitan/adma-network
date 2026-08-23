'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const BLU = '#1A7AB8'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o password non corretti.')
      setLoading(false)
      return
    }
    window.location.href = '/dashboard/profilo'
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #E8F4FC 0%, #F0F7FC 60%, #ffffff 100%)',
      padding: '1.5rem',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img src="/adma-logo.png" alt="ADMA Logo" style={{ width: 160, margin: '0 auto 12px', display: 'block' }} />
        <div style={{ fontSize: 12, color: '#888', letterSpacing: '0.08em' }}>
          Rete mondiale dei gruppi aggregati · Primaria Valdocco
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 380, background: 'white', border: '0.5px solid #dce8f0', borderRadius: 16, padding: '1.75rem', boxShadow: '0 4px 20px rgba(26,122,184,0.08)' }}>
        {error && (
          <div style={{ background: '#FCEBEB', border: '0.5px solid #F7C1C1', color: '#A32D2D', borderRadius: 8, padding: '0.6rem 0.85rem', fontSize: 13, marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6, letterSpacing: '0.05em' }}>EMAIL DEL GRUPPO</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="email@esempio.com"
            style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#F8FBFD', border: '0.5px solid #dce8f0', borderRadius: 8, color: '#333', boxSizing: 'border-box' as const, outline: 'none' }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6, letterSpacing: '0.05em' }}>PASSWORD</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: '#F8FBFD', border: '0.5px solid #dce8f0', borderRadius: 8, color: '#333', boxSizing: 'border-box' as const, outline: 'none' }}
          />
        </div>
        <button onClick={handleLogin} disabled={loading} style={{
          width: '100%', background: loading ? '#93C8E8' : BLU,
          color: 'white', border: 'none', padding: '11px', borderRadius: 8,
          fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'Accesso in corso...' : 'ACCEDI'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 13, color: '#888' }}>
        <a href="/" style={{ color: BLU, textDecoration: 'none' }}>← Torna alla home</a>
        {' · '}
        <a href="/registrazione" style={{ color: BLU, textDecoration: 'none' }}>Registra il tuo gruppo</a>
      </div>
    </main>
  )
}
