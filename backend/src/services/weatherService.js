const axios = require('axios')

const KEY = (process.env.WEATHER_API_KEY || '').replace(/^"|"$/g, '').trim()

exports.getWeather = async (lat, lng) => {
  if (!KEY) {
    // mocked weather
    return {
      temp: 15,
      description: 'Partly cloudy',
      clouds: 40,
      visibility: 10000
    }
  }
  try{
    // OpenWeatherMap Current Weather API
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${KEY}&units=metric`
    const r = await axios.get(url)
    const d = r.data
    return {
      temp: d.main.temp,
      description: d.weather && d.weather[0] ? d.weather[0].description : 'Unknown',
      clouds: d.clouds ? d.clouds.all : 0,
      visibility: d.visibility || null
    }
  }catch(err){
    console.error('OpenWeather fetch error message:', err.message)
    if (err.response) {
      console.error('OpenWeather response status:', err.response.status)
      console.error('OpenWeather response data:', err.response.data)
      // propagate a helpful error object so controller can include message
      throw new Error(`OpenWeather ${err.response.status}: ${JSON.stringify(err.response.data)}`)
    }
    // network or other error
    throw new Error('OpenWeather fetch failed: '+err.message)
  }
}
