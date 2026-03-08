const axios = require('axios')

const KEY = (process.env.FLICKR_API_KEY || '').replace(/^"|"$/g, '').trim()

// Search Flickr for geo-tagged photos near lat/lng
exports.searchNearby = async (lat, lng, opts = {}) => {
  if (!KEY) return []
  const radiusKm = opts.radiusKm || 5
  const per_page = opts.per_page || 6

  try {
    const url = 'https://www.flickr.com/services/rest/'
    const params = {
      method: 'flickr.photos.search',
      api_key: KEY,
      lat: lat,
      lon: lng,
      radius: Math.max(0.1, Math.min(32, radiusKm)),
      radius_units: 'km',
      per_page,
      sort: 'date-posted-desc',
      extras: 'url_c,url_z,url_m,date_taken,owner_name,geo',
      format: 'json',
      nojsoncallback: 1
    }

    const resp = await axios.get(url, { params, timeout: 10000 })
    const photos = ((resp.data || {}).photos || {}).photo || []

    return photos.map(p => {
      // prefer url_c, url_z, url_m
      const image = p.url_c || p.url_z || p.url_m || null
      return {
        id: p.id,
        title: p.title || (p.ownername ? `Photo by ${p.ownername}` : 'Flickr photo'),
        url: image,
        provider: 'flickr',
        date_taken: p.datetaken || null,
        lat: p.latitude ? parseFloat(p.latitude) : null,
        lng: p.longitude ? parseFloat(p.longitude) : null
      }
    }).filter(p => p.url)
  } catch (err) {
    console.error('flickrService.searchNearby error', err && err.message)
    return []
  }
}
