import { generateCrossword } from './CrosswordGeneration/generateCrossword.js'
import { crosswordList } from './CrosswordGeneration/crosswordList.js'
import { wordList } from "./CrosswordGeneration/wordList.js";
import moment from 'moment-timezone';
import express from 'express'

export const app = express()

const MAX_CROSSWORDS_GEN = 5;

app.get('/', (req, res) => {
    
    const now = moment().tz("Australia/Melbourne").format("YYYY-MM-DD")
    const startDay = "2022-02-20";
    const daysSinceStart = moment.duration(moment(now,"YYYY-MM-DD").diff(moment(startDay,"YYYY-MM-DD"))).asDays()
    res.set('Access-Control-Allow-Origin', '*');
    res.send({
        crosswordleNo: daysSinceStart+1,
        data: crosswordList[daysSinceStart],
    })

  })

app.get('/generate', (req, res) => {
    
    const noCrosswords = req.query.num ? req.query.num : 1;
    if (noCrosswords > MAX_CROSSWORDS_GEN) {
        res.status(400).send({
            message: "Maximum number of crosswords exceeded."
        })
    }
    let currentWordList = wordList;
    let crosswords = []
    for (let i = 0; i < noCrosswords; i++) {
        const newCrossword = generateCrossword(currentWordList)
        crosswords.push(newCrossword)
        // Remove all used words from current word list
        newCrossword.forEach(e => {
            const wordIndex = currentWordList[e.word.length].indexOf(e.word.toLowerCase())
            if (wordIndex != -1) {
                currentWordList[e.word.length].splice(wordIndex, 1) // Remove word from current word list
            }
        })
    }
    res.send(crosswords)

})

app.listen(5000, () => {
    console.log('Running on port 5000.')
})