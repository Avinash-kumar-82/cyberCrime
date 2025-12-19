const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')

require('dotenv').config()
const connectDB = require('./db/connect')
const authenticationRoute = require("./routes/authenticationRoute")
app.use(cors())
app.use(express.json())
app.use("/api", authenticationRoute)
connectDB(process.env.MONGO_URL)
    .then(
        () => {
            console.log("Database connected")
            app.listen(3000, () => {
                console.log("server is running")
            })
        }
    )
    .catch((error) => {
        console.log(error)
    })