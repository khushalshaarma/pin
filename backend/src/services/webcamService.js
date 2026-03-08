const axios = require('axios')

const KEY = (process.env.WEBCAM_API_KEY || '').replace(/^"|"$/g, '').trim()

// Find nearby webcams for a given lat/lng using Windy Webcams API (if key provided).
// Returns an array of webcams in the shape: { id, title, url, lat, lng, distance, provider }
exports.findNearby = async (lat, lng) => {
  if (!KEY) return []

  try {
    // Windy Webcams API v2 - request nearby webcams. We request image and location fields.
    // Example endpoint: https://api.windy.com/api/webcams/v2/list/nearby={lat},{lng},50?show=webcams:image,location
    const radiusKm = 50
    const url = `https://api.windy.com/api/webcams/v2/list/nearby=${lat},${lng},${radiusKm}?show=webcams:image,location`

    // Windy accepts the key as a query param `key` or via header `x-windy-key` in some setups. Use query param first.
    const resp = await axios.get(url + `&key=${KEY}`, { timeout: 8000 })

    const webcams = (((resp || {}).data || {}).result || {}).webcams || []

    return webcams.map(w => {
      const image = (w.image && (w.image.current || w.image.daylight || w.image.max)) || {}
      const preview = image.preview || image.thumbnail || image.url || null
      return {
        id: w.id || w._id || (w.location && `${w.location.latitude},${w.location.longitude}`) || String(Math.random()).slice(2,10),
        title: w.title || w.location && w.location.city || 'Webcam',
        url: preview || (w.player && w.player.live && w.player.live.embed) || null,
        lat: w.location && w.location.latitude ? parseFloat(w.location.latitude) : null,
        lng: w.location && w.location.longitude ? parseFloat(w.location.longitude) : null,
        distance: w.distance || null,
        provider: 'windy'
      }
    }).filter(w=>w.url) // only return entries with an image URL
  } catch (err) {
    console.error('webcamService.findNearby error', err.message)
    return []
  }
}
