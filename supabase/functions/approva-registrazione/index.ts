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

    const scadenza = new Date()
    scadenza.setFullYear(scadenza.getFullYear() + 1)

    await supabase.from('groups').insert({
      user_id: authData.user.id,
      nome: r.nome,
      paese: r.paese,
      citta: r.citta,
      numero_erezione: r.numero_erezione,
      numero_aggregazione: r.numero_aggregazione,
      data_aggregazione_originale: r.data_aggregazione_originale,
      referente: r.referente,
      email: r.email,
      telefono: r.telefono,
      numero_membri: r.numero_membri,
      scadenza: scadenza.toISOString().split('T')[0],
      is_primaria: false,
    })

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