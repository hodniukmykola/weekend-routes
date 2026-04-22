import { useState } from "react"
import api from "../services/api"
import "../App.css"

type Place = {
  _id: string
  name: string
  city: string
  description: string
  tags: string[]
  rating: number
  image?: string
  order?: number
  address?: string
  location?: {
    lat: number
    lng: number
  }
}

export default function RouteForm() {
  const [city, setCity] = useState("Чернівці")
  const [tags, setTags] = useState("хочу перекусити")
  const [places, setPlaces] = useState<Place[]>([])
  const [routeDescription, setRouteDescription] = useState("")
  const [googleMapsUrl, setGoogleMapsUrl] = useState("")
  const [smartTags, setSmartTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setRouteDescription("")
    setGoogleMapsUrl("")
    setSmartTags([])

    try {
      const response = await api.get("/route", {
        params: {
          city,
          tags,
          limit: 8
        }
      })

      setPlaces(response.data.places || [])
      setRouteDescription(response.data.description || "")
      setGoogleMapsUrl(response.data.googleMapsUrl || "")
      setSmartTags(response.data.smartTags || [])
    } catch (err) {
      setError("Не вдалося побудувати маршрут")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const applyTag = (value: string) => {
    setTags(value)
  }

  return (
    <div className="page">
      <section className="hero-section">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="hero-text centered">
            <p className="badge">Маршрут вихідного дня по Чернівцях</p>

            <h1>
              Розумний маршрут
              <br />
              за твоїм
              <br />
              звичайним текстом
            </h1>

            <p className="subtitle">
              Напиши як людина: “хочу перекусити”, “хочу прогулятись і випити кави”,
              “цікавить старе місто” — система сама визначить категорії.
            </p>

            <div className="quick-tags">
              <button type="button" onClick={() => applyTag("хочу перекусити")}>
                Хочу перекусити
              </button>
              <button type="button" onClick={() => applyTag("хочу випити кави")}>
                Хочу кави
              </button>
              <button
                type="button"
                onClick={() => applyTag("хочу прогулятись і випити кави")}
              >
                Прогулянка + кава
              </button>
              <button
                type="button"
                onClick={() => applyTag("цікавить старе місто і красиві будівлі")}
              >
                Старе місто
              </button>
            </div>

            <form className="route-form center-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Введіть місто"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <input
                type="text"
                placeholder="Наприклад: хочу перекусити"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />

              <button type="submit">Побудувати маршрут</button>
            </form>

            {loading && <p className="info">Система аналізує запит і будує маршрут...</p>}
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      </section>

      {smartTags.length > 0 && (
        <section className="smart-tags-section">
          <h2>Розпізнані категорії</h2>
          <div className="smart-tags-box">
            {smartTags.map((tag) => (
              <span key={tag} className="smart-tag">
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {routeDescription && (
        <section className="route-description-section">
          <h2>Опис маршруту</h2>
          <div className="route-description-box">
            <p>{routeDescription}</p>

            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="maps-link"
              >
                Відкрити маршрут у Google Maps
              </a>
            )}
          </div>
        </section>
      )}

      <section className="places-section">
        <h2>Маршрут прогулянки</h2>
        <p className="section-subtitle">
          Система визначила теги, обрала найкращі локації за рейтингом і
          побудувала маршрут
        </p>

        <div className="route-line">
          {places.map((place) => (
            <div className="route-step-card" key={place._id}>
              <div className="route-step-number">{place.order}</div>

              <img
                src={
                  place.image ||
                  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
                }
                alt={place.name}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
                }}
              />

              <div className="place-card-content">
                <h3>{place.name}</h3>
                <p className="city">{place.city}</p>
                {place.address && <p className="address">{place.address}</p>}
                <p>{place.description}</p>

                <div className="tags">
                  {place.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <p className="rating">⭐ {place.rating}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}