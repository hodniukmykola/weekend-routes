const OpenAI = require("openai")

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function analyzeInterests(text) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Перетвори інтереси користувача у короткий список тегів для туристичних місць."
      },
      {
        role: "user",
        content: text
      }
    ]
  })

  return response.choices[0].message.content
}

async function generateRouteDescription(places) {
  const names = places.map(p => p.name).join(", ")

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Створи короткий опис туристичного маршруту по місту."
      },
      {
        role: "user",
        content: `Створи опис маршруту для таких місць: ${names}`
      }
    ]
  })

  return response.choices[0].message.content
}

module.exports = {
  analyzeInterests,
  generateRouteDescription
}