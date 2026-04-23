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
  myGroupId: string
  onSelectGroup: (g: Gruppo) => void
}

export default function MappaLeaflet({ groups, myGroupId, onSelectGroup }: Props) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) return

    import('leaflet').then(L => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      mapRef.current = L.map(containerRef.current!).setView([20, 10], 2)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || groups.length === 0) return

    import('leaflet').then(L => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      groups.forEach(g => {
        if (!g.lat || !g.lng) return
        const isMe = g.id === myGroupId
        const color = isMe ? '#534AB7' : '#1D9E75'
        const size = isMe ? 14 : 10

        const icon = L.divIcon({
          html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
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
  }, [groups, myGroupId])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}