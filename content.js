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

  const controlsRight = document.querySelector('.ytp-right-controls');
  if (!controlsRight) return;

  if (controlsRight.children.length === 0) {
      setTimeout(createCustomButton, 200);
      return;
  }

  if (document.getElementById('customFullscreenBtn')) return;

  const customBtn = document.createElement('button');
  customBtn.id = 'customFullscreenBtn';
  customBtn.className = 'ytp-button';

  customBtn.innerHTML = `
      <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
          <path class="ytp-svg-fill" d="M10 10h6v2h-4v4h-2v-6zm10 0h6v6h-2v-4h-4v-2zm-10 10h2v4h4v2h-6v-6zm14 0v6h-6v-2h4v-4h2z"></path>
      </svg>
  `;

  customBtn.onclick = toggleWrapperFullscreen;

  const theaterBtn = controlsRight.querySelector('.ytp-size-button');
  if (theaterBtn) {
      theaterBtn.insertAdjacentElement('afterend', customBtn);
  } else {
      const fullscreenBtn = controlsRight.querySelector('.ytp-fullscreen-button');
      if (fullscreenBtn) {
          controlsRight.insertBefore(customBtn, fullscreenBtn);
      } else {
          controlsRight.appendChild(customBtn);
      }
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