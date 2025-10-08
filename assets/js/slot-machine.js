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

    btn.addEventListener('click', () => {
      btn.disabled = true;
      result.textContent = '';
      reels.forEach(reel => reel.classList.add('spin'));
      playTone(440, 0.25);

      setTimeout(() => {
        reels.forEach(reel => reel.classList.remove('spin'));
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
