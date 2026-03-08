require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const routes = require('./routes')

const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.use('/api', routes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`LiveScape backend listening on port ${PORT}`)
  console.log('Configured keys:', {
    MAPBOX_TOKEN: !!process.env.MAPBOX_TOKEN,
    WEATHER_API_KEY: !!process.env.WEATHER_API_KEY,
    WEBCAM_API_KEY: !!process.env.WEBCAM_API_KEY,
    SATELLITE_API_KEY: !!process.env.SATELLITE_API_KEY
  })
})
