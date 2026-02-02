// Storyline Skipper - Injected into page context
(function() {
  if (window.storylineSkipperLoaded) return;
  window.storylineSkipperLoaded = true;

  let skipInterval = null;
  let isSkipping = false;

  function clickButton(btn) {
    if (!btn) return false;
    let r = btn.getBoundingClientRect();
    let x = r.left + r.width / 2;
    let y = r.top + r.height / 2;
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(t => {
      btn.dispatchEvent(new PointerEvent(t, {
        bubbles: true,
        clientX: x,
        clientY: y,
        pointerId: 1
      }));
    });
    return true;
  }

  function skipOnce() {
    try {
      // Try main window DS
      if (typeof DS !== 'undefined') {
        let tl = DS.views?.nameSpaces?._frame?.seek?.viewLogic?.currTimeline;
        if (tl) {
          tl.seek(tl.timelineDuration());
        }
        let n = document.querySelector('#next');
        if (n) clickButton(n);
        return true;
      }

      // Try frames
      for (let i = 0; i < window.frames.length; i++) {
        try {
          let f = window.frames[i];
          if (typeof f.DS !== 'undefined') {
            let tl = f.DS.views?.nameSpaces?._frame?.seek?.viewLogic?.currTimeline;
            if (tl) {
              tl.seek(tl.timelineDuration());
            }
            let n = f.document.querySelector('#next');
            if (n) clickButton(n);
            return true;
          }
        } catch (e) {}
      }

      return false;
    } catch (e) {
      console.log('[Skipper] Error:', e);
      return false;
    }
  }

  function showNotification(text, color) {
    let existing = document.getElementById('skipper-notification');
    if (existing) existing.remove();

    let div = document.createElement('div');
    div.id = 'skipper-notification';
    div.textContent = text;
    div.style.cssText = 'position:fixed;top:20px;right:20px;padding:12px 24px;background:'+color+';color:white;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;border-radius:8px;z-index:999999;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:opacity 0.3s;';
    document.body.appendChild(div);
    setTimeout(() => {
      div.style.opacity = '0';
      setTimeout(() => div.remove(), 300);
    }, 2000);
  }

  function startSkipping() {
    if (isSkipping) return;
    isSkipping = true;
    skipInterval = setInterval(skipOnce, 500);
    console.log('[Skipper] Auto-skip STARTED');
    showNotification('Auto-Skip ON', '#4CAF50');
  }

  function stopSkipping() {
    if (!isSkipping) return;
    isSkipping = false;
    if (skipInterval) {
      clearInterval(skipInterval);
      skipInterval = null;
    }
    console.log('[Skipper] Auto-skip STOPPED');
    showNotification('Auto-Skip OFF', '#f44336');
  }

  function toggleSkipping() {
    if (isSkipping) {
      stopSkipping();
    } else {
      startSkipping();
    }
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Alt+S to toggle
    if (e.altKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      toggleSkipping();
    }
    // Alt+N to skip once
    if (e.altKey && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      skipOnce();
      showNotification('Skipped!', '#2196F3');
    }
    // Escape to stop
    if (e.key === 'Escape' && isSkipping) {
      e.preventDefault();
      stopSkipping();
    }
  });

  // Listen for events from content script
  document.addEventListener('storyline-skipper-toggle', toggleSkipping);
  document.addEventListener('storyline-skipper-skip', () => {
    skipOnce();
    showNotification('Skipped!', '#2196F3');
  });

  // Expose for console debugging
  window.storylineSkipper = {
    toggle: toggleSkipping,
    skipOnce: skipOnce,
    start: startSkipping,
    stop: stopSkipping,
    isSkipping: () => isSkipping
  };

  console.log('[Skipper] Loaded. Alt+S = toggle, Alt+N = skip once');
})();
