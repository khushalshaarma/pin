const express = require('express')
const router = express.Router()
const controller = require('../controllers/locationController')

// POST /api/location/preview  { lat, lng }
router.post('/preview', controller.preview)

// GET /api/location/reverse?lat=..&lng=..
router.get('/reverse', controller.reverseGeocode)

module.exports = router
