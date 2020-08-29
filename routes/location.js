// express for routing to different api endpoints
const express = require("express")
const router = express.Router()

// mongoose for actually saving stuff to the MongoDB database
const mongoose = require('mongoose');

// import the Location model
const Location = require('../models/location')

router.route('/')
  .get((req, res) => {
    // name refers to the name of the location
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ error: "Please enter the name of the location." })
    }

    return Location.findOne({ name }, (error, location) => {
      if (!!error) {
        return res.status(500).json({ error })
      } else if (!location) {
        return res.status(500).json({ error: "No match found" })
      }
      return res.status(200).json({ location })
    })
  })
  .post((req, res) => {
    const { name, latitude, longitude, dangerStepSize } = req.body
    if (!name || !latitude || !longitude || !dangerStepSize) {
      return res.status(400).json({ error: "Missing fields in request" })
    }

    // create a new location with an empty crowd history because it has
    // not yet been visited
    var location = new Location({
      name,
      coordinates: {
        latitude,
        longitude
      },
      crowdHistory: [],
      danger: {
        stepSize: dangerStepSize
      }
    })

    location.save((error) => {
      if (!!error) {
        return res.status(500).json({ error })
      }
      return res.status(200).json({ location })
    })
  })
router.route('/crowds/:id')
  .put((req, res) => {
    const { crowdSize } = req.body
    const { id } = req.params
    if (!crowdSize || !id) {
      return res.status(400).json({ error: "Missing fields in request" })
    }

    Location.findById(id, (error, location) => {
      const dangerLevel = crowdSize / location.danger.stepSize
      location.crowdHistory = [
        ...(!!location.crowdHistory ? location.crowdHistory : []),
        { size: crowdSize, timestamp: Date.now(), dangerLevel }
      ]
      console.log(location)
      location.save((error) => {
        if (!!error) {
          return res.status(500).json({ error })
        }
        return res.status(200).json({ location })
      })
    })
  })
  .get((req, res) => {
    const { startTimestamp, stopTimeStamp } = req.body
    const { id } = req.params

    if (!startTimestamp || !stopTimeStamp || !id) {
      return res.status(400).json({ error: "Missing fields in request" })
    }

    Location.findById(id, (error, location) => {
      if (!!error) {
        return res.status(500).json({ error })
      }
      const crowdSum = location.crowdHistory.reduceRight((size, crowd) => {
        return size + crowd.size
      }, 0)
      const averageCrowd = crowdSum / location.crowdHistory.length
      const averageDanger = averageCrowd / location.danger.stepSize

      return res.status(200).json({ averageCrowd, averageDanger })
    })
  })

module.exports = router

