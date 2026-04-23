'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [group, setGroup] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGroup() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return; }
      const { data } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setGroup(data)
      setLoading(false)
    }
    loadGroup()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento...</div>

  return (
    <main style={{ minHeight: '100vh', background: '#f9f9f7', padding: '1.5rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#534AB7', fontWeight: 500 }}>
              {group?.nome?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{group?.nome}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{group?.is_primaria ? 'Amministratore · Primaria Valdocco' : group?.paese}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#185FA5', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>Esci</button>
        </div>
        <div style={{ background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Benvenuto nella rete ADMA</div>
          <div style={{ fontSize: 14, color: '#888' }}>La dashboard è in costruzione — a breve qui troverai la mappa mondiale, i rinnovi e la chat.</div>
        </div>
      </div>
    </main>
  )
}