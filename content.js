// ---- Fullscreen wrapper setup ----
let wrapper = document.getElementById("pageFullscreenWrapper");
let isFakeFullscreen = false;
let extensionEnabled = true; // default enabled

if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "pageFullscreenWrapper";

    while (document.body.firstChild) {
        wrapper.appendChild(document.body.firstChild);
    }
    document.body.appendChild(wrapper);
}

// ---- Load saved state from storage ----
chrome.storage.sync.get(["fakeFullscreenEnabled"], (data) => {
  extensionEnabled = data.fakeFullscreenEnabled ?? true; //use data if exist else equles true


  const originalBtn = document.querySelector('.ytp-fullscreen-button');
  if (originalBtn) originalBtn.style.display = extensionEnabled ? 'none' : ''; //if enabled = hides, else button is shown.

  if (extensionEnabled) {
    createCustomButton();
  }
});


function scrollToTopYouTube() {
  // Find the real scroll container when in fake fullscreen
  const wrapper = document.getElementById("pageFullscreenWrapper");
  const ytdApp = document.querySelector("ytd-app");
  const scrollContainer = wrapper || ytdApp || document.scrollingElement;

  if (!scrollContainer) return;

  scrollContainer.scrollTop = 0;
  console.log("Scrolled to top of:", scrollContainer.id || scrollContainer.tagName);
}

/* === Helpers to enter/exit fake fullscreen === */
function enterFakeFullscreen() {
  if (!extensionEnabled || isFakeFullscreen) return;

  const body = document.body;
  const player = document.querySelector("#movie_player");
  const app = document.querySelector("ytd-app");
  if (!body || !player || !app) return;

  isFakeFullscreen = true;

  body.classList.add("fake-page-fullscreen");
  player.classList.add("fake-page-fullscreen");
  app.classList.add("fake-page-fullscreen");

  body.style.margin = "0";
  body.style.padding = "0";
  player.style.margin = "0";
  player.style.padding = "0";

  scrollToTopYouTube();
  console.log("Entered fake fullscreen");
}

function exitFakeFullscreen() {
  if (!extensionEnabled || !isFakeFullscreen) return;

  scrollToTopYouTube();

  const body = document.body;
  const player = document.querySelector("#movie_player");
  const app = document.querySelector("ytd-app");
  if (!body || !player || !app) return;

  isFakeFullscreen = false;

  body.classList.remove("fake-page-fullscreen");
  player.classList.remove("fake-page-fullscreen");
  app.classList.remove("fake-page-fullscreen");

  body.style.margin = "";
  body.style.padding = "";
  player.style.margin = "";
  player.style.padding = "";


  console.log("Exited fake fullscreen");
}

// Toggle fullscreen function
function toggleWrapperFullscreen() {
    if (!extensionEnabled) return; // ⚠️ ignore if disabled

    if (!document.fullscreenElement) {
        wrapper.requestFullscreen().catch(err => console.error(err));
        enterFakeFullscreen();
    } else if (document.fullscreenElement === wrapper) {
        document.exitFullscreen().catch(err => console.error(err));
        exitFakeFullscreen();
    }
}

// ---- YouTube button handling ----
function createCustomButton() {
  if (!extensionEnabled) return; // only show button if enabled

  // Edge cases incase the controls aren't loaded yet.
  const controlsRight = document.querySelector('.ytp-right-controls');
  if (!controlsRight) return;

  if (controlsRight.children.length === 0) {
      setTimeout(createCustomButton, 200);
      return;
  }

  // If there already a custom button.
  if (document.getElementById('customFullscreenBtn')) return;


  // SVG icons:
  const enterIcon = `
    <svg height="24" viewBox="0 0 24 24" width="24">
      <path d="M10 3H3V10C3 10.26 3.10 10.51 3.29 10.70C3.48 10.89 3.73 11 4 11C4.26 11 4.51 10.89 4.70 10.70C4.89 10.51 5 10.26 5 10V6.41L9.29 10.70L9.36 10.77C9.56 10.92 9.80 11.00 10.04 10.99C10.29 10.98 10.52 10.87 10.70 10.70C10.87 10.52 10.98 10.29 10.99 10.04C11.00 9.80 10.92 9.56 10.77 9.36L10.70 9.29L6.41 5H10C10.26 5 10.51 4.89 10.70 4.70C10.89 4.51 11 4.26 11 4C11 3.73 10.89 3.48 10.70 3.29C10.51 3.10 10.26 3 10 3ZM20 13C19.73 13 19.48 13.10 19.29 13.29C19.10 13.48 19 13.73 19 14V17.58L14.70 13.29L14.63 13.22C14.43 13.07 14.19 12.99 13.95 13.00C13.70 13.01 13.47 13.12 13.29 13.29C13.12 13.47 13.01 13.70 13.00 13.95C12.99 14.19 13.07 14.43 13.22 14.63L13.29 14.70L17.58 19H14C13.73 19 13.48 19.10 13.29 19.29C13.10 19.48 13 19.73 13 20C13 20.26 13.10 20.51 13.29 20.70C13.48 20.89 13.73 21 14 21H21V14C21 13.73 20.89 13.48 20.70 13.29C20.51 13.10 20.26 13 20 13Z" fill="white"></path>
    </svg>
  `;

  const exitIcon = `
    <svg height="24" viewBox="0 0 24 24" width="24">
      <path d="M3.29 3.29C3.11 3.46 3.01 3.70 3.00 3.94C2.98 4.19 3.06 4.43 3.22 4.63L3.29 4.70L7.58 8.99H5C4.73 8.99 4.48 9.10 4.29 9.29C4.10 9.47 4 9.73 4 9.99C4 10.26 4.10 10.51 4.29 10.70C4.48 10.89 4.73 10.99 5 10.99H11V4.99C11 4.73 10.89 4.47 10.70 4.29C10.51 4.10 10.26 3.99 10 3.99C9.73 3.99 9.48 4.10 9.29 4.29C9.10 4.47 9 4.73 9 4.99V7.58L4.70 3.29L4.63 3.22C4.43 3.06 4.19 2.98 3.94 3.00C3.70 3.01 3.46 3.11 3.29 3.29ZM19 13H13V19C13 19.26 13.10 19.51 13.29 19.70C13.48 19.89 13.73 20 14 20C14.26 20 14.51 19.89 14.70 19.70C14.89 19.51 15 19.26 15 19V16.41L19.29 20.70L19.36 20.77C19.56 20.92 19.80 21.00 20.04 20.99C20.29 20.98 20.52 20.87 20.70 20.70C20.87 20.52 20.98 20.29 20.99 20.04C21.00 19.80 20.92 19.56 20.77 19.36L20.70 19.29L16.41 15H19C19.26 15 19.51 14.89 19.70 14.70C19.89 14.51 20 14.26 20 14C20 13.73 19.89 13.48 19.70 13.29C19.51 13.10 19.26 13 19 13Z" fill="white"></path>
    </svg>
  `;


  // Creating the button
  const customBtn = document.createElement('button');
  customBtn.id = 'customFullscreenBtn';
  customBtn.className = 'ytp-button';
  customBtn.innerHTML = enterIcon;


  // Click behavior
  customBtn.addEventListener('click', () => {
    if (!extensionEnabled) return;

    // Toggle fullscreen mode
    toggleWrapperFullscreen();

    // Update icon
    customBtn.innerHTML = isFakeFullscreen ? exitIcon : enterIcon;
  });

  // Putting the custombutton in his place😤.
  const fullscreenBtn = controlsRight.querySelector('.ytp-fullscreen-button');
  if (fullscreenBtn) {
    fullscreenBtn.insertAdjacentElement('beforebegin', customBtn);
  } else {
    controlsRight.appendChild(customBtn);
  }

  // Hide original YouTube fullscreen button ONLY if extension is enabled
  const originalBtn = controlsRight.querySelector('.ytp-fullscreen-button');
  if (originalBtn) originalBtn.style.display = extensionEnabled ? 'none' : '';
}


// ---- Observe YouTube player changes ----
function observePlayerControls() {
  const controlsRight = document.querySelector('.ytp-right-controls');
  if (!controlsRight) {
    setTimeout(observePlayerControls, 500);
    return;
  }

  const observer = new MutationObserver(() => {
    if (extensionEnabled) createCustomButton();
  });

  observer.observe(controlsRight, {
    childList: true,
    subtree: false
  });

  createCustomButton();
}
observePlayerControls();


// Exit fake fullscreen on Escape/F11
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && isFakeFullscreen) {
    exitFakeFullscreen();
  }
});


// ---- Listen to popup toggle ----
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "toggleFakeFullscreen") {
    extensionEnabled = msg.enabled;
    console.log("Extension enabled:", extensionEnabled);

    const customBtn = document.getElementById('customFullscreenBtn');
    const originalBtn = document.querySelector('.ytp-fullscreen-button');

    if (!extensionEnabled) {
      // Remove custom button
      if (customBtn) customBtn.remove();
      // Show original button
      if (originalBtn) originalBtn.style.display = '';
      // Exit fake fullscreen if active
      if (isFakeFullscreen) {
        exitFakeFullscreen();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.error(err));
        }
      }
    } else {
      // Hide original button
      if (originalBtn) originalBtn.style.display = 'none';
      // Re-create custom button
      createCustomButton();
    }
  }
});