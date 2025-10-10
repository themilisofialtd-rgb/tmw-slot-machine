document.addEventListener('DOMContentLoaded', function() {
  const containers = document.querySelectorAll('.tmw-slot-machine');
  if (!containers.length) {
    return;
  }

  containers.forEach(container => {
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
    const btn = container.querySelector('.tmw-spin-btn');
    const reels = container.querySelectorAll('.reel');
    const result = container.querySelector('.tmw-result');
    const soundToggle = container.querySelector('.tmw-sound-toggle');

    if (!btn || !reels.length || !result || !soundToggle) {
      return;
    }

    result.classList.add('slot-result');

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

      result.textContent = 'You Win!';
      void result.offsetWidth;
      result.classList.add('show');
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

        winContainer.textContent = '';

        const textNode = document.createTextNode(`${displayMessage} `);
        winContainer.appendChild(textNode);

        const linkEl = document.createElement('a');
        linkEl.className = 'tmw-claim-bonus';
        linkEl.target = '_blank';
        linkEl.rel = 'nofollow noopener';
        linkEl.textContent = 'Claim Your Bonus';
        linkEl.href = trimmedUrl;
        winContainer.appendChild(linkEl);

        if (!result.contains(winContainer)) {
          result.innerHTML = '';
          result.appendChild(winContainer);
        } else {
          Array.from(result.children).forEach(child => {
            if (child !== winContainer) {
              child.remove();
            }
          });
        }

        return true;
      } catch (error) {
        return false;
      }
    };

    const showOfferMessage = iconName => {
      if (!result) {
        return;
      }

      result.classList.remove('show');

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
      const messageText = trimmedTitle ? `🎉 You Win ${trimmedTitle}!` : '🎉 You Win!';

      const wasUpdated = updateWinMessage(messageText, url);
      if (!wasUpdated) {
        showFallbackWinMessage();
        return;
      }

      void result.offsetWidth;
      result.classList.add('show');
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

    const updateSoundLabel = () => {
      soundToggle.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Enable Sound';
    };

    updateSoundLabel();

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
      updateSoundLabel();
    });

    const reelList = Array.from(reels);
    setRandomIconsOnReels(reelList);

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

      const flashes = Math.floor(Math.random() * 4) + 6; // 6–9 flashes
      let count = 0;

      flashIntervalId = setInterval(() => {
        count += 1;
        reelList.forEach(reel => {
          const icon = pool[Math.floor(Math.random() * pool.length)];
          setIconOnReel(reel, icon);
        });

        if (count >= flashes) {
          clearInterval(flashIntervalId);
          flashIntervalId = null;
          if (typeof onComplete === 'function') {
            onComplete();
          }
        }
      }, 250);
    };

    btn.addEventListener('click', () => {
      stopResultFlash();
      btn.disabled = true;
      result.textContent = '';
      result.classList.remove('show');
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
          showOfferMessage(matchedIcon);
          playWinSound();
        } else {
          result.textContent = 'Try Again!';
          result.classList.remove('show');
          playTone(260, 0.2);
        }

        btn.disabled = false;
      });
    });
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
