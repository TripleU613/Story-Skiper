// Popup script

const toggleBtn = document.getElementById('toggleBtn');
const skipOnceBtn = document.getElementById('skipOnceBtn');
const status = document.getElementById('status');

let isSkipping = false;

function updateUI() {
  if (isSkipping) {
    toggleBtn.textContent = 'Stop Auto-Skip';
    toggleBtn.classList.add('active');
    status.textContent = 'Auto-skipping...';
    status.style.color = '#4CAF50';
  } else {
    toggleBtn.textContent = 'Start Auto-Skip';
    toggleBtn.classList.remove('active');
    status.textContent = 'Ready';
    status.style.color = '#888';
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function sendMessage(action) {
  const tab = await getActiveTab();
  if (!tab?.id) {
    status.textContent = 'No active tab';
    status.style.color = '#f44336';
    return null;
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action });
    return response;
  } catch (e) {
    status.textContent = 'Not on a Storyline page';
    status.style.color = '#f44336';
    return null;
  }
}

// Get initial status
(async () => {
  const response = await sendMessage('getStatus');
  if (response) {
    isSkipping = response.isSkipping;
    updateUI();
    if (!response.supported) {
      status.textContent = 'Page loading... try again';
      status.style.color = '#ff9800';
    }
  }
})();

// Toggle button
toggleBtn.addEventListener('click', async () => {
  const response = await sendMessage('toggle');
  if (response) {
    isSkipping = response.isSkipping;
    updateUI();
  }
});

// Skip once button
skipOnceBtn.addEventListener('click', async () => {
  await sendMessage('skipOnce');
  status.textContent = 'Skipped!';
  status.style.color = '#2196F3';
  setTimeout(() => {
    if (!isSkipping) {
      status.textContent = 'Ready';
      status.style.color = '#888';
    }
  }, 1000);
});
