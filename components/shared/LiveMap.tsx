"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { io, Socket } from "socket.io-client"
import { Loader2, Navigation, Clock, ShieldAlert } from "lucide-react"
import "leaflet/dist/leaflet.css"

interface StopType {
  stopName: string
  stopOrder: number
  latitude: number
  longitude: number
}

interface LiveMapProps {
  busId: string
  routeName: string
  stops: StopType[]
}

export function LiveMap({ busId, routeName, stops }: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const busMarkerRef = useRef<any>(null)
  const socketRef = useRef<Socket | null>(null)
  
  const [lastLocation, setLastLocation] = useState<{
    latitude: number
    longitude: number
    speed: number | null
    timestamp: string | null
  } | null>(null)

  // 1. Fetch initial location
  const { data: initialLoc, isLoading: isInitialLocLoading } = useQuery({
    queryKey: ["bus-location", busId],
    queryFn: async () => {
      const res = await fetch(`/api/buses/${busId}/location`)
      if (!res.ok) return null
      return res.json()
    },
    retry: false
  })

  useEffect(() => {
    if (initialLoc) {
      setLastLocation({
        latitude: initialLoc.latitude,
        longitude: initialLoc.longitude,
        speed: initialLoc.speed,
        timestamp: initialLoc.timestamp
      })
    }
  }, [initialLoc])

  // 2. Map and Socket.io Instantiation
  useEffect(() => {
    if (!mapContainerRef.current) return

    let L: any
    
    const initMap = async () => {
      // Dynamic import to bypass Next SSR compiler
      L = await import("leaflet")

      // Standard Leaflet Icon bug fix
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      // Default center to NCR or first stop
      const centerLat = stops.length > 0 ? stops[0].latitude : 28.6139
      const centerLon = stops.length > 0 ? stops[0].longitude : 77.2090

      // Create map instance
      const map = L.map(mapContainerRef.current).setView([centerLat, centerLon], 13)
      mapInstanceRef.current = map

      // Add elegant dark theme tiles matching emerald/slate visuals
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20
      }).addTo(map)

      // Plot route stop markers
      const stopLatLngs: [number, number][] = []
      stops.forEach((stop) => {
        const marker = L.circleMarker([stop.latitude, stop.longitude], {
          radius: 8,
          fillColor: "#10b981", // Emerald green
          color: "#047857",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map)

        marker.bindPopup(`<strong>Stop #${stop.stopOrder}</strong><br/>${stop.stopName}`)
        stopLatLngs.push([stop.latitude, stop.longitude])
      })

      // Draw polyline connecting stops
      if (stopLatLngs.length > 1) {
        L.polyline(stopLatLngs, {
          color: "#10b981",
          weight: 4,
          opacity: 0.7,
          dashArray: "5, 10"
        }).addTo(map)

        // Fit map bounds to show route path
        map.fitBounds(L.polyline(stopLatLngs).getBounds(), { padding: [40, 40] })
      }

      // Draw initial Bus position if resolved
      const startLat = lastLocation?.latitude || (stops.length > 0 ? stops[0].latitude : null)
      const startLon = lastLocation?.longitude || (stops.length > 0 ? stops[0].longitude : null)

      if (startLat && startLon) {
        const busIcon = L.divIcon({
          html: `<div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white border-2 border-slate-900 shadow-lg shadow-emerald-500/50 animate-pulse"><svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4M8 17h12m0 0l-4-4m4 4l-4 4"/></svg></div>`,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })

        const busMarker = L.marker([startLat, startLon], { icon: busIcon }).addTo(map)
        busMarker.bindPopup(`<strong>Active Fleet Bus</strong><br/>Tracking: ${routeName}`)
        busMarkerRef.current = busMarker
      }

      // Setup Socket tracking
      const socket = io("http://localhost:3001")
      socketRef.current = socket

      socket.on("connect", () => {
        console.log(`[LIVEMAP] Connected to tracking socket. Joining room: bus:${busId}`)
        socket.emit("join-bus-room", busId)
      })

      socket.on("location-update", (data: any) => {
        console.log("[LIVEMAP] Received location ping update:", data)
        
        setLastLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
          timestamp: data.timestamp
        })

        // Pan map and update marker position dynamically
        if (mapInstanceRef.current && busMarkerRef.current) {
          const newPos = new L.LatLng(data.latitude, data.longitude)
          busMarkerRef.current.setLatLng(newPos)
          mapInstanceRef.current.panTo(newPos)
        }
      })
    }

    initMap()

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [busId, stops])

  return (
    <div className="space-y-4">
      {/* Map display */}
      <div 
        ref={mapContainerRef} 
        className="h-[380px] w-full rounded-2xl overflow-hidden border border-white/5 shadow-inner relative z-10" 
      />

      {/* Telemetry metadata footer info */}
      <div className="grid grid-cols-3 gap-4 text-slate-400 text-xs bg-slate-900/60 border border-white/5 rounded-xl p-3.5">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-emerald-400 shrink-0" />
          <div>
            <span className="block text-[10px] text-slate-500 font-semibold uppercase">Velocity</span>
            <span className="font-bold text-white font-mono">
              {lastLocation?.speed ? `${lastLocation.speed.toFixed(1)} km/h` : "0.0 km/h"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-400 shrink-0" />
          <div>
            <span className="block text-[10px] text-slate-500 font-semibold uppercase">Last Update</span>
            <span className="font-bold text-white">
              {lastLocation?.timestamp 
                ? new Date(lastLocation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
                : "Idle"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
          <div>
            <span className="block text-[10px] text-slate-500 font-semibold uppercase">Status</span>
            <span className={`font-bold ${lastLocation?.speed ? "text-emerald-400" : "text-amber-400"}`}>
              {lastLocation?.speed ? "Running" : "Stopped"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
