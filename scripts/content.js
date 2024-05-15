console.log("pine");
var row = 1;
function readGeuss(rowNum){
  //date-state: empty, tbd, absent, present, correct
  let curRow = document.querySelector('[aria-label="Row ${rowNum}"]');//finds current row
  if (curRow) {
    var letters = curRow.querySelectorAll('.Tile-module_tile__UWEHN');
    let word = [];
    let dataState = [];
    for(let i = 0; i < letters.length; i++){
      if(!letters[i]){
        console.log("Error: No Letters Found");
        break;
      }
      let letter = letters[i].querySelector('#text');;
      let letter_state = letter.getAttribute('data-state');
      word.push(letter);
      dataState.push(letter_state);
    }
    chrome.runtime.sendMessage(chrome.runtime.id, {//sends word to html script
      action: "newWord",
      word: word,
      colors: dataState
    });
  }else{
    console.log("Error: Cannot Find Row");
  }
}
//deal with the intro screen
let button =  document.querySelector('.Welcome-module_button__ZG0Zh');
button.addEventListener('click', function() {
  console.log('Clicked');
  var curRow = document.querySelector('[aria-label="Row ${rowNum}"]');
  const firstletter = curRow.querySelector('.Tile-module_tile__UWEHN');

  const observer = new MutationObserver(function() {
  let curState = firstletter.getAttribute('data-state');
  if (curState === 'present' || curState === 'absent' || curState === 'correct') {
    console.log('The data-state attribute is ' + curState);
    readGeuss(row++);
    observer.disconnect();
  }
  const observerOptions  = {attributes: true, attributeFilter: ['data-state']};
  observer.observe(firstletter, observerOptions);
  });
});

// var observer = new MutationObserver(readGeuss);
// observer.observe(curRow, );
// readGeuss(1);