import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

export default function Dashboard({ location }){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if (!location) return setData(null)
    setLoading(true)
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'
    axios.post(`${API_BASE}/location/preview`, location)
      .then(r=>setData(r.data))
      .catch(e=>{
        console.error('Preview request failed', e)
        setData({ error: e?.response?.data?.error || 'Failed to fetch preview' })
      })
      .finally(()=>setLoading(false))
  }, [location])

  const cardAnim = { hidden:{opacity:0, y:8}, show:{opacity:1, y:0, transition:{duration:0.45}} }

  if (!location) return (
    <motion.div className="card" initial="hidden" animate="show" variants={cardAnim}>
      <div className="title">No Location Selected</div>
      <div className="muted">Click anywhere on the map to preview a location</div>
    </motion.div>
  )
  if (loading) return (
    <motion.div className="card" initial="hidden" animate="show" variants={cardAnim}>
      <div className="skeleton h-36"/>
    </motion.div>
  )
  if (!data) return null

  if (data.error) {
    return (
      <div className="card">
        <div className="title">Preview Error</div>
        <div className="muted">{data.error}</div>
      </div>
    )
  }

  return (
    <div>
      <motion.div className="card" initial="hidden" animate="show" variants={cardAnim}>
        <div className="title">Location</div>
        <div className="muted">{(data.location && data.location.name) || `${location.lat}, ${location.lng}`}</div>
        <div style={{marginTop:8}}>Lat: {location.lat.toFixed(5)} Lng: {location.lng.toFixed(5)}</div>
      </motion.div>

      <motion.div className="card" initial="hidden" animate="show" variants={cardAnim}>
        <div className="title">Weather</div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{fontSize:18,fontWeight:700}}>{data.weather?.description || 'Unknown'}</div>
            <div className="muted">Clouds: {data.weather?.clouds ?? '—'}% · Visibility: {data.weather?.visibility ?? '—'}m</div>
          </div>
          <div className="large-number">{data.weather?.temp ? `${Math.round(data.weather.temp)}°C` : '—'}</div>
        </div>
      </motion.div>

      <motion.div className="card" initial="hidden" animate="show" variants={cardAnim}>
        <div className="title">Scenic Score</div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{fontSize:28,fontWeight:800, color:'#fff'}}>{data.analysis?.scenicScore ?? '—'} / 100</div>
            <div className="muted">Visibility: {data.analysis?.visibility ?? '—'} · Crowd: {data.analysis?.crowdLevel ?? '—'}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontWeight:700}}>{data.analysis.travelWorthiness}</div>
            <div className="muted">Recommendation</div>
          </div>
        </div>
      </motion.div>

      <motion.div className="card" initial="hidden" animate="show" variants={cardAnim}>
        <div className="title">Visual Preview</div>
        <div style={{marginTop:10}}>
          <div className="muted">Satellite</div>
          <motion.img src={data.satellite?.url || 'https://maps.wikimedia.org/img/osm-intl,13,0,0,800x400.png'} alt="satellite" className="visual-image" layoutId="satellite" initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} transition={{duration:0.6}} />
        </div>
        <div style={{marginTop:12}}>
          <div className="muted">Latest Photo</div>
          <motion.img src={(data.photos && data.photos[0] && data.photos[0].url) || 'https://picsum.photos/800/500?random=9'} alt="photo" className="visual-image" initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:0.6, delay:0.06}} />
        </div>
        <div style={{marginTop:12}}>
          <div className="muted">Live Webcam</div>
          {data.webcams && data.webcams.length > 0 ? (
            <div style={{marginTop:8}}>
              <div className="muted">{data.webcams[0].title || 'Nearby Webcam'}</div>
              {/* If the webcam url is an image we show it; otherwise render a link to open it */}
              {typeof data.webcams[0].url === 'string' && (/\.(jpg|jpeg|png|gif)$/.test(data.webcams[0].url) || data.webcams[0].url.startsWith('http')) ? (
                <motion.img src={data.webcams[0].url} alt="webcam" className="visual-image" initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:0.6, delay:0.12}} />
              ) : (
                <div className="muted">Live feed available — <a href={data.webcams[0].url} target="_blank" rel="noreferrer">open in new tab</a></div>
              )}
            </div>
          ) : (
            <div className="muted">No nearby webcams found</div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
