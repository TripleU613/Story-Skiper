// Storyline Skipper - Content Script
// Injects the skipper script into page context

(function() {
  // Inject the external script file (bypasses CSP)
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function() {
    this.remove();
    console.log('[Skipper Content] Injected script loaded');
  };
  script.onerror = function() {
    console.log('[Skipper Content] Failed to load injected script');
  };
  (document.head || document.documentElement).appendChild(script);

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
      document.dispatchEvent(new CustomEvent('storyline-skipper-toggle'));
      sendResponse({ success: true });
    } else if (request.action === 'skipOnce') {
      document.dispatchEvent(new CustomEvent('storyline-skipper-skip'));
      sendResponse({ success: true });
    } else if (request.action === 'getStatus') {
      sendResponse({ supported: true });
    }
    return true;
  });

  console.log('[Skipper Content] Content script loaded');
})();
