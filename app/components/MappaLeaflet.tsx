'use client'
import { useEffect, useRef } from 'react'

interface Gruppo {
  id: string
  nome: string
  paese: string
  referente: string
  numero_membri: number
  lat: number
  lng: number
  scadenza: string
  email: string
}

interface Props {
  groups: Gruppo[]
  myGroupId?: string
  searchTerm: string
  onSelectGroup: (g: Gruppo) => void
}

const BLU = '#1A7AB8'
const AZZURRO = '#29ABE2'

export default function MappaLeaflet({ groups, myGroupId, searchTerm, onSelectGroup }: Props) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])
  const mapReadyRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.6); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes myPulse {
        0% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.5); opacity: 0.3; }
        100% { transform: scale(1); opacity: 0.8; }
      }
      .marker-pulse { animation: pulse 1s ease-in-out infinite; }
      .my-pulse { animation: myPulse 1.5s ease-in-out infinite; }
    `
    document.head.appendChild(style)

    import('leaflet').then(L => {
      mapRef.current = L.map(containerRef.current!).setView([20, 10], 2)
      mapReadyRef.current = true
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO'
      }).addTo(mapRef.current)

      const valdoccoIcon = L.divIcon({
        html: `<div style="
          width:38px;height:38px;border-radius:50%;
          background:white;
          border:3px solid ${AZZURRO};
          overflow:hidden;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
        ">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Torino-Basilica_Maria_Ausiliatrice.jpg/320px-Torino-Basilica_Maria_Ausiliatrice.jpg"
            style="width:100%;height:100%;object-fit:cover;"
            onerror="this.parentElement.innerHTML='<div style=background:${BLU};width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px>A</div>'"
          />
        </div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        className: ''
      })

      L.marker([45.07, 7.69], { icon: valdoccoIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:180px;text-align:center;">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Torino-Basilica_Maria_Ausiliatrice.jpg/320px-Torino-Basilica_Maria_Ausiliatrice.jpg"
              style="width:100%;height:90px;object-fit:cover;border-radius:6px;margin-bottom:8px;"
            />
            <div style="font-weight:700;color:${BLU};font-size:13px;">ADMA Primaria</div>
            <div style="font-size:11px;color:#888;margin-top:2px;">Basilica di Maria Ausiliatrice<br>Valdocco, Torino</div>
          </div>
        `)
    })

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !mapReadyRef.current || groups.length === 0) return

    import('leaflet').then(L => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      const q = searchTerm.toLowerCase().trim()

      groups.forEach(g => {
        if (!g.lat || !g.lng) return

        // Marker del mio gruppo — pulsante e distintivo
        if (g.id === myGroupId) {
          const icon = L.divIcon({
            html: `<div style="position:relative;width:28px;height:28px;">
              <div class="my-pulse" style="
                position:absolute;top:0;left:0;
                width:28px;height:28px;border-radius:50%;
                background:rgba(41,171,226,0.25);
                border:2.5px solid ${AZZURRO};
              "></div>
              <div style="
                position:absolute;top:7px;left:7px;
                width:14px;height:14px;border-radius:50%;
                background:${BLU};
                border:2.5px solid white;
                box-shadow:0 2px 6px rgba(0,0,0,0.35);
              "></div>
            </div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            className: ''
          })
          const marker = L.marker([g.lat, g.lng], { icon }).addTo(mapRef.current)
          marker.bindPopup(`
            <div style="font-family:sans-serif;text-align:center;min-width:150px;">
              <div style="font-weight:700;color:${BLU};font-size:13px;">◆ Il mio gruppo</div>
              <div style="font-size:12px;color:#555;margin-top:3px;">${g.nome}</div>
              <div style="font-size:11px;color:#888;">${g.paese} · ${g.numero_membri} membri</div>
            </div>
          `)
          markersRef.current.push(marker)
          return
        }

        const isAttivo = g.scadenza && new Date(g.scadenza) >= new Date()
        const isHighlighted = q.length > 0 && (
          g.nome?.toLowerCase().includes(q) ||
          g.paese?.toLowerCase().includes(q) ||
          g.referente?.toLowerCase().includes(q)
        )
        const isDimmed = q.length > 0 && !isHighlighted

        const color = isAttivo ? AZZURRO : '#B4B2A9'
        const size = isHighlighted ? 15 : 10
        const pulse = isHighlighted ? 'marker-pulse' : ''
        const opacity = isDimmed ? 0.15 : 1

        const icon = L.divIcon({
          html: `<div class="${pulse}" style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:${color};
            border:2px solid white;
            box-shadow:0 1px 5px rgba(0,0,0,0.25);
            opacity:${opacity};
          "></div>`,
          iconSize: [size, size],
          iconAnchor: [size/2, size/2],
          className: ''
        })

        const marker = L.marker([g.lat, g.lng], { icon }).addTo(mapRef.current)
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:160px;">
            <div style="font-weight:600;font-size:13px;color:${BLU};margin-bottom:3px;">${g.nome}</div>
            <div style="font-size:11px;color:#888;margin-bottom:2px;">${g.paese} · ${g.numero_membri} membri</div>
            <div style="font-size:11px;color:#888;margin-bottom:6px;">${g.referente}</div>
            <div style="
              display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:500;
              background:${isAttivo ? '#E3F4FC' : '#f0f0ee'};
              color:${isAttivo ? BLU : '#888'};
            ">${isAttivo ? 'Attivo' : 'Non attivo'}</div>
          </div>
        `)
        marker.on('click', () => onSelectGroup(g))
        markersRef.current.push(marker)
      })
    })
  }, [groups, myGroupId, searchTerm])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}