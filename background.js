//const ORIGIN = "https://www.nytimes.com/games/wordle/index.html";
// chrome.sidePanel
//   .setPanelBehavior({ openPanelOnActionClick: true })
//   .catch((error) => console.error(error));

// chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
//   if (!tab.url) return;
//   const url = new URL(tab.url);
//   if (url.origin === ORIGIN) {//only runs on wordle
//     await chrome.sidePanel.setOptions({
//       tabId,
//       path: 'scripts/sidepanel.html',
//       enabled: true
//     });
    
//   } else {// Disables the side panel on all other sites
//     await chrome.sidePanel.setOptions({
//       tabId,
//       enabled: false
//     });
//   }
// });
console.log("This is background script");
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
//background.js

var isClosed = true;
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'mySidepanel') {
    console.log('Sidepanel open.');
    isClosed = false;
    port.onDisconnect.addListener(async () => {
      console.log('Sidepanel closed.');
      isClosed = true;
    });
  }
});

var rows = [];
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "newWord") {
      console.log(`sending message to side panels: ${request.word}`);
      // chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {//direct messaging 
      //   chrome.runtime.sendMessage({ message: request.message });
      // });
      const options = {
        action: request.action, 
        word: request.word,
        colors: request.colors
      };   
      rows.push(options);   
      chrome.storage.session.set({ 
        rows
      }, function() {
        console.log('Message stored in local storage');
      });
      if(!isClosed)
        chrome.runtime.sendMessage({ action: 'reload' });
    }
});
