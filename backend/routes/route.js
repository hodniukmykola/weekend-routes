const express = require("express")
const router = express.Router()
const Place = require("../models/Place")

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

function buildDescription(city, tags, places) {
  if (!places.length) {
    return `На жаль, для міста ${city} не знайдено локацій за вибраними інтересами.`
  }

  const tagsText = tags.length ? tags.join(", ") : "загальної прогулянки"
  const names = places.map((place) => place.name).join(" → ")

  return `Маршрут по місту ${city} сформовано з урахуванням інтересів: ${tagsText}. Спочатку система відібрала найкращі локації за рейтингом, після чого побудувала логічну послідовність відвідування. Рекомендований порядок прогулянки: ${names}.`
}

router.get("/", async (req, res) => {
  try {
    const city = req.query.city?.trim()
    const rawTags = req.query.tags || ""

    if (!city) {
      return res.status(400).json({
        message: "Не вказано місто"
      })
    }

    const tags = rawTags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)

    const query = {
      city: city
    }

    if (tags.length > 0) {
      query.tags = { $in: tags }
    }

    let places = await Place.find(query)

    if (!places.length) {
      return res.json({
        places: [],
        description: `На жаль, для міста ${city} не знайдено локацій за вибраними інтересами.`,
        googleMapsUrl: ""
      })
    }

    // 1. Спочатку сортуємо по рейтингу
    places.sort((a, b) => (b.rating || 0) - (a.rating || 0))

    // 2. Беремо топ-5
    places = places.slice(0, 5)

    // 3. Потім будуємо маршрут
    const orderedRoute = buildRouteByNearestNeighbor(places).map((place, index) => ({
      ...place.toObject(),
      order: index + 1
    }))

    const description = buildDescription(city, tags, orderedRoute)
    const googleMapsUrl = buildGoogleMapsUrl(orderedRoute)

    res.json({
      places: orderedRoute,
      description,
      googleMapsUrl
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Помилка генерації маршруту"
    })
  }
})

module.exports = router