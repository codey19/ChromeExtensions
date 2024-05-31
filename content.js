async function fetchData(rowNum){
  //deal with the intro screen
  const elm = await waitForElm(`[aria-label="Row ${rowNum}"]`);

  console.log('Row Found');
  var curRow = document.querySelector(`[aria-label="Row ${rowNum}"]`);
  const allLeters = curRow.querySelectorAll('.Tile-module_tile__UWEHN');
  const firstletter = allLeters[4];
  if (!firstletter) {
    console.log('The .firstletter element not found');
    return;
  }
  console.log(`First Letter: ${firstletter}`);

  let curState = firstletter.getAttribute('data-state');
  if(curState === 'present' || curState === 'absent' || curState === 'correct'){
    console.log("Already Read");
    readGuess(rowNum);
    return;
  }

  //readGuess(rowNum);
  const observer = new MutationObserver(function() {
    let curState = firstletter.getAttribute('data-state');
    if (curState === 'present' || curState === 'absent' || curState === 'correct') {
      console.log('The new data-state attribute is ' + curState);
      readGuess(rowNum);
      observer.disconnect();
    }
  });

  // Configuration options for the observer
  const observerOptions  = {attributes: true, attributeFilter: ['data-state']};

  // Start observing the target element
  observer.observe(firstletter, observerOptions);
}

function waitForElm(selector) {
  return new Promise(resolve => {
      if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
          if (document.querySelector(selector)) {
              observer.disconnect();
              resolve(document.querySelector(selector));
          }
      });

      // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
      observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  });
}

function readGuess(rowNum){
  //date-state: empty, tbd, absent, present, correct
  console.log("Reading Guess");
  let curRow = document.querySelector(`[aria-label="Row ${rowNum}"]`);//finds current row
  if (curRow) {
    var letters = curRow.querySelectorAll('.Tile-module_tile__UWEHN');
    let word = [];
    let dataState = [];
    for(let i = 0; i < letters.length; i++){
      if(!letters[i]){
        console.log("Error: No Letters Found");
        break;
      }
      let letter = letters[i].innerHTML;
      let letter_state = letters[i].getAttribute('data-state');
      word.push(letter);
      dataState.push(letter_state);
    }
    sendMessage(word, dataState);

    console.log(`found new guess ${word}`);
  }else{
    console.log("Error: Cannot Find Row");
  }
}

for(let row = 1; row < 7; row ++){
  fetchData(row);
}
// let row = 1;
// fetchData(row);

// document.addEventListener('keydown', (event) => {//debugging
//   if (event.code === 'CapsLock') {
//     sendMessage(["MY WORDS"], ["colors"]);
//     console.log("HERE");
//   }
// });

const sendMessage = (word, dataState) => {
  chrome.runtime.sendMessage(chrome.runtime.id, {//sends word to content script
    action: "newWord",
    word: word,
    colors: dataState
  });
}