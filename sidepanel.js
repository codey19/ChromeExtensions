const API_KEY = "AIzaSyApfRd0KTfvwK5YGgUZQQq-tTnIPhC4oco";
const endpoint = `https://generativeai.googleapis.com/v1/models/gemini-1.5-flash:generateContent`;

chrome.runtime.connect({ name: 'mySidepanel' });
console.log("This is the side panel");

var allValidGuesses = [];
var letterFrequencies  = [];
var validAnswers = [];
var validGuesses = [];
var gray = new Set();

var storageCache = [];
var numRows = 1;
var elem = document.getElementById("inner");//progress bar animation
var width = 1;
var id = setInterval(frame, 10);
function frame() {
  if (width >= numRows/6*100) {
    clearInterval(id);
  } else {
    width++;
    elem.style.width = width + '%';
  }
}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {//reload method
  if (request.action === 'reload') {
    window.location.reload();
  }
});
const init = async() => {
  allValidGuesses = await parseCSV("../validGuesses.csv");
  //var temp = await parseCSV(".../answers.scv")
  letterFrequencies = await parseCSV("../letterFrequency.csv");
  validGuesses = [...allValidGuesses[0]];
  //var validAnswers = [...letterFrequencies];
  //console.log(validGuesses);
}

const initStorageCache = chrome.storage.session.get().then((items) => {
  //Object.assign(storageCache, items);
  storageCache = items.rows || [];
});

async function parseCSV(file) {
  const response = await fetch(file);
  const csvString = await response.text();
  const data = [];
  const lines = csvString.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const columns = lines[i].split(",");
    data.push(columns);
  }
  return data;
}

function nextGuess(word, colors){//data_states =  empty, tbd, absent, present, correct
  var greenYellow = new Map();
  for(let i = 0; i < word.length; i ++){//accounts for reoccurance of letters
      if(colors[i] === 'correct' || colors[i] === 'present'){
          if(greenYellow.has(word[i]))
              greenYellow.set(word[i], greenYellow.get(colors[i]) + 1);
          else
              greenYellow.set(word[i], 1);
      }else if(colors[i] === 'absent')
          gray.add(word[i]);
  }
  let newValidGuesses = [];
  console.log(validGuesses.length);
  for(let i = 0; i < validGuesses.length; i ++) {
      var isPossible = true;
      if(!compareFreq(greenYellow, validGuesses[i])) 
          continue;
      for(let j = 0; j < word.length; j++){
          if(colors[j] === 'correct'){
              if(validGuesses[i].charAt(j) != word[j]) {
                  isPossible = false;
                  //console.log(`indexOf ${word[j]} in ${validGuesses[j]} and ${word}`);
                  break;
              }
          }else if(colors[j] == 'present'){
              if(validGuesses[i].indexOf(word[j]) === j || validGuesses[i].indexOf(word[j]) === -1){//double letters
                  isPossible = false;
                  console.log(`indexOf ${word[j]} in ${validGuesses[i]} and ${word}`);
                  break;
              }
          }else if(colors[j] == 'absent'){
              //gray.push(word.[j]);double letters
              if(word[j] === validGuesses[i].charAt(j)){
                  isPossible = false;
                  //console.log(validGuesses[j]);
                  break;
              }
          }
      }
      if(isPossible){
        newValidGuesses.push(validGuesses[i]);  
      }
  }
  validGuesses = [...newValidGuesses];
  validAnswers = [...newValidGuesses];//valid guesses == valid answers
  //determining the rankings of all the new possible guesses
   var guessRanks = new Map();
   console.log(`Length: ${newValidGuesses.length}`);
  //for(let i = 0; i < allValidGuesses[0].length; i++){
    // let temp = allValidGuesses[0][i];
    // var num = checkStats(temp);
    // guessRanks.set(temp, num);\
 // }
  //checkStats("apple");
  //checkStats("abler");
  console.log("next step");
  // guessRanks = sortMap(guessRanks);
  // let arr = [];
  // for (let [key, value] of newMap) {
  //   console.log(key + " is " + value);
  //   arr.push(key);
  // }
  // validGuesses = [...arr];
  // validAnswers = [...arr];
}

function getFreq(word){
  var lettersOccurrence = new Map();
  for(let i = 0; i < word.length; i++)
      if(lettersOccurrence.has(word[i]))
          lettersOccurrence.set(word[i], lettersOccurrence.get(word[i]) + 1);
      else
          lettersOccurrence.set(word[i], 1);
  return lettersOccurrence;
}

function compareFreq(greenYellow, word){
  var lettersOccurrence = getFreq(word);
  lettersOccurrence.forEach(element => {
      if(!lettersOccurrence.has(element))
          return false;
      else if(greenYellow.get(element) != lettersOccurrence.get(element))
          return false;
  });
  return true;
}

function sortMap(map) {
  return new Map([...map].sort((a, b) => a[0].localeCompare(b[0])));
}

function checkStats(word){
  //ai first to rank words
  console.log("Checking Stats");
  const prompt = "Generate a 5 letter word in all capitals.";
  const requestBody = {
    prompt: prompt,
    model: "gemini-1.5-flash",
    parameters: {

    }
  };

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify(requestBody)
  })
  .then(response => response.json())
  .then(data => {
    const text = data.content.text;
    console.log(text);
  })
  .catch(error => {
    console.error(error);
  });
  var ratio = 0.0;
  const ansNumOriginal = validAnswers.length; //point of comparison for all words
  // for(let i = 0; i < validAnswers.length; i++){//ai give weight to answers
  //   var colors =  getColors(word, validAnswers[i]);//if i was the answer what would be the color thing
  //   var newValidAnswers = nextGuessStat(word, colors);
  //   ratio += newValidAnswers/ansNumOriginal;
  //   //calculate the total reduced == reduced weighted/total weighted
  // }
  //console.log(`${word} = ${ratio}`);
  // return ratio;
}

function getColors(guess, answer){
    var colors = [];
    for(let i = 0; i < guess.length; i++){
      let guessLetter = guess.charAt(i);
      if(answer.charAt(i) == guessLetter)
        colors[i] = 'present';
      else if(getCharFreq(guess, guessLetter) == 1 && answer.indexOf(guessLetter) >= 0)
        colors[i] = 'correct';
      else if(answer.indexOf(guessLetter) == -1)
        colors[i] = 'absent';
    }

    //inserts repeated letters into display
    for(let i = 0; i < guess.length; i++){
      if(getCharFreq(guess, guess.charAt(i)) > 1 && answer.charAt(i) != guess.charAt(i))
        if(!(getCharFreq(guess, guess.charAt(i)) == getCharFreq(answer, guess.charAt(i))))//determines if the # of repeated letters in the guess matches the # of repeated letters in the answer
          colors[i] = 'correct';
        else
        colors[i] = 'absent';
    }
  return colors;
}
 
  function getCharFreq(word, c){
    var freq = 0;
    for(let i = 0; i < word.length; i++)
      if(word.charAt(i) === c)
        freq++;
    return freq;
  }

  // function nextGuessStat(word, colors){
  //   var greenYellow = new Map();
  //   for(let i = 0; i < word.length; i ++){//accounts for reoccurance of letters
  //       if(colors[i] === 'correct' || colors[i] === 'present'){
  //           if(greenYellow.has(word[i]))
  //               greenYellow.set(word[i], greenYellow.get(colors[i]) + 1);
  //           else
  //               greenYellow.set(word[i], 1);
  //       }else if(colors[i] === 'absent')
  //           gray.add(word[i]);
  //   }
  //   let newValidGuesses = 0;
  //   for(let i = 0; i < validGuesses.length; i ++) {
  //       var isPossible = true;
  //       if(!compareFreq(greenYellow, validGuesses[i])) 
  //           continue;
  //       for(let j = 0; j < word.length; j++){
  //           if(colors[j] === 'correct'){
  //               if(validGuesses[i].charAt(j) != word[j]) {
  //                   isPossible = false;
  //                   break;
  //               }
  //           }else if(colors[j] == 'present'){
  //               if(validGuesses[j].indexOf(word[j]) === j || validGuesses[j].indexOf(word[j]) === -1){//double letters
  //                   isPossible = false;
  //                   break;
  //               }
  //           }else if(colors[j] == 'absent'){
  //               //gray.push(word.[j]);double letters
  //               if(word[j] == validGuesses[j]){
  //                   isPossible = false;
  //                   break;
  //               }
  //           }
  //       }
  //       if(isPossible)
  //           newValidGuesses++;
  //   }
  //   return newValidGuesses;
  // }

init().then(() => {
  console.log()
  initStorageCache.then(() => {//retrieving data from storage
    numRows = storageCache.length;
    for(let j = 0; j < storageCache.length; j++){
      let options = storageCache[j];
      const { action, word, colors } = options;
      console.log('Cached options:', action, word, colors);
      var fullWord = "";
      for(let i = 0; i < word.length; i++)
        fullWord += word[i];
      //document.getElementById('word-container').innerHTML += fullWord + '<br>'; // append to the container
      console.log(validGuesses);
      nextGuess(word, colors, false);
      console.log(validGuesses);
      console.log("next Guess");
      var guesses = document.getElementById("Guesses");
      while (guesses.firstChild) {
        guesses.removeChild(guesses.firstChild);
      }
      for(let i = 0; i < validGuesses.length; i++){//add all guesses to list
        console.log("add");
        if(i >= 30) 
          break;
        let entry = document.createElement('li');
        entry.appendChild(document.createTextNode(validGuesses[i]));
        guesses.appendChild(entry);
      }
    }
    // location.reload();
  });
});