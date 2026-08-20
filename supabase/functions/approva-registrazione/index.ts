import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function geocode(citta: string, paese: string): Promise<{ lat: number, lng: number } | null> {
  try {
    const query = encodeURIComponent(`${citta}, ${paese}`)
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
      headers: { 'User-Agent': 'ADMA-Network/1.0' }
    })
    const data = await res.json()
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
  } catch (e) {
    console.error('Geocoding error:', e)
  }
  return null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { registrazione_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: r } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('id', registrazione_id)
      .single()

    if (!r) return new Response(JSON.stringify({ error: 'Richiesta non trovata' }), { status: 404, headers: corsHeaders })

    const tempPassword = 'ADMA' + Math.random().toString(36).slice(2, 8).toUpperCase() + '!'

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: r.email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError) return new Response(JSON.stringify({ error: authError.message }), { status: 400, headers: corsHeaders })

    // Scadenza al 31 dicembre anno corrente
    const annoCorrente = new Date().getFullYear()
    const scadenza = `${annoCorrente}-12-31`

    const coords = await geocode(r.citta || r.paese, r.paese)

    const { data: gruppo } = await supabase.from('groups').insert({
      user_id: authData.user.id,
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
      scadenza: scadenza,
      lat: coords?.lat || null,
      lng: coords?.lng || null,
      is_primaria: false,
      diploma_url: r.diploma_url || null,
    }).select().single()

    // Assegna timbro anno corrente
    if (gruppo) {
      await supabase.from('badges').insert({
        group_id: gruppo.id,
        anno: annoCorrente,
      })
    }

    await supabase.from('registration_requests')
      .update({ stato: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', registrazione_id)

    return new Response(JSON.stringify({
      success: true,
      email: r.email,
      password: tempPassword
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
  }
})
