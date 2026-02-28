require('dotenv').config()

const express = require('express')
const app = express()

app.use(express.json())

const API_KEY = process.env.API_KEY

const allowedModes = new Set(['driving', 'walking', 'bicycling', 'transit'])


app.get('/directions', async (req, res) => {
    try {
        const origin = req.query.origin || 'aberdeen'
        const destination = req.query.destination || 'edinburgh'
        const travel_mode = req.query.mode

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${encodeURIComponent(travel_mode)}&key=${API_KEY}`

        const response = await fetch(url)
        const data = await response.json()

        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Something went wrong' })
    }
})

app.listen(3000, () => {
    console.log('Server running on port 3000')
})