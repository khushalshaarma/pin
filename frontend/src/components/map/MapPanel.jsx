import React, { useRef, useEffect, useState } from 'react'

const token = import.meta.env.VITE_MAPBOX_TOKEN || ''

export default function MapPanel({ onPick }){
  const mapEl = useRef()
  const mapRef = useRef()
  const markerRef = useRef()
  const freeMapEl = useRef()
  const leafletMapRef = useRef(null)
  const [mapError, setMapError] = useState(null)
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')
  // projection removed; always use mercator / 2D map
  const [pins, setPins] = useState([])
  const leafletMarkersRef = useRef({})

  useEffect(()=>{
    // Initialize map or free alternatives depending on presence of token

    if (token) {
      // Mapbox map handled elsewhere — keep previous behavior when token exists
      let mapboxgl
      let map
      import('mapbox-gl').then((m)=>{
        mapboxgl = m.default || m
        mapboxgl.accessToken = token

        map = new mapboxgl.Map({
          container: mapEl.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [78.9629,20.5937],
          zoom: 2.5,
          projection: { name: 'mercator' }
        })

        map.on('click', (e)=>{
          const { lng, lat } = e.lngLat
          try{ if (markerRef.current) markerRef.current.remove() }catch(e){}
          markerRef.current = new mapboxgl.Marker().setLngLat([lng,lat]).addTo(map)
          const pin = { id: Date.now(), lat, lng }
          setPins(p=>[pin, ...p])
          if (onPick) onPick(lat,lng)
        })
        mapRef.current = map
      }).catch(err=>{
        console.error('Mapbox load error', err)
        setMapError('Failed to load Mapbox map')
      })

      return ()=>{
        try{ if (mapRef.current) mapRef.current.remove() }catch(e){}
        mapRef.current = null
      }
    }

    // If no Mapbox token: initialize free map or globe based on projection
    let cleanup = () => {}
    // inject leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const initLeaflet = async () => {
      const L = (await import('leaflet'))
      if (freeMapEl.current && !leafletMapRef.current) {
        // ensure container has an explicit size so Leaflet can initialize
        try{ freeMapEl.current.style.height = `${window.innerHeight - 64 - 24}px` }catch(e){}
        const map = L.map(freeMapEl.current).setView([20,78], 3)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map)
        leafletMapRef.current = { map, L }
        map.on('click', e=>{
          const { lat, lng } = e.latlng
          try{ if (leafletMapRef.current._marker) leafletMapRef.current._marker.remove() }catch(e){}
          const pin = { id: Date.now(), lat, lng }
          setPins(p=>[pin, ...p])
          if (onPick) onPick(lat,lng)
          // also add marker reference for later syncing
          try{ leafletMarkersRef.current[pin.id] = L.marker([lat,lng]).addTo(map) }catch(e){}
          leafletMapRef.current._marker = leafletMarkersRef.current[pin.id]
        })
      }
    }

    // Always initialize Leaflet free map when Mapbox token is not present.
    initLeaflet().catch(()=>{})

    cleanup = ()=>{
      try{ if (leafletMapRef.current && leafletMapRef.current.map) leafletMapRef.current.map.remove() }catch(e){}
      leafletMapRef.current = null
      leafletMarkersRef.current = {}
      // nothing globe-specific to clean up
      if (link && link.parentNode) link.parentNode.removeChild(link)
    }

    return cleanup
  }, [])

  const handleManualSubmit = (e)=>{
    e.preventDefault()
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)
    if (!isFinite(lat) || !isFinite(lng)) return alert('Invalid coordinates')
    if (onPick) onPick(lat,lng)
  }

  const handleGeolocate = ()=>{
    if (!navigator.geolocation) return alert('Geolocation not available')
    navigator.geolocation.getCurrentPosition(pos=>{
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setManualLat(lat.toFixed(6))
      setManualLng(lng.toFixed(6))
      if (onPick) onPick(lat,lng)
    }, err=>alert('Geolocation error: '+err.message))
  }

  if (!token) {
    // free map view rendered; initialization handled by the main effect above
    return (
      <div style={{height:'100%', position:'relative', padding:12, boxSizing:'border-box'}}>
        <div style={{position:'absolute', zIndex:5, right:12, top:12, display:'flex', gap:8}}>
          <button className="btn" onClick={()=>{
            // reset view: clear pins and recenter
            setPins([])
            try{ if (leafletMapRef.current && leafletMapRef.current.map) leafletMapRef.current.map.setView([20,78],3) }catch(e){}
          }} style={{minWidth:72}}>Reset</button>
        </div>

        <div style={{position:'absolute', left:12, top:12, zIndex:4, width:300, pointerEvents:'auto'}}>
          <div className="card" style={{padding:12}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontWeight:800}}>Pin Manager</div>
              <div style={{fontSize:12, color:'var(--muted)'}}>{pins.length} pins</div>
            </div>
            <div style={{marginTop:8, maxHeight:160, overflow:'auto'}}>
              {pins.length===0 ? <div className="muted">No pins yet — click the map to add.</div> : (
                pins.map(p=> (
                  <div key={p.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8}}>
                    <div style={{fontSize:13}}>{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</div>
                    <div style={{display:'flex', gap:6}}>
                      <button className="btn" onClick={()=>{ try{ if (leafletMapRef.current && leafletMapRef.current.map) leafletMapRef.current.map.setView([p.lat,p.lng], 10) }catch(e){} }} title="Focus">View</button>
                      <button className="btn" onClick={()=>{
                        // remove pin from state
                        setPins(xs=>xs.filter(s=>s.id!==p.id))
                        // remove leaflet marker if exists
                        try{ const m = leafletMarkersRef.current[p.id]; if (m && leafletMapRef.current && leafletMapRef.current.map) { m.remove(); delete leafletMarkersRef.current[p.id] } }catch(e){}
                        // no globe to remove
                      }} title="Remove">✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{marginTop:8, display:'flex', gap:8}}>
              <button className="btn" onClick={()=>{ navigator.clipboard && navigator.clipboard.writeText(pins.map(p=>`${p.lat},${p.lng}`).join('\n')) }} disabled={pins.length===0}>Copy</button>
              <button className="btn" onClick={()=>{ const csv = 'lat,lng\n'+pins.map(p=>`${p.lat},${p.lng}`).join('\n'); const blob = new Blob([csv],{type:'text/csv'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='pins.csv'; a.click(); URL.revokeObjectURL(url); }} disabled={pins.length===0}>Export</button>
            </div>
          </div>
        </div>

        <div ref={freeMapEl} className="leaflet-container" style={{height:'calc(100vh - 64px)', borderRadius:12, overflow:'hidden'}} />

        <div style={{position:'absolute', left:12, bottom:12}}>
          <button className="btn" onClick={handleGeolocate}>Use My Location</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{position:'relative'}}>
      <div style={{position:'absolute', zIndex:3, right:12, top:12, display:'flex', gap:8}}>
        <button className="btn" onClick={()=>{
          // reset view to world
          try{ const m = mapRef.current; if (m) m.flyTo({center:[0,20], zoom:1.5}) }catch(e){}
        }}>Reset</button>
      </div>
      <div className="mapbox-map" ref={mapEl} style={{height:'100%'}}></div>
    </div>
  )
}
