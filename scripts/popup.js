import * as d3 from 'https://d3js.org/d3.v3.min.js';
var validGuesses = [];
var letterFrequencies = [];
d3.csv("WordleExtension/validGuesses.csv").then(function(data) {
    validGuesses = data;
});
d3.csv("WordleExtension/letterFrequency.csv").then(function(data) {
    letterFrequencies = data;
});
var validAnswers = [...letterFrequencies];
var gray = new Set();
//ai component helps rate the frquency and possibility of the indivdual word 
document.addEventListener("DOMContentLoaded", function () {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "newWord") {
        const word = request.word;
        const colors = request.colors;
        nextGuess(word, colors);
        document.getElementById("word-container").innerHTML = word;
        var guesses = document.getElementById("guesses");
        for(let i = 0; i < validGuesses; i++){
            let entry = document.createElement('li');
            entry.appendChild(document.createTextNode(validGuesses[i]))
            guesses.appendChild(entry);
        }
    }
    });
});

function nextGuess(word, colors){//data_states =  empty, tbd, absent, present, correct
    var greenYellow = new Map();
    for(let i = 0; i < word.length; i ++){
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

