const express = require('express')
const router = express.Router()
const location = require('./location')
const status = require('./status')
const satellite = require('./satellite')

router.use('/location', location)
router.use('/status', status)
router.use('/satellite', satellite)

module.exports = router
