const express = require('express')
const router = express.Router()
const axios = require('axios')

const SAT_KEY = (process.env.SATELLITE_API_KEY || '').replace(/^"|"$/g, '').trim()

// Simple proxy endpoint to fetch a NASA GIBS or Earth imagery tile.
// This example uses the NASA GIBS tile service (no API key required for basic tiles)
// If you want to use NASA Earth API or other endpoints that require a key, use process.env.SATELLITE_API_KEY.

router.get('/proxy', async (req, res) => {
  const { lat, lng } = req.query
  if (!lat || !lng) return res.status(400).json({ error: 'lat & lng required' })

  // We'll return a static map tile from NASA GIBS using the Global Imagery Browse Service (GIBS)
  // For simplicity use the MODIS Terra True Color (VIIRS or MODIS) layer via Web Map Tile Service URL pattern.

  // Convert lat,lng to tile parameters (use fixed zoom)
  const zoom = 6
  // We'll just proxy a simple static snapshot using the Mapbox-like static tiles approach via GIBS WMTS
  const tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2020-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`

  // As calculating x/y tiles is non-trivial here, we'll fallback and redirect to a NASA Worldview snapshot service
  // Using the Worldview API to get a static image (note: limited usage)
  const snapshotUrl = `https://worldview.earthdata.nasa.gov/thumbnail?&v=2020-01-01&x=${lng}&y=${lat}&z=6&w=800&h=400`

  try{
    if (SAT_KEY) {
      // Use NASA Earth Imagery API: returns an image for given lat/lon
      // Example: https://api.nasa.gov/planetary/earth/imagery?lat=1.5&lon=100.75&dim=0.15&api_key=DEMO_KEY
      const dim = 0.12
      const nasaUrl = `https://api.nasa.gov/planetary/earth/imagery?lat=${lat}&lon=${lng}&dim=${dim}&api_key=${SAT_KEY}`
      const resp = await axios.get(nasaUrl, { responseType: 'arraybuffer', timeout: 10000 })
      const contentType = resp.headers['content-type'] || 'image/jpeg'
      res.set('Content-Type', contentType)
      return res.send(Buffer.from(resp.data, 'binary'))
    }

    // Redirect client to the snapshotUrl (so browser can load directly). This avoids proxying large binary through server.
    return res.redirect(snapshotUrl)
  }catch(err){
    console.error('Satellite proxy error', err.message)
    if (err.response){
      console.error('Satellite service response', err.response.status, err.response.data)
    }
    return res.status(500).json({ error: 'satellite proxy failed', detail: err.message })
  }
})

module.exports = router
