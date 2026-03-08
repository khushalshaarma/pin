const axios = require('axios')

const KEY = process.env.SATELLITE_API_KEY

exports.getLatest = async (lat, lng) => {
  // If a SATELLITE_API_KEY is provided we will use server-side proxy to fetch imagery (e.g. NASA Earth API)
  if (!KEY) {
    return {
      url: `https://maps.wikimedia.org/img/osm-intl,13,${lat},${lng},800x400.png`,
      date: null,
      provider: 'osm'
    }
  }

  // Return a backend proxy URL so the API key remains server-side
  return {
    url: `/api/satellite/proxy?lat=${lat}&lng=${lng}`,
    date: null,
    provider: 'worldview'
  }
}
