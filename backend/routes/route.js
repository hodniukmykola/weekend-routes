const express = require("express")
const router = express.Router()
const Place = require("../models/Place")
const { analyzeInterests, generateDescription } = require("../ai/localAI")

function getDistance(a, b) {
  if (
    !a.location ||
    !b.location ||
    typeof a.location.lat !== "number" ||
    typeof a.location.lng !== "number" ||
    typeof b.location.lat !== "number" ||
    typeof b.location.lng !== "number"
  ) {
    return Number.MAX_SAFE_INTEGER
  }

  const latDiff = a.location.lat - b.location.lat
  const lngDiff = a.location.lng - b.location.lng

  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)
}

function buildRouteByNearestNeighbor(places) {
  if (!places.length) return []

  const remaining = [...places]
  const route = []

  let current = remaining.shift()
  route.push(current)

  while (remaining.length > 0) {
    let nearestIndex = 0
    let nearestDistance = getDistance(current, remaining[0])

    for (let i = 1; i < remaining.length; i++) {
      const distance = getDistance(current, remaining[i])

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = i
      }
    }

    current = remaining.splice(nearestIndex, 1)[0]
    route.push(current)
  }

  return route
}

function buildGoogleMapsUrl(route) {
  if (!route.length) return ""

  if (route.length === 1) {
    const only = route[0]
    return `https://www.google.com/maps/search/?api=1&query=${only.location.lat},${only.location.lng}`
  }

  const origin = `${route[0].location.lat},${route[0].location.lng}`
  const destination = `${route[route.length - 1].location.lat},${route[route.length - 1].location.lng}`

  const waypoints = route
    .slice(1, route.length - 1)
    .map((place) => `${place.location.lat},${place.location.lng}`)
    .join("|")

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`

  if (waypoints) {
    url += `&waypoints=${waypoints}`
  }

  return url
}

function normalizeIds(raw) {
  if (!raw) return []

  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
}

router.get("/", async (req, res) => {
  try {
    const city = req.query.city?.trim()
    const rawInterests = req.query.tags || ""
    const limit = parseInt(req.query.limit) || 8

    if (!city) {
      return res.status(400).json({
        message: "Не вказано місто"
      })
    }

    const smartTags = analyzeInterests(rawInterests)

    console.log("Текст користувача:", rawInterests)
    console.log("Розпізнані теги:", smartTags)

    const query = {
      city: new RegExp(`^${city}$`, "i")
    }

    if (smartTags.length > 0) {
      query.tags = { $in: smartTags }
    }

    let places = await Place.find(query)

    if (!places.length) {
      return res.json({
        places: [],
        description: `На жаль, для міста ${city} не знайдено локацій за цими інтересами.`,
        googleMapsUrl: "",
        smartTags
      })
    }

    places.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    places = places.slice(0, limit)

    const orderedRoute = buildRouteByNearestNeighbor(places).map((place, index) => ({
      ...place.toObject(),
      order: index + 1
    }))

    const description = generateDescription(city, smartTags, orderedRoute)
    const googleMapsUrl = buildGoogleMapsUrl(orderedRoute)

    res.json({
      places: orderedRoute,
      description,
      googleMapsUrl,
      smartTags
    })
  } catch (error) {
    console.error("Route error:", error)
    res.status(500).json({
      message: "Помилка генерації маршруту"
    })
  }
})

router.get("/replace", async (req, res) => {
  try {
    const city = req.query.city?.trim()
    const rawInterests = req.query.tags || ""
    const excludeIds = normalizeIds(req.query.excludeIds)

    if (!city) {
      return res.status(400).json({
        message: "Не вказано місто"
      })
    }

    const smartTags = analyzeInterests(rawInterests)

    const query = {
      city: new RegExp(`^${city}$`, "i")
    }

    if (smartTags.length > 0) {
      query.tags = { $in: smartTags }
    }

    let places = await Place.find(query)

    if (excludeIds.length > 0) {
      places = places.filter((place) => !excludeIds.includes(String(place._id)))
    }

    if (!places.length) {
      return res.json({
        place: null
      })
    }

    places.sort((a, b) => (b.rating || 0) - (a.rating || 0))

    const replacement = places[0].toObject()

    res.json({
      place: replacement
    })
  } catch (error) {
    console.error("Replace route error:", error)
    res.status(500).json({
      message: "Помилка заміни місця"
    })
  }
})

module.exports = router