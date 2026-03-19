function normalizeText(text) {
  return text.toLowerCase().trim()
}

function extractSmartTags(input) {
  const text = normalizeText(input)

  const dictionary = {
    архітектура: [
      "архітектура",
      "архітектур",
      "будівл",
      "старе місто",
      "історичний центр",
      "красиві будівлі",
      "університет",
      "ратуша",
      "театр"
    ],
    кава: [
      "кава",
      "кави",
      "випити кави",
      "кафе",
      "кавярня",
      "кав'ярня",
      "лате",
      "капучино"
    ],
    історія: [
      "історія",
      "історичне",
      "історичні",
      "музей",
      "музеї",
      "пам'ятка",
      "старовина"
    ],
    прогулянка: [
      "прогулянка",
      "прогулятись",
      "прогулятися",
      "погуляти",
      "гуляти",
      "пройтись",
      "пройтися",
      "пішки"
    ],
    природа: [
      "природа",
      "парк",
      "парки",
      "сквер",
      "сад",
      "зелень"
    ],
    культура: [
      "культура",
      "театр",
      "філармонія",
      "концерт",
      "вистава",
      "мистецтво"
    ],
    їжа: [
      "їжа",
      "перекус",
      "поїсти",
      "ресторан",
      "десерт"
    ]
  }

  const foundTags = new Set()

  for (const [tag, keywords] of Object.entries(dictionary)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        foundTags.add(tag)
      }
    }
  }

  const rawParts = text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  const allowedTags = [
    "архітектура",
    "кава",
    "історія",
    "прогулянка",
    "природа",
    "культура",
    "їжа"
  ]

  for (const part of rawParts) {
    if (allowedTags.includes(part)) {
      foundTags.add(part)
    }
  }

  if (foundTags.has("прогулянка")) {
    foundTags.add("природа")
  }

  if (foundTags.has("кава")) {
    foundTags.add("їжа")
  }

  if (foundTags.has("архітектура")) {
    foundTags.add("історія")
  }

  return Array.from(foundTags)
}

module.exports = { extractSmartTags }