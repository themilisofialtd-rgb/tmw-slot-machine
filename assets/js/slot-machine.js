if (typeof tmwSlot === 'undefined' || !tmwSlot.assetsUrl) {
  console.warn('tmwSlot.assetsUrl missing – using fallback path.');
  var tmwSlot = { assetsUrl: '/wp-content/plugins/tmw-slot-machine/assets' };
}

const SLOT_BUTTON_ID = 'tmw-slot-btn';
const SLOT_BUTTON_CLASS = 'slot-btn';
const slotContainer = document.querySelector('.slot-container');
const slotBtn = document.getElementById(SLOT_BUTTON_ID);

let tmwReelOrderTimeoutId = null;

const tmwFixReelOrder = () => {
  if (typeof document === 'undefined' || !document.querySelectorAll) {
    return;
  }

  const reels = document.querySelectorAll('.tmw-slot-machine .reel');
  reels.forEach((reel, index) => {
    if (!reel || !reel.style) {
      return;
    }
    reel.style.order = index;
  });
};

const scheduleReelOrderFix = (delay = 600) => {
  if (tmwReelOrderTimeoutId) {
    clearTimeout(tmwReelOrderTimeoutId);
  }

  if (typeof window === 'undefined' || typeof window.setTimeout !== 'function') {
    tmwFixReelOrder();
    tmwReelOrderTimeoutId = null;
    return;
  }

  const effectiveDelay = Number(delay);
  const finalDelay = Number.isFinite(effectiveDelay) && effectiveDelay >= 0
    ? effectiveDelay
    : 600;

  tmwReelOrderTimeoutId = window.setTimeout(() => {
    tmwFixReelOrder();
    tmwReelOrderTimeoutId = null;
  }, finalDelay);
};

const cleanGhostBonus = context => {
  const scope = context && typeof context.querySelectorAll === 'function'
    ? context
    : document;
  const candidates = scope === document
    ? scope.querySelectorAll('.tmw-slot-machine .tmw-claim-bonus')
    : scope.querySelectorAll('.tmw-claim-bonus');

  candidates.forEach(node => {
    if (!node.closest('.slot-right')) {
      node.remove();
    }
  });
};

const cleanupSlotButtons = context => {
  const scope = context && typeof context.querySelectorAll === 'function'
    ? context
    : document;
  const primaryButton = scope.querySelector(`#${SLOT_BUTTON_ID}`) || slotBtn;
  const root = primaryButton
    ? (primaryButton.closest('.tmw-slot-machine') || scope)
    : scope;

  const containers = root.querySelectorAll('.slot-container');
  if (containers.length) {
    containers.forEach(wrapper => {
      wrapper
        .querySelectorAll(`.${SLOT_BUTTON_CLASS}`)
        .forEach(button => {
          if (!primaryButton || button === primaryButton) {
            return;
          }
          button.remove();
        });
    });
  }

  cleanGhostBonus(root);
};

function tmwMakeButtonsClickable(root) {
  if (!root || !root.querySelector) {
    return;
  }

  const btn = root.querySelector('.slot-btn');
  const claim = root.querySelector('.tmw-claim-bonus');
  const sound = root.querySelector('#soundToggle, .sound-toggle, .tmw-sound-toggle');
  [btn, claim, sound].forEach(el => {
    if (!el || !el.style) {
      return;
    }
    el.style.position = 'relative';
    el.style.zIndex = '2147483646';
    el.style.pointerEvents = 'auto';
  });

  const shields = root.querySelectorAll(
    '.slot-center, .slot-reels, .tmw-slot-placeholder, .tmw-surprise-img, .slot-center *'
  );
  shields.forEach(el => {
    if (!el || !el.style) {
      return;
    }
    el.style.pointerEvents = 'none';
    el.style.zIndex = '1';
  });
}

cleanGhostBonus();
cleanupSlotButtons();

document.addEventListener('DOMContentLoaded', function() {
  cleanupSlotButtons();
  scheduleReelOrderFix(0);

  const containers = document.querySelectorAll('.tmw-slot-machine');
  if (!containers.length) {
    return;
  }

  containers.forEach(container => {
    if (!slotBtn || !container.contains(slotBtn)) {
      return;
    }
    const headlineText = (typeof tmwSlot !== 'undefined' && tmwSlot && typeof tmwSlot.headline === 'string')
      ? tmwSlot.headline
      : '';

    if (headlineText) {
      let headlineEl = container.querySelector('.slot-headline');
      if (!headlineEl) {
        headlineEl = document.createElement('div');
        headlineEl.className = 'slot-headline';
        const reelsWrapper = container.querySelector('.slot-reels, .tmw-reels');
        headlineEl.textContent = headlineText;
        if (reelsWrapper) {
          container.insertBefore(headlineEl, reelsWrapper);
        } else {
          container.insertBefore(headlineEl, container.firstChild);
        }
      } else {
        headlineEl.textContent = headlineText;
      }
    }

    const assetsBaseUrl = resolveAssetsBaseUrl();
    const reels = container.querySelectorAll('.reel');
    const result = container.querySelector('.tmw-result');
    const reelsContainer = container.querySelector('.slot-reels, .tmw-reels');
    const soundToggle = container.querySelector('#soundToggle, .sound-toggle, .tmw-sound-toggle');

    if (!slotBtn || !reels.length || !result || !soundToggle) {
      return;
    }

    cleanGhostBonus(container);
    cleanupSlotButtons(container);

    let surpriseImgEl = null;
    const hideSurpriseImage = () => {
      if (surpriseImgEl) {
        surpriseImgEl.remove();
        surpriseImgEl = null;
      }
      const placeholder = document.querySelector('.tmw-slot-placeholder');
      if (placeholder && !placeholder.querySelector('.tmw-surprise-img')) {
        placeholder.style.display = 'none';
      }
    };

    // Show surprise on all viewports (desktop + mobile) before first spin
    const shouldShowSurprise = true;
    // Mobile allowed: no viewport guard here
    if (shouldShowSurprise) {
      const surpriseTarget = container.querySelector('.tmw-slot-placeholder') || result;
      if (surpriseTarget && !surpriseTarget.querySelector('.tmw-surprise-img')) {
        const surpriseImg = document.createElement('img');
        const assetsBase = (typeof tmwSlot !== 'undefined' && tmwSlot && tmwSlot.assetsUrl)
          ? String(tmwSlot.assetsUrl).trim().replace(/\/$/, '')
          : assetsBaseUrl;
        const fallbackSrc = 'assets/img/surprice-trans.png';

        surpriseImg.src = assetsBase ? `${assetsBase}/img/surprice-trans.png` : fallbackSrc;
        surpriseImg.alt = 'Surprise Bonus';
        surpriseImg.className = 'tmw-surprise-img';
        surpriseImgEl = surpriseImg;
        surpriseTarget.appendChild(surpriseImg);
      }
    }

    if (slotBtn && typeof slotBtn.addEventListener === 'function') {
      slotBtn.addEventListener('click', () => {
        hideSurpriseImage();
      }, { once: true });
    }

    const ghostObserver = new MutationObserver(() => {
      cleanGhostBonus(container);
    });
    ghostObserver.observe(container, { childList: true, subtree: true });

    result.classList.add('slot-result');
    tmwMakeButtonsClickable(container);
    setTimeout(() => tmwMakeButtonsClickable(container), 1500);

    if (typeof MutationObserver === 'function') {
      const tmwClickShieldObserver = new MutationObserver(() => tmwMakeButtonsClickable(container));
      tmwClickShieldObserver.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class','style']
      });
    }

    const BUTTON_STATES = {
      SPIN: 'spin',
      RESET: 'reset'
    };
    let hasCompletedSpin = false;
    let currentButtonState = BUTTON_STATES.SPIN;

    const validateAndLogState = (state, { disabled } = {}) => {
      if (!container) {
        return;
      }

      cleanupSlotButtons(container);
      const localSlotContainer = container.querySelector('.slot-container') || slotContainer;
      const buttonCount = localSlotContainer
        ? localSlotContainer.querySelectorAll(`.${SLOT_BUTTON_CLASS}`).length
        : 0;
      const diagnostic = `${state}|buttons=${buttonCount}|disabled=${disabled ? '1' : '0'}|valid=${buttonCount === 1 ? 'ok' : 'dup'}`;
      logSlotState(diagnostic);
    };

    function updateButtonState(state, options = {}) {
      const { disabled = false, focus = false } = options;

      cleanupSlotButtons(container);

      if (!slotBtn || !container.contains(slotBtn)) {
        return;
      }

      if (!slotBtn.id) {
        slotBtn.id = SLOT_BUTTON_ID;
      }

      currentButtonState = state;

      slotBtn.classList.remove('spin', 'claim', 'reset', 'spin-again');
      slotBtn.classList.add(SLOT_BUTTON_CLASS);
      slotBtn.dataset.mode = state;
      slotBtn.dataset.state = state;
      slotBtn.disabled = Boolean(disabled);
      slotBtn.onclick = null;

      switch (state) {
        case BUTTON_STATES.RESET:
          slotBtn.textContent = 'Spin Again';
          slotBtn.classList.add('reset', 'spin-again');
          slotBtn.onclick = startSpin;
          break;
        case BUTTON_STATES.SPIN:
        default:
          slotBtn.textContent = 'Spin Now';
          slotBtn.classList.add('spin');
          slotBtn.onclick = startSpin;
          break;
      }

      slotBtn.classList.add('is-active');

      if (!slotBtn.hasAttribute('type')) {
        slotBtn.setAttribute('type', 'button');
      }

      if (focus && typeof slotBtn.focus === 'function') {
        slotBtn.focus();
      }

      validateAndLogState(state, { disabled });
      cleanupSlotButtons(container);
    }

    function resetSpinButton(options = {}) {
      cleanupSlotButtons(container);

      if (!slotBtn) {
        return;
      }

      renderRightClaim('');
      cleanGhostBonus(container);

      const nextState = hasCompletedSpin ? BUTTON_STATES.RESET : BUTTON_STATES.SPIN;
      updateButtonState(nextState, options);
      cleanupSlotButtons(container);
    }

    // Render the CLAIM CTA on the right side only
    const renderRightClaim = (linkUrl, labelText) => {
      const right = container.querySelector('.slot-right');
      if (!right) {
        return;
      }

      right
        .querySelectorAll('.tmw-claim-bonus')
        .forEach(node => node.remove());

      const trimmed = typeof linkUrl === 'string' ? linkUrl.trim() : '';
      if (!trimmed) {
        cleanGhostBonus(container);
        return;
      }

      const claimLink = document.createElement('a');
      claimLink.className = 'tmw-claim-bonus';
      claimLink.href = trimmed;
      claimLink.target = '_blank';
      claimLink.rel = 'nofollow noopener';
      const defaultLabel = (typeof tmwSlot !== 'undefined' && tmwSlot && tmwSlot.claimLabel)
        ? tmwSlot.claimLabel
        : 'Claim Your Bonus';
      claimLink.textContent = labelText || defaultLabel;

      right.appendChild(claimLink);

      if (right && claimLink) {
        right.insertBefore(claimLink, right.firstChild);
      }
      cleanGhostBonus(container);
    };

    const activateClaimButton = linkUrl => {
      const trimmedLink = typeof linkUrl === 'string' ? linkUrl.trim() : '';

      if (!slotBtn) {
        return;
      }

      if (!trimmedLink) {
        resetSpinButton();
        return;
      }

      hasCompletedSpin = true;
      // show CTA on the right, left becomes "Spin Again"
      renderRightClaim(trimmedLink);
      updateButtonState(BUTTON_STATES.RESET);
      cleanupSlotButtons(container);
    };

    if (slotBtn) {
      slotBtn.dataset.mode = 'spin';
    }

    const resetForSpin = () => {
      if (result) {
        // 🔥 Hard-clear any leftover bonus link or win container
        result.innerHTML = '';
        result.classList.remove('show', 'win-text', 'revealed');
        result.textContent = '';
      }
      if (reelsContainer) {
        reelsContainer.classList.remove('fade-out');
      }
    };

    const animateWinReveal = () => {
      if (reelsContainer) {
        reelsContainer.classList.add('fade-out');
      }
      if (!result) {
        return;
      }
      result.classList.add('win-text');
      result.classList.remove('revealed');
      void result.offsetWidth;
      requestAnimationFrame(() => {
        result.classList.add('revealed');
      });
      result.classList.add('show');
    };

    if (result) {
      result.addEventListener('click', () => {
        if (!result.classList.contains('win-text')) {
          return;
        }
        result.classList.remove('revealed');
        requestAnimationFrame(() => {
          result.classList.add('revealed');
        });
      });
    }

    let soundEnabled = (container.dataset.soundDefault || 'off') === 'on';
    let audioContext;
    const winSoundPath = assetsBaseUrl ? `${assetsBaseUrl}/sounds/win.mp3` : 'assets/sounds/win.mp3';
    const winSound = new Audio(winSoundPath);
    let winSoundLoaded = false;

    winSound.preload = 'auto';
    winSound.volume = 0.9;
    winSound.addEventListener('canplaythrough', () => {
      winSoundLoaded = true;
    }, { once: true });
    winSound.addEventListener('error', () => {
      winSoundLoaded = false;
    });

    const stopWinSound = () => {
      try {
        winSound.pause();
        winSound.currentTime = 0;
      } catch (error) {
        // ignore
      }
    };

    const playWinSound = () => {
      if (!soundEnabled) {
        return;
      }

      if (!winSoundLoaded) {
        playTone(880, 0.5);
        return;
      }

      stopWinSound();

      const playPromise = winSound.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    };

    const offersData = (() => {
      if (typeof tmwSlot !== 'undefined' && tmwSlot && Array.isArray(tmwSlot.offers)) {
        return tmwSlot.offers;
      }

      if (container.dataset.offers) {
        try {
          const parsed = JSON.parse(container.dataset.offers);
          if (Array.isArray(parsed)) {
            return parsed.filter(offer => offer && offer.title && offer.url);
          }
        } catch (error) {
          console.error('TMW Slot Machine: invalid offers data', error);
        }
      }

      return [];
    })();

    const offerMap = [
      'bonus.png',
      'peeks.png',
      'deal.png',
      'roses.png',
      'value.png'
    ];

    const showFallbackWinMessage = () => {
      if (!result) {
        return;
      }

      result.textContent = '🎉 Bonus!';
      hasCompletedSpin = true;
      resetSpinButton();
      animateWinReveal();
    };

    const updateWinMessage = (messageText, linkUrl) => {
      if (!result) {
        return false;
      }

      const parentSlot = result.closest('.tmw-slot-machine');
      if (!parentSlot) {
        return false;
      }

      const trimmedUrl = typeof linkUrl === 'string' ? linkUrl.trim() : '';
      if (!trimmedUrl) {
        return false;
      }

      const displayMessage = (typeof messageText === 'string' && messageText.trim())
        ? messageText.trim()
        : '🎉 You Win!';

      try {
        let winContainer = result.querySelector('.tmw-win-message');

        if (!winContainer) {
          winContainer = document.createElement('div');
          winContainer.className = 'tmw-win-message';
        }

        const baseLabel = '🎉 You Win';
        let messagePrefix = baseLabel;
        let prizeText = '';

        if (displayMessage.startsWith(baseLabel)) {
          const remainder = displayMessage.slice(baseLabel.length).trim();
          if (!remainder || !remainder.replace(/[!\s]+/g, '')) {
            messagePrefix = displayMessage.trim();
          } else {
            prizeText = remainder;
          }
        } else {
          messagePrefix = displayMessage.trim();
        }

        const fragment = document.createDocumentFragment();
        fragment.appendChild(document.createTextNode(messagePrefix));

        let prizeSpanCreated = false;

        if (prizeText) {
          fragment.appendChild(document.createTextNode(' '));
          try {
            const prizeSpan = document.createElement('span');
            prizeSpan.className = 'tmw-prize-text';
            prizeSpan.textContent = prizeText;
            fragment.appendChild(prizeSpan);
            prizeSpanCreated = true;
          } catch (error) {
            prizeSpanCreated = false;
          }
        }

        winContainer.textContent = '';

        if (!prizeText || prizeSpanCreated) {
          winContainer.appendChild(fragment);
        } else {
          winContainer.textContent = displayMessage;
        }

        result.innerHTML = '';
        result.appendChild(winContainer);

        return true;
      } catch (error) {
        try {
          result.innerHTML = '';
          const fallbackContainer = document.createElement('div');
          fallbackContainer.className = 'tmw-win-message';
          fallbackContainer.textContent = displayMessage;
          result.appendChild(fallbackContainer);
          return true;
        } catch (fallbackError) {
          result.textContent = displayMessage;
        }
        return false;
      }
    };

    const showWin = iconName => {
      if (!result) {
        return;
      }

      // 🔥 Ensure previous bonus markup is fully cleared
      result.innerHTML = '';
      result.classList.remove('show', 'win-text', 'revealed');

      const offerIndex = offerMap.indexOf(iconName);
      if (offerIndex === -1 || !offersData[offerIndex]) {
        showFallbackWinMessage();
        return;
      }

      const { title, url } = offersData[offerIndex];
      if (!title || !url) {
        showFallbackWinMessage();
        return;
      }

      const trimmedTitle = String(title).trim();
      // Simplified prize message without "You Win"
      const messageText = trimmedTitle ? `🎉 ${trimmedTitle}!` : '🎉 Bonus!';
      const trimmedUrl = typeof url === 'string' ? url.trim() : '';

      const wasUpdated = updateWinMessage(messageText, url);
      if (!wasUpdated) {
        showFallbackWinMessage();
        return;
      }

      hasCompletedSpin = true;

      if (trimmedUrl) {
        activateClaimButton(trimmedUrl);
      } else {
        resetSpinButton();
      }

      animateWinReveal();

      // Placement safety (in case any theme scripts meddle)
      cleanGhostBonus(container);
    };

    const ensureAudioContext = () => {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return null;
      }
      if (!audioContext) {
        audioContext = new AudioContextClass();
      }
      return audioContext;
    };

    const playTone = (frequency, duration = 0.3) => {
      if (!soundEnabled) {
        return;
      }
      const ctx = ensureAudioContext();
      if (!ctx) {
        return;
      }
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    };

    const persistSoundPreference = value => {
      try {
        localStorage.setItem('tmwSound', value);
      } catch (error) {
        // ignore persistence errors
      }
    };

    const updateSoundLabel = () => {
      const isActive = Boolean(soundEnabled);
      const label = isActive ? '🔊 Sound On' : '🔇 Enable Sound';
      soundToggle.textContent = label;
      soundToggle.setAttribute('aria-label', isActive ? 'Sound On' : 'Enable Sound');
      soundToggle.classList.toggle('active', isActive);
    };

    updateSoundLabel();

    // --- Sound: default muted (grey "Enable Sound") ---
    const initializeMutedSound = () => {
      const audioToggle = document.getElementById('soundToggle') || soundToggle;
      if (audioToggle) {
        soundEnabled = false;
        audioToggle.classList.remove('active');
        audioToggle.textContent = '🔇 Enable Sound';
        audioToggle.style.backgroundColor = '#555';
      }
    };

    window.addEventListener('DOMContentLoaded', initializeMutedSound);
    initializeMutedSound();

    soundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        const ctx = ensureAudioContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      }
      if (!soundEnabled) {
        stopWinSound();
      }
      persistSoundPreference(soundEnabled ? 'on' : 'off');
      updateSoundLabel();
    });

    const reelList = Array.from(reels);
    setRandomIconsOnReels(reelList);
    scheduleReelOrderFix(0);

    let flashIntervalId = null;

    const stopResultFlash = () => {
      if (flashIntervalId) {
        clearInterval(flashIntervalId);
        flashIntervalId = null;
      }
    };

    const startResultFlash = (iconPool, onComplete) => {
      stopResultFlash();

      const pool = Array.isArray(iconPool) ? iconPool.filter(Boolean) : getIconPool();

      if (!reelList.length || !pool.length) {
        if (typeof onComplete === 'function') {
          onComplete();
        }
        return;
      }

      const spinDuration = 1400;
      const frameInterval = 110;
      const now = (typeof performance !== 'undefined' && performance && typeof performance.now === 'function')
        ? () => performance.now()
        : () => Date.now();
      const spinStart = now();
      let spinCompleted = false;

      const updateReels = () => {
        reelList.forEach(reel => {
          const icon = pool[Math.floor(Math.random() * pool.length)];
          setIconOnReel(reel, icon);
        });
      };

      const finishSpin = () => {
        if (spinCompleted) {
          return;
        }
        spinCompleted = true;
        scheduleReelOrderFix();
        if (flashIntervalId) {
          clearInterval(flashIntervalId);
          flashIntervalId = null;
        }
        if (typeof onComplete === 'function') {
          onComplete();
        }
      };

      updateReels();

      flashIntervalId = setInterval(() => {
        const elapsed = now() - spinStart;
        if (elapsed >= spinDuration) {
          finishSpin();
          return;
        }

        updateReels();
      }, frameInterval);

      setTimeout(() => {
        finishSpin();
      }, spinDuration + frameInterval);
    };

    function startSpin() {
      cleanupSlotButtons(container);

      if (!slotBtn) {
        return;
      }

      hideSurpriseImage();
      stopResultFlash();
      renderRightClaim('');
      slotBtn.disabled = true;
      slotBtn.classList.add('is-busy');
      validateAndLogState(currentButtonState, { disabled: true });
      resetForSpin();
      stopWinSound();
      setRandomIconsOnReels(reelList);
      reels.forEach(reel => reel.classList.add('spin'));
      playTone(440, 0.25);

      const iconPool = getIconPool();
      const winRate = getWinRate();
      const isWinningSpin = Math.random() * 100 < winRate;

      reels.forEach(reel => reel.classList.remove('spin'));
      startResultFlash(iconPool, () => {
        const spinResult = applySpinResult(reelList, iconPool, isWinningSpin);

        if (isWinningSpin && Array.isArray(spinResult) && spinResult.length) {
          const matchedIcon = spinResult[0];
          showWin(matchedIcon);
          playWinSound();
        } else {
          result.textContent = 'Try Again!';
          result.classList.remove('win-text', 'revealed');
          result.classList.add('show');
          playTone(260, 0.2);
          hasCompletedSpin = true;
          updateButtonState(BUTTON_STATES.RESET);
        }

        slotBtn.disabled = false;
        slotBtn.classList.remove('is-busy');
        cleanupSlotButtons(container);
        scheduleReelOrderFix();
      });
    }

    if (slotBtn) {
      updateButtonState(BUTTON_STATES.SPIN);
    }
  });
});

// === TMW Neon Icons Enhancement ===

const resolveAssetsBaseUrl = () => {
  if (typeof tmwSlot === 'undefined' || !tmwSlot) {
    return '';
  }

  if (tmwSlot.assetsUrl) {
    return String(tmwSlot.assetsUrl).trim().replace(/\/$/, '');
  }

  if (tmwSlot.url) {
    return `${String(tmwSlot.url).trim().replace(/\/$/, '')}/assets`;
  }

  return '';
};

// Define available icons
const tmwIcons = [
  'bonus.png',
  'peeks.png',
  'deal.png',
  'roses.png',
  'value.png'
];

const getIconPool = () => {
  if (typeof tmwSlot !== 'undefined' && Array.isArray(tmwSlot.icons) && tmwSlot.icons.length) {
    return tmwSlot.icons.filter(Boolean);
  }
  return tmwIcons.filter(Boolean);
};

const getWinRate = () => {
  if (typeof tmwSlot !== 'undefined' && tmwSlot && typeof tmwSlot.winRate !== 'undefined') {
    const parsed = Number(tmwSlot.winRate);
    if (Number.isFinite(parsed)) {
      return Math.min(100, Math.max(0, parsed));
    }
  }
  return 50;
};

const getTmwIconUrl = icon => {
  if (icon === null || typeof icon === 'undefined') {
    return '';
  }

  const iconString = String(icon).trim();
  if (!iconString) {
    return '';
  }

  if (/^(?:https?:)?\/\//i.test(iconString) || iconString.startsWith('data:')) {
    return iconString;
  }

  const normalizedIcon = iconString.replace(/^\/+/, '').replace(/^img\//, '');
  const baseUrl = resolveAssetsBaseUrl();

  if (baseUrl) {
    return `${baseUrl}/img/${normalizedIcon}`;
  }

  return `assets/img/${normalizedIcon}`;
};

const ensureReelImage = reel => {
  if (!reel) {
    return null;
  }
  let img = reel.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'lazy';
    img.draggable = false;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.display = 'block';
    img.style.pointerEvents = 'none';
    reel.innerHTML = '';
    reel.appendChild(img);
  }
  return img;
};

const setIconOnReel = (reel, icon) => {
  if (!reel || (icon === null || typeof icon === 'undefined')) {
    return;
  }

  const iconUrl = getTmwIconUrl(icon);
  if (!iconUrl) {
    return;
  }

  const img = ensureReelImage(reel);
  if (img) {
    img.src = iconUrl;
    const altSource = typeof icon === 'string' && icon ? icon : iconUrl;
    const baseName = (altSource || '').split('/').pop() || '';
    img.alt = baseName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
    reel.style.backgroundImage = 'none';
  } else {
    reel.style.backgroundImage = `url(${iconUrl})`;
  }
  reel.style.backgroundSize = 'contain';
  reel.style.backgroundRepeat = 'no-repeat';
  reel.style.backgroundPosition = 'center';
};

const applySpinResult = (reels, iconPool, isWinningSpin) => {
  const reelArray = Array.from(reels || []);
  const pool = Array.isArray(iconPool) ? iconPool.filter(Boolean) : getIconPool();

  if (!reelArray.length || !pool.length) {
    return [];
  }

  const pickRandomIcon = () => pool[Math.floor(Math.random() * pool.length)];

  if (isWinningSpin) {
    const winningIcon = pickRandomIcon();
    reelArray.forEach(reel => setIconOnReel(reel, winningIcon));
    return reelArray.map(() => winningIcon);
  }

  const selectedIcons = reelArray.map(() => pickRandomIcon());

  if (selectedIcons.length > 1) {
    const firstIcon = selectedIcons[0];
    const allSame = selectedIcons.every(icon => icon === firstIcon);
    if (allSame) {
      const alternativeIcon = pool.find(icon => icon !== firstIcon);
      if (alternativeIcon) {
        selectedIcons[selectedIcons.length - 1] = alternativeIcon;
      }
    }
  }

  reelArray.forEach((reel, index) => setIconOnReel(reel, selectedIcons[index]));
  return selectedIcons;
};

const setRandomIconsOnReels = reels => {
  const reelArray = Array.from(reels || []);
  const iconPool = getIconPool();

  if (!reelArray.length || !iconPool.length) {
    return;
  }

  const shuffled = iconPool.slice();
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const iconsToUse = shuffled.slice(0, Math.min(reelArray.length, shuffled.length));
  if (!iconsToUse.length) {
    return;
  }

  reelArray.forEach((reel, index) => {
    const icon = iconsToUse[index % iconsToUse.length];
    setIconOnReel(reel, icon);
  });
};

function logSlotState(label) {
  if (typeof fetch !== 'function') {
    return;
  }

  const stateLabel = typeof label === 'string' && label ? label : 'unknown';

  fetch('/wp-admin/admin-ajax.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `action=tmw_slot_log&state=${encodeURIComponent(stateLabel)}`
  }).catch(() => {});
}

// Preload icons to prevent empty reels on first spin
(function preloadTmwIcons() {
  const iconsToPreload = getIconPool();
  iconsToPreload.forEach(icon => {
    const img = new Image();
    const url = getTmwIconUrl(icon);
    if (url) {
      img.src = url;
    }
  });
  if (iconsToPreload.length) {
    console.log('[TMW Slot Machine] Icons preloaded:', iconsToPreload.join(', '));
  }
})();

// Apply random icons on load for fallback contexts
document.addEventListener('DOMContentLoaded', () => {
  const reels = document.querySelectorAll('.reel');
  setRandomIconsOnReels(reels);
});

/* =========================================================
   [TMW-DEBUG] v1.1.6d — Desktop clickability HUD & logs
   Enabled only with ?tmwDebug=1
   No effect for normal visitors
   ========================================================= */
(function(){
  try {
    const params = new URLSearchParams(location.search);
    if (!params.get('tmwDebug')) return;

    document.documentElement.classList.add('tmw-debug');
    document.body.classList.add('tmw-debug');

    // Find the current slot container (first one on page)
    const container = document.querySelector('.tmw-slot-machine');
    if (!container) { console.warn('[TMW-DEBUG] no .tmw-slot-machine'); return; }

    // Build HUD
    const hud = document.createElement('div');
    hud.className = 'tmw-debug-hud';
    hud.innerHTML =
      '<div style="margin-bottom:6px;font-weight:700;">TMW DEBUG</div>' +
      '<div style="margin-bottom:6px;">Spin top: <span id="tmwTopSpin">—</span></div>' +
      '<div style="margin-bottom:6px;">Sound top: <span id="tmwTopSound">—</span></div>' +
      '<div style="margin-bottom:6px;">Claim top: <span id="tmwTopClaim">—</span></div>' +
      '<div style="margin-bottom:6px;">Last mutation: <span id="tmwMut">—</span></div>' +
      '<div style="margin-bottom:6px;">' +
        '<button id="tmwToggleGuard" type="button">Guard: OFF</button>' +
        '<button id="tmwSnapshot" type="button">Snapshot</button>' +
      '</div>' +
      '<div id="tmwLog" style="max-height:160px;overflow:auto;white-space:pre-wrap;"></div>';
    container.style.position = container.style.position || 'relative';
    container.appendChild(hud);

    const elSpin  = container.querySelector('.slot-btn');
    const elSound = container.querySelector('.sound-toggle');
    const elClaim = container.querySelector('.tmw-claim-bonus');

    function centerPoint(el){
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) };
    }

    function cssPath(el){
      if (!el || !el.tagName) return String(el);
      const out = [];
      let cur = el;
      while (cur && cur.nodeType === 1 && out.length < 6) {
        const id = cur.id ? '#' + cur.id : '';
        const cls = (cur.className && typeof cur.className === 'string')
          ? '.' + cur.className.trim().split(/\s+/).slice(0,2).join('.') : '';
        out.unshift(cur.tagName.toLowerCase() + id + cls);
        cur = cur.parentElement;
      }
      return out.join(' > ');
    }

    function topAt(el){
      if (!el) return null;
      const {x,y} = centerPoint(el);
      const top = document.elementFromPoint(x,y);
      if (top) {
        // flag as click-shield if it isn't the control itself
        if (top !== el && !el.contains(top)) top.setAttribute('data-tmw-clickshield','1');
      }
      const cs = top ? getComputedStyle(top) : null;
      return {
        node: top,
        hint: top ? cssPath(top) : 'null',
        pe: cs ? cs.pointerEvents : '—',
        z: cs ? cs.zIndex : '—',
        pos: cs ? cs.position : '—',
        tf: cs ? cs.transform : '—',
        op: cs ? cs.opacity : '—'
      };
    }

    function setTxt(id, txt){ const n = hud.querySelector('#'+id); if (n) n.textContent = txt; }
    function log(txt){ const l = hud.querySelector('#tmwLog'); if (l) { l.textContent += txt + '\n'; l.scrollTop = l.scrollHeight; } }

    function update(){
      const a = topAt(elSpin);
      const b = topAt(elSound);
      const c = topAt(elClaim);
      setTxt('tmwTopSpin',  a ? a.hint + ' | pe:' + a.pe + ' z:' + a.z : '—');
      setTxt('tmwTopSound', b ? b.hint + ' | pe:' + b.pe + ' z:' + b.z : '—');
      setTxt('tmwTopClaim', c ? c.hint + ' | pe:' + c.pe + ' z:' + c.z : '—');
    }

    // Toggle guard ON/OFF to force-clickable test
    hud.querySelector('#tmwToggleGuard').addEventListener('click', function(){
      const on = container.classList.toggle('tmw-guard-on');
      this.textContent = 'Guard: ' + (on ? 'ON' : 'OFF');
      update();
      log('[TMW-DEBUG] Guard ' + (on ? 'ENABLED' : 'DISABLED'));
    });

    // Manual snapshot
    hud.querySelector('#tmwSnapshot').addEventListener('click', function(){
      update();
      log('[TMW-DEBUG] Snapshot: ' + (new Date()).toISOString());
    });

    // Global click-phase logger for the slot
    ['capture','bubble'].forEach(phase => {
      const useCapture = phase === 'capture';
      container.addEventListener('click', function(ev){
        log('[TMW-DEBUG] click ' + phase + ' target=' + cssPath(ev.target));
      }, useCapture);
    });

    // Mutation logger on center visuals (common offenders)
    const mutTarget = container.querySelector('.slot-center') || container;
    const mo = new MutationObserver(muts => {
      const m = muts[0];
      const t = (m && m.target) ? cssPath(m.target) : '—';
      setTxt('tmwMut', t);
      update();
      console.warn('[TMW-DEBUG] mutation:', m);
    });
    mo.observe(mutTarget, { childList:true, subtree:true, attributes:true, attributeFilter:['class','style'] });

    // Initial & periodic updates, plus a delayed update (~1s after load)
    update();
    setTimeout(update, 1200);
    setInterval(update, 500);

    console.log('%c[TMW-DEBUG] Debug HUD active (?tmwDebug=1). Use Guard toggle and Snapshot.','background:#222;color:#0f0;padding:3px 5px;border-radius:3px;');
  } catch(e) {
    console.error('[TMW-DEBUG] error', e);
  }
})();

