'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const ADMA_BLU = '#1A3A6B'
const ADMA_ORO = '#C9A84C'

export default function HeaderADMA() {
  const [myGroup, setMyGroup] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('groups').select('nome, paese, is_primaria').eq('user_id', user.id).single().then(({ data }) => setMyGroup(data))
    })
  }, [])

  const navLinks = [
    { href: '/dashboard/mappa', label: 'Mappa' },
    { href: '/dashboard/profilo', label: 'Profilo' },
    { href: '/dashboard/messaggi', label: 'Messaggi' },
    { href: '/dashboard/rinnovo', label: 'Rinnovo' },
    { href: '/dashboard/password', label: 'Password' },
    ...(myGroup?.is_primaria ? [{ href: '/dashboard/admin', label: 'Admin' }] : []),
  ]

  return (
    <div style={{
      background: ADMA_BLU,
      padding: '0 1.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 56, position: 'sticky', top: 0, zIndex: 100,
      borderBottom: `2px solid ${ADMA_ORO}`,
    }}>
      <a href="/dashboard/mappa" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(201,168,76,0.15)',
          border: `1.5px solid ${ADMA_ORO}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: ADMA_ORO, fontWeight: 700, fontFamily: 'serif',
        }}>A</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: ADMA_ORO, letterSpacing: '0.1em', fontFamily: 'serif' }}>ADMA</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>{myGroup?.nome || ''}</div>
        </div>
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {navLinks.map(l => (
          <a key={l.href} href={l.href} style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
            {l.label}
          </a>
        ))}
        <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
          style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
          Esci
        </button>
      </div>
    </div>
  )
}