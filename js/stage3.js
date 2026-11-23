const stage3 = {
  stageElement: null,
  heroElement: null,
  dimOverlay: null,
  batsLayer: null,
  petalsCanvas: null,
  petalsCtx: null,
  candleStage: null,
  candleWrap: null,
  candleBtn: null,
  candleBtnText: null,
  smokeContainer: null,
  finaleMessage: null,
  descentEmbersContainer: null,
  parallaxLayers: [],
  batsList: [],
  isInitialized: false,
  isActive: false,
  isCandleExtinguished: false,
  prefersReducedMotion: false,
  lastTouchTime: 0,
  targetMouseX: 0,
  targetMouseY: 0,
  currentMouseX: 0,
  currentMouseY: 0,
  targetScrollY: 0,
  currentScrollY: 0,
  lastScrollY: 0,
  ambientPhase: 0,
  ambientRamp: 0,
  batFlightClock: 0,
  batBurstEnergy: 0,
  parallaxRafId: null,
  petalsRafId: null,
  petalsList: [],
  embersList: [],
  revealObserver: null,
  timers: [],
  audioCtx: null,

  init() {
    this.stageElement = document.getElementById('stage-3');
    this.heroElement = document.getElementById('stage3-hero');
    this.dimOverlay = document.getElementById('stage3-dim-overlay');
    this.batsLayer = document.getElementById('stage3-bats-layer');
    this.petalsCanvas = document.getElementById('stage3-petals-canvas');
    this.candleStage = document.getElementById('stage3-candle-stage');
    this.candleWrap = document.getElementById('candle-interactive-wrap');
    this.candleBtn = document.getElementById('stage3-candle-btn');
    this.candleBtnText = document.getElementById('stage3-candle-btn-text');
    this.smokeContainer = document.getElementById('candle-smoke-container');
    this.finaleMessage = document.getElementById('stage3-finale-message');
    this.descentEmbersContainer = document.getElementById('descent-embers');

    if (!this.stageElement) {
      return;
    }

    this.prefersReducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.isActive = true;
    this.ambientRamp = 0;
    this.collectParallaxLayers();
    this.applyTranslations();

    if (!this.isInitialized) {
      this.bindEvents();
      this.spawnDescentEmbers();
      this.initBatsFlock();
      this.setupRevealObserver();
      this.resizeCanvas();
      this.isInitialized = true;
    }

    window.scrollTo(0, 0);
    this.targetScrollY = 0;
    this.currentScrollY = 0;
    this.lastScrollY = 0;

    this.handleStage2CounterTransition();
    this.startParallaxLoop();
  },

  collectParallaxLayers() {
    const nodeList = this.stageElement.querySelectorAll('.hero-parallax-layer');
    this.parallaxLayers = Array.from(nodeList).map((el) => ({
      el,
      depthX: parseFloat(el.getAttribute('data-depth-x') || '0'),
      depthY: parseFloat(el.getAttribute('data-depth-y') || '0'),
      scrollSpeed: parseFloat(el.getAttribute('data-scroll-speed') || '0')
    }));
  },

  handleStage2CounterTransition() {
    const counterFocal = document.getElementById('stage2-counter-focal');
    const heroNumber = document.getElementById('stage3-hero-number');
    if (heroNumber) {
      heroNumber.textContent = '18';
    }

    const revealTimer = setTimeout(() => {
      if (counterFocal) {
        counterFocal.classList.add('is-handed-off');
      }
      if (this.stageElement) {
        this.stageElement.classList.add('is-hero-revealed');
      }
    }, 320);
    this.timers.push(revealTimer);
  },

  applyTranslations() {
    if (typeof i18n === 'undefined') {
      return;
    }

    document.documentElement.lang = i18n.currentLanguage || 'uk';
    const metaTitle = i18n.t('metaTitle');
    if (metaTitle && metaTitle !== 'metaTitle') {
      document.title = metaTitle;
    }

    this.setText('stage3-hero-prefix', i18n.t('stage3.heroPrefix'));
    this.setText('stage3-hero-suffix', i18n.t('stage3.heroSuffix'));
    this.setText('stage3-hero-name', i18n.t('stage3.heroName'));
    this.setText('stage3-descent-label', i18n.t('stage3.descentLabel'));

    this.setText('stage3-card-label', i18n.t('stage3.cardLabel'));
    this.setText('stage3-card-title', i18n.t('stage3.cardTitle'));
    this.setText('stage3-greeting-p1', i18n.t('stage3.greetingP1'));
    this.setText('stage3-greeting-p2', i18n.t('stage3.greetingP2'));
    this.setText('stage3-greeting-sign', i18n.t('stage3.greetingSign'));

    this.setText('stage3-gallery-label', i18n.t('stage3.galleryLabel'));
    this.setText('stage3-gallery-title', i18n.t('stage3.galleryTitle'));
    this.setText('stage3-gallery-subtitle', i18n.t('stage3.gallerySubtitle'));

    const galleryCards = i18n.t('stage3.galleryCards');
    if (Array.isArray(galleryCards)) {
      galleryCards.forEach((cardData, index) => {
        const codeEl = this.stageElement.querySelector(`[data-gallery-code="${index}"]`);
        const titleEl = this.stageElement.querySelector(`[data-gallery-title="${index}"]`);
        const captionEl = this.stageElement.querySelector(`[data-gallery-caption="${index}"]`);
        if (codeEl && cardData.code) {
          codeEl.textContent = cardData.code;
        }
        if (titleEl && cardData.title) {
          titleEl.textContent = cardData.title;
        }
        if (captionEl && cardData.caption) {
          captionEl.textContent = cardData.caption;
        }
      });
    }

    this.setText('stage3-wishes-label', i18n.t('stage3.wishesLabel'));
    this.setText('stage3-wishes-title', i18n.t('stage3.wishesTitle'));

    const wishes = i18n.t('stage3.wishes');
    if (Array.isArray(wishes)) {
      wishes.forEach((wishItem, index) => {
        const titleEl = this.stageElement.querySelector(`[data-wish-title="${index}"]`);
        const textEl = this.stageElement.querySelector(`[data-wish-text="${index}"]`);
        if (titleEl) {
          titleEl.textContent = typeof wishItem === 'object' ? wishItem.title : '';
        }
        if (textEl) {
          textEl.textContent = typeof wishItem === 'object' ? wishItem.text : String(wishItem);
        }
      });
    }

    this.setText('stage3-finale-label', i18n.t('stage3.finaleLabel'));
    this.setText('stage3-finale-title', i18n.t('stage3.finaleTitle'));
    this.setText('stage3-finale-subtitle', i18n.t('stage3.finaleSubtitle'));

    if (this.isCandleExtinguished) {
      this.setText('stage3-candle-btn-text', i18n.t('stage3.candleExtinguishedAction'));
    } else {
      this.setText('stage3-candle-btn-text', i18n.t('stage3.candleAction'));
    }

    this.setText('stage3-wish-granted', i18n.t('stage3.candleWishGranted'));
    this.setText('stage3-wish-sub', i18n.t('stage3.candleWishSub'));
  },

  setText(elementId, value) {
    const el = document.getElementById(elementId);
    if (el && typeof value === 'string') {
      el.textContent = value;
    }
  },

  getScrollTop() {
    let rectScroll = 0;
    if (this.heroElement) {
      const rect = this.heroElement.getBoundingClientRect();
      rectScroll = Math.max(0, -rect.top);
    }
    const winScroll = window.scrollY || window.pageYOffset || 0;
    const docScroll = (document.documentElement && document.documentElement.scrollTop) || 0;
    const bodyScroll = (document.body && document.body.scrollTop) || 0;
    return Math.max(rectScroll, winScroll, docScroll, bodyScroll);
  },

  bindEvents() {
    window.addEventListener('mousemove', (event) => {
      if (!this.isActive || this.prefersReducedMotion) {
        return;
      }
      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      this.targetMouseX = ((event.clientX / vw) - 0.5) * 2;
      this.targetMouseY = ((event.clientY / vh) - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('touchmove', (event) => {
      if (!this.isActive || this.prefersReducedMotion || !event.touches || !event.touches[0]) {
        return;
      }
      const touch = event.touches[0];
      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      this.targetMouseX = ((touch.clientX / vw) - 0.5) * 2;
      this.targetMouseY = ((touch.clientY / vh) - 0.5) * 2;
    }, { passive: true });

    const onScrollUpdate = () => {
      if (!this.isActive) {
        return;
      }
      this.targetScrollY = this.getScrollTop();
      this.lastScrollY = this.targetScrollY;

      if (this.targetScrollY > 10) {
        const counterFocal = document.getElementById('stage2-counter-focal');
        if (counterFocal && !counterFocal.classList.contains('is-handed-off')) {
          counterFocal.classList.add('is-handed-off');
        }
        if (this.stageElement && !this.stageElement.classList.contains('is-hero-revealed')) {
          this.stageElement.classList.add('is-hero-revealed');
        }
      }
    };

    window.addEventListener('scroll', onScrollUpdate, { capture: true, passive: true });

    window.addEventListener('resize', () => {
      this.resizeCanvas();
    }, { passive: true });

    const galleryCards = this.stageElement.querySelectorAll('.gallery-card');
    galleryCards.forEach((card) => {
      card.addEventListener('touchstart', () => {
        galleryCards.forEach((other) => {
          if (other !== card) {
            other.classList.remove('is-active-card');
          }
        });
        card.classList.toggle('is-active-card');
      }, { passive: true });
    });

    const handleCandleTouch = (event) => {
      if (this.isCandleExtinguished) {
        return;
      }
      this.lastTouchTime = Date.now();
      event.preventDefault();
      this.extinguishCandle();
    };

    const handleCandleClick = (event) => {
      if (this.isCandleExtinguished) {
        return;
      }
      if (Date.now() - this.lastTouchTime < 450) {
        return;
      }
      event.preventDefault();
      this.extinguishCandle();
    };

    const handleCandleKey = (event) => {
      if (this.isCandleExtinguished) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.extinguishCandle();
      }
    };

    if (this.candleBtn) {
      this.candleBtn.addEventListener('touchstart', handleCandleTouch, { passive: false });
      this.candleBtn.addEventListener('click', handleCandleClick);
    }

    if (this.candleWrap) {
      this.candleWrap.addEventListener('touchstart', handleCandleTouch, { passive: false });
      this.candleWrap.addEventListener('click', handleCandleClick);
      this.candleWrap.addEventListener('keydown', handleCandleKey);
    }
  },

  startParallaxLoop() {
    if (this.parallaxRafId) {
      cancelAnimationFrame(this.parallaxRafId);
    }

    const tick = () => {
      if (!this.isActive) {
        return;
      }

      this.targetScrollY = this.getScrollTop();
      const heroHeight = (this.heroElement && this.heroElement.offsetHeight) || window.innerHeight || 800;
      const lerpFactor = this.prefersReducedMotion ? 1 : 0.065;

      if (!this.prefersReducedMotion) {
        this.ambientPhase += 0.007;
        this.ambientRamp = Math.min(1, this.ambientRamp + 0.018);
      }

      const ambientX = this.prefersReducedMotion ? 0 : Math.sin(this.ambientPhase) * 0.03 * this.ambientRamp;
      const ambientY = this.prefersReducedMotion ? 0 : Math.cos(this.ambientPhase * 0.72) * 0.02 * this.ambientRamp;

      const desiredX = (this.targetMouseX * this.ambientRamp) + ambientX;
      const desiredY = (this.targetMouseY * this.ambientRamp) + ambientY;

      this.currentMouseX += (desiredX - this.currentMouseX) * lerpFactor;
      this.currentMouseY += (desiredY - this.currentMouseY) * lerpFactor;

      const scrollDiff = this.targetScrollY - this.currentScrollY;
      if (Math.abs(scrollDiff) < 0.35) {
        this.currentScrollY = this.targetScrollY;
      } else {
        this.currentScrollY += scrollDiff * 0.24;
      }

      const scrollRatio = Math.max(0, Math.min(1.5, this.currentScrollY / heroHeight));

      if (this.stageElement) {
        const darkness = Math.min(1, scrollRatio * 1.05);
        const strataRise = Math.min(125, scrollRatio * 108);
        this.stageElement.style.setProperty('--descent-progress', scrollRatio.toFixed(3));
        this.stageElement.style.setProperty('--hero-darkness', darkness.toFixed(3));
        this.stageElement.style.setProperty('--strata-shift', `${strataRise.toFixed(1)}px`);
      }

      if (scrollRatio <= 1.35) {
        const maxShiftX = Math.min(window.innerWidth * 0.055, 64);
        const maxShiftY = Math.min(window.innerHeight * 0.042, 42);

        for (let i = 0; i < this.parallaxLayers.length; i++) {
          const layer = this.parallaxLayers[i];
          const moveX = this.prefersReducedMotion ? 0 : -this.currentMouseX * maxShiftX * layer.depthX;
          const moveY = this.prefersReducedMotion ? 0 : -this.currentMouseY * maxShiftY * layer.depthY;
          const scrollOffsetY = this.currentScrollY * layer.scrollSpeed;
          const totalY = moveY + scrollOffsetY;

          layer.el.style.transform = `translate3d(${moveX.toFixed(2)}px, ${totalY.toFixed(2)}px, 0)`;
        }
      }

      this.updateBatsFlock(scrollRatio);

      this.parallaxRafId = requestAnimationFrame(tick);
    };

    this.parallaxRafId = requestAnimationFrame(tick);
  },

  initBatsFlock() {
    if (!this.batsLayer) {
      return;
    }

    this.batsLayer.innerHTML = '';
    this.batsList = [];
    const count = 32;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const batEl = document.createElement('div');
      batEl.className = 'bat-actor';

      batEl.innerHTML = `
        <svg class="bat-svg" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
          <g class="bat-wing-left">
            <path d="M50,26 C38,8 16,2 1,14 C12,20 18,28 15,40 C26,32 35,34 41,43 C44,35 47,31 50,32 Z" fill="#1b090e" stroke="#ff5c5e" stroke-width="1.65" />
          </g>
          <g class="bat-wing-right">
            <path d="M50,26 C62,8 84,2 99,14 C88,20 82,28 85,40 C74,32 65,34 59,43 C56,35 53,31 50,32 Z" fill="#1b090e" stroke="#ff5c5e" stroke-width="1.65" />
          </g>
          <ellipse cx="50" cy="29" rx="6" ry="10" fill="#14070b" stroke="rgba(255, 107, 107, 0.45)" stroke-width="0.9" />
          <polygon points="45.5,21 43,10 49,19" fill="#14070b" />
          <polygon points="54.5,21 57,10 51,19" fill="#14070b" />
          <circle cx="47.8" cy="22" r="1.4" fill="#ff8585" />
          <circle cx="52.2" cy="22" r="1.4" fill="#ff8585" />
        </svg>
      `;

      fragment.appendChild(batEl);

      const fromLeft = i % 2 === 0;
      const lane = (i / count);
      const startX = fromLeft ? (-8 + (i % 4) * 6) : (108 - (i % 4) * 6);
      const endX = fromLeft ? (106 + (i % 3) * 5) : (-6 - (i % 3) * 5);
      const startY = 66 + (lane * 28) + ((i % 3) - 1) * 6;
      const endY = 8 + ((1 - lane) * 40) + ((i % 4) - 1.5) * 6;
      const ctrlX = 50 + (fromLeft ? 16 : -16) + ((i % 5) - 2) * 8;
      const ctrlY = Math.min(startY, endY) - 16 - (i % 4) * 6;
      const enterAt = (i / count) * 0.38;
      const span = 0.56 + (i % 3) * 0.03;

      this.batsList.push({
        el: batEl,
        startX,
        startY,
        ctrlX,
        ctrlY,
        endX,
        endY,
        enterAt,
        span,
        scale: 0.65 + (i % 6) * 0.16,
        swayAmp: 15 + (i % 4) * 7,
        swayFreq: 3.4 + (i % 5) * 0.7,
        flapCycles: 11 + (i % 4) * 3,
        flapPhaseOffset: (i % 7) * 0.9,
        fromLeft
      });
    }

    this.batsLayer.appendChild(fragment);
  },

  updateBatsFlock(scrollRatio) {
    if (!this.batsList || this.batsList.length === 0) {
      return;
    }

    const zoneStart = 0.04;
    const zoneEnd = 1.08;

    if (scrollRatio <= zoneStart || scrollRatio >= zoneEnd) {
      for (let i = 0; i < this.batsList.length; i++) {
        this.batsList[i].el.style.opacity = '0';
      }
      return;
    }

    const zoneProgress = (scrollRatio - zoneStart) / (zoneEnd - zoneStart);
    const vw = window.innerWidth || 1440;
    const vh = window.innerHeight || 900;

    for (let i = 0; i < this.batsList.length; i++) {
      const bat = this.batsList[i];
      const t = (zoneProgress - bat.enterAt) / bat.span;

      if (t <= 0 || t >= 1) {
        bat.el.style.opacity = '0';
        continue;
      }

      const invT = 1 - t;
      const pctX = (invT * invT * bat.startX) + (2 * invT * t * bat.ctrlX) + (t * t * bat.endX);
      const pctY = (invT * invT * bat.startY) + (2 * invT * t * bat.ctrlY) + (t * t * bat.endY);

      const x = (pctX / 100) * vw;
      const y = (pctY / 100) * vh + Math.sin(t * Math.PI * bat.swayFreq) * bat.swayAmp;

      const dx = 2 * invT * (bat.ctrlX - bat.startX) + 2 * t * (bat.endX - bat.ctrlX);
      const dy = 2 * invT * (bat.ctrlY - bat.startY) + 2 * t * (bat.endY - bat.ctrlY);
      const angleDeg = Math.atan2(dy, Math.abs(dx)) * (180 / Math.PI) * 0.45 * (bat.fromLeft ? 1 : -1);

      const flapWave = Math.sin(t * Math.PI * bat.flapCycles + bat.flapPhaseOffset);
      const wingRot = flapWave * 27;
      const wingScaleY = 0.91 - flapWave * 0.15;

      let edgeAlpha = 1;
      if (t < 0.14) {
        edgeAlpha = t / 0.14;
      } else if (t > 0.86) {
        edgeAlpha = (1 - t) / 0.14;
      }

      bat.el.style.opacity = Math.max(0, Math.min(1, edgeAlpha)).toFixed(3);
      bat.el.style.setProperty('--bat-wing-left-rot', `${wingRot.toFixed(1)}deg`);
      bat.el.style.setProperty('--bat-wing-right-rot', `${(-wingRot).toFixed(1)}deg`);
      bat.el.style.setProperty('--bat-wing-sy', wingScaleY.toFixed(3));
      bat.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${angleDeg.toFixed(1)}deg) scale(${bat.scale.toFixed(2)})`;
    }
  },

  spawnDescentEmbers() {
    if (!this.descentEmbersContainer) {
      return;
    }

    this.descentEmbersContainer.innerHTML = '';
    const count = 18;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const mote = document.createElement('span');
      mote.className = 'descent-ember-mote';
      const leftPos = 4 + (i / count) * 92 + (Math.random() - 0.5) * 4;
      const size = 2.5 + Math.random() * 4;
      const duration = 4.2 + Math.random() * 4.5;
      const delay = Math.random() * 5;
      const drift = (Math.random() - 0.5) * 65;

      mote.style.left = `${leftPos.toFixed(1)}%`;
      mote.style.setProperty('--mote-size', `${size.toFixed(1)}px`);
      mote.style.setProperty('--mote-dur', `${duration.toFixed(2)}s`);
      mote.style.setProperty('--mote-delay', `${delay.toFixed(2)}s`);
      mote.style.setProperty('--mote-drift', `${drift.toFixed(1)}px`);

      fragment.appendChild(mote);
    }

    this.descentEmbersContainer.appendChild(fragment);
  },

  setupRevealObserver() {
    const revealTargets = this.stageElement.querySelectorAll('.reveal-on-scroll');
    if (!('IntersectionObserver' in window) || this.prefersReducedMotion) {
      revealTargets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, {
      threshold: 0.14,
      rootMargin: '0px 0px -40px 0px'
    });

    revealTargets.forEach((el) => this.revealObserver.observe(el));
  },

  extinguishCandle() {
    if (this.isCandleExtinguished) {
      return;
    }

    this.isCandleExtinguished = true;

    if (this.candleStage) {
      this.candleStage.classList.add('is-extinguished');
    }

    if (this.candleBtn) {
      this.candleBtn.classList.add('is-disabled');
      this.candleBtn.setAttribute('aria-disabled', 'true');
    }

    if (typeof i18n !== 'undefined') {
      this.setText('stage3-candle-btn-text', i18n.t('stage3.candleExtinguishedAction'));
    }

    this.playExtinguishAudioAndHaptics();
    this.spawnRisingSmoke();

    if (this.dimOverlay) {
      this.dimOverlay.classList.add('is-dimmed');
    }

    const petalsTimer = setTimeout(() => {
      this.startPetalsAndEmbersFinale();
    }, 320);
    this.timers.push(petalsTimer);

    const messageTimer = setTimeout(() => {
      if (this.finaleMessage) {
        this.finaleMessage.classList.add('is-visible');
      }
    }, 850);
    this.timers.push(messageTimer);
  },

  spawnRisingSmoke() {
    if (!this.smokeContainer) {
      return;
    }

    this.smokeContainer.innerHTML = '';
    const puffCount = 16;

    for (let i = 0; i < puffCount; i++) {
      const spawnDelay = i * 110;
      const timer = setTimeout(() => {
        if (!this.smokeContainer) {
          return;
        }
        const puff = document.createElement('span');
        puff.className = 'smoke-puff';
        const size = 18 + Math.random() * 26;
        const direction = i % 2 === 0 ? 1 : -1;
        const dx = direction * (12 + Math.random() * 34);
        const dy = 110 + Math.random() * 95;
        const scale = 2.1 + Math.random() * 1.6;
        const dur = 2.1 + Math.random() * 1.1;

        puff.style.setProperty('--smoke-size', `${size.toFixed(0)}px`);
        puff.style.setProperty('--smoke-dx', `${dx.toFixed(1)}px`);
        puff.style.setProperty('--smoke-dy', `${dy.toFixed(1)}px`);
        puff.style.setProperty('--smoke-scale', scale.toFixed(2));
        puff.style.setProperty('--smoke-dur', `${dur.toFixed(2)}s`);

        this.smokeContainer.appendChild(puff);

        const cleanupTimer = setTimeout(() => {
          if (puff.parentNode) {
            puff.parentNode.removeChild(puff);
          }
        }, dur * 1000 + 100);
        this.timers.push(cleanupTimer);
      }, spawnDelay);
      this.timers.push(timer);
    }
  },

  resizeCanvas() {
    if (!this.petalsCanvas) {
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.petalsCanvas.width = Math.floor(width * dpr);
    this.petalsCanvas.height = Math.floor(height * dpr);
    this.petalsCtx = this.petalsCanvas.getContext('2d');
    if (this.petalsCtx) {
      this.petalsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  },

  createPetal(startAtTop) {
    const vw = window.innerWidth || 375;
    const vh = window.innerHeight || 667;
    const colors = [
      { main: '#b11226', edge: '#d9383a' },
      { main: '#8c0b1c', edge: '#b11226' },
      { main: '#d9383a', edge: '#ff6b6b' },
      { main: '#640713', edge: '#9e1122' }
    ];
    const palette = colors[Math.floor(Math.random() * colors.length)];

    return {
      x: Math.random() * vw,
      y: startAtTop ? -25 - Math.random() * vh * 0.65 : Math.random() * vh,
      size: 7 + Math.random() * 8.5,
      speedY: 0.75 + Math.random() * 1.15,
      speedX: (Math.random() - 0.5) * 0.7,
      swayAmp: 0.6 + Math.random() * 1.1,
      swayFreq: 0.012 + Math.random() * 0.018,
      swayPhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.025,
      flipPhase: Math.random() * Math.PI * 2,
      flipSpeed: 0.02 + Math.random() * 0.025,
      opacity: 0.65 + Math.random() * 0.3,
      mainColor: palette.main,
      edgeColor: palette.edge
    };
  },

  createEmber(startAtTop) {
    const vw = window.innerWidth || 375;
    const vh = window.innerHeight || 667;

    return {
      x: Math.random() * vw,
      y: startAtTop ? -15 - Math.random() * vh * 0.5 : Math.random() * vh,
      radius: 1.3 + Math.random() * 2.2,
      speedY: 0.45 + Math.random() * 0.85,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.018 + Math.random() * 0.02,
      pulsePhase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.45 ? '#ff6b6b' : '#ff9e7d'
    };
  },

  startPetalsAndEmbersFinale() {
    this.resizeCanvas();
    if (!this.petalsCtx) {
      return;
    }

    const isMobile = window.innerWidth < 640;
    const petalCount = isMobile ? 28 : 46;
    const emberCount = isMobile ? 16 : 26;

    this.petalsList = [];
    this.embersList = [];

    for (let i = 0; i < petalCount; i++) {
      this.petalsList.push(this.createPetal(true));
    }

    for (let i = 0; i < emberCount; i++) {
      this.embersList.push(this.createEmber(true));
    }

    if (this.petalsRafId) {
      cancelAnimationFrame(this.petalsRafId);
    }

    const renderParticles = () => {
      if (!this.petalsCtx) {
        return;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ctx = this.petalsCtx;

      ctx.clearRect(0, 0, vw, vh);

      for (let i = 0; i < this.embersList.length; i++) {
        const ember = this.embersList[i];
        ember.swayPhase += ember.swaySpeed;
        ember.pulsePhase += 0.04;
        ember.y += ember.speedY;
        ember.x += Math.sin(ember.swayPhase) * 0.55;

        if (ember.y > vh + 20) {
          ember.y = -15;
          ember.x = Math.random() * vw;
        }

        const alpha = 0.35 + (Math.sin(ember.pulsePhase) + 1) * 0.28;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = ember.color;
        ctx.shadowColor = '#d9383a';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (let i = 0; i < this.petalsList.length; i++) {
        const petal = this.petalsList[i];
        petal.swayPhase += petal.swayFreq;
        petal.flipPhase += petal.flipSpeed;
        petal.rotation += petal.rotationSpeed;
        petal.y += petal.speedY;
        petal.x += petal.speedX + Math.sin(petal.swayPhase) * petal.swayAmp;

        if (petal.y > vh + 30) {
          petal.y = -25;
          petal.x = Math.random() * vw;
        }
        if (petal.x > vw + 30) {
          petal.x = -25;
        } else if (petal.x < -30) {
          petal.x = vw + 25;
        }

        const flipScale = 0.35 + Math.abs(Math.cos(petal.flipPhase)) * 0.65;

        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);
        ctx.scale(1, flipScale);
        ctx.globalAlpha = petal.opacity;

        const s = petal.size;
        const grad = ctx.createRadialGradient(0, -s * 0.2, s * 0.1, 0, 0, s);
        grad.addColorStop(0, petal.edgeColor);
        grad.addColorStop(1, petal.mainColor);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * 0.95, -s * 0.75, s * 0.85, s * 0.65, 0, s);
        ctx.bezierCurveTo(-s * 0.85, s * 0.65, -s * 0.95, -s * 0.75, 0, -s);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      this.petalsRafId = requestAnimationFrame(renderParticles);
    };

    this.petalsRafId = requestAnimationFrame(renderParticles);
  },

  playExtinguishAudioAndHaptics() {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([25, 45, 30]);
      } catch (e) {
      }
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      const bufferSize = this.audioCtx.sampleRate * 0.45;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(620, now);
      filter.frequency.exponentialRampToValueAtTime(220, now + 0.42);
      filter.Q.setValueAtTime(1.8, now);

      const noiseGain = this.audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.01, now);
      noiseGain.gain.linearRampToValueAtTime(0.14, now + 0.08);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.audioCtx.destination);
      whiteNoise.start(now);
      whiteNoise.stop(now + 0.45);

      const chimeNotes = [440, 554.37, 659.25];
      chimeNotes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const start = now + 0.25 + idx * 0.14;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.06, start + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0008, start + 1.25);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(start);
        osc.stop(start + 1.3);
      });
    } catch (e) {
    }
  }
};

if (typeof window !== 'undefined') {
  window.stage3 = stage3;
}
