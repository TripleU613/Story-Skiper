// Background service worker - handles keyboard shortcuts

chrome.commands.onCommand.addListener(async (command) => {
  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) return;

  if (command === 'toggle-skip') {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle' }).catch(() => {});
  } else if (command === 'skip-once') {
    chrome.tabs.sendMessage(tab.id, { action: 'skipOnce' }).catch(() => {});
  }
});
