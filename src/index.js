import { generateCrossword } from './CrosswordGeneration/generateCrossword.js'

import express from 'express'

export const app = express()

app.get('/', (req, res) => {
  res.send(generateCrossword())
})

app.listen(5000, () => {
  console.log('Running on port 5000.')
})