document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('fullscreenToggle');

  // Restore saved state
  chrome.storage.sync.get(["fakeFullscreenEnabled"], (data) => {
    toggle.checked = data.fakeFullscreenEnabled ?? true;
    sendMessage(toggle.checked);
  });

  // Save state on change
  toggle.addEventListener('change', function() {
    chrome.storage.sync.set({ fakeFullscreenEnabled: toggle.checked });
    sendMessage(toggle.checked);
  });

  function sendMessage(enabled) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "toggleFakeFullscreen",
        enabled: enabled
      });
    });
  }
});
