const geoService = require('../services/geocodeService')
const weatherService = require('../services/weatherService')
const webcamService = require('../services/webcamService')
const photoService = require('../services/photoService')
const satelliteService = require('../services/satelliteService')
const analysisService = require('../services/analysisService')

exports.reverseGeocode = async (req, res) => {
  const { lat, lng } = req.query
  try {
    const name = await geoService.reverse(lat, lng)
    res.json({ name })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Reverse geocode failed' })
  }
}

exports.preview = async (req, res) => {
  const { lat, lng } = req.body
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' })
  try {
    const name = await geoService.reverse(lat, lng)
    // fetch weather separately so we can catch and surface provider errors
    let weather
    try{
      weather = await weatherService.getWeather(lat, lng)
    }catch(err){
      console.error('Weather service error:', err.message)
      weather = { temp: null, description: 'Unavailable', clouds: null, visibility: null, error: err.message }
    }

    const [webcamsRaw, photosRaw, satelliteRaw, flickrRaw] = await Promise.all([
      webcamService.findNearby(lat, lng),
      photoService.searchNearby(lat, lng),
      satelliteService.getLatest(lat, lng),
      // Flickr is optional and will return [] if key missing
      require('../services/flickrService').searchNearby(lat, lng)
    ])

    // Ensure any relative backend URLs (e.g. `/api/satellite/proxy?...`) are
    // returned to the client as absolute URLs so the browser can load them
    // regardless of frontend host/port. Use the current request host/protocol.
    const base = `${req.protocol}://${req.get('host')}`
    // Merge Flickr photos first (most realistic crowd-sourced images), then satellite snapshot and sample photos
    const flickrPhotos = (flickrRaw || []).map(p => ({ ...p, url: (p.url && p.url.startsWith('/')) ? `${base}${p.url}` : p.url }))
    const photos = [ ...flickrPhotos, ...(photosRaw || []).map(p => ({ ...p, url: (p.url && p.url.startsWith('/')) ? `${base}${p.url}` : p.url })) ]
    const satellite = satelliteRaw && satelliteRaw.url ? {
      ...satelliteRaw,
      url: satelliteRaw.url.startsWith('/') ? `${base}${satelliteRaw.url}` : satelliteRaw.url
    } : satelliteRaw
    const webcams = (webcamsRaw || []).map(w => ({
      ...w,
      url: (w.url && w.url.startsWith('/')) ? `${base}${w.url}` : w.url
    }))

    const analysis = analysisService.analyze({ weather, photos, webcams, satellite })

    res.json({
      location: { name, lat, lng },
      weather,
      webcams,
      photos,
      satellite,
      analysis
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Preview failed', detail: err.message })
  }
}
