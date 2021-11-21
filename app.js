// ContentScript matches with every LinkedIn page,
// so we need to check if this is a profile tab.
function isProfileTab() {
  return document.URL.indexOf('linkedin.com/in/') !== -1;
}

// Each specific tab should store their ID to be able to
// unregister when route changes to a non-profile page.
let tabId = null;

function setTabStatus() {
  if (isProfileTab()) {
    // Register this tab as a profile page to background.js
    chrome.runtime.sendMessage(
      { type: 'registerProfileTab' },
      response => {
        // and save the tabId to use later.
        tabId = response;
      }
    );

    // Inject random user data to the profile tab.
    getRandomUser(injectUser);
  } else {
    // If it's not or no longer a profile tab, unregister it.
    chrome.runtime.sendMessage(
      { type: 'unregisterTab', tabId }
    );
  }
}

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    // Get notified when a tab is updated via routing.
    if (message.type === 'tabUpdated') {
      setTabStatus();
    }
  }
);

// Register for the first render.
setTabStatus();

// Fetching random user data.
async function getRandomUser(callback)  {
  await fetch('https://randomuser.me/API')
    .then(response => response.json())
    .then(data => {
      callback(data);
    })
    .catch(e => {
      console.error(e);
      alert('Unable to add a random user!');
    });
};

// Check and remove earlier random user element.
function injectUser(data) {
  const user = data.results[0];

  const existingPerson = document.getElementsByClassName('random-user')[0];
  if (existingPerson) {
    existingPerson.remove();
  }

  appendUserElement(user);
};

// Append the random user to the profile page.
function appendUserElement(user) {
  const artdecoCard = document.getElementsByClassName('artdeco-card')[0];
  const userSection = document.createElement('section');
  userSection.classList.add('random-user', 'pv-profile-section', 'pv-about-section', 'artdeco-card', 'p5', 'mt4');

  const userName = `<h1>${user.name.first} ${user.name.last}</h1>`;
  const userImg = `<img src="${user.picture.medium}" />`;
  const userDetails = `<div class="details"><p><strong>Age:</strong> ${user.dob.age}</p><p><strong>Phone:</strong> ${user.phone}</p><p><strong>Email:</strong> ${user.email}</p></div>`;

  userSection.innerHTML = userName + userImg + userDetails;
  artdecoCard.parentNode.insertBefore(userSection, artdecoCard.nextSibling);
};
