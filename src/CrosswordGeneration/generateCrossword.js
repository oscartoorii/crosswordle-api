
const ornts = ["VERTICAL", "HORIZONTAL"]

// For simplicity, the algorithm will stay very primitive and restricted.
// A crossword must have:
// 2x 5 letter words
// 2x 6 letter words
// Orientation is determined as a back-and-forth system during generation, 
// but the word generated initially will have a random orientation
export const generateCrossword = (wordList) => {
    
    // Initialise game data array
    let gameOutput = [];

    // Initialise crossword grid
    let gameGrid = Array(6).fill(0).map(e => Array(6).fill("."))

    // Randomly get a 6 letter word and insert into grid
    const orntSix1 = ornts[Math.floor(Math.random()*ornts.length)];
    const posSix1 = getPossibleStartPos(6, orntSix1, gameOutput)[0];
    const wordSix1 = wordList[6][Math.floor(Math.random()*wordList[6].length)];
    wordSix1.split("").forEach((e, wordPos) => {
        if (orntSix1===ornts[1]) {
            gameGrid[posSix1[1]][posSix1[0]+wordPos] = e;
        } else if (orntSix1===ornts[0]) {
            gameGrid[posSix1[1]+wordPos][posSix1[0]] = e;
        }
    })
    gameOutput.push({
        startPos: posSix1,
        word: wordSix1.toUpperCase(),
        orientation: orntSix1,
        ID: null,
    })
    // Add another 6 letter word
    gameGrid = addNewWord(5, gameOutput, gameGrid, wordList)

    // Add a 5 letter word
    gameGrid = addNewWord(5, gameOutput, gameGrid, wordList)

    // Add another 5 letter word
    gameGrid = addNewWord(5, gameOutput, gameGrid, wordList)

    console.log(gameGrid)
    // Output final crossword
    let ID = 0;
    gameOutput.map(e => {
        if (e.ID===null) {
            ID++;
            e.ID = ID;
            gameOutput.map(e2 => JSON.stringify(e2.startPos)===JSON.stringify(e.startPos) ? e2.ID=ID : "")
        }
    })
    return gameOutput;
}

const addNewWord = (wordLength, gameOutput, gameGrid, wordList) => {

    const newOrnt = flipOrientation(gameOutput[gameOutput.length-1].orientation)
    const newPossiblePos = getPossibleStartPos(wordLength, newOrnt, gameOutput)
    let newPos, newWord, wordsChecked = 0;
    while (!newWord && wordsChecked <= 1000) {
        const randomWord = wordList[wordLength][Math.floor(Math.random()*wordList[wordLength].length)];
        wordsChecked++;
        // Check new word is not same as any of the other same letter words
        if (gameOutput.every(e => e.word !== randomWord.toUpperCase())) {
            for (let possiblePos of newPossiblePos) {
                const newGrid = tryPlacing(gameGrid, possiblePos, newOrnt, randomWord)
                if (newGrid!==false) { // Placing was successful
                    gameGrid = newGrid;
                    newWord = randomWord;
                    newPos = possiblePos;
                    break;
                }
            }
        }
    }
    if (wordsChecked > 1000) {
        newPos = [-1, -1]
        newWord = "NO WORD FOUND"
    }
    gameOutput.push({
        startPos: newPos,
        word: newWord.toUpperCase(),
        orientation: newOrnt,
        ID: null,
    })
    return gameGrid;
}

// Returns all possible start positions based on the length of a word
const getPossibleStartPos = (wordLength, ornt, gameOutput) => {
    let horizontalRange = 6; // As default, a horizontal start pos can occur between 0 and 5
    let verticalRange = 6; // As default, a vertical start pos can occur between 0 and 5

    if (ornt===ornts[1]) {
        horizontalRange -= wordLength;
    } else if (ornt===ornts[0]) {
        verticalRange -= wordLength;
    }
    let possibleStartPos = []
    for (let ver = 0; ver < (ornt===ornts[0]?verticalRange+1:verticalRange); ver++ ) {
        for (let hor = 0; hor < (ornt===ornts[1]?horizontalRange+1:horizontalRange); hor++ ) {
            if (!gameOutput.some(e => e.orientation===ornt && JSON.stringify(e.startPos)===JSON.stringify([hor, ver]))) {
                possibleStartPos.push([hor, ver])
            }
        }
    }
    shuffleArray(possibleStartPos) // Ensure the first letter position it checks is randomised, otherwise there is bias towards picking the first few positions
    return possibleStartPos;
}

// Takes an orientation and flips it to another
const flipOrientation = (ornt) => {
    if (ornt===ornts[0]) {
        return ornts[1]
    } else if (ornt===ornts[1]) {
        return ornts[0]
    }
}

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const tryPlacing = (gameGrid, possiblePos, ornt, randomWord) => {
    let newGameGrid = JSON.parse(JSON.stringify(gameGrid)) // Copy game grid
    const randomWordSpl = randomWord.split("");
    for (let wordPos = 0; wordPos < randomWordSpl.length; wordPos++) {
        if (ornt===ornts[1]) {
            if (newGameGrid[possiblePos[1]][possiblePos[0]+wordPos]===".") { // If current pos is empty
                if (getSurroundingPos(possiblePos[0]+wordPos, possiblePos[1], ornt, wordPos, randomWordSpl.length).some(surrPos => newGameGrid[surrPos[1]][surrPos[0]]!==".")) {
                    return false;
                } else {
                    newGameGrid[possiblePos[1]][possiblePos[0]+wordPos] = randomWordSpl[wordPos];
                }
            } else { // If current pos is a letter
                if (newGameGrid[possiblePos[1]][possiblePos[0]+wordPos]!==randomWordSpl[wordPos]) {
                    return false;
                }
            }
        } else if (ornt===ornts[0]) {
            if (newGameGrid[possiblePos[1]+wordPos][possiblePos[0]]===".") { // If current pos is empty
                if (getSurroundingPos(possiblePos[0], possiblePos[1]+wordPos, ornt, wordPos, randomWordSpl.length).some(surrPos => newGameGrid[surrPos[1]][surrPos[0]]!==".")) {
                    return false;
                } else {
                    newGameGrid[possiblePos[1]+wordPos][possiblePos[0]] = randomWordSpl[wordPos];
                }
            } else { // If current pos is a letter
                if (newGameGrid[possiblePos[1]+wordPos][possiblePos[0]]!==randomWordSpl[wordPos]) {
                    return false;
                }
            }
        }
    }
    return newGameGrid;
}

// Takes a position and orientation and returns any position within the game boundary out of previous-pos, next-pos, side1, and side2.
const getSurroundingPos = (x, y, ornt, wordPos, wordLength) => {

    let surroundingPos = []
    if (ornt===ornts[0]) { // Vertical
        if (wordPos===0 && y-1 >= 0) { // Previous-pos (Top)
            surroundingPos.push([x, y-1])
        }
        if (wordPos===wordLength-1 && y+1 < 6) { // Next-pos (Bottom)
            surroundingPos.push([x, y+1])
        }
        if (x-1 >= 0) { // Side1 (Left)
            surroundingPos.push([x-1, y])
        }
        if (x+1 < 6) { // Side2 (Right)
            surroundingPos.push([x+1, y])
        }
    } else if (ornt===ornts[1]) { // Horizontal
        if (wordPos===0 && x-1 >= 0) { // Previous-pos (Left)
            surroundingPos.push([x-1, y])
        }
        if (wordPos===wordLength-1 && x+1 < 6) { // Next-pos (Right)
            surroundingPos.push([x+1, y])
        }
        if (y-1 >= 0) { // Side1 (Top)
            surroundingPos.push([x, y-1])
        }
        if (y+1 < 6) { // Side2 (Bottom)
            surroundingPos.push([x, y+1])
        }
    }
    return surroundingPos;

}
