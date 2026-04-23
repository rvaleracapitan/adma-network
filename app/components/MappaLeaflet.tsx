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
  searchTerm: string
  onSelectGroup: (g: Gruppo) => void
}

export default function MappaLeaflet({ groups, searchTerm, onSelectGroup }: Props) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])

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
        50% { transform: scale(1.4); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      .marker-pulse { animation: pulse 1s ease-in-out infinite; }
    `
    document.head.appendChild(style)

    import('leaflet').then(L => {
      mapRef.current = L.map(containerRef.current!).setView([20, 10], 2)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current)

      // Marker fisso Valdocco
      const valdoccoIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#534AB7;border:3px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.4)"></div>`,
        iconSize: [16, 16],
        className: ''
      })
      L.marker([45.07, 7.69], { icon: valdoccoIcon })
        .addTo(mapRef.current)
        .bindPopup('<div style="font-family:sans-serif;font-weight:500">ADMA Primaria Valdocco</div>')
    })

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || groups.length === 0) return

    import('leaflet').then(L => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      const q = searchTerm.toLowerCase().trim()

      groups.forEach(g => {
        if (!g.lat || !g.lng) return

        const isHighlighted = q.length > 0 && (
          g.nome?.toLowerCase().includes(q) ||
          g.paese?.toLowerCase().includes(q) ||
          g.referente?.toLowerCase().includes(q)
        )

        const color = isHighlighted ? '#185FA5' : '#B4B2A9'
        const size = isHighlighted ? 13 : 9
        const pulse = isHighlighted ? 'marker-pulse' : ''

        const icon = L.divIcon({
          html: `<div class="${pulse}" style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
          iconSize: [size, size],
          className: ''
        })

        const marker = L.marker([g.lat, g.lng], { icon }).addTo(mapRef.current)
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:160px">
            <div style="font-weight:500;font-size:14px;margin-bottom:4px">${g.nome}</div>
            <div style="font-size:12px;color:#888;margin-bottom:4px">${g.paese} · ${g.numero_membri} membri</div>
            <div style="font-size:12px;color:#888">${g.referente}</div>
          </div>
        `)
        marker.on('click', () => onSelectGroup(g))
        markersRef.current.push(marker)
      })
    })
  }, [groups, searchTerm])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}