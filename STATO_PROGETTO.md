# ADMA Network — Stato del Progetto

## Stack tecnologico
- **Frontend**: Next.js (TypeScript) su Vercel
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Realtime, Edge Functions)
- **Mappa**: Leaflet.js con tile CartoDB
- **Repository**: github.com/rvaleracapitan/adma-network
- **URL produzione**: adma-network.vercel.app
- **Supabase URL**: https://osxplchohewsothxtdoi.supabase.co

## Colori ADMA ufficiali
- BLU = '#1A7AB8'
- AZZURRO = '#29ABE2'
- Sfondo pagine = '#F0F7FC'

## Database — Tabelle principali

### groups
- id, user_id (FK auth.users), nome, paese, citta
- numero_erezione, data_erezione (fisso)
- numero_aggregazione, data_aggregazione_originale (fisso)
- opera, tipo_appartenenza, congregazione (SDB/FMA), diocesi (fisso)
- ispettoria, nome_presidente, cognome_presidente (aggiornabile)
- nome_animatore, cognome_animatore, referente (aggiornabile)
- email, telefono, numero_membri (aggiornabile)
- scadenza (31 marzo anno successivo)
- lat, lng (geocoding automatico)
- is_primaria (true solo per Valdocco)
- diploma_url (URL Storage Supabase)

### registration_requests
Stessi campi di g
cat > STATO_PROGETTO.md << 'EOF'
# ADMA Network — Stato del Progetto

## Stack tecnologico
- **Frontend**: Next.js (TypeScript) su Vercel
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Realtime, Edge Functions)
- **Mappa**: Leaflet.js con tile CartoDB
- **Repository**: github.com/rvaleracapitan/adma-network
- **URL produzione**: adma-network.vercel.app
- **Supabase URL**: https://osxplchohewsothxtdoi.supabase.co

## Colori ADMA ufficiali
- BLU = '#1A7AB8'
- AZZURRO = '#29ABE2'
- Sfondo pagine = '#F0F7FC'

## Database — Tabelle principali

### groups
- id, user_id (FK auth.users), nome, paese, citta
- numero_erezione, data_erezione (fisso)
- numero_aggregazione, data_aggregazione_originale (fisso)
- opera, tipo_appartenenza, congregazione (SDB/FMA), diocesi (fisso)
- ispettoria, nome_presidente, cognome_presidente (aggiornabile)
- nome_animatore, cognome_animatore, referente (aggiornabile)
- email, telefono, numero_membri (aggiornabile)
- scadenza (31 marzo anno successivo)
- lat, lng (geocoding automatico)
- is_primaria (true solo per Valdocco)
- diploma_url (URL Storage Supabase)

### registration_requests
Stessi campi di groups + stato (pending/approved/rejected) + submitted_at + reviewed_at

### renewals
group_id, referente, email, telefono, numero_membri,
nome_presidente, cognome_presidente, nome_animatore, cognome_animatore,
ispettoria, stato, submitted_at, reviewed_at

### badges
group_id, anno — unique(group_id, anno)
Timbro annuale assegnato dalla Primaria all'approvazione del rinnovo

### messages
from_group_id, to_group_id, content, created_at, read

## File principali

### Pagine
- app/page.tsx — Login
- app/registrazione/page.tsx — Registrazione pubblica
- app/dashboard/profilo/page.tsx — Profilo gruppo loggato
- app/dashboard/mappa/page.tsx — Mappa + lista + chat
- app/dashboard/gruppo/[id]/page.tsx — Profilo pubblico (ID da window.location.pathname)
- app/dashboard/rinnovo/page.tsx — Rinnovo annuale (1 gen - 31 mar)
- app/dashboard/admin/page.tsx — Pannello Primaria
- app/dashboard/messaggi/page.tsx — Inbox
- app/dashboard/password/page.tsx — Cambio password

### Componenti
- app/components/HeaderADMA.tsx — Header comune
- app/components/MappaLeaflet.tsx — Mappa Leaflet

### Edge Functions
- supabase/functions/approva-registrazione/index.ts — Crea account + geocoding

## Logica business

### Registrazione
Form completo → registration_requests → Primaria approva → Edge Function crea account auth + inserisce in groups con geocoding automatico OpenStreetMap

### Rinnovo annuale
Finestra 1 gennaio - 31 marzo. Approvazione Primaria → aggiorna dati groups + assegna badge anno corrente. Scadenza sempre 31 marzo anno successivo.

### Mappa
- Azzurro = attivi (scadenza > oggi)
- Grigio = non attivi
- Mio gruppo = dot blu pulsante con anello animato
- Primaria = foto Basilica Maria Ausiliatrice
- Click marker → popup con onclick="window.location.href='/dashboard/gruppo/ID'"

### Timbri
Cerchi con foto Basilica semitrasparente + anno + "✓ rinnovato"

## Utenti
- Admin Primaria: renato.valera@libero.it (is_primaria=true)
- Dopo login → redirect a /dashboard/profilo

## RLS Policy
```sql
create policy "Gruppi visibili agli autenticati"
  on public.groups for select to authenticated
  using (is_primaria = true or user_id = auth.uid() or scadenza >= current_date);
```

## Dati caricati (test)
- ~91 gruppi manuali con coordinate reali
- ~990 gruppi fake distribuiti nel mondo
- ~80% attivi (scadenza 2027-03-31, badge 2026 assegnato)
- ~20% non rinnovati (scadenza 2025-03-31, punti grigi)

## Note tecniche importanti
- Mappa: usa useState(mapReady) per triggare re-render
- Profilo gruppo: usa window.location.pathname.split('/').pop() (useParams non funziona)
- Link popup Leaflet: usa onclick="window.location.href=..." (non tag a href)
- Mappa sempre nel DOM con display:none (non smontare)
- RLS senza subquery ricorsive
- Inserimento dati massivo: usa service_role key (non anon key)

## TODO pendenti
1. Email automatica con Resend (credenziali al nuovo gruppo)
2. Email notifica rinnovo in scadenza
3. Recupero password (link dimenticata nel login)
4. Responsive mobile
5. Collegamento dominio personalizzato (sottodominio admadonbosco.org)
6. Diploma visibile nella lista gruppi della mappa
7. Upload diplomi testato end-to-end
