const axios = require('axios')
const satelliteService = require('./satelliteService')

exports.searchNearby = async (lat, lng) => {
  // Always attempt to include a satellite snapshot as the first "latest" photo.
  // satelliteService.getLatest will return a proxy path when a key is present
  // or a public tile URL when not. We catch errors and fall back to sample images.
  try {
    const sat = await satelliteService.getLatest(lat, lng)
    const photos = []
    if (sat && sat.url) {
      photos.push({ id: 'satellite', title: 'Satellite snapshot', url: sat.url, brightness: 0.85 })
    }

    // add a couple of sample photos after the satellite snapshot
    photos.push({ id: 'sample1', title: 'Viewpoint sample', url: 'https://picsum.photos/800/500?random=1', brightness: 0.8 })
    photos.push({ id: 'sample2', title: 'Nearby trail', url: 'https://picsum.photos/800/500?random=2', brightness: 0.6 })

    return photos
  } catch (err) {
    console.error('photoService: failed to fetch satellite image', err && err.message)
    return [
      { id: 'sample1', title: 'Viewpoint sample', url: 'https://picsum.photos/800/500?random=1', brightness: 0.8 },
      { id: 'sample2', title: 'Nearby trail', url: 'https://picsum.photos/800/500?random=2', brightness: 0.6 }
    ]
  }
}
