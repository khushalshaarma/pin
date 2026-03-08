const axios = require('axios')
const satelliteService = require('./satelliteService')

exports.searchNearby = async (lat, lng) => {
  // If a SATELLITE_API_KEY is provided, prefer returning a satellite snapshot
  // as the "latest photo" so the frontend shows a live image instead of picsum.
  try {
    if (process.env.SATELLITE_API_KEY) {
      const sat = await satelliteService.getLatest(lat, lng)
      if (sat && sat.url) {
        return [
          {
            id: 'satellite',
            title: 'Satellite snapshot',
            url: sat.url,
            brightness: 0.8
          },
          {
            id: 'sample2',
            title: 'Nearby trail',
            url: 'https://picsum.photos/800/500?random=2',
            brightness: 0.6
          }
        ]
      }
    }
  } catch (err) {
    console.error('photoService: failed to fetch satellite image', err.message)
    // fall back to sample images below
  }

  return [
    {
      id: 'sample1',
      title: 'Viewpoint sample',
      url: 'https://picsum.photos/800/500?random=1',
      brightness: 0.8
    },
    {
      id: 'sample2',
      title: 'Nearby trail',
      url: 'https://picsum.photos/800/500?random=2',
      brightness: 0.6
    }
  ]
}
