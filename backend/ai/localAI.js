function analyzeInterests(text) {
  const input = (text || "").toLowerCase().trim()

  const patterns = [
    {
      keywords: ["кава", "кави", "кав'", "кафе", "лате", "капучино"],
      tags: ["кава", "їжа"]
    },
    {
      keywords: ["перекус", "їсти", "поїсти", "їжа", "ресторан", "десерт", "бургер", "піц"],
      tags: ["їжа"]
    },
    {
      keywords: ["прогуля", "гуляти", "пішки", "пройтись", "пройтися", "маршрут"],
      tags: ["прогулянка", "природа"]
    },
    {
      keywords: ["архітект", "будівл", "старе місто", "ратуша", "театр", "університет"],
      tags: ["архітектура", "історія"]
    },
    {
      keywords: ["істор", "музей", "пам'ятк", "старовин", "культурна спадщина"],
      tags: ["історія", "культура"]
    },
    {
      keywords: ["фото", "панорама", "інстаграм", "гарний вид", "красивий вид", "фотолокац"],
      tags: ["фото"]
    },
    {
      keywords: ["природа", "парк", "озеро", "ліс", "сад", "сквер", "зелень"],
      tags: ["природа", "прогулянка"]
    },
    {
      keywords: ["культура", "вистава", "концерт", "філармон", "мистецтво"],
      tags: ["культура"]
    }
  ]

  const result = new Set()

  patterns.forEach((rule) => {
    rule.keywords.forEach((word) => {
      if (input.includes(word)) {
        rule.tags.forEach((tag) => result.add(tag))
      }
    })
  })

  const manualTags = input
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
    "фото",
    "їжа"
  ]

  manualTags.forEach((tag) => {
    if (allowedTags.includes(tag)) {
      result.add(tag)
    }
  })

  return Array.from(result)
}

function generateDescription(city, tags, places) {
  if (!places.length) {
    return `На жаль, для міста ${city} не знайдено локацій за вибраними інтересами.`
  }

  const names = places.map((p) => p.name).join(" → ")
  const tagText = tags.length ? tags.join(", ") : "вільна прогулянка"

  return `Маршрут у місті ${city} побудовано за інтересами: ${tagText}. Система відібрала найкращі місця за рейтингом та сформувала зручну послідовність відвідування: ${names}. Цей маршрут підійде для комфортної прогулянки й знайомства з містом.`
}

module.exports = {
  analyzeInterests,
  generateDescription
}