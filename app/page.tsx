'use client'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

const BLU = '#1A7AB8'
const AZZURRO = '#29ABE2'

export default function Home() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = '/dashboard/profilo'
    })
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0D5C8C 0%, #1A7AB8 60%, #29ABE2 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <img src="/adma-logo.png" alt="ADMA" style={{ width: 160, display: 'block', margin: '0 auto 1rem', filter: 'brightness(0) invert(1)' }} />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em' }}>RETE MONDIALE DEI GRUPPI AGGREGATI</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Primaria di Valdocco · Torino</div>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem', maxWidth: 700, width: '100%' }}>
        <div style={{ flex: 1, minWidth: 260, maxWidth: 320, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 16, padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
          onClick={() => window.location.href = '/login'}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔑</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>Sei già registrato?</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 20, lineHeight: 1.6 }}>
            Accedi con le credenziali del tuo gruppo per entrare nella rete ADMA
          </div>
          <div style={{ background: 'white', color: BLU, padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, display: 'inline-block' }}>
            ACCEDI
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 260, maxWidth: 320, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 16, padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
          onClick={() => window.location.href = '/registrazione'}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>Nuovo gruppo?</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 20, lineHeight: 1.6 }}>
            Registra il tuo gruppo al network ADMA e unisciti alla rete mondiale
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1.5px solid rgba(255,255,255,0.5)', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, display: 'inline-block' }}>
            REGISTRATI
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 620, textAlign: 'center', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '1.5rem' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
          La registrazione al Network ADMA è disponibile per tutti i gruppi <strong style={{ color: 'white' }}>regolarmente eretti</strong> e <strong style={{ color: 'white' }}>regolarmente aggregati alla Primaria</strong> che abbiano già il diploma di aggregazione.
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginTop: 10 }}>
          Grazie alla registrazione al Network il tuo gruppo potrà entrare a far parte della rete ADMA mondiale, rimanere in contatto con la Primaria e con tutti gli altri gruppi del mondo e ricevere il <strong style={{ color: 'white' }}>badge annuale di rinnovo</strong>.
        </div>
      </div>

      <div style={{ marginTop: '2rem', fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
        Fondato da Don Bosco il 18 aprile 1869 · Basilica di Maria Ausiliatrice, Valdocco, Torino
      </div>
    </main>
  )
}
