const mongoose = require('mongoose')
const { Schema, model } = mongoose

// Define user schema
var LocationSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  crowdHistory: [{
    size: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    dangerLevel: {
      type: Number,
      default: 0
    }
  }],
  danger: {
    stepSize: {
      type: Number,
      default: 10
    }
  },
});

// Export Mongoose model
module.exports = model('Location', LocationSchema);