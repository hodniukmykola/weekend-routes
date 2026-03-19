const mongoose = require("mongoose")

const PlaceSchema = new mongoose.Schema(
  {
    name: String,
    city: String,
    description: String,
    tags: [String],
    rating: Number,
    image: String,
    address: String,
    location: {
      lat: Number,
      lng: Number
    }
  },
  {
    collection: "places"
  }
)

module.exports = mongoose.model("Place", PlaceSchema)