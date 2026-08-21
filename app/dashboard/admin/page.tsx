'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import HeaderADMA from '../../components/HeaderADMA'

const BLU = '#1A7AB8'
const AZZURRO = '#29ABE2'

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
      .from('registration_requests').select('*').in('stato', ['pending', 'in_lavorazione'])
      .order('submitted_at', { ascending: false })
    setRegistrazioni(reg || [])
    const { data: rin } = await supabase
      .from('renewals').select('*, groups(nome, paese, numero_erezione, opera, congregazione, diocesi, ispettoria)')
      .eq('stato', 'pending').order('submitted_at', { ascending: false })
    setRinnovi(rin || [])
  }

  async function presaInCarico(id: string) {
    const operatore = prompt('Inserisci il tuo nome per prendere in carico questa richiesta:')
    if (!operatore) return
    await supabase.from('registration_requests').update({
      stato: 'in_lavorazione',
      operatore: operatore,
      presa_in_carico_at: new Date().toISOString(),
    }).eq('id', id)
    await loadData()
  }

  async function rilasciaInCarico(id: string) {
    await supabase.from('registration_requests').update({
      stato: 'pending',
      operatore: null,
      presa_in_carico_at: null,
    }).eq('id', id)
    await loadData()
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
    await supabase.from('registration_requests').update({ stato: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', id)
    await loadData()
  }

  async function approvaRinnovo(r: any) {
    const annoCorrente = new Date().getFullYear()
   const nuovaScadenza = `${annoCorrente}-12-31`
    await supabase.from('groups').update({
      referente: r.referente, email: r.email, telefono: r.telefono,
      numero_membri: r.numero_membri, nome_presidente: r.nome_presidente,
      cognome_presidente: r.cognome_presidente, nome_animatore: r.nome_animatore,
      cognome_animatore: r.cognome_animatore, scadenza: nuovaScadenza,
    }).eq('id', r.group_id)
    await supabase.from('renewals').update({ stato: 'approved', reviewed_at: new Date().toISOString() }).eq('id', r.id)
    await supabase.from('badges').upsert({ group_id: r.group_id, anno: annoCorrente }, { onConflict: 'group_id,anno' })
    alert(`Rinnovo ${annoCorrente} approvato!\nTimbro ${annoCorrente} assegnato.\nNuova scadenza: 31 marzo ${annoCorrente + 1}`)
    await loadData()
  }

  async function rifiutaRinnovo(id: string) {
    await supabase.from('renewals').update({ stato: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', id)
    await loadData()
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F0F7FC' }}>
      <HeaderADMA />
      <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Caricamento...</div>
    </div>
  )

  const cardStyle = {
    background: 'white', borderRadius: 12, padding: '1rem',
    marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    borderTop: `3px solid ${AZZURRO}`,
  }

  const sectionTitle = {
    fontSize: 11, fontWeight: 600 as const, color: BLU,
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
    marginBottom: '0.5rem',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FC' }}>
      <HeaderADMA />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem' }}>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: BLU }}>Pannello Admin</div>
          <div style={{ fontSize: 13, color: '#888' }}>Primaria di Valdocco · gestione registrazioni e rinnovi</div>
        </div>

        {/* Tab */}
        <div style={{ display: 'flex', background: 'white', borderRadius: 8, padding: 3, width: 'fit-content', marginBottom: '1rem', border: '0.5px solid #dce8f0' }}>
          {(['registrazioni', 'rinnovi'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 18px', fontSize: 13,
              background: tab === t ? BLU : 'none',
              color: tab === t ? 'white' : '#888',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: tab === t ? 600 : 400,
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'registrazioni' && registrazioni.length > 0 && (
                <span style={{ background: '#FAEEDA', color: '#854F0B', padding: '1px 6px', borderRadius: 999, fontSize: 11, marginLeft: 6 }}>
                  {registrazioni.length}
                </span>
              )}
              {t === 'rinnovi' && rinnovi.length > 0 && (
                <span style={{ background: '#E3F4FC', color: BLU, padding: '1px 6px', borderRadius: 999, fontSize: 11, marginLeft: 6 }}>
                  {rinnovi.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Registrazioni */}
        {tab === 'registrazioni' && (
          <div>
            {registrazioni.length === 0 && (
              <div style={{ textAlign: 'center', color: '#888', fontSize: 14, padding: '3rem' }}>Nessuna richiesta in attesa.</div>
            )}
            {registrazioni.map(r => (
              <div key={r.id} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: BLU }}>{r.nome}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{r.paese}{r.citta ? ` · ${r.citta}` : ''} · {new Date(r.submitted_at).toLocaleDateString('it-IT')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ background: '#FAEEDA', color: '#854F0B', padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>
                      Prima registrazione
                    </span>
                    {r.stato === 'in_lavorazione' && (
                      <span style={{ background: '#E3F4FC', color: BLU, padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>
                        In lavorazione: {r.operatore}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    ['Nome', r.nome || '—'],
                    ['Città', r.citta || '—'],
                    ['Paese', r.paese || '—'],
                    ['N. Erezione', r.numero_erezione || '—'],
                    ['Data Erezione', r.data_erezione || '—'],
                    ['N. Aggregazione', r.numero_aggregazione || '—'],
                    ['Data Aggregazione', r.data_aggregazione_originale || '—'],
                    ['Opera', r.opera || '—'],
                    ['Tipo appartenenza', r.tipo_appartenenza || '—'],
                    ['Congregazione', r.congregazione || '—'],
                    ['Diocesi', r.diocesi || '—'],
                    ['Presidente', r.nome_presidente ? `${r.nome_presidente} ${r.cognome_presidente}` : '—'],
                    ['Animatore spirituale', r.nome_animatore ? `${r.nome_animatore} ${r.cognome_animatore}` : '—'],
                    ['Email', r.email || '—'],
                    ['Telefono', r.telefono || '—'],
                    ['Numero membri', r.numero_membri || '—'],
                    ['Ispettoria', r.ispettoria || '—'],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                      <div style={{ fontSize: 13, color: '#333' }}>{value || '—'}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>DIPLOMA ALLEGATO</div>
                  {r.diploma_url ? (
                    <a href={r.diploma_url} target="_blank" rel="noopener noreferrer" style={{ color: BLU, fontSize: 13, textDecoration: 'underline' }}>
                      Visualizza diploma →
                    </a>
                  ) : (
                    <div style={{ fontSize: 13, color: '#aaa' }}>Nessun diploma caricato</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => approvaRegistrazione(r)} style={{ background: BLU, color: 'white', border: 'none', padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Approva e crea account
                  </button>
                  {r.stato === 'pending' && (
                    <button onClick={() => presaInCarico(r.id)} style={{ background: '#F0F7FC', color: BLU, border: `0.5px solid ${BLU}`, padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                      Prendi in carico
                    </button>
                  )}
                  {r.stato === 'in_lavorazione' && (
                    <button onClick={() => rilasciaInCarico(r.id)} style={{ background: '#F0F7FC', color: '#888', border: '0.5px solid #ccc', padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                      Rilascia
                    </button>
                  )}
                  <button onClick={() => rifiutaRegistrazione(r.id)} style={{ background: 'none', color: '#E24B4A', border: '0.5px solid #E24B4A', padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                    Rifiuta
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rinnovi */}
        {tab === 'rinnovi' && (
          <div>
            {rinnovi.length === 0 && (
              <div style={{ textAlign: 'center', color: '#888', fontSize: 14, padding: '3rem' }}>Nessun rinnovo in attesa.</div>
            )}
            {rinnovi.map(r => (
              <div key={r.id} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: BLU }}>{r.groups?.nome}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{r.groups?.paese} · {new Date(r.submitted_at).toLocaleDateString('it-IT')}</div>
                  </div>
                  <span style={{ background: '#E3F4FC', color: BLU, padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>
                    Rinnovo {new Date().getFullYear()}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    ['Nome', r.groups?.nome || '—'],
                    ['Paese', r.groups?.paese || '—'],
                    ['N. Erezione', r.groups?.numero_erezione || '—'],
                    ['Opera', r.groups?.opera || '—'],
                    ['Congregazione', r.groups?.congregazione || '—'],
                    ['Diocesi', r.groups?.diocesi || '—'],
                    ['Ispettoria aggiornata', r.ispettoria || r.groups?.ispettoria || '—'],
                    ['Presidente', r.nome_presidente ? `${r.nome_presidente} ${r.cognome_presidente}` : '—'],
                    ['Animatore spirituale', r.nome_animatore ? `${r.nome_animatore} ${r.cognome_animatore}` : '—'],
                    ['Email', r.email || '—'],
                    ['Telefono', r.telefono || '—'],
                    ['Numero membri', r.numero_membri || '—'],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                      <div style={{ fontSize: 13, color: '#333' }}>{value || '—'}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => approvaRinnovo(r)} style={{ background: BLU, color: 'white', border: 'none', padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Approva rinnovo {new Date().getFullYear()}
                  </button>
                  <button onClick={() => rifiutaRinnovo(r.id)} style={{ background: 'none', color: '#E24B4A', border: '0.5px solid #E24B4A', padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                    Rifiuta
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}