document.addEventListener('DOMContentLoaded', function() {
  const containers = document.querySelectorAll('.tmw-slot-machine');
  if (!containers.length) {
    return;
  }

  containers.forEach(container => {
    const btn = container.querySelector('.tmw-spin-btn');
    const reels = container.querySelectorAll('.reel');
    const result = container.querySelector('.tmw-result');
    const soundToggle = container.querySelector('.tmw-sound-toggle');

    if (!btn || !reels.length || !result || !soundToggle) {
      return;
    }

    const winRate = parseFloat(container.dataset.winRate || '20');
    let soundEnabled = (container.dataset.soundDefault || 'off') === 'on';
    let offers = [];
    let audioContext;

    if (container.dataset.offers) {
      try {
        const parsed = JSON.parse(container.dataset.offers);
        if (Array.isArray(parsed)) {
          offers = parsed.filter(offer => offer && offer.title && offer.url);
        }
      } catch (error) {
        console.error('TMW Slot Machine: invalid offers data', error);
      }
    }

    const defaultOffer = {
      title: 'Claim Reward',
      url: 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u'
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

    const startResultFlash = () => {
      stopResultFlash();

      const iconPool = (() => {
        if (typeof tmwSlot !== 'undefined' && Array.isArray(tmwSlot.icons) && tmwSlot.icons.length) {
          return tmwSlot.icons.filter(Boolean);
        }
        if (Array.isArray(tmwIcons)) {
          return tmwIcons.filter(Boolean);
        }
        return [];
      })();

      if (!reelList.length || !iconPool.length) {
        return;
      }

      const flashes = Math.floor(Math.random() * 4) + 6; // 6–9 flashes
      let count = 0;

      flashIntervalId = setInterval(() => {
        count += 1;
        reelList.forEach(reel => {
          const icon = iconPool[Math.floor(Math.random() * iconPool.length)];
          setIconOnReel(reel, icon);
        });

        if (count >= flashes) {
          clearInterval(flashIntervalId);
          flashIntervalId = null;
        }
      }, 250);
    };

    btn.addEventListener('click', () => {
      stopResultFlash();
      btn.disabled = true;
      result.textContent = '';
      setRandomIconsOnReels(reelList);
      reels.forEach(reel => reel.classList.add('spin'));
      playTone(440, 0.25);

      setTimeout(() => {
        reels.forEach(reel => reel.classList.remove('spin'));
        startResultFlash();

        const win = Math.random() * 100 < winRate;
        const offer = offers.length ? offers[Math.floor(Math.random() * offers.length)] : defaultOffer;

        if (win) {
          result.innerHTML = `🎉 You WON! <a href="${offer.url}" target="_blank" rel="noopener noreferrer">${offer.title}</a>`;
          playTone(880, 0.5);
        } else {
          result.innerHTML = `😅 So close! Try again or <a href="${offer.url}" target="_blank" rel="noopener noreferrer">grab ${offer.title}</a>.`;
          playTone(260, 0.2);
        }

        btn.disabled = false;
      }, 2500);
    });
  });
});

// === TMW Neon Icons Enhancement ===

// Define available icons
const tmwIcons = [
  'bonus.png',
  'peeks.png',
  'deal.png',
  'roses.png',
  'value.png'
];

const getTmwIconUrl = icon => {
  if (typeof tmwSlot !== 'undefined' && tmwSlot.url) {
    return `${tmwSlot.url}assets/img/${icon}`;
  }
  return icon;
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
  if (!reel || !icon) {
    return;
  }
  const iconUrl = getTmwIconUrl(icon);
  const img = ensureReelImage(reel);
  if (img) {
    img.src = iconUrl;
    img.alt = icon.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    reel.style.backgroundImage = 'none';
  } else {
    reel.style.backgroundImage = `url(${iconUrl})`;
  }
  reel.style.backgroundSize = 'contain';
  reel.style.backgroundRepeat = 'no-repeat';
  reel.style.backgroundPosition = 'center';
};

const setRandomIconsOnReels = reels => {
  const reelArray = Array.from(reels || []);
  if (!reelArray.length || !tmwIcons.length) {
    return;
  }

  const shuffled = tmwIcons.slice();
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const iconsToUse = shuffled.slice(0, Math.min(reelArray.length, shuffled.length));

  reelArray.forEach((reel, index) => {
    const icon = iconsToUse[index % iconsToUse.length];
    setIconOnReel(reel, icon);
  });
};

// Preload icons to prevent empty reels on first spin
(function preloadTmwIcons() {
  tmwIcons.forEach(icon => {
    const img = new Image();
    const url = getTmwIconUrl(icon);
    if (url) {
      img.src = url;
    }
  });
  console.log('[TMW Slot Machine] Icons preloaded:', tmwIcons.join(', '));
})();

// Apply random icons on load for fallback contexts
document.addEventListener('DOMContentLoaded', () => {
  const reels = document.querySelectorAll('.reel');
  setRandomIconsOnReels(reels);
});
