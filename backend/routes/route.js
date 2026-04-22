const express = require("express")
const router = express.Router()
const Place = require("../models/Place")
const { analyzeInterests, generateDescription } = require("../ai/localAI")

// 📍 Відстань (залишаємо для сортування маршруту)
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

// 📍 Побудова маршруту (найближчий сусід)
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

// ✅ GOOGLE MAPS ПО АДРЕСАХ (ГОЛОВНЕ)
function buildGoogleMapsUrl(route) {
  if (!route || route.length === 0) return ""

  // якщо тільки 1 місце
  if (route.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      route[0].address || route[0].name
    )}`
  }

  const origin = encodeURIComponent(route[0].address || route[0].name)

  const destination = encodeURIComponent(
    route[route.length - 1].address || route[route.length - 1].name
  )

  const waypoints = route
    .slice(1, route.length - 1)
    .map((place) => encodeURIComponent(place.address || place.name))
    .join("|")

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`

  if (waypoints) {
    url += `&waypoints=${waypoints}`
  }

  return url
}

// 🚀 ОСНОВНИЙ ROUTE
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

    // 🧠 "AI" аналіз (локальний)
    const smartTags = analyzeInterests(rawInterests)

    console.log("Текст:", rawInterests)
    console.log("Теги:", smartTags)

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
        description: `На жаль, для міста ${city} не знайдено локацій.`,
        googleMapsUrl: "",
        smartTags
      })
    }

    // ⭐ сортування по рейтингу
    places.sort((a, b) => (b.rating || 0) - (a.rating || 0))

    // ✂ беремо топ N
    places = places.slice(0, limit)

    // 📍 будуємо маршрут
    const orderedRoute = buildRouteByNearestNeighbor(places).map(
      (place, index) => ({
        ...place.toObject(),
        order: index + 1
      })
    )

    // 📝 опис
    const description = generateDescription(city, smartTags, orderedRoute)

    // 🗺️ Google Maps
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

module.exports = router