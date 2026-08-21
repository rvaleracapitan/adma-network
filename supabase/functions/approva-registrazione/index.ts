import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const body = await req.json()
    const registrazione_id = body.registrazione_id

    // 1. Leggi la richiesta
    const { data: r, error: e1 } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('id', registrazione_id)
      .single()

    if (e1 || !r) {
      return new Response(JSON.stringify({ error: 'Richiesta non trovata: ' + e1?.message }), { status: 404, headers: corsHeaders })
    }

    // 2. Crea utente auth
    const tempPassword = 'Adma!2026'
    const { data: authData, error: e2 } = await supabase.auth.admin.createUser({
      email: r.email,
      password: tempPassword,
      email_confirm: true,
    })

    if (e2 || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Errore creazione utente: ' + e2?.message }), { status: 400, headers: corsHeaders })
    }

    const userId = authData.user.id

    // 3. Geocoding (opzionale, non blocca)
    let lat = null, lng = null
    try {
      const query = encodeURIComponent(`${r.citta || ''}, ${r.paese || ''}`)
      const geo = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
        headers: { 'User-Agent': 'ADMA-Network/1.0' }
      })
      const geoData = await geo.json()
      if (geoData.length > 0) {
        lat = parseFloat(geoData[0].lat)
        lng = parseFloat(geoData[0].lon)
      }
    } catch (_) {}

    // 4. Inserisci gruppo
    const annoCorrente = new Date().getFullYear()
    const { data: gruppo, error: e3 } = await supabase
      .from('groups')
      .insert({
        user_id: userId,
        nome: r.nome,
        paese: r.paese,
        citta: r.citta,
        numero_erezione: r.numero_erezione,
        numero_aggregazione: r.numero_aggregazione,
        data_aggregazione_originale: r.data_aggregazione_originale,
        data_erezione: r.data_erezione,
        opera: r.opera,
        tipo_appartenenza: r.tipo_appartenenza,
        congregazione: r.congregazione,
        diocesi: r.diocesi,
        ispettoria: r.ispettoria,
        referente: r.referente,
        nome_presidente: r.nome_presidente,
        cognome_presidente: r.cognome_presidente,
        nome_animatore: r.nome_animatore,
        cognome_animatore: r.cognome_animatore,
        email: r.email,
        telefono: r.telefono,
        numero_membri: r.numero_membri,
        scadenza: `${annoCorrente}-12-31`,
        lat: lat,
        lng: lng,
        is_primaria: false,
        diploma_url: r.diploma_url || null,
      })
      .select()
      .single()

    if (e3 || !gruppo) {
      return new Response(JSON.stringify({ error: 'Errore inserimento gruppo: ' + e3?.message }), { status: 500, headers: corsHeaders })
    }

    // 5. Assegna badge anno corrente
    await supabase.from('badges').insert({
      group_id: gruppo.id,
      anno: annoCorrente,
    })

    // 6. Aggiorna stato richiesta
    await supabase
      .from('registration_requests')
      .update({ stato: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', registrazione_id)

    return new Response(JSON.stringify({
      success: true,
      email: r.email,
      password: tempPassword
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: 'Errore generale: ' + e.message }), { status: 500, headers: corsHeaders })
  }
})
