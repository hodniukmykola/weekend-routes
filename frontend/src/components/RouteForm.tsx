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
  const [tags, setTags] = useState("кава")
  const [places, setPlaces] = useState<Place[]>([])
  const [routeDescription, setRouteDescription] = useState("")
  const [googleMapsUrl, setGoogleMapsUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setRouteDescription("")
    setGoogleMapsUrl("")

    try {
      const response = await api.get("/route", {
        params: {
          city,
          tags
        }
      })

      setPlaces(response.data.places || [])
      setRouteDescription(response.data.description || "")
      setGoogleMapsUrl(response.data.googleMapsUrl || "")
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
              Побудуй готовий
              <br />
              маршрут містом,
              <br />
              а не просто список
              <br />
              локацій
            </h1>

            <p className="subtitle">
              Система спочатку обирає найкращі місця за рейтингом, а потім
              формує логічну послідовність для прогулянки.
            </p>

            <div className="quick-tags">
              <button type="button" onClick={() => applyTag("архітектура")}>
                Архітектура
              </button>
              <button type="button" onClick={() => applyTag("кава")}>
                Кава
              </button>
              <button type="button" onClick={() => applyTag("історія")}>
                Історія
              </button>
              <button type="button" onClick={() => applyTag("прогулянка")}>
                Прогулянка
              </button>
              <button type="button" onClick={() => applyTag("архітектура,кава")}>
                Архітектура + кава
              </button>
              <button
                type="button"
                onClick={() => applyTag("архітектура,прогулянка")}
              >
                Архітектура + прогулянка
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
                placeholder="Інтереси, наприклад архітектура,кава,прогулянка"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />

              <button type="submit">Побудувати маршрут</button>
            </form>

            {loading && <p className="info">Маршрут будується...</p>}
            {error && <p className="error">{error}</p>}

            <div className="hero-stats">
              <div className="stat-card">
                <span className="stat-number">5</span>
                <span className="stat-label">локацій у маршруті</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">1</span>
                <span className="stat-label">день для прогулянки</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">★</span>
                <span className="stat-label">відбір за рейтингом</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-city">
        <h2>Чому саме Чернівці?</h2>

        <div className="about-grid">
          <div className="about-card">
            <h3>Європейська архітектура</h3>
            <p>
              Чернівці відомі своєю австро-угорською архітектурою, вузькими
              вуличками та історичними будівлями.
            </p>
          </div>

          <div className="about-card">
            <h3>Кавова культура</h3>
            <p>
              У центрі міста багато затишних кав'ярень, де можна відпочити після
              прогулянки.
            </p>
          </div>

          <div className="about-card">
            <h3>Ідеально для маршруту</h3>
            <p>
              Компактний центр, площі, парки та пам’ятки дозволяють легко
              побудувати маршрут на один день.
            </p>
          </div>
        </div>
      </section>

      <section className="interests">
        <h2>Популярні інтереси</h2>

        <div className="interest-grid">
          <div className="interest-card" onClick={() => applyTag("архітектура")}>
            <span>🏛</span>
            <h3>Архітектура</h3>
            <p>Історичні будівлі, ратуша та університет</p>
          </div>

          <div className="interest-card" onClick={() => applyTag("кава")}>
            <span>☕</span>
            <h3>Кав'ярні</h3>
            <p>Атмосферні місця для кави та відпочинку</p>
          </div>

          <div className="interest-card" onClick={() => applyTag("історія")}>
            <span>📚</span>
            <h3>Історія</h3>
            <p>Місця, що зберігають дух старих Чернівців</p>
          </div>

          <div className="interest-card" onClick={() => applyTag("прогулянка")}>
            <span>🚶</span>
            <h3>Прогулянка</h3>
            <p>Парки, площі та красиві міські маршрути</p>
          </div>
        </div>
      </section>

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
          Спочатку відібрані найкращі місця за рейтингом, потім побудований
          порядок проходження
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

                {place.location && (
                  <p className="coords">
                    {place.location.lat}, {place.location.lng}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}