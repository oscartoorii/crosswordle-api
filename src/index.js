import { generateCrossword } from './CrosswordGeneration/generateCrossword.js'
import { crosswordList } from './CrosswordGeneration/crosswordList.js'

import express from 'express'

export const app = express()

app.get('/', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.send(crosswordList[0])
  })

app.get('/generate', (req, res) => {
  res.send(generateCrossword())
})

app.listen(5000, () => {
  console.log('Running on port 5000.')
})