const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const routeRoutes = require("./routes/route")
const Place = require("./models/Place")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/route", routeRoutes)

app.get("/places", async (req, res) => {
  try {
    const places = await Place.find()
    res.json(places)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Помилка при отриманні місць" })
  }
})

mongoose
  .connect("mongodb://kolya:0963916820@ac-zywyqnn-shard-00-00.kaof8qn.mongodb.net:27017,ac-zywyqnn-shard-00-01.kaof8qn.mongodb.net:27017,ac-zywyqnn-shard-00-02.kaof8qn.mongodb.net:27017/weekend_routes?ssl=true&replicaSet=atlas-yi3yyd-shard-0&authSource=admin&appName=Kursova")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB error:", err))

app.listen(5000, () => {
  console.log("Server running on port 5000")
})