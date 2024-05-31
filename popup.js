console.log("opened pop up");

// popup.js
// window.onload = () => {
//     chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//         if (request.message) {
//           console.log("Message received in popup:", request.message);
//           // You can update your popup's UI based on the received message here
//         }s
//       });
// }

  

// document.addEventListener("DOMContentLoaded", function () {
//     console.log("DOM loaded");
//     chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//         if (request.action === "newWord") {
//             console.log(`Received new word ${word}`)
//             const word = request.word;
//             const colors = request.colors;
//             nextGuess(word, colors);
//             document.getElementById("word-container").innerHTML = word;
//             var guesses = document.getElementById("guesses");
//             for(let i = 0; i < validGuesses.length; i++){
//                 let entry = document.createElement('li');
//                 entry.appendChild(document.createTextNode(validGuesses[i]))
//                 guesses.appendChild(entry);
//             }
//         }else if(request.action === "test"){
//             console.log("Request: Received");
//             const testWord = request.action;
//             //document.getElementById("word-container").innerHTML = word;
//             var guesses = document.getElementById("guesses");
//             let entry = document.createElement('li');
//             entry.appendChild(document.createTextNode(testWord))
//             guesses.appendChild(entry);
//         }
//     });
// });
