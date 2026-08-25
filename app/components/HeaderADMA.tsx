'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const BLU = '#1A7AB8'
const AZZURRO = '#29ABE2'

export default function HeaderADMA() {
  const [myGroup, setMyGroup] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('groups').select('nome, paese, is_primaria').eq('user_id', user.id).single().then(({ data }) => setMyGroup(data))
    })
  }, [])

  const navLinks = [
    { href: '/dashboard/profilo', label: 'Profilo' },
    { href: '/dashboard/password', label: 'Password' },

    { href: '/dashboard/mappa', label: 'Esplora' },
    ...(myGroup?.is_primaria ? [{ href: '/dashboard/admin', label: 'Admin' }] : []),
  ]

  return (
    <div style={{
      background: BLU,
      padding: '0 1.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 56, position: 'sticky', top: 0, zIndex: 100,
      borderBottom: `3px solid ${AZZURRO}`,
    }}>
      <a href="/dashboard/mappa" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <img src="/adma-logo.png" alt="ADMA" style={{ height: 38, width: 'auto', filter: 'brightness(0) invert(1)' }} />
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em', maxWidth: 120 }}>
          {myGroup?.nome || ''}
        </div>
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {navLinks.map(l => (
          <a key={l.href} href={l.href} style={{
            fontSize: 12, color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
          }}>
            {l.label}
          </a>
        ))}
        <span style={{
          fontSize: 12, color: 'rgba(255,255,255,0.3)',
          cursor: 'not-allowed',
        }}>
          Rinnovo
        </span>
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
          style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Esci
        </button>
      </div>
    </div>
  )
}