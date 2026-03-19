const request = require("supertest")
const express = require("express")

jest.mock("../models/Place", () => ({
  find: jest.fn()
}))

const Place = require("../models/Place")
const routeRoutes = require("../routes/route")

const app = express()
app.use(express.json())
app.use("/route", routeRoutes)

describe("Route API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("повертає маршрут з 5 місць", async () => {
    Place.find.mockResolvedValue([
      {
        _id: "1",
        name: "Місце 1",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 5,
        location: { lat: 48.29, lng: 25.93 },
        toObject() { return this }
      },
      {
        _id: "2",
        name: "Місце 2",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 4.8,
        location: { lat: 48.291, lng: 25.931 },
        toObject() { return this }
      },
      {
        _id: "3",
        name: "Місце 3",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 4.7,
        location: { lat: 48.292, lng: 25.932 },
        toObject() { return this }
      },
      {
        _id: "4",
        name: "Місце 4",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 4.6,
        location: { lat: 48.293, lng: 25.933 },
        toObject() { return this }
      },
      {
        _id: "5",
        name: "Місце 5",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 4.5,
        location: { lat: 48.294, lng: 25.934 },
        toObject() { return this }
      },
      {
        _id: "6",
        name: "Місце 6",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 2,
        location: { lat: 48.295, lng: 25.935 },
        toObject() { return this }
      }
    ])

    const res = await request(app).get("/route").query({
      city: "Чернівці",
      tags: "кава"
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.places).toHaveLength(5)
  })

  test("спочатку відбирає місця з найвищим рейтингом", async () => {
    Place.find.mockResolvedValue([
      {
        _id: "1",
        name: "Низький рейтинг",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 2,
        location: { lat: 48.295, lng: 25.935 },
        toObject() { return this }
      },
      {
        _id: "2",
        name: "Найкраще місце",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 5,
        location: { lat: 48.29, lng: 25.93 },
        toObject() { return this }
      },
      {
        _id: "3",
        name: "Місце 3",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 4.8,
        location: { lat: 48.291, lng: 25.931 },
        toObject() { return this }
      },
      {
        _id: "4",
        name: "Місце 4",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 4.7,
        location: { lat: 48.292, lng: 25.932 },
        toObject() { return this }
      },
      {
        _id: "5",
        name: "Місце 5",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 4.6,
        location: { lat: 48.293, lng: 25.933 },
        toObject() { return this }
      },
      {
        _id: "6",
        name: "Місце 6",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 4.5,
        location: { lat: 48.294, lng: 25.934 },
        toObject() { return this }
      }
    ])

    const res = await request(app).get("/route").query({
      city: "Чернівці",
      tags: "кава"
    })

    const ratings = res.body.places.map((p) => p.rating)
    expect(ratings).toContain(5)
    expect(ratings).not.toContain(2)
  })

  test("повертає опис маршруту", async () => {
    Place.find.mockResolvedValue([
      {
        _id: "1",
        name: "Місце 1",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 5,
        location: { lat: 48.29, lng: 25.93 },
        toObject() { return this }
      }
    ])

    const res = await request(app).get("/route").query({
      city: "Чернівці",
      tags: "кава"
    })

    expect(res.statusCode).toBe(200)
    expect(typeof res.body.description).toBe("string")
    expect(res.body.description.length).toBeGreaterThan(0)
  })

  test("повертає google maps url", async () => {
    Place.find.mockResolvedValue([
      {
        _id: "1",
        name: "Місце 1",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 5,
        location: { lat: 48.29, lng: 25.93 },
        toObject() { return this }
      },
      {
        _id: "2",
        name: "Місце 2",
        city: "Чернівці",
        description: "desc",
        tags: ["кава"],
        rating: 4.8,
        location: { lat: 48.291, lng: 25.931 },
        toObject() { return this }
      }
    ])

    const res = await request(app).get("/route").query({
      city: "Чернівці",
      tags: "кава"
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.googleMapsUrl).toContain("google.com/maps")
  })
})