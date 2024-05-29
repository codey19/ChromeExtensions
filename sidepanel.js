console.log("This is the side panel");

// document.addEventListener("DOMContentLoaded", function () { direct message receive
//     chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//         if (request.message === "newWord") {
//             console.log("Message received in side panel:", request.message);
//             // You can update your popup's UI based on the received message here
//         }
//     });
// });
var validAnswers = [];
var validGuesses = [];
var gray = new Set();

var storageCache = [];
var numRows = 1;
const init = async() => {
  var allValidGuesses = await parseCSV("../validGuesses.csv");
  var letterFrequencies = await parseCSV("../letterFrequency.csv");
  var validGuesses = allValidGuesses[0];
  //var validAnswers = [...letterFrequencies];
  console.log(validGuesses);
}

const initStorageCache = chrome.storage.session.get().then((items) => {
  //Object.assign(storageCache, items);
  storageCache = items.rows || [];
});

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

    nextGuess(word, colors);
    console.log(validGuesses);
    console.log("next Guess");
    //for(let i = 0; i < validGuesses.length; i++){//add all guesses to list
      // if(i > 50)
        // break;
      var guesses = document.getElementById("Guesses");
      let entry = document.createElement('li');
      entry.appendChild(document.createTextNode(fullWord));
      guesses.appendChild(entry);
    //}
  }
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
          if(greenYellow.contains(word[i]))
              greenYellow.set(word[i], greenYellow.get(colors[i]) + 1);
          else
              greenYellow.set(word[i], 1);
      }else if(colors[i] === 'absent')
          gray.add(word.charAt(i));
  }
  let newValidGuesses = [];
  for(let i = 0; i < validGuesses.length; i ++) {
      var isPossible = true;
      if(!compareFreq(greenYellow, validGuesses[i])) 
          continue;
      for(let j = 0; j < word.length(); j++){
          if(colors[j] === 'correct'){
              if(validGuesses[i].charAt(j) != word[j]) {
                  isPossible = false;
                  break;
              }
          }else if(colors[j] == 'present'){
              if(validGuesses[j].indexOf(word[j]) === j || validGuesses[j].indexOf(word[j]) === -1){//double letters
                  isPossible = false;
                  break;
              }
          }else if(colors[j] == 'absent'){
              //gray.push(word.[j]);double letters
              if(word[j] == validGuesses[j]){
                  isPossible = false;
                  break;
              }
          }
      }
      if(isPossible)
          newValidGuesses.push(validGuesses[i]);
  }

  //stuff
  for(let i = 0; i < allValidGuesses.length; i++){
      //checkStats();
      //rankGeusses();
  }

  validGuesses = newValidGuesses; 

  validAnswers = [...newValidGuesses];//valid guesses == valid answers
}

function getFreq(word){
  var lettersOccurrence = new Map();
  for(let i = 0; i < word.length; i++)
      if(lettersOccurrence.contains(word[i]))
          lettersOccurrence.set(word[i], lettersOccurrence.get(word[i]) + 1);
      else
          lettersOccurrence.set(word[i], 1);
  return lettersOccurrence;
}

function compareFreq(greenYellow, word){
  var lettersOccurrence = getFreq(word);
  lettersOccurrence.forEach(element => {
      if(!lettersOccurrence.containsKey(element))
          return false;
      else if(greenYellow.get(element) != lettersOccurrence.get(element))
          return false;
  });
  return true;
}

init();