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
      background: 'linear-gradient(160deg, #0F2547 0%, #1A3A6B 60%, #1E4A8A 100%)',
      padding: '1.5rem',
    }}>

      {/* Logo e titolo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(201,168,76,0.15)',
          border: '2px solid #C9A84C',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <text x="22" y="30" textAnchor="middle" fontSize="22" fontWeight="700" fill="#C9A84C" fontFamily="serif">A</text>
          </svg>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#C9A84C', letterSpacing: '0.12em', fontFamily: 'serif' }}>ADMA</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, letterSpacing: '0.08em' }}>
          ASSOCIAZIONE DI MARIA AUSILIATRICE
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>
          Rete mondiale dei gruppi aggregati · Primaria Valdocco
        </div>
      </div>

      {/* Card login */}
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'rgba(255,255,255,0.05)',
        border: '0.5px solid rgba(201,168,76,0.3)',
        borderRadius: 16,
        padding: '1.75rem',
        backdropFilter: 'blur(10px)',
      }}>
        {error && (
          <div style={{
            background: 'rgba(226,75,74,0.15)',
            border: '0.5px solid rgba(226,75,74,0.5)',
            color: '#FF8A89',
            borderRadius: 8, padding: '0.6rem 0.85rem',
            fontSize: 13, marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6, letterSpacing: '0.05em' }}>
            EMAIL DEL GRUPPO
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@esempio.com"
            style={{
              width: '100%', padding: '10px 14px', fontSize: 14,
              background: 'rgba(255,255,255,0.08)',
              border: '0.5px solid rgba(255,255,255,0.2)',
              borderRadius: 8, color: 'white', boxSizing: 'border-box' as const,
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6, letterSpacing: '0.05em' }}>
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
              background: 'rgba(255,255,255,0.08)',
              border: '0.5px solid rgba(255,255,255,0.2)',
              borderRadius: 8, color: 'white', boxSizing: 'border-box' as const,
              outline: 'none',
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? 'rgba(201,168,76,0.5)' : '#C9A84C',
            color: '#0F2547',
            border: 'none', padding: '11px', borderRadius: 8,
            fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.05em',
          }}
        >
          {loading ? 'Accesso in corso...' : 'ACCEDI'}
        </button>
      </div>

      {/* Link registrazione */}
      <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
        Gruppo non registrato nel network?{' '}
        <a href="/registrazione" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 500 }}>
          Richiedi registrazione
        </a>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '3rem', fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
        Fondato da Don Bosco il 18 aprile 1869 · Basilica di Maria Ausiliatrice, Valdocco, Torino
      </div>
    </main>
  )
}