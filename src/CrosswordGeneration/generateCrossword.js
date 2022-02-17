
const ornts = ["VERTICAL", "HORIZONTAL"]
const numberOfWords = 4;

// To Do's:
// - Modularise code
// - Flexible number of words (within range)

// For simplicity, the algorithm will stay very primitive and restricted.
// A crossword must have:
// 2x 5 letter words
// 2x 6 letter words
// Orientation is determined as a back-and-forth system during generation, 
// but the word generated initially will have a random orientation
export const generateCrossword = (wordList) => {
    
    // Initialise game data array
    let gameOutput = Array(numberOfWords).fill(0);

    // Initialise crossword grid
    let gameGrid = Array(6).fill(0).map(e => Array(6).fill("."))

    // Randomly get a 6 letter word and insert into grid
    const orntSix1 = ornts[Math.floor(Math.random()*ornts.length)];
    const posSix1 = getRandomStartPos(6, orntSix1)
    const wordSix1 = wordList[6][Math.floor(Math.random()*wordList[6].length)];
    wordSix1.split("").forEach((e, wordPos) => {
        if (orntSix1===ornts[1]) {
            gameGrid[posSix1[1]][posSix1[0]+wordPos] = e;
        } else if (orntSix1===ornts[0]) {
            gameGrid[posSix1[1]+wordPos][posSix1[0]] = e;
        }
    })
    gameOutput[0] = {
        startPos: posSix1,
        word: wordSix1.toUpperCase(),
        orientation: orntSix1,
        ID: null,
    }
    // Randomly get another 6 letter word if there is a common letter, and for all common letters, try to place it on the board
    const orntSix2 = flipOrientation(orntSix1)
    const possiblePosSix2 = getPossibleStartPos(6, orntSix2)
    let posSix2;
    let wordSix2;
    while (!wordSix2) {
        const randomWord = wordList[6][Math.floor(Math.random()*wordList[6].length)];
        // Check new word is not same as first and at least one letter is common in both words
        if (randomWord!==wordSix1 && randomWord.split("").some(e => wordSix1.split("").includes(e))) { 
            shuffleArray(possiblePosSix2) // Ensure the first letter position it checks is randomised, otherwise there is bias towards picking the first few letters
            for (let possiblePos of possiblePosSix2) {
                const newGrid = tryPlacing(gameGrid, possiblePos, orntSix2, randomWord)
                if (newGrid!==false) { // Placing was successful
                    gameGrid = newGrid;
                    wordSix2 = randomWord;
                    posSix2 = possiblePos;
                    break;
                }
            }
        }
    }
    gameOutput[1] = {
        startPos: posSix2,
        word: wordSix2.toUpperCase(),
        orientation: orntSix2,
        ID: null,
    }
    // Randomly get a 5 letter word and if there is a common letter, and for all common letters, try to place it on the board
    const orntFive1 = flipOrientation(orntSix2)
    const possiblePosFive1 = getPossibleStartPos(5, orntFive1)
    let posFive1;
    let wordFive1;
    while (!wordFive1) {
        const randomWord = wordList[5][Math.floor(Math.random()*wordList[5].length)];
        shuffleArray(possiblePosFive1) // Ensure the first letter position it checks is randomised, otherwise there is bias towards picking the first few letters
        for (let possiblePos of possiblePosFive1) {
            const newGrid = tryPlacing(gameGrid, possiblePos, orntFive1, randomWord)
            if (newGrid!==false) { // Placing was successful
                gameGrid = newGrid;
                wordFive1 = randomWord;
                posFive1 = possiblePos;
                break;
            }
        }
    }
    gameOutput[2] = {
        startPos: posFive1,
        word: wordFive1.toUpperCase(),
        orientation: orntFive1,
        ID: null,
    }
    // Randomly get a 5 letter word and if there is a common letter, and for all common letters, try to place it on the board
    const orntFive2 = flipOrientation(orntFive1)
    const possiblePosFive2 = getPossibleStartPos(5, orntFive2)
    let posFive2;
    let wordFive2;
    while (!wordFive2) {
        const randomWord = wordList[5][Math.floor(Math.random()*wordList[5].length)];
        // Check new word is not same as any of the other same letter words
        if (randomWord!==wordFive1) {
            shuffleArray(possiblePosFive2) // Ensure the first letter position it checks is randomised, otherwise there is bias towards picking the first few letters
            for (let possiblePos of possiblePosFive2) {
                const newGrid = tryPlacing(gameGrid, possiblePos, orntFive2, randomWord)
                if (newGrid!==false) { // Placing was successful
                    gameGrid = newGrid;
                    wordFive2 = randomWord;
                    posFive2 = possiblePos;
                    break;
                }
            }
        }
    }
    gameOutput[3] = {
        startPos: posFive2,
        word: wordFive2.toUpperCase(),
        orientation: orntFive2,
        ID: null,
    }
    // Output final crossword
    let ID = 0;
    gameOutput.map(e => {
        if (e.ID===null) {
            ID++;
            e.ID = ID;
            gameOutput.map(e2 => JSON.stringify(e2.startPos)===JSON.stringify(e.startPos) ? e2.ID=ID : "")
        }
    })
    console.log(gameGrid)
    return gameOutput;
}

// Returns all possible start positions based on the length of a word
const getPossibleStartPos = (wordLength, ornt) => {
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
            possibleStartPos.push([hor, ver])
        }
    }
    return possibleStartPos;
}

// Takes a given word and its orientation to determine a random start position
const getRandomStartPos = (wordLength, ornt) => {

    const possibleStartPos = getPossibleStartPos(wordLength, ornt)
    const randomStartPos = possibleStartPos[Math.floor(Math.random()*possibleStartPos.length)];
    return randomStartPos;

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
            if (newGameGrid[possiblePos[1]][possiblePos[0]+wordPos]===".") {
                newGameGrid[possiblePos[1]][possiblePos[0]+wordPos] = randomWordSpl[wordPos];
            } else if (newGameGrid[possiblePos[1]][possiblePos[0]+wordPos]!==randomWordSpl[wordPos]) {
                return false;
            }
        } else if (ornt===ornts[0]) {
            if (newGameGrid[possiblePos[1]+wordPos][possiblePos[0]]===".") {
                newGameGrid[possiblePos[1]+wordPos][possiblePos[0]] = randomWordSpl[wordPos];
            } else if (newGameGrid[possiblePos[1]+wordPos][possiblePos[0]]!==randomWordSpl[wordPos]) {
                return false;
            }
        }
    }
    return newGameGrid;

}