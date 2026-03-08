const axios = require('axios')

async function checkOpenWeather(key){
  if (!key) return { available: false, reason: 'no_key' }
  const k = (key||'').replace(/^"|"$/g, '').trim()
  if (!k) return { available: false, reason: 'empty_key' }
  try{
    // small test call to OpenWeather (use coords 0,0 to minimize region issues)
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=0&lon=0&appid=${k}&units=metric`
    const r = await axios.get(url, { timeout: 5000 })
    if (r && r.status === 200) return { available: true, status: 200 }
    return { available: false, status: r.status, data: r.data }
  }catch(err){
    const info = { available: false }
    if (err.response){
      info.status = err.response.status
      info.data = err.response.data
      info.reason = err.response.data && err.response.data.message ? err.response.data.message : 'api_error'
    } else {
      info.reason = err.message
    }
    return info
  }
}

exports.info = async (req, res) => {
  const env = process.env
  const weatherCheck = await checkOpenWeather(env.WEATHER_API_KEY)
  res.json({
    ok: true,
    keys: {
      mapbox: !!env.MAPBOX_TOKEN,
      weather: !!env.WEATHER_API_KEY,
      webcam: !!env.WEBCAM_API_KEY,
      satellite: !!env.SATELLITE_API_KEY
    },
    weatherCheck,
    node_env: env.NODE_ENV || 'development'
  })
}
