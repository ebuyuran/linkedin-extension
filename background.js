// Each LinkedIn tab is populated in their respective
// array, as profile tabs or something else.
const profileTabs = [];
const otherTabs = [];

function removeItemFromArray(array, item) {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  } 
}

function setTabStatus(action, tabId) {
  // Register every LinkedIn tab and check if any of them
  // are profile pages. Random user injection actions
  // will only apply to profile pages.
  switch (action) {
    // Tabs can move from one array to another as 
    // user clicks around.
    case 'register':
      if (!(profileTabs.includes(tabId))) {
        profileTabs.push(tabId);
      }

      if (otherTabs.includes(tabId)) {
        removeItemFromArray(otherTabs, tabId);
      }
      break;

    case 'unregister':
      if (profileTabs.includes(tabId)) {
        removeItemFromArray(profileTabs, tabId);
      }

      if (!(otherTabs.includes(tabId))) {
        otherTabs.push(tabId);
      }
      break;

    default:
      throw new Error();
  }
}

// Listen content script messages to register their status.
chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (message.type === 'registerProfileTab') {
      // Register this tab as one of profile tabs.
      setTabStatus('register', sender.tab.id);
    }
    // Send their tabId back to store locally.
    sendResponse(sender.tab.id);

    if (message.type === 'unregisterTab') {
      // and vice versa...
      setTabStatus('unregister', sender.tab.id);
    }
  }
);

// Whenever a LinkedIn tab is updated,
// all tabs reevaluate their status
// and profile tabs will rerender random users.
chrome.tabs.onUpdated.addListener(
  (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      const allLinkedInTabs = [...profileTabs, ...otherTabs];

      // Emiting an event to all tabs might be a bit costly,
      // but I think it's okay for the purposes of this challenge.
      allLinkedInTabs.forEach(item => {
        chrome.tabs.sendMessage(item, {type: "tabUpdated"});
      });
    }
  }
);
