'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email o password non corretti.')
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f7' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#534AB7', fontWeight: 500, margin: '0 auto 10px' }}>A</div>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>ADMA Network</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Rete mondiale dei gruppi aggregati · Primaria Valdocco</p>
        </div>
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '1.5rem' }}>
          {error && (
            <div style={{ background: '#FCEBEB', border: '0.5px solid #F7C1C1', color: '#A32D2D', borderRadius: 8, padding: '0.6rem 0.85rem', fontSize: 13, marginBottom: '0.75rem' }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 4 }}>Email del gruppo</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@esempio.com"
              style={{ width: '100%', padding: '9px 12px', fontSize: 14, border: '0.5px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 4 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '9px 12px', fontSize: 14, border: '0.5px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }}
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', background: '#1a1a1a', color: 'white', border: 'none', padding: 10, borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '0.5rem' }}
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: 13, color: '#888' }}>
          Nuovo gruppo?{' '}
          <a href="/registrazione" style={{ color: '#185FA5', textDecoration: 'underline' }}>Richiedi aggregazione</a>
        </div>
      </div>
    </main>
  )
}