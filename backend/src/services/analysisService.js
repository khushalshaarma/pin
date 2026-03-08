// Simple analysis engine that computes a Scenic Score based on inputs
exports.analyze = ({ weather, photos, webcams, satellite }) => {
  // scoring from 0-100
  let score = 50
  let visibility = 'Unknown'
  let travel = 'Moderately Recommended'
  let crowd = 'Unknown'

  if (weather) {
    const clouds = weather.clouds || 50
    const vis = weather.visibility || 5000
    // cloud penalty
    score += (50 - clouds) * 0.5
    // visibility bonus
    score += Math.max(0, (vis - 2000) / 200)
    visibility = vis > 8000 ? 'Excellent' : vis > 4000 ? 'Good' : vis > 1500 ? 'Fair' : 'Poor'
  }

  // photo brightness
  if (photos && photos.length) {
    const avgBright = photos.reduce((s,p)=>s+(p.brightness||0),0)/photos.length
    score += (avgBright - 0.5) * 20
  }

  // webcams presence gives confidence
  if (webcams && webcams.length) score += 5

  // clamp
  score = Math.max(0, Math.min(100, Math.round(score)))

  if (score > 75) travel = 'Highly Recommended'
  else if (score > 50) travel = 'Moderately Recommended'
  else travel = 'Not Recommended'

  if (webcams && webcams.length > 2) crowd = 'High'
  else if (photos && photos.length > 5) crowd = 'High'
  else if (photos && photos.length > 2) crowd = 'Medium'
  else crowd = 'Low'

  return { scenicScore: score, visibility, travelWorthiness: travel, crowdLevel: crowd }
}
