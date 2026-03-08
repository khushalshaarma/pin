const express = require('express')
const router = express.Router()
const axios = require('axios')

const SAT_KEY = (process.env.SATELLITE_API_KEY || '').replace(/^"|"$/g, '').trim()

// Simple proxy endpoint to fetch a NASA GIBS or Earth imagery tile.
// This example uses the NASA GIBS tile service (no API key required for basic tiles)
// If you want to use NASA Earth API or other endpoints that require a key, use process.env.SATELLITE_API_KEY.

router.get('/proxy', async (req, res) => {
  let { lat, lng } = req.query
  if (!lat || !lng) return res.status(400).json({ error: 'lat & lng required' })
  // normalize to numbers and constrain longitude to [-180,180]
  lat = parseFloat(lat)
  lng = parseFloat(lng)
  if (!isFinite(lat) || !isFinite(lng)) return res.status(400).json({ error: 'invalid lat or lng' })
  // normalize longitude into -180..180
  lng = ((((lng + 180) % 360) + 360) % 360) - 180

  // We'll return a static map tile from NASA GIBS using the Global Imagery Browse Service (GIBS)
  // For simplicity use the MODIS Terra True Color (VIIRS or MODIS) layer via Web Map Tile Service URL pattern.

  // Convert lat,lng to tile parameters (use fixed zoom)
  const zoom = 6
  // We'll just proxy a simple static snapshot using the Mapbox-like static tiles approach via GIBS WMTS
  const tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2020-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`

  // As calculating x/y tiles is non-trivial here, we'll fallback and redirect to a NASA Worldview snapshot service
  // Using the Worldview API to get a static image (note: limited usage)
  const snapshotUrl = `https://worldview.earthdata.nasa.gov/thumbnail?&v=2020-01-01&x=${lng}&y=${lat}&z=6&w=800&h=400`

  try {
    if (SAT_KEY) {
      // Use NASA Earth Imagery API: returns an image for given lat/lon
      // Example: https://api.nasa.gov/planetary/earth/imagery?lat=1.5&lon=100.75&dim=0.15&api_key=DEMO_KEY
      const dim = 0.12
      const nasaUrl = `https://api.nasa.gov/planetary/earth/imagery?lat=${lat}&lon=${lng}&dim=${dim}&api_key=${SAT_KEY}`
      // increase timeout to allow NASA to respond
      const resp = await axios.get(nasaUrl, { responseType: 'arraybuffer', timeout: 30000 })
      const contentType = resp.headers['content-type'] || 'image/jpeg'
      res.set('Content-Type', contentType)
      return res.send(Buffer.from(resp.data, 'binary'))
    }

    // No key: redirect client to the snapshotUrl (so browser can load directly).
    return res.redirect(snapshotUrl)
  } catch (err) {
    // On error (timeout or provider error) fall back to a reliable static tile
    console.error('Satellite proxy error', err && err.message)
    if (err && err.response) {
      console.error('Satellite service response', err.response.status)
    }

    // Fallback: use Wikimedia static map tile (no API key required)
    const wikimedia = `https://maps.wikimedia.org/img/osm-intl,6,${lat},${lng},800x400.png`
    try {
      return res.redirect(wikimedia)
    } catch (e) {
      return res.status(500).json({ error: 'satellite proxy failed', detail: (err && err.message) || String(e) })
    }
  }
})

module.exports = router
