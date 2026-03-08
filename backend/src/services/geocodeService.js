const axios = require('axios')

const MAPBOX = process.env.MAPBOX_TOKEN

exports.reverse = async (lat, lng) => {
  if (!MAPBOX) {
    // fallback mocked name
    return `Lat ${lat}, Lng ${lng}`
  }
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX}`
  const r = await axios.get(url)
  const feat = r.data && r.data.features && r.data.features[0]
  return feat ? feat.place_name : `Lat ${lat}, Lng ${lng}`
}
