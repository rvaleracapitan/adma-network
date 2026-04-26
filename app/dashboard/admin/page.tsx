'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function Admin() {
  const [registrazioni, setRegistrazioni] = useState<any[]>([])
  const [rinnovi, setRinnovi] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'registrazioni' | 'rinnovi'>('registrazioni')

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return; }
      const { data: me } = await supabase.from('groups').select('*').eq('user_id', user.id).single()
      if (!me?.is_primaria) { window.location.href = '/dashboard/mappa'; return; }
      await loadData()
      setLoading(false)
    }
    check()
  }, [])

  async function loadData() {
    const { data: reg } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('stato', 'pending')
      .order('submitted_at', { ascending: false })
    setRegistrazioni(reg || [])

    const { data: rin } = await supabase
      .from('renewals')
      .select('*, groups(nome, paese, numero_erezione)')
      .eq('stato', 'pending')
      .order('submitted_at', { ascending: false })
    setRinnovi(rin || [])
  }

  async function approvaRegistrazione(r: any) {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/approva-registrazione`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ registrazione_id: r.id })
    })
    const data = await res.json()
    if (!res.ok) { alert('Errore: ' + data.error); return; }
    alert(`Approvato!\nEmail: ${data.email}\nPassword temporanea: ${data.password}`)
    await loadData()
  }

  async function rifiutaRegistrazione(id: string) {
    await supabase.from('registration_requests')
      .update({ stato: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', id)
    await loadData()
  }

  async function approvaRinnovo(r: any) {
    const annoCorrente = new Date().getFullYear()
    const nuovaScadenza = `${annoCorrente + 1}-03-31`

    await supabase.from('groups').update({
      referente: r.referente,
      email: r.email,
      telefono: r.telefono,
      numero_membri: r.numero_membri,
      nome_presidente: r.nome_presidente,
      cognome_presidente: r.cognome_presidente,
      nome_animatore: r.nome_animatore,
      cognome_animatore: r.cognome_animatore,
      scadenza: nuovaScadenza,
    }).eq('id', r.group_id)

    await supabase.from('renewals')
      .update({ stato: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', r.id)

    await supabase.from('badges')
      .upsert({ group_id: r.group_id, anno: annoCorrente }, { onConflict: 'group_id,anno' })

    alert(`Rinnovo ${annoCorrente} approvato!\nTimbro ${annoCorrente} assegnato.\nNuova scadenza: 31 marzo ${annoCorrente + 1}`)
    await loadData()
  }

  async function rifiutaRinnovo(id: string) {
    await supabase.from('renewals')
      .update({ stato: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', id)
    await loadData()
  }

  const cardStyle = {
    background: 'white',
    border: '0.5px solid #e5e5e5',
    borderRadius: 12,
    padding: '0.85rem 1rem',
    marginBottom: 9,
  }

  const btnOk = {
    background: '#1D9E75', color: 'white', border: 'none',
    padding: '6px 13px', borderRadius: 8, fontSize: 13, cursor: 'pointer'
  }

  const btnNo = {
    background: '#E24B4A', color: 'white', border: 'none',
    padding: '6px 13px', borderRadius: 8, fontSize: 13, cursor: 'pointer'
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento...</div>

  return (
    <main style={{ minHeight: '100vh', background: '#f9f9f7', padding: '1.5rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '0.5px solid #e5e5e5', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#534AB7', fontWeight: 500 }}>PR</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Pannello Admin</div>
              <div style={{ fontSize: 12, color: '#888' }}>Primaria di Valdocco</div>
            </div>
          </div>
          <a href="/dashboard/mappa" style={{ fontSize: 12, color: '#185FA5', textDecoration: 'underline' }}>← Mappa</a>
        </div>

        {/* Tab */}
        <div style={{ display: 'flex', background: '#f5f5f3', borderRadius: 8, padding: 3, width: 'fit-content', marginBottom: '1rem' }}>
          {(['registrazioni', 'rinnovi'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '5px 16px', fontSize: 13,
              border: tab === t ? '0.5px solid #e5e5e5' : 'none',
              background: tab === t ? 'white' : 'none',
              borderRadius: 6, cursor: 'pointer', fontWeight: tab === t ? 500 : 400
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'registrazioni' && registrazioni.length > 0 && (
                <span style={{ background: '#FAEEDA', color: '#854F0B', padding: '1px 6px', borderRadius: 999, fontSize: 11, marginLeft: 6 }}>{registrazioni.length}</span>
              )}
              {t === 'rinnovi' && rinnovi.length > 0 && (
                <span style={{ background: '#FAEEDA', color: '#854F0B', padding: '1px 6px', borderRadius: 999, fontSize: 11, marginLeft: 6 }}>{rinnovi.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Registrazioni */}
        {tab === 'registrazioni' && (
          <div>
            {registrazioni.length === 0 && (
              <div style={{ textAlign: 'center', color: '#888', fontSize: 14, padding: '2rem' }}>Nessuna richiesta in attesa.</div>
            )}
            {registrazioni.map(r => (
              <div key={r.id} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{r.nome}</div>
                    <div style={{ fontSize: 13, color: '#888' }}>{r.paese} · {new Date(r.submitted_at).toLocaleDateString('it-IT')}</div>
                  </div>
                  <span style={{ background: '#FAEEDA', color: '#854F0B', padding: '2px 9px', borderRadius: 999, fontSize: 12 }}>Prima registrazione</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                  {[
                    ['Presidente', r.nome_presidente ? `${r.nome_presidente} ${r.cognome_presidente}` : r.referente],
                    ['Animatore', r.nome_animatore ? `${r.nome_animatore} ${r.cognome_animatore}` : '—'],
                    ['Membri', r.numero_membri],
                    ['Email', r.email],
                    ['Telefono', r.telefono],
                    ['N. Erezione', r.numero_erezione],
                    ['N. Aggregazione', r.numero_aggregazione],
                    ['Data aggregazione', r.data_aggregazione_originale],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <div style={{ fontSize: 11, color: '#888' }}>{label}</div>
                      <div style={{ fontSize: 13 }}>{value || '—'}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={btnOk} onClick={() => approvaRegistrazione(r)}>Approva e crea account</button>
                  <button style={btnNo} onClick={() => rifiutaRegistrazione(r.id)}>Rifiuta</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rinnovi */}
        {tab === 'rinnovi' && (
          <div>
            {rinnovi.length === 0 && (
              <div style={{ textAlign: 'center', color: '#888', fontSize: 14, padding: '2rem' }}>Nessun rinnovo in attesa.</div>
            )}
            {rinnovi.map(r => (
              <div key={r.id} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{r.groups?.nome}</div>
                    <div style={{ fontSize: 13, color: '#888' }}>{r.groups?.paese} · {new Date(r.submitted_at).toLocaleDateString('it-IT')}</div>
                  </div>
                  <span style={{ background: '#E6F1FB', color: '#185FA5', padding: '2px 9px', borderRadius: 999, fontSize: 12 }}>Rinnovo</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                  {[
                    ['Presidente', r.nome_presidente ? `${r.nome_presidente} ${r.cognome_presidente}` : '—'],
                    ['Animatore', r.nome_animatore ? `${r.nome_animatore} ${r.cognome_animatore}` : '—'],
                    ['Membri aggiornati', r.numero_membri],
                    ['Email', r.email],
                    ['Telefono', r.telefono],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <div style={{ fontSize: 11, color: '#888' }}>{label}</div>
                      <div style={{ fontSize: 13 }}>{value || '—'}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={btnOk} onClick={() => approvaRinnovo(r)}>Approva rinnovo {new Date().getFullYear()}</button>
                  <button style={btnNo} onClick={() => rifiutaRinnovo(r.id)}>Rifiuta</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}