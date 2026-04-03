"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix Leaflet default icon in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl:
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="#ef4444" stroke="white" stroke-width="1.5"/></svg>'
    ),
  iconRetinaUrl:
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="#ef4444" stroke="white" stroke-width="1.5"/></svg>'
    ),
  shadowUrl: "",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

interface RecenterProps {
  lat: number
  lng: number
  raioKm: number
}

function Recenter({ lat, lng, raioKm }: RecenterProps) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], raioKm <= 5 ? 13 : raioKm <= 15 ? 12 : raioKm <= 30 ? 11 : 10)
  }, [lat, lng, raioKm, map])
  return null
}

interface LeadsMapaProps {
  lat: number
  lng: number
  raioKm: number
}

export default function LeadsMapa({ lat, lng, raioKm }: LeadsMapaProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={12}
      style={{ height: "160px", width: "100%", borderRadius: "8px" }}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom={false}
      dragging={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Circle
        center={[lat, lng]}
        radius={raioKm * 1000}
        pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.1, weight: 2 }}
      />
      <Recenter lat={lat} lng={lng} raioKm={raioKm} />
    </MapContainer>
  )
}
