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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o password non corretti.')
      setLoading(false)
      return
    }
    window.location.href = '/dashboard/mappa'
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #0D5C8C 0%, #1A7AB8 60%, #29ABE2 100%)',
      padding: '1.5rem',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img src="/adma-logo.png" alt="ADMA Logo" style={{ width: 160, margin: '0 auto 12px', display: 'block', filter: 'brightness(0) invert(1)' }} />
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>
          Rete mondiale dei gruppi aggregati · Primaria Valdocco
        </div>
      </div>

      <div style={{
        width: '100%', maxWidth: 380,
        background: 'rgba(255,255,255,0.1)',
        border: '0.5px solid rgba(255,255,255,0.3)',
        borderRadius: 16,
        padding: '1.75rem',
      }}>
        {error && (
          <div style={{
            background: 'rgba(226,75,74,0.2)',
            border: '0.5px solid rgba(226,75,74,0.5)',
            color: '#FF8A89',
            borderRadius: 8, padding: '0.6rem 0.85rem',
            fontSize: 13, marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6, letterSpacing: '0.05em' }}>
            EMAIL DEL GRUPPO
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@esempio.com"
            style={{
              width: '100%', padding: '10px 14px', fontSize: 14,
              background: 'rgba(255,255,255,0.15)',
              border: '0.5px solid rgba(255,255,255,0.3)',
              borderRadius: 8, color: 'white', boxSizing: 'border-box' as const, outline: 'none',
            }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6, letterSpacing: '0.05em' }}>
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: '10px 14px', fontSize: 14,
              background: 'rgba(255,255,255,0.15)',
              border: '0.5px solid rgba(255,255,255,0.3)',
              borderRadius: 8, color: 'white', boxSizing: 'border-box' as const, outline: 'none',
            }}
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? 'rgba(255,255,255,0.3)' : 'white',
            color: '#1A7AB8',
            border: 'none', padding: '11px', borderRadius: 8,
            fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.05em',
          }}
        >
          {loading ? 'Accesso in corso...' : 'ACCEDI'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
        Gruppo non registrato nel network?{' '}
        <a href="/registrazione" style={{ color: 'white', fontWeight: 600 }}>
          Richiedi registrazione
        </a>
      </div>

      <div style={{ marginTop: '3rem', fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
        Fondato da Don Bosco il 18 aprile 1869 · Basilica di Maria Ausiliatrice, Valdocco, Torino
      </div>
    </main>
  )
}