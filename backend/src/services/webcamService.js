const axios = require('axios')

const KEY = process.env.WEBCAM_API_KEY

exports.findNearby = async (lat, lng) => {
  if (!KEY) {
    return []
  }
  // Placeholder for an API like webcams.travel
  // This is a stub - real implementation should call a webcams API
  return []
}
