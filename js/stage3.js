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
  batsVisible: false,
  isInitialized: false,
  isActive: false,
  isCandleExtinguished: false,
  prefersReducedMotion: false,
  lastTouchTime: 0,
  viewportWidth: 1440,
  viewportHeight: 900,
  heroHeight: 800,
  targetMouseX: 0,
  targetMouseY: 0,
  currentMouseX: 0,
  currentMouseY: 0,
  targetScrollY: 0,
  currentScrollY: 0,
  lastScrollY: 0,
  ambientPhase: 0,
  ambientRamp: 0,
  parallaxRafId: null,
  petalsRafId: null,
  petalsList: [],
  embersList: [],
  petalSprites: [],
  emberSprites: {},
  asciiFlowers: [],
  angelInstance: null,
  angelObserver: null,
  asciiCharRamp: " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  revealObserver: null,
  timers: [],

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
      this.updateViewportMetrics();
      this.bindEvents();
      this.spawnDescentEmbers();
      this.initBatsFlock();
      this.setupRevealObserver();
      this.resizeCanvas();
      this.initGalleryAsciiFlowers();
      this.initWeepingAngel();
      this.isInitialized = true;
    } else {
      this.updateViewportMetrics();
      this.resizeGalleryAsciiFlowers();
      this.resizeWeepingAngel();
    }

    window.scrollTo(0, 0);
    this.targetScrollY = 0;
    this.currentScrollY = 0;
    this.lastScrollY = 0;

    this.handleStage2CounterTransition();
    this.startParallaxLoop();
  },

  updateViewportMetrics() {
    this.viewportWidth = window.innerWidth || 1440;
    this.viewportHeight = window.innerHeight || 900;
    this.heroHeight = (this.heroElement && this.heroElement.offsetHeight) || this.viewportHeight || 800;
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
    this.setText('stage3-angel-caption', i18n.t('stage3.angelCaption'));
  },

  setText(elementId, value) {
    const el = document.getElementById(elementId);
    if (el && typeof value === 'string') {
      el.textContent = value;
    }
  },

  getScrollTop() {
    return window.scrollY || window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop) || 0;
  },

  bindEvents() {
    window.addEventListener('mousemove', (event) => {
      if (!this.isActive || this.prefersReducedMotion) {
        return;
      }
      const vw = this.viewportWidth || 1;
      const vh = this.viewportHeight || 1;
      this.targetMouseX = ((event.clientX / vw) - 0.5) * 2;
      this.targetMouseY = ((event.clientY / vh) - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('touchmove', (event) => {
      if (!this.isActive || this.prefersReducedMotion || !event.touches || !event.touches[0]) {
        return;
      }
      const touch = event.touches[0];
      const vw = this.viewportWidth || 1;
      const vh = this.viewportHeight || 1;
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

      if (!this.parallaxRafId && this.targetScrollY <= this.heroHeight * 1.45) {
        this.startParallaxLoop();
      }
    };

    window.addEventListener('scroll', onScrollUpdate, { capture: true, passive: true });

    window.addEventListener('resize', () => {
      this.updateViewportMetrics();
      this.resizeCanvas();
      this.resizeGalleryAsciiFlowers();
      this.resizeWeepingAngel();
      if (!this.parallaxRafId && this.isActive && this.targetScrollY <= this.heroHeight * 1.45) {
        this.startParallaxLoop();
      }
    }, { passive: true });

    const galleryCards = this.stageElement.querySelectorAll('.gallery-card');
    galleryCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        this.setCardFlowerSpinning(card, true);
      });
      card.addEventListener('mouseleave', () => {
        if (!card.classList.contains('is-active-card')) {
          this.setCardFlowerSpinning(card, false);
        }
      });
      card.addEventListener('focusin', () => {
        this.setCardFlowerSpinning(card, true);
      });
      card.addEventListener('focusout', () => {
        if (!card.classList.contains('is-active-card')) {
          this.setCardFlowerSpinning(card, false);
        }
      });
      card.addEventListener('touchstart', () => {
        galleryCards.forEach((other) => {
          if (other !== card) {
            other.classList.remove('is-active-card');
            this.setCardFlowerSpinning(other, false);
          }
        });
        const isNowActive = card.classList.toggle('is-active-card');
        this.setCardFlowerSpinning(card, isNowActive);
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
      this.parallaxRafId = null;
    }

    const tick = () => {
      if (!this.isActive) {
        this.parallaxRafId = null;
        return;
      }

      const heroHeight = this.heroHeight || 800;
      const lerpFactor = this.prefersReducedMotion ? 1 : 0.065;

      const scrollDiff = this.targetScrollY - this.currentScrollY;
      if (Math.abs(scrollDiff) < 0.35) {
        this.currentScrollY = this.targetScrollY;
      } else {
        this.currentScrollY += scrollDiff * 0.24;
      }

      const scrollRatio = Math.max(0, Math.min(1.5, this.currentScrollY / heroHeight));

      if (scrollRatio > 1.38 && Math.abs(scrollDiff) < 0.35) {
        this.updateBatsFlock(scrollRatio);
        this.parallaxRafId = null;
        return;
      }

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

      if (this.stageElement) {
        const darkness = Math.min(1, scrollRatio * 1.05);
        const strataRise = Math.min(125, scrollRatio * 108);
        this.stageElement.style.setProperty('--descent-progress', scrollRatio.toFixed(3));
        this.stageElement.style.setProperty('--hero-darkness', darkness.toFixed(3));
        this.stageElement.style.setProperty('--strata-shift', `${strataRise.toFixed(1)}px`);
      }

      if (scrollRatio <= 1.35) {
        const maxShiftX = Math.min(this.viewportWidth * 0.055, 64);
        const maxShiftY = Math.min(this.viewportHeight * 0.042, 42);

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
    this.batsLayer.style.opacity = '0';
    this.batsVisible = false;
    this.batsList = [];
    const count = 32;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const batEl = document.createElement('div');
      batEl.className = 'bat-actor';

      batEl.innerHTML = `
        <svg class="bat-svg" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
          <g class="bat-wing-left"><use href="#bat-wing-l-def" /></g>
          <g class="bat-wing-right"><use href="#bat-wing-r-def" /></g>
          <use href="#bat-body-def" />
        </svg>
      `;

      const leftWing = batEl.querySelector('.bat-wing-left');
      const rightWing = batEl.querySelector('.bat-wing-right');

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
        leftWing,
        rightWing,
        isVisible: false,
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
      if (this.batsVisible && this.batsLayer) {
        this.batsLayer.style.opacity = '0';
        this.batsVisible = false;
      }
      return;
    }

    if (!this.batsVisible && this.batsLayer) {
      this.batsLayer.style.opacity = '1';
      this.batsVisible = true;
    }

    const zoneProgress = (scrollRatio - zoneStart) / (zoneEnd - zoneStart);
    const vw = this.viewportWidth;
    const vh = this.viewportHeight;

    for (let i = 0; i < this.batsList.length; i++) {
      const bat = this.batsList[i];
      const t = (zoneProgress - bat.enterAt) / bat.span;

      if (t <= 0 || t >= 1) {
        if (bat.isVisible) {
          bat.el.style.opacity = '0';
          bat.isVisible = false;
        }
        continue;
      }

      bat.isVisible = true;
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
      bat.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${angleDeg.toFixed(1)}deg) scale(${bat.scale.toFixed(2)})`;
      if (bat.leftWing) {
        bat.leftWing.style.transform = `rotate(${wingRot.toFixed(1)}deg) scaleY(${wingScaleY.toFixed(3)})`;
      }
      if (bat.rightWing) {
        bat.rightWing.style.transform = `rotate(${(-wingRot).toFixed(1)}deg) scaleY(${wingScaleY.toFixed(3)})`;
      }
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
          this.revealObserver.unobserve(entry.target);
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

  buildParticleSprites() {
    if (this.petalSprites.length > 0) {
      return;
    }

    const palettes = [
      { main: '#c9d1e0', edge: '#f4f1e8' },
      { main: '#8e93a3', edge: '#c9d1e0' },
      { main: '#f4f1e8', edge: '#ffffff' },
      { main: '#2a2d38', edge: '#8e93a3' }
    ];

    const baseRadius = 16;
    const dim = baseRadius * 2 + 4;
    const center = dim / 2;

    this.petalSprites = palettes.map((palette) => {
      const offscreen = document.createElement('canvas');
      offscreen.width = dim;
      offscreen.height = dim;
      const octx = offscreen.getContext('2d');
      octx.translate(center, center);
      const grad = octx.createRadialGradient(0, -baseRadius * 0.2, baseRadius * 0.1, 0, 0, baseRadius);
      grad.addColorStop(0, palette.edge);
      grad.addColorStop(1, palette.main);
      octx.fillStyle = grad;
      octx.beginPath();
      octx.moveTo(0, -baseRadius);
      octx.bezierCurveTo(baseRadius * 0.95, -baseRadius * 0.75, baseRadius * 0.85, baseRadius * 0.65, 0, baseRadius);
      octx.bezierCurveTo(-baseRadius * 0.85, baseRadius * 0.65, -baseRadius * 0.95, -baseRadius * 0.75, 0, -baseRadius);
      octx.closePath();
      octx.fill();
      return { canvas: offscreen, baseRadius, halfDim: center };
    });

    const emberColors = ['#f4f1e8', '#c9d1e0'];
    const emberDim = 28;
    const emberCenter = emberDim / 2;
    const emberBaseRadius = 4;

    emberColors.forEach((color) => {
      const offscreen = document.createElement('canvas');
      offscreen.width = emberDim;
      offscreen.height = emberDim;
      const octx = offscreen.getContext('2d');
      const glowGrad = octx.createRadialGradient(emberCenter, emberCenter, 0.5, emberCenter, emberCenter, emberCenter);
      glowGrad.addColorStop(0, color);
      glowGrad.addColorStop(0.3, color);
      glowGrad.addColorStop(0.6, 'rgba(233, 238, 255, 0.28)');
      glowGrad.addColorStop(1, 'rgba(233, 238, 255, 0)');
      octx.fillStyle = glowGrad;
      octx.beginPath();
      octx.arc(emberCenter, emberCenter, emberCenter, 0, Math.PI * 2);
      octx.fill();
      this.emberSprites[color] = { canvas: offscreen, baseRadius: emberBaseRadius, halfDim: emberCenter };
    });
  },

  createPetal(startAtTop) {
    const vw = this.viewportWidth || 375;
    const vh = this.viewportHeight || 667;
    const spriteIndex = Math.floor(Math.random() * 4);

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
      spriteIndex
    };
  },

  createEmber(startAtTop) {
    const vw = this.viewportWidth || 375;
    const vh = this.viewportHeight || 667;

    return {
      x: Math.random() * vw,
      y: startAtTop ? -15 - Math.random() * vh * 0.5 : Math.random() * vh,
      radius: 1.3 + Math.random() * 2.2,
      speedY: 0.45 + Math.random() * 0.85,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.018 + Math.random() * 0.02,
      pulsePhase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.45 ? '#f4f1e8' : '#c9d1e0'
    };
  },

  startPetalsAndEmbersFinale() {
    this.resizeCanvas();
    if (!this.petalsCtx) {
      return;
    }

    this.buildParticleSprites();

    const isMobile = this.viewportWidth < 640;
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

      const vw = this.viewportWidth;
      const vh = this.viewportHeight;
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
        const sprite = this.emberSprites[ember.color];
        if (sprite) {
          const scale = ember.radius / sprite.baseRadius;
          const drawRadius = sprite.halfDim * scale;
          ctx.globalAlpha = alpha;
          ctx.drawImage(
            sprite.canvas,
            ember.x - drawRadius,
            ember.y - drawRadius,
            drawRadius * 2,
            drawRadius * 2
          );
        }
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
        const sprite = this.petalSprites[petal.spriteIndex];
        if (sprite) {
          const sizeRatio = petal.size / sprite.baseRadius;
          ctx.save();
          ctx.translate(petal.x, petal.y);
          ctx.rotate(petal.rotation);
          ctx.scale(sizeRatio, sizeRatio * flipScale);
          ctx.globalAlpha = petal.opacity;
          ctx.drawImage(sprite.canvas, -sprite.halfDim, -sprite.halfDim);
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;
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
      const ctx = (typeof app !== 'undefined' && typeof app.getAudioContext === 'function')
        ? app.getAudioContext()
        : null;
      if (!ctx) {
        return;
      }

      const now = ctx.currentTime;

      const bufferSize = ctx.sampleRate * 0.45;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(620, now);
      filter.frequency.exponentialRampToValueAtTime(220, now + 0.42);
      filter.Q.setValueAtTime(1.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, now);
      noiseGain.gain.linearRampToValueAtTime(0.14, now + 0.08);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);
      whiteNoise.stop(now + 0.45);

      const chimeNotes = [440, 554.37, 659.25];
      chimeNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + 0.25 + idx * 0.14;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.06, start + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0008, start + 1.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 1.3);
      });
    } catch (e) {
    }
  },

  initGalleryAsciiFlowers() {
    if (!this.stageElement) {
      return;
    }

    const cards = this.stageElement.querySelectorAll('.gallery-card[data-flower]');
    this.asciiFlowers = [];

    cards.forEach((card, index) => {
      const type = card.getAttribute('data-flower') || 'rose';
      const canvas = card.querySelector('.gallery-ascii-canvas');
      if (!canvas) {
        return;
      }

      const ctx = canvas.getContext('2d', { alpha: false });
      const points = this.generateFlowerPoints(type);

      const initialPoses = {
        moonflower: { yaw: 0.45, pitch: -0.46, roll: 0.10, fovFactor: 1.05, centerY: -0.62 },
        lily: { yaw: 0.25, pitch: -0.44, roll: -0.09, fovFactor: 0.96, centerY: -0.60 },
        rose: { yaw: 0.38, pitch: -0.52, roll: 0.11, fovFactor: 1.02, centerY: -0.68 },
        chamomile: { yaw: 0.52, pitch: -0.58, roll: 0.08, fovFactor: 1.02, centerY: -0.62 },
        lotus: { yaw: 0.30, pitch: -0.50, roll: 0.06, fovFactor: 0.98, centerY: -0.58 }
      };

      const pose = initialPoses[type] || initialPoses.rose;

      const instance = {
        card,
        canvas,
        ctx,
        type,
        points,
        width: 0,
        height: 0,
        dpr: 1,
        cols: 0,
        rows: 0,
        cellW: 5.2,
        cellH: 8.8,
        zBuffer: null,
        lumBuffer: null,
        partBuffer: null,
        charBuffer: null,
        yaw: pose.yaw + index * 0.15,
        pitch: pose.pitch,
        baseRoll: pose.roll,
        roll: pose.roll,
        fovFactor: pose.fovFactor,
        centerY: pose.centerY,
        spinPhase: 0,
        isSpinning: false,
        currentSpeed: 0,
        targetSpeed: 0,
        rafId: null
      };

      this.asciiFlowers.push(instance);
      this.setupFlowerCanvasMetrics(instance);
      this.renderFlowerFrame(instance);
    });
  },

  resizeGalleryAsciiFlowers() {
    if (!this.asciiFlowers || this.asciiFlowers.length === 0) {
      return;
    }

    for (let i = 0; i < this.asciiFlowers.length; i++) {
      const inst = this.asciiFlowers[i];
      this.setupFlowerCanvasMetrics(inst);
      this.renderFlowerFrame(inst);
    }
  },

  setupFlowerCanvasMetrics(inst) {
    const rect = inst.canvas.getBoundingClientRect();
    const w = Math.max(220, Math.floor(rect.width || 320));
    const h = Math.max(260, Math.floor(rect.height || 390));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    inst.dpr = dpr;
    inst.width = w;
    inst.height = h;
    inst.canvas.width = Math.floor(w * dpr);
    inst.canvas.height = Math.floor(h * dpr);
    inst.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    inst.cellW = w < 290 ? 4.6 : 5.1;
    inst.cellH = w < 290 ? 7.8 : 8.6;
    inst.cols = Math.max(36, Math.floor(w / inst.cellW));
    inst.rows = Math.max(36, Math.floor(h / inst.cellH));

    const total = inst.cols * inst.rows;
    inst.zBuffer = new Float32Array(total);
    inst.lumBuffer = new Float32Array(total);
    inst.partBuffer = new Uint8Array(total);
    inst.charBuffer = new Uint16Array(total);

    const fontPx = Math.round(inst.cellH * 0.98);
    inst.ctx.font = `600 ${fontPx}px ui-monospace, "SF Mono", "Cascadia Mono", "Consolas", "Courier New", monospace`;
    inst.ctx.textAlign = 'center';
    inst.ctx.textBaseline = 'middle';
  },

  setCardFlowerSpinning(card, shouldSpin) {
    if (!this.asciiFlowers) {
      return;
    }

    const inst = this.asciiFlowers.find((item) => item.card === card);
    if (!inst) {
      return;
    }

    inst.isSpinning = shouldSpin;
    inst.targetSpeed = shouldSpin ? 0.022 : 0;

    if (!inst.rafId) {
      this.startFlowerSpinLoop(inst);
    }
  },

  startFlowerSpinLoop(inst) {
    const step = () => {
      if (!this.isActive) {
        inst.rafId = null;
        return;
      }

      const accel = inst.isSpinning ? 0.08 : 0.055;
      inst.currentSpeed += (inst.targetSpeed - inst.currentSpeed) * accel;

      if (!inst.isSpinning && Math.abs(inst.currentSpeed) < 0.00035) {
        inst.currentSpeed = 0;
        this.renderFlowerFrame(inst);
        inst.rafId = null;
        return;
      }

      inst.yaw += inst.currentSpeed;
      inst.spinPhase += inst.currentSpeed * 1.4;
      inst.roll = inst.baseRoll + Math.sin(inst.spinPhase) * 0.06;

      this.renderFlowerFrame(inst);
      inst.rafId = requestAnimationFrame(step);
    };

    inst.rafId = requestAnimationFrame(step);
  },

  sampleParametricSurface(points, uSteps, vSteps, part, aoBase, evalFn) {
    const eps = 0.004;
    for (let iu = 0; iu <= uSteps; iu++) {
      const u = iu / uSteps;
      for (let iv = 0; iv <= vSteps; iv++) {
        const v = iv / vSteps;
        const p = evalFn(u, v);
        const pu = evalFn(Math.min(1, u + eps), v);
        const pv = evalFn(u, Math.min(1, v + eps));

        const tx = pu.x - p.x;
        const ty = pu.y - p.y;
        const tz = pu.z - p.z;

        const bx = pv.x - p.x;
        const by = pv.y - p.y;
        const bz = pv.z - p.z;

        let nx = ty * bz - tz * by;
        let ny = tz * bx - tx * bz;
        let nz = tx * by - ty * bx;

        const outDot = nx * p.x + nz * p.z + ny * (p.y + 0.25);
        if (outDot < 0) {
          nx = -nx;
          ny = -ny;
          nz = -nz;
        }

        const len = Math.hypot(nx, ny, nz) || 1;
        const ao = Math.max(0.18, Math.min(1.0, aoBase * (0.42 + 0.58 * u)));

        points.push({
          x: p.x,
          y: p.y,
          z: p.z,
          nx: nx / len,
          ny: ny / len,
          nz: nz / len,
          part,
          ao
        });
      }
    }
  },

  addCommonStemAndLeaves(points, stemTopY, stemLen, leafConfigs) {
    this.sampleParametricSurface(points, 48, 12, 1, 0.82, (u, v) => {
      const theta = v * Math.PI * 2;
      const y = stemTopY - u * stemLen;
      const curveX = Math.sin(u * Math.PI * 1.1) * 0.15;
      const curveZ = Math.cos(u * Math.PI * 0.9) * 0.08 - 0.08;
      const r = 0.082 * (1 - u * 0.2);
      return {
        x: curveX + r * Math.cos(theta),
        y,
        z: curveZ + r * Math.sin(theta)
      };
    });

    leafConfigs.forEach((lf) => {
      const baseY = stemTopY - lf.stemU * stemLen;
      const baseX = Math.sin(lf.stemU * Math.PI * 1.1) * 0.15;
      const baseZ = Math.cos(lf.stemU * Math.PI * 0.9) * 0.08 - 0.08;
      const dirX = Math.cos(lf.angle);
      const dirZ = Math.sin(lf.angle);
      const perpX = -dirZ;
      const perpZ = dirX;

      this.sampleParametricSurface(points, 20, 14, 2, 0.86, (u, v) => {
        const s = (v - 0.5) * 2;
        const profile = Math.sin(Math.pow(u, 0.78) * Math.PI);
        const w = s * lf.width * profile;
        const forward = 0.07 + u * lf.len;
        const vFold = Math.abs(s) * 0.10 * profile;
        const archY = Math.sin(u * Math.PI * 0.82) * 0.26 - Math.pow(u, 1.8) * lf.droop + vFold;

        return {
          x: baseX + dirX * forward + perpX * w,
          y: baseY + archY,
          z: baseZ + dirZ * forward + perpZ * w
        };
      });
    });
  },

  generateFlowerPoints(type) {
    const points = [];

    if (type === 'rose') {
      const layers = [
        { count: 3, radius: 0.26, height: 0.72, tilt: 0.22, curl: 0.18, wave: 0.06, yBase: 0.14, rot: 0.0, ao: 0.68 },
        { count: 4, radius: 0.45, height: 0.80, tilt: 0.42, curl: 0.30, wave: 0.10, yBase: 0.10, rot: 0.55, ao: 0.78 },
        { count: 5, radius: 0.68, height: 0.84, tilt: 0.68, curl: 0.46, wave: 0.14, yBase: 0.05, rot: 1.15, ao: 0.88 },
        { count: 6, radius: 0.94, height: 0.82, tilt: 0.96, curl: 0.62, wave: 0.18, yBase: -0.02, rot: 1.85, ao: 0.95 },
        { count: 6, radius: 1.22, height: 0.76, tilt: 1.26, curl: 0.78, wave: 0.22, yBase: -0.10, rot: 2.45, ao: 1.0 },
        { count: 7, radius: 1.48, height: 0.66, tilt: 1.54, curl: 0.92, wave: 0.25, yBase: -0.20, rot: 3.10, ao: 0.96 }
      ];

      layers.forEach((layer, layerIdx) => {
        const spanAngle = (Math.PI * 2 / layer.count) * 0.74;
        for (let k = 0; k < layer.count; k++) {
          const baseAngle = layer.rot + (k * Math.PI * 2) / layer.count;
          const petalVar = 1 + ((k % 2 === 0 ? 1 : -1) * 0.04);

          this.sampleParametricSurface(points, 20, 18, 0, layer.ao, (u, v) => {
            const s = (v - 0.5) * 2;
            const widthEnv = Math.sin(Math.pow(u, 0.72) * Math.PI * 0.92) * (1 - 0.12 * s * s);
            const cupDepth = (1 - s * s) * 0.26 * Math.sin(u * Math.PI);
            const bloomCurve = Math.pow(u, 1.35) * layer.tilt;
            const lipCurl = Math.max(0, u - 0.58) / 0.42;
            const curlRadial = Math.pow(lipCurl, 1.7) * layer.curl * (1 - 0.35 * s * s);
            const curlDrop = Math.pow(lipCurl, 2.1) * layer.curl * 0.58 * (1 + 0.4 * s * s);

            const r = (0.07 + layer.radius * (0.28 * u + 0.72 * bloomCurve) + curlRadial - cupDepth) * petalVar;
            const y = layer.yBase + layer.height * Math.sin(u * Math.PI * 0.64) - curlDrop - 0.08 * s * s * u;
            const angleOffset = s * spanAngle * (0.35 + 0.65 * widthEnv);
            const twist = 0.14 * (1 - u) * (layerIdx % 2 === 0 ? 1 : -1);
            const ripple = Math.cos(s * Math.PI * 1.5) * layer.wave * Math.pow(u, 1.6) * 0.14;
            const theta = baseAngle + angleOffset + twist;

            return {
              x: (r + ripple) * Math.cos(theta),
              y,
              z: (r + ripple) * Math.sin(theta)
            };
          });
        }
      });

      for (let k = 0; k < 5; k++) {
        const sepalAngle = (k * Math.PI * 2) / 5 + 0.35;
        this.sampleParametricSurface(points, 14, 8, 1, 0.75, (u, v) => {
          const s = (v - 0.5) * 2;
          const leafWidth = (1 - Math.pow(u, 0.85)) * 0.28;
          const r = 0.22 + u * 1.1;
          const y = -0.26 + Math.sin(u * Math.PI) * 0.12 - Math.pow(u, 1.6) * 0.5;
          const theta = sepalAngle + s * leafWidth / Math.max(0.25, r * 0.65);
          return { x: r * Math.cos(theta), y, z: r * Math.sin(theta) };
        });
      }

      this.addCommonStemAndLeaves(points, -0.45, 2.35, [
        { stemU: 0.32, angle: 0.25, len: 1.18, width: 0.44, droop: 0.35 },
        { stemU: 0.58, angle: 3.45, len: 1.02, width: 0.38, droop: 0.30 }
      ]);
      return points;
    }

    if (type === 'lily') {
      const whorls = [
        { count: 3, rotOffset: 0, width: 0.52, archHeight: 0.92, recurve: 0.72, radiusScale: 1.55, ao: 0.98 },
        { count: 3, rotOffset: Math.PI / 3, width: 0.42, archHeight: 0.84, recurve: 0.82, radiusScale: 1.48, ao: 0.90 }
      ];

      whorls.forEach((wh) => {
        for (let k = 0; k < wh.count; k++) {
          const baseAngle = wh.rotOffset + (k * Math.PI * 2) / wh.count;
          const dirX = Math.cos(baseAngle);
          const dirZ = Math.sin(baseAngle);
          const perpX = -dirZ;
          const perpZ = dirX;

          this.sampleParametricSurface(points, 28, 18, 0, wh.ao, (u, v) => {
            const s = (v - 0.5) * 2;
            const profile = Math.sin(Math.pow(u, 0.72) * Math.PI);
            const w = s * wh.width * profile;
            const radialOut = 0.10 + Math.pow(u, 0.88) * wh.radiusScale - Math.pow(Math.max(0, u - 0.68) / 0.32, 2.0) * 0.28;
            const cupAndRib = Math.abs(s) * 0.14 * profile - Math.cos(s * Math.PI * 2) * 0.03 * u;
            const y = -0.15 + Math.sin(u * Math.PI * 0.72) * wh.archHeight - Math.pow(Math.max(0, u - 0.52) / 0.48, 2.15) * wh.recurve + cupAndRib;

            return {
              x: dirX * radialOut + perpX * w,
              y,
              z: dirZ * radialOut + perpZ * w
            };
          });
        }
      });

      for (let k = 0; k < 6; k++) {
        const stAngle = (k * Math.PI * 2) / 6 + 0.26;
        const dirX = Math.cos(stAngle);
        const dirZ = Math.sin(stAngle);
        const perpX = -dirZ;
        const perpZ = dirX;

        this.sampleParametricSurface(points, 18, 6, 3, 0.95, (u, v) => {
          const theta = v * Math.PI * 2;
          const filR = 0.025;
          const flare = Math.pow(u, 1.75) * 0.68;
          const h = -0.10 + u * 1.05;
          return {
            x: dirX * (0.06 + flare) + (perpX * Math.cos(theta) + dirX * Math.sin(theta)) * filR,
            y: h,
            z: dirZ * (0.06 + flare) + (perpZ * Math.cos(theta) + dirZ * Math.sin(theta)) * filR
          };
        });

        const tipR = 0.06 + 0.68;
        const tipY = -0.10 + 1.05;
        this.sampleParametricSurface(points, 10, 10, 3, 1.0, (u, v) => {
          const s = (u - 0.5) * 2;
          const theta = v * Math.PI * 2;
          const rad = 0.055 * Math.sqrt(Math.max(0, 1 - s * s));
          const len = s * 0.18;
          return {
            x: dirX * (tipR + Math.cos(theta) * rad) + perpX * len,
            y: tipY + Math.sin(theta) * rad,
            z: dirZ * (tipR + Math.cos(theta) * rad) + perpZ * len
          };
        });
      }

      this.addCommonStemAndLeaves(points, -0.25, 2.45, [
        { stemU: 0.28, angle: 0.5, len: 1.35, width: 0.26, droop: 0.42 },
        { stemU: 0.54, angle: 3.6, len: 1.25, width: 0.24, droop: 0.38 }
      ]);
      return points;
    }

    if (type === 'chamomile') {
      this.sampleParametricSurface(points, 22, 36, 3, 0.96, (u, v) => {
        const theta = v * Math.PI * 2;
        const r = u * 0.56;
        const dome = Math.cos(u * Math.PI * 0.52) * 0.34;
        const florets = Math.sin(u * 38) * Math.cos(v * 44) * 0.022;
        return {
          x: r * Math.cos(theta),
          y: 0.05 + dome + florets,
          z: r * Math.sin(theta)
        };
      });

      const rayCount = 16;
      for (let k = 0; k < rayCount; k++) {
        const baseAngle = (k * Math.PI * 2) / rayCount;
        const dirX = Math.cos(baseAngle);
        const dirZ = Math.sin(baseAngle);
        const perpX = -dirZ;
        const perpZ = dirX;
        const slightAlt = (k % 2 === 0 ? 0.03 : -0.02);

        this.sampleParametricSurface(points, 20, 10, 0, 0.95, (u, v) => {
          const s = (v - 0.5) * 2;
          const profile = Math.sin(Math.pow(u, 0.65) * Math.PI * 0.96);
          const w = s * 0.165 * profile;
          const dist = 0.50 + u * 1.12;
          const groove = -Math.cos(s * Math.PI) * 0.025 * profile;
          const droop = Math.sin(u * Math.PI * 0.75) * 0.12 - Math.pow(u, 1.9) * 0.30 + slightAlt;

          return {
            x: dirX * dist + perpX * w,
            y: 0.04 + droop + groove,
            z: dirZ * dist + perpZ * w
          };
        });
      }

      this.sampleParametricSurface(points, 12, 24, 1, 0.78, (u, v) => {
        const theta = v * Math.PI * 2;
        const r = 0.12 + u * 0.44;
        const y = -0.18 + u * 0.20;
        return {
          x: r * Math.cos(theta),
          y,
          z: r * Math.sin(theta)
        };
      });

      this.addCommonStemAndLeaves(points, -0.20, 2.45, [
        { stemU: 0.30, angle: 0.8, len: 1.05, width: 0.28, droop: 0.30 },
        { stemU: 0.56, angle: 3.9, len: 0.98, width: 0.26, droop: 0.28 }
      ]);
      return points;
    }

    if (type === 'moonflower') {
      this.sampleParametricSurface(points, 42, 76, 0, 0.96, (u, v) => {
        const theta = v * Math.PI * 2;
        const star5 = Math.cos(5 * theta);
        const pleat5 = Math.cos(5 * theta + Math.PI);

        const throatR = 0.07 + 0.24 * u;
        const flareR = Math.pow(u, 2.15) * 1.32;
        const starLut = 1 + 0.095 * star5 * Math.pow(u, 1.8);
        const r = (throatR + flareR) * starLut;

        const heightCurve = -0.38 + 1.12 * Math.pow(u, 0.72);
        const rimDrop = Math.pow(Math.max(0, u - 0.74) / 0.26, 2.0) * 0.22 * (1 + 0.3 * star5);
        const ribs = (0.032 * star5 - 0.018 * pleat5) * Math.pow(u, 1.3);

        const y = heightCurve - rimDrop + ribs;
        const spiralTwist = (1 - u) * 0.38;

        return {
          x: r * Math.cos(theta + spiralTwist),
          y,
          z: r * Math.sin(theta + spiralTwist)
        };
      });

      for (let k = 0; k < 5; k++) {
        const ridgeAngle = (k * Math.PI * 2) / 5;
        this.sampleParametricSurface(points, 24, 5, 3, 1.0, (u, v) => {
          const s = (v - 0.5) * 2;
          const theta = ridgeAngle + s * 0.045 * (0.4 + 0.6 * u);
          const throatR = 0.07 + 0.24 * u;
          const flareR = Math.pow(u, 2.15) * 1.32;
          const r = (throatR + flareR) * 1.095;
          const heightCurve = -0.38 + 1.12 * Math.pow(u, 0.72);
          const rimDrop = Math.pow(Math.max(0, u - 0.74) / 0.26, 2.0) * 0.28;
          const y = heightCurve - rimDrop + 0.045;
          const spiralTwist = (1 - u) * 0.38;

          return {
            x: r * Math.cos(theta + spiralTwist),
            y,
            z: r * Math.sin(theta + spiralTwist)
          };
        });
      }

      this.sampleParametricSurface(points, 36, 10, 1, 0.82, (u, v) => {
        const theta = v * Math.PI * 2;
        const y = -0.38 - u * 2.35;
        const vineHelixR = 0.14 * Math.sin(u * Math.PI);
        const vineAngle = u * Math.PI * 3.2;
        const r = 0.072 * (1 - u * 0.2);

        return {
          x: vineHelixR * Math.cos(vineAngle) + r * Math.cos(theta),
          y,
          z: vineHelixR * Math.sin(vineAngle) + r * Math.sin(theta)
        };
      });

      const heartLeaves = [
        { stemU: 0.34, angle: 0.4, scale: 0.72 },
        { stemU: 0.62, angle: 3.55, scale: 0.64 }
      ];

      heartLeaves.forEach((hl) => {
        const baseY = -0.38 - hl.stemU * 2.35;
        const dirX = Math.cos(hl.angle);
        const dirZ = Math.sin(hl.angle);
        const perpX = -dirZ;
        const perpZ = dirX;

        this.sampleParametricSurface(points, 18, 16, 2, 0.88, (u, v) => {
          const s = (v - 0.5) * 2;
          const heartWidth = Math.sin(Math.pow(u, 0.65) * Math.PI) * (1 + 0.28 * (1 - u));
          const notch = (1 - u) * Math.exp(-s * s * 10) * 0.22;
          const forward = (0.12 + (u - notch) * 1.15) * hl.scale;
          const side = s * 0.55 * heartWidth * hl.scale;
          const archY = (Math.sin(u * Math.PI * 0.75) * 0.22 - Math.pow(u, 1.7) * 0.38 + Math.abs(s) * 0.08) * hl.scale;

          return {
            x: dirX * forward + perpX * side,
            y: baseY + archY,
            z: dirZ * forward + perpZ * side
          };
        });
      });

      return points;
    }

    this.sampleParametricSurface(points, 14, 24, 3, 0.96, (u, v) => {
      const theta = v * Math.PI * 2;
      const r = u * 0.36;
      const y = 0.04 + Math.cos(u * Math.PI * 0.45) * 0.24;
      return {
        x: r * Math.cos(theta),
        y,
        z: r * Math.sin(theta)
      };
    });

    const lotusRings = [
      { count: 6, rScale: 0.62, hScale: 0.85, tilt: 0.35, width: 0.28, yOffset: 0.02, rot: 0.0, ao: 0.90 },
      { count: 8, rScale: 0.98, hScale: 0.82, tilt: 0.68, width: 0.36, yOffset: -0.03, rot: 0.39, ao: 0.96 },
      { count: 10, rScale: 1.32, hScale: 0.70, tilt: 1.05, width: 0.40, yOffset: -0.10, rot: 0.18, ao: 1.0 },
      { count: 10, rScale: 1.56, hScale: 0.45, tilt: 1.38, width: 0.42, yOffset: -0.18, rot: 0.52, ao: 0.92 }
    ];

    lotusRings.forEach((ring) => {
      for (let k = 0; k < ring.count; k++) {
        const baseAngle = ring.rot + (k * Math.PI * 2) / ring.count;
        const dirX = Math.cos(baseAngle);
        const dirZ = Math.sin(baseAngle);
        const perpX = -dirZ;
        const perpZ = dirX;

        this.sampleParametricSurface(points, 20, 14, 0, ring.ao, (u, v) => {
          const s = (v - 0.5) * 2;
          const boatProfile = Math.sin(Math.pow(u, 0.76) * Math.PI);
          const w = s * ring.width * boatProfile;
          const spoonCup = (1 - s * s) * 0.16 * Math.sin(u * Math.PI);

          const outDist = 0.16 + (u * 0.35 + Math.pow(u, 1.25) * 0.65 * ring.tilt) * ring.rScale - spoonCup * 0.4;
          const upHeight = ring.yOffset + Math.sin(u * Math.PI * 0.68) * ring.hScale - Math.pow(u, 2.0) * 0.22 * ring.tilt + Math.abs(s) * 0.12 * boatProfile;

          return {
            x: dirX * outDist + perpX * w,
            y: upHeight,
            z: dirZ * outDist + perpZ * w
          };
        });
      }
    });

    this.addCommonStemAndLeaves(points, -0.26, 2.38, [
      { stemU: 0.36, angle: 0.6, len: 1.15, width: 0.42, droop: 0.34 },
      { stemU: 0.62, angle: 3.7, len: 1.02, width: 0.36, droop: 0.30 }
    ]);

    return points;
  },

  getFlowerCellColor(type, lum, part) {
    const l = Math.max(0, Math.min(1, lum));

    if (part === 1 || part === 2) {
      const r = Math.round(28 + 135 * Math.pow(l, 1.08));
      const g = Math.round(36 + 155 * Math.pow(l, 0.96));
      const b = Math.round(46 + 165 * Math.pow(l, 1.02));
      return `rgb(${r},${g},${b})`;
    }

    if (type === 'rose') {
      if (l > 0.82) {
        const t = (l - 0.82) / 0.18;
        const r = Math.round(235 + 20 * t);
        const g = Math.round(115 + 125 * t);
        const b = Math.round(125 + 115 * t);
        return `rgb(${r},${g},${b})`;
      }
      const r = Math.round(48 + 195 * Math.pow(l, 0.82));
      const g = Math.round(12 + 95 * Math.pow(l, 1.50));
      const b = Math.round(22 + 108 * Math.pow(l, 1.32));
      return `rgb(${r},${g},${b})`;
    }

    if (type === 'lily') {
      if (part === 3) {
        const r = Math.round(70 + 185 * Math.pow(l, 0.82));
        const g = Math.round(35 + 155 * Math.pow(l, 1.10));
        const b = Math.round(20 + 95 * Math.pow(l, 1.45));
        return `rgb(${r},${g},${b})`;
      }
      const r = Math.round(42 + 210 * Math.pow(l, 0.88));
      const g = Math.round(40 + 206 * Math.pow(l, 0.90));
      const b = Math.round(48 + 198 * Math.pow(l, 0.86));
      return `rgb(${r},${g},${b})`;
    }

    if (type === 'chamomile') {
      if (part === 3) {
        const r = Math.round(68 + 187 * Math.pow(l, 0.80));
        const g = Math.round(48 + 170 * Math.pow(l, 0.95));
        const b = Math.round(20 + 110 * Math.pow(l, 1.40));
        return `rgb(${r},${g},${b})`;
      }
      const r = Math.round(44 + 206 * Math.pow(l, 0.86));
      const g = Math.round(46 + 204 * Math.pow(l, 0.86));
      const b = Math.round(54 + 198 * Math.pow(l, 0.84));
      return `rgb(${r},${g},${b})`;
    }

    if (type === 'moonflower') {
      if (part === 3) {
        const r = Math.round(70 + 185 * Math.pow(l, 0.78));
        const g = Math.round(80 + 175 * Math.pow(l, 0.78));
        const b = Math.round(110 + 145 * Math.pow(l, 0.72));
        return `rgb(${r},${g},${b})`;
      }
      const r = Math.round(34 + 198 * Math.pow(l, 0.92));
      const g = Math.round(42 + 202 * Math.pow(l, 0.88));
      const b = Math.round(62 + 193 * Math.pow(l, 0.80));
      return `rgb(${r},${g},${b})`;
    }

    if (part === 3) {
      const r = Math.round(65 + 185 * Math.pow(l, 0.85));
      const g = Math.round(45 + 165 * Math.pow(l, 1.05));
      const b = Math.round(35 + 140 * Math.pow(l, 1.20));
      return `rgb(${r},${g},${b})`;
    }
    const r = Math.round(46 + 198 * Math.pow(l, 0.88));
    const g = Math.round(36 + 178 * Math.pow(l, 1.04));
    const b = Math.round(58 + 188 * Math.pow(l, 0.90));
    return `rgb(${r},${g},${b})`;
  },

  renderFlowerFrame(inst) {
    if (!inst || !inst.ctx || !inst.zBuffer) {
      return;
    }

    const cols = inst.cols;
    const rows = inst.rows;
    inst.zBuffer.fill(-1e9);

    const cosY = Math.cos(inst.yaw);
    const sinY = Math.sin(inst.yaw);
    const cosX = Math.cos(inst.pitch);
    const sinX = Math.sin(inst.pitch);
    const cosZ = Math.cos(inst.roll);
    const sinZ = Math.sin(inst.roll);

    const keyLx = 0.54;
    const keyLy = 0.68;
    const keyLz = -0.49;

    const fillLx = -0.62;
    const fillLy = -0.25;
    const fillLz = -0.74;

    const fovScale = Math.min(inst.width, inst.height) * 0.92 * inst.fovFactor;
    const camDist = 4.65;
    const centerYOffset = inst.centerY;

    const invCellW = 1 / inst.cellW;
    const invCellH = 1 / inst.cellH;
    const ramp = this.asciiCharRamp;
    const rampMax = ramp.length - 1;

    const pts = inst.points;
    const nPts = pts.length;

    for (let i = 0; i < nPts; i++) {
      const p = pts[i];
      const py0 = p.y - centerYOffset;

      const x1 = p.x * cosY + p.z * sinY;
      const z1 = -p.x * sinY + p.z * cosY;
      const y1 = py0;

      const x2 = x1 * cosZ - y1 * sinZ;
      const y2 = x1 * sinZ + y1 * cosZ;
      const z2 = z1;

      const y3 = y2 * cosX - z2 * sinX;
      const z3 = y2 * sinX + z2 * cosX;
      const x3 = x2;

      const depth = camDist - z3;
      if (depth <= 0.4) {
        continue;
      }

      const proj = fovScale / depth;
      const screenX = inst.width * 0.5 + x3 * proj;
      const screenY = inst.height * 0.46 - y3 * proj;

      const col = (screenX * invCellW) | 0;
      const row = (screenY * invCellH) | 0;

      if (col < 0 || col >= cols || row < 0 || row >= rows) {
        continue;
      }

      const idx = row * cols + col;
      if (z3 <= inst.zBuffer[idx]) {
        continue;
      }

      const nx1 = p.nx * cosY + p.nz * sinY;
      const nz1 = -p.nx * sinY + p.nz * cosY;
      const ny1 = p.ny;

      const nx2 = nx1 * cosZ - ny1 * sinZ;
      const ny2 = nx1 * sinZ + ny1 * cosZ;
      const nz2 = nz1;

      const ny3 = ny2 * cosX - nz2 * sinX;
      const nz3 = ny2 * sinX + nz2 * cosX;
      const nx3 = nx2;

      let diffKey = nx3 * keyLx + ny3 * keyLy - nz3 * keyLz;
      if (diffKey < 0) {
        diffKey = -diffKey * 0.35;
      }

      let diffFill = nx3 * fillLx + ny3 * fillLy - nz3 * fillLz;
      if (diffFill < 0) {
        diffFill = 0;
      }

      const rim = Math.pow(1 - Math.min(1, Math.abs(nz3)), 2.2) * 0.52;
      const hz = (-keyLz + 1);
      const hLen = Math.hypot(keyLx, keyLy, hz);
      const specDot = Math.max(0, (nx3 * keyLx + ny3 * keyLy + nz3 * hz) / hLen);
      const spec = Math.pow(specDot, 18) * 0.46;

      let lum = (0.10 + diffKey * 0.64 + diffFill * 0.20 + rim + spec) * p.ao;
      lum = Math.max(0.03, Math.min(1.0, lum));

      const charIdx = Math.min(rampMax, Math.max(1, (lum * rampMax) | 0));

      inst.zBuffer[idx] = z3;
      inst.lumBuffer[idx] = lum;
      inst.partBuffer[idx] = p.part;
      inst.charBuffer[idx] = charIdx;
    }

    const ctx = inst.ctx;
    ctx.fillStyle = '#0d0f14';
    ctx.fillRect(0, 0, inst.width, inst.height);

    const aura = ctx.createRadialGradient(
      inst.width * 0.5, inst.height * 0.42, 6,
      inst.width * 0.5, inst.height * 0.42, Math.min(inst.width, inst.height) * 0.55
    );
    if (inst.type === 'rose') {
      aura.addColorStop(0, 'rgba(175, 34, 48, 0.14)');
    } else if (inst.type === 'moonflower') {
      aura.addColorStop(0, 'rgba(165, 188, 235, 0.14)');
    } else {
      aura.addColorStop(0, 'rgba(201, 209, 224, 0.12)');
    }
    aura.addColorStop(0.6, 'rgba(18, 20, 28, 0.05)');
    aura.addColorStop(1, 'rgba(13, 15, 20, 0)');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, inst.width, inst.height);

    const cellW = inst.cellW;
    const cellH = inst.cellH;
    const halfW = cellW * 0.5;
    const halfH = cellH * 0.5;
    let lastStyle = '';

    for (let r = 0; r < rows; r++) {
      const rowOffset = r * cols;
      const yPos = r * cellH + halfH;

      for (let c = 0; c < cols; c++) {
        const idx = rowOffset + c;
        if (inst.zBuffer[idx] <= -1e8) {
          continue;
        }

        const lum = inst.lumBuffer[idx];
        const part = inst.partBuffer[idx];
        const ch = ramp[inst.charBuffer[idx]];
        const quantizedLum = ((lum * 22) | 0) / 22;
        const color = this.getFlowerCellColor(inst.type, quantizedLum, part);

        if (color !== lastStyle) {
          ctx.fillStyle = color;
          lastStyle = color;
        }

        ctx.fillText(ch, c * cellW + halfW, yPos);
      }
    }
  },

  initWeepingAngel() {
    if (!this.stageElement) {
      return;
    }

    const canvas = document.getElementById('stage3-angel-canvas');
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    const points = this.generateWeepingAngelPoints();

    const tears = [];
    for (let i = 0; i < 6; i++) {
      tears.push({
        side: i % 2 === 0 ? -1 : 1,
        phase: i / 6,
        speed: 0.0042 + (i % 3) * 0.0008,
        spreadX: ((i % 3) - 1) * 0.025
      });
    }

    this.angelInstance = {
      canvas,
      ctx,
      points,
      tears,
      width: 0,
      height: 0,
      dpr: 1,
      cols: 0,
      rows: 0,
      cellW: 4.8,
      cellH: 8.2,
      zBuffer: null,
      lumBuffer: null,
      partBuffer: null,
      charBuffer: null,
      baseYaw: 0.24,
      yaw: 0.24,
      pitch: -0.22,
      roll: 0.0,
      breathPhase: 0,
      isVisible: false,
      rafId: null
    };

    this.setupWeepingAngelMetrics();
    this.renderWeepingAngelFrame(0);

    if ('IntersectionObserver' in window && !this.prefersReducedMotion) {
      this.angelObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!this.angelInstance) {
            return;
          }
          if (entry.isIntersecting) {
            this.angelInstance.isVisible = true;
            this.startWeepingAngelLoop();
          } else {
            this.angelInstance.isVisible = false;
            if (this.angelInstance.rafId) {
              cancelAnimationFrame(this.angelInstance.rafId);
              this.angelInstance.rafId = null;
            }
          }
        });
      }, {
        threshold: 0.05
      });

      this.angelObserver.observe(canvas);
    } else if (!this.prefersReducedMotion) {
      this.angelInstance.isVisible = true;
      this.startWeepingAngelLoop();
    }
  },

  resizeWeepingAngel() {
    if (!this.angelInstance) {
      return;
    }
    this.setupWeepingAngelMetrics();
    this.renderWeepingAngelFrame(this.angelInstance.breathPhase);
  },

  setupWeepingAngelMetrics() {
    const inst = this.angelInstance;
    if (!inst || !inst.canvas) {
      return;
    }

    const rect = inst.canvas.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width || window.innerWidth || 1200));
    const h = Math.max(420, Math.floor(rect.height || 680));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    inst.dpr = dpr;
    inst.width = w;
    inst.height = h;
    inst.canvas.width = Math.floor(w * dpr);
    inst.canvas.height = Math.floor(h * dpr);
    inst.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    inst.cellW = w < 640 ? 4.6 : 5.4;
    inst.cellH = w < 640 ? 7.8 : 9.0;
    inst.cols = Math.max(60, Math.floor(w / inst.cellW));
    inst.rows = Math.max(54, Math.floor(h / inst.cellH));

    const total = inst.cols * inst.rows;
    inst.zBuffer = new Float32Array(total);
    inst.lumBuffer = new Float32Array(total);
    inst.partBuffer = new Uint8Array(total);
    inst.charBuffer = new Uint16Array(total);

    const fontPx = Math.round(inst.cellH * 0.98);
    inst.ctx.font = `600 ${fontPx}px ui-monospace, "SF Mono", "Cascadia Mono", "Consolas", "Courier New", monospace`;
    inst.ctx.textAlign = 'center';
    inst.ctx.textBaseline = 'middle';
  },

  startWeepingAngelLoop() {
    const inst = this.angelInstance;
    if (!inst || inst.rafId) {
      return;
    }

    const tick = () => {
      if (!this.isActive || !inst.isVisible) {
        inst.rafId = null;
        return;
      }

      inst.breathPhase += 0.024;
      for (let i = 0; i < inst.tears.length; i++) {
        inst.tears[i].phase += inst.tears[i].speed;
        if (inst.tears[i].phase > 1) {
          inst.tears[i].phase -= 1;
        }
      }

      this.renderWeepingAngelFrame(inst.breathPhase);
      inst.rafId = requestAnimationFrame(tick);
    };

    inst.rafId = requestAnimationFrame(tick);
  },

  sampleAngelSurface(points, uSteps, vSteps, part, group, aoBase, weightFn, evalFn) {
    const eps = 0.005;
    for (let iu = 0; iu <= uSteps; iu++) {
      const u = iu / uSteps;
      for (let iv = 0; iv <= vSteps; iv++) {
        const v = iv / vSteps;
        const p = evalFn(u, v);
        const pu = evalFn(Math.min(1, u + eps), v);
        const pv = evalFn(u, Math.min(1, v + eps));

        const tx = pu.x - p.x;
        const ty = pu.y - p.y;
        const tz = pu.z - p.z;

        const bx = pv.x - p.x;
        const by = pv.y - p.y;
        const bz = pv.z - p.z;

        let nx = ty * bz - tz * by;
        let ny = tz * bx - tx * bz;
        let nz = tx * by - ty * bx;

        const cx = p.cx !== undefined ? p.cx : 0;
        const cy = p.cy !== undefined ? p.cy : p.y;
        const cz = p.cz !== undefined ? p.cz : 0;

        const outDot = nx * (p.x - cx) + ny * (p.y - cy) + nz * (p.z - cz);
        if (outDot < 0) {
          nx = -nx;
          ny = -ny;
          nz = -nz;
        }

        const len = Math.hypot(nx, ny, nz) || 1;
        const w = typeof weightFn === 'function' ? weightFn(u, v) : 1.0;
        const ao = Math.max(0.18, Math.min(1.0, aoBase));

        points.push({
          x: p.x,
          y: p.y,
          z: p.z,
          nx: nx / len,
          ny: ny / len,
          nz: nz / len,
          part,
          group,
          ao,
          w
        });
      }
    }
  },

  addAngelTube(points, pathPts, radStart, radEnd, uSteps, vSteps, part, group, aoBase, weightFn) {
    const evalBezier = (t) => {
      if (pathPts.length === 3) {
        const inv = 1 - t;
        return {
          x: inv * inv * pathPts[0].x + 2 * inv * t * pathPts[1].x + t * t * pathPts[2].x,
          y: inv * inv * pathPts[0].y + 2 * inv * t * pathPts[1].y + t * t * pathPts[2].y,
          z: inv * inv * pathPts[0].z + 2 * inv * t * pathPts[1].z + t * t * pathPts[2].z
        };
      }
      const inv = 1 - t;
      const c0 = inv * inv * inv;
      const c1 = 3 * inv * inv * t;
      const c2 = 3 * inv * t * t;
      const c3 = t * t * t;
      return {
        x: c0 * pathPts[0].x + c1 * pathPts[1].x + c2 * pathPts[2].x + c3 * pathPts[3].x,
        y: c0 * pathPts[0].y + c1 * pathPts[1].y + c2 * pathPts[2].y + c3 * pathPts[3].y,
        z: c0 * pathPts[0].z + c1 * pathPts[1].z + c2 * pathPts[2].z + c3 * pathPts[3].z
      };
    };

    this.sampleAngelSurface(points, uSteps, vSteps, part, group, aoBase, weightFn, (u, v) => {
      const c = evalBezier(u);
      const cNext = evalBezier(Math.min(1, u + 0.01));
      let tx = cNext.x - c.x;
      let ty = cNext.y - c.y;
      let tz = cNext.z - c.z;
      const tLen = Math.hypot(tx, ty, tz) || 1;
      tx /= tLen;
      ty /= tLen;
      tz /= tLen;

      let ux = 0;
      let uy = 1;
      let uz = 0;
      if (Math.abs(ty) > 0.9) {
        ux = 1;
        uy = 0;
      }

      let px = ty * uz - tz * uy;
      let py = tz * ux - tx * uz;
      let pz = tx * uy - ty * ux;
      const pLen = Math.hypot(px, py, pz) || 1;
      px /= pLen;
      py /= pLen;
      pz /= pLen;

      const qx = ty * pz - tz * py;
      const qy = tz * px - tx * pz;
      const qz = tx * py - ty * px;

      const theta = v * Math.PI * 2;
      const r = radStart + (radEnd - radStart) * u;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      return {
        x: c.x + (px * cosT + qx * sinT) * r,
        y: c.y + (py * cosT + qy * sinT) * r,
        z: c.z + (pz * cosT + qz * sinT) * r,
        cx: c.x,
        cy: c.y,
        cz: c.z
      };
    });
  },

  generateWeepingAngelPoints() {
    const points = [];

    this.sampleAngelSurface(points, 14, 44, 1, 0, 0.72, null, (u, v) => {
      const theta = v * Math.PI * 2;
      const y = -1.36 + u * 0.44;
      const stepMold = u < 0.22 ? 1.16 : (u > 0.82 ? 1.04 : 0.96);
      const fluting = 1 + 0.025 * Math.cos(16 * theta);
      const r = 0.84 * stepMold * fluting;
      return {
        x: r * Math.cos(theta),
        y,
        z: -0.05 + r * Math.sin(theta) * 0.85,
        cx: 0,
        cy: y,
        cz: -0.05
      };
    });

    this.sampleAngelSurface(points, 10, 36, 1, 0, 0.78, null, (u, v) => {
      const theta = v * Math.PI * 2;
      const r = u * 0.86;
      return {
        x: r * Math.cos(theta),
        y: -0.92,
        z: -0.05 + r * Math.sin(theta) * 0.85,
        cx: 0,
        cy: -1.1,
        cz: -0.05
      };
    });

    this.sampleAngelSurface(points, 32, 48, 0, 0, 0.88, (u) => u * 0.25, (u, v) => {
      const theta = v * Math.PI * 2;
      const y = -1.24 + u * 0.88;
      const frontBulge = Math.max(0, Math.sin(theta));
      const kneeHeight = Math.exp(-Math.pow((u - 0.82) / 0.22, 2));
      const baseRx = 0.62 - u * 0.24 + kneeHeight * 0.08;
      const baseRz = 0.56 - u * 0.16 + frontBulge * (0.34 + kneeHeight * 0.16);
      const pleats = (0.045 * Math.cos(11 * theta) + 0.025 * Math.sin(19 * theta)) * (1 - u * 0.45);
      const centerShiftZ = -0.10 + u * 0.22 + frontBulge * 0.12;

      return {
        x: (baseRx + pleats) * Math.cos(theta),
        y,
        z: centerShiftZ + (baseRz + pleats) * Math.sin(theta),
        cx: 0,
        cy: y,
        cz: centerShiftZ
      };
    });

    [-1, 1].forEach((side) => {
      this.addAngelTube(
        points,
        [
          { x: side * 0.19, y: -0.78, z: -0.14 },
          { x: side * 0.24, y: -0.52, z: 0.18 },
          { x: side * 0.23, y: -0.32, z: 0.48 }
        ],
        0.17,
        0.14,
        18,
        16,
        0,
        0,
        0.90,
        (u) => u * 0.3
      );

      this.addAngelTube(
        points,
        [
          { x: side * 0.23, y: -0.32, z: 0.48 },
          { x: side * 0.21, y: -0.72, z: 0.48 },
          { x: side * 0.19, y: -1.16, z: 0.38 }
        ],
        0.14,
        0.11,
        20,
        16,
        0,
        0,
        0.88,
        (u) => (1 - u) * 0.3
      );
    });

    this.sampleAngelSurface(points, 28, 36, 0, 1, 0.92, (u) => 0.35 + 0.65 * u, (u, v) => {
      const theta = v * Math.PI * 2;
      const y = -0.68 + u * 0.88;
      const forwardLeanZ = -0.14 + Math.pow(u, 1.15) * 0.26;
      const waistTaper = 0.86 + 0.24 * Math.sin(u * Math.PI * 0.85);
      const rx = (0.31 + u * 0.11) * waistTaper;
      const rz = (0.23 + u * 0.04) * waistTaper;
      const robeFolds = 0.024 * Math.cos(9 * theta) * (1 - u * 0.3);

      return {
        x: (rx + robeFolds) * Math.cos(theta),
        y,
        z: forwardLeanZ + (rz + robeFolds) * Math.sin(theta),
        cx: 0,
        cy: y,
        cz: forwardLeanZ
      };
    });

    this.sampleAngelSurface(points, 12, 22, 0, 1, 0.88, () => 1.0, (u, v) => {
      const theta = v * Math.PI * 2;
      const y = 0.16 + u * 0.18;
      const z = 0.12 + u * 0.10;
      const r = 0.125 * (1 - u * 0.15);
      return {
        x: r * Math.cos(theta),
        y,
        z: z + r * Math.sin(theta),
        cx: 0,
        cy: y,
        cz: z
      };
    });

    this.sampleAngelSurface(points, 24, 30, 0, 2, 0.96, () => 1.0, (u, v) => {
      const phi = u * Math.PI;
      const theta = v * Math.PI * 2;
      const sinP = Math.sin(phi);
      const cosP = Math.cos(phi);

      const rx = 0.21;
      const ry = 0.26;
      const rz = 0.23;

      let lx = rx * sinP * Math.cos(theta);
      let ly = ry * cosP;
      let lz = rz * sinP * Math.sin(theta);

      const tilt = 0.56;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const ry2 = ly * cosT - lz * sinT;
      const rz2 = ly * sinT + lz * cosT;

      const hx = 0;
      const hy = 0.44;
      const hz = 0.28;

      return {
        x: hx + lx,
        y: hy + ry2,
        z: hz + rz2,
        cx: hx,
        cy: hy,
        cz: hz
      };
    });

    this.sampleAngelSurface(points, 24, 28, 0, 2, 0.94, () => 1.0, (u, v) => {
      const s = (v - 0.5) * 2;
      const angle = s * Math.PI * 0.82;
      const y = 0.68 - u * 0.54;
      const flare = 0.22 + Math.pow(u, 1.2) * 0.12;
      const wave = 0.022 * Math.cos(s * Math.PI * 7) * u;
      const zCenter = 0.24 - u * 0.06;

      return {
        x: (flare + wave) * Math.sin(angle),
        y,
        z: zCenter - (flare * 0.88 + wave) * Math.cos(angle) * 0.65,
        cx: 0,
        cy: y,
        cz: zCenter
      };
    });

    this.sampleAngelSurface(points, 8, 44, 4, 2, 1.0, () => 1.0, (u, v) => {
      const theta = v * Math.PI * 2;
      const tubePhi = u * Math.PI * 2;
      const R = 0.36;
      const r = 0.028;

      let lx = (R + r * Math.cos(tubePhi)) * Math.cos(theta);
      let ly = r * Math.sin(tubePhi);
      let lz = (R + r * Math.cos(tubePhi)) * Math.sin(theta);

      const tilt = 0.44;
      const ry = ly * Math.cos(tilt) - lz * Math.sin(tilt);
      const rz = ly * Math.sin(tilt) + lz * Math.cos(tilt);

      return {
        x: lx,
        y: 0.72 + ry,
        z: 0.22 + rz,
        cx: R * Math.cos(theta),
        cy: 0.72 - R * Math.sin(theta) * Math.sin(tilt),
        cz: 0.22 + R * Math.sin(theta) * Math.cos(tilt)
      };
    });

    [-1, 1].forEach((side) => {
      this.addAngelTube(
        points,
        [
          { x: side * 0.38, y: 0.14, z: 0.08 },
          { x: side * 0.40, y: -0.06, z: 0.28 },
          { x: side * 0.28, y: -0.24, z: 0.48 }
        ],
        0.115,
        0.095,
        20,
        16,
        2,
        3,
        0.95,
        (u) => 0.7 + 0.3 * u
      );

      this.addAngelTube(
        points,
        [
          { x: side * 0.28, y: -0.24, z: 0.48 },
          { x: side * 0.23, y: 0.04, z: 0.54 },
          { x: side * 0.13, y: 0.28, z: 0.50 }
        ],
        0.092,
        0.072,
        20,
        16,
        2,
        3,
        0.98,
        () => 1.0
      );

      this.sampleAngelSurface(points, 14, 14, 2, 3, 1.0, () => 1.0, (u, v) => {
        const s = (v - 0.5) * 2;
        const palmW = 0.085 * Math.sin(Math.pow(u, 0.65) * Math.PI);
        const fingerRibs = 0.014 * Math.cos(s * Math.PI * 4) * Math.pow(u, 0.8);
        const curveIn = -side * (0.14 - u * 0.07) + s * palmW * 0.35;
        const py = 0.27 + u * 0.19;
        const pz = 0.49 - Math.pow(u, 1.5) * 0.06 + Math.abs(s) * 0.02 + fingerRibs;

        return {
          x: curveIn,
          y: py,
          z: pz,
          cx: 0,
          cy: 0.38,
          cz: 0.32
        };
      });
    });

    [-1, 1].forEach((side) => {
      const wingGroup = side < 0 ? 4 : 5;

      this.addAngelTube(
        points,
        [
          { x: side * 0.16, y: 0.16, z: -0.06 },
          { x: side * 0.78, y: 1.06, z: -0.24 },
          { x: side * 1.62, y: 1.32, z: -0.10 },
          { x: side * 1.98, y: 0.36, z: 0.16 }
        ],
        0.105,
        0.048,
        36,
        14,
        3,
        wingGroup,
        0.98,
        (u) => 0.35 + 0.65 * u
      );

      const featherCount = 18;
      for (let f = 0; f < featherCount; f++) {
        const t = f / (featherCount - 1);

        const inv = 1 - t;
        const c0 = inv * inv * inv;
        const c1 = 3 * inv * inv * t;
        const c2 = 3 * inv * t * t;
        const c3 = t * t * t;

        const rootX = c0 * (side * 0.16) + c1 * (side * 0.78) + c2 * (side * 1.62) + c3 * (side * 1.98);
        const rootY = c0 * 0.16 + c1 * 1.06 + c2 * 1.32 + c3 * 0.36;
        const rootZ = c0 * (-0.06) + c1 * (-0.24) + c2 * (-0.10) + c3 * 0.16;

        const featherLen = 0.80 + Math.sin(t * Math.PI) * 0.66 + t * 0.28;
        const featherWidth = 0.095 + t * 0.04;
        const sweepOutX = side * (0.20 + Math.sin(t * Math.PI) * 0.32 - t * 0.14);
        const curlForwardZ = 0.12 + t * 0.34;

        this.sampleAngelSurface(
          points,
          22,
          8,
          3,
          wingGroup,
          0.90 + 0.10 * (1 - t * 0.5),
          (u) => 0.3 + 0.7 * (t * 0.6 + u * 0.4),
          (u, v) => {
            const s = (v - 0.5) * 2;
            const blade = Math.sin(Math.pow(u, 0.7) * Math.PI);
            const w = s * featherWidth * blade;
            const ridge = (1 - Math.abs(s)) * 0.032 * blade;

            const fx = rootX + sweepOutX * u + side * ridge;
            const fy = rootY - u * featherLen;
            const fz = rootZ + Math.pow(u, 1.45) * curlForwardZ + w;

            return {
              x: fx,
              y: fy,
              z: fz,
              cx: 0,
              cy: fy,
              cz: 0.1
            };
          }
        );
      }

      const innerFeatherCount = 12;
      for (let f = 0; f < innerFeatherCount; f++) {
        const t = f / (innerFeatherCount - 1);
        const rootX = side * (0.22 + t * 1.12);
        const rootY = 0.22 + Math.sin(t * Math.PI * 0.85) * 0.76;
        const rootZ = -0.10 - Math.sin(t * Math.PI) * 0.12;
        const featherLen = 0.58 + Math.sin(t * Math.PI) * 0.44;

        this.sampleAngelSurface(
          points,
          16,
          6,
          3,
          wingGroup,
          0.84,
          (u) => 0.3 + 0.5 * (t + u),
          (u, v) => {
            const s = (v - 0.5) * 2;
            const blade = Math.sin(Math.pow(u, 0.7) * Math.PI);
            const w = s * 0.085 * blade;

            return {
              x: rootX + side * (u * 0.16 + (1 - Math.abs(s)) * 0.025),
              y: rootY - u * featherLen,
              z: rootZ + u * u * 0.16 + w,
              cx: 0,
              cy: rootY - u * featherLen,
              cz: 0.1
            };
          }
        );
      }
    });

    return points;
  },

  getAngelCellColor(lum, part) {
    const l = Math.max(0, Math.min(1, lum));

    if (part === 5) {
      const r = Math.round(145 + 110 * Math.pow(l, 0.7));
      const g = Math.round(180 + 75 * Math.pow(l, 0.7));
      const b = Math.round(230 + 25 * Math.pow(l, 0.6));
      return `rgb(${r},${g},${b})`;
    }

    if (part === 4) {
      const r = Math.round(75 + 180 * Math.pow(l, 0.82));
      const g = Math.round(72 + 175 * Math.pow(l, 0.86));
      const b = Math.round(62 + 165 * Math.pow(l, 0.92));
      return `rgb(${r},${g},${b})`;
    }

    if (part === 3) {
      const r = Math.round(32 + 216 * Math.pow(l, 0.88));
      const g = Math.round(36 + 214 * Math.pow(l, 0.88));
      const b = Math.round(48 + 206 * Math.pow(l, 0.84));
      return `rgb(${r},${g},${b})`;
    }

    if (part === 2) {
      const r = Math.round(40 + 210 * Math.pow(l, 0.85));
      const g = Math.round(42 + 206 * Math.pow(l, 0.87));
      const b = Math.round(52 + 198 * Math.pow(l, 0.86));
      return `rgb(${r},${g},${b})`;
    }

    if (part === 1) {
      const r = Math.round(20 + 135 * Math.pow(l, 1.05));
      const g = Math.round(22 + 142 * Math.pow(l, 1.02));
      const b = Math.round(30 + 155 * Math.pow(l, 0.98));
      return `rgb(${r},${g},${b})`;
    }

    const r = Math.round(28 + 205 * Math.pow(l, 0.92));
    const g = Math.round(32 + 205 * Math.pow(l, 0.90));
    const b = Math.round(42 + 202 * Math.pow(l, 0.86));
    return `rgb(${r},${g},${b})`;
  },

  renderWeepingAngelFrame(phase) {
    const inst = this.angelInstance;
    if (!inst || !inst.ctx || !inst.zBuffer) {
      return;
    }

    const cols = inst.cols;
    const rows = inst.rows;
    inst.zBuffer.fill(-1e9);

    const rawWave = (Math.sin(phase) + 1) * 0.5;
    const breath = Math.pow(rawWave, 1.35);
    const tremor = Math.sin(phase * 7.5) * 0.005 * Math.pow(breath, 2.2);

    const yaw = inst.baseYaw + Math.sin(phase * 0.35) * 0.085;
    const pitch = inst.pitch + breath * 0.025;
    const roll = Math.sin(phase * 0.35) * 0.02;

    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosX = Math.cos(pitch);
    const sinX = Math.sin(pitch);
    const cosZ = Math.cos(roll);
    const sinZ = Math.sin(roll);

    const keyLx = 0.52;
    const keyLy = 0.72;
    const keyLz = -0.46;

    const fillLx = -0.64;
    const fillLy = -0.22;
    const fillLz = -0.73;

    const fovScale = Math.max(inst.height * 1.18, Math.min(inst.width * 0.78, inst.height * 1.38));
    const camDist = 4.35;
    const centerYOffset = -0.04;

    const invCellW = 1 / inst.cellW;
    const invCellH = 1 / inst.cellH;
    const ramp = this.asciiCharRamp;
    const rampMax = ramp.length - 1;

    const plotPoint = (px, py, pz, nx, ny, nz, part, ao) => {
      const py0 = py - centerYOffset;

      const x1 = px * cosY + pz * sinY;
      const z1 = -px * sinY + pz * cosY;
      const y1 = py0;

      const x2 = x1 * cosZ - y1 * sinZ;
      const y2 = x1 * sinZ + y1 * cosZ;
      const z2 = z1;

      const y3 = y2 * cosX - z2 * sinX;
      const z3 = y2 * sinX + z2 * cosX;
      const x3 = x2;

      const depth = camDist - z3;
      if (depth <= 0.4) {
        return;
      }

      const proj = fovScale / depth;
      const screenX = inst.width * 0.5 + x3 * proj;
      const screenY = inst.height * 0.50 - y3 * proj;

      const col = (screenX * invCellW) | 0;
      const row = (screenY * invCellH) | 0;

      if (col < 0 || col >= cols || row < 0 || row >= rows) {
        return;
      }

      const idx = row * cols + col;
      if (z3 <= inst.zBuffer[idx]) {
        return;
      }

      const nx1 = nx * cosY + nz * sinY;
      const nz1 = -nx * sinY + nz * cosY;
      const ny1 = ny;

      const nx2 = nx1 * cosZ - ny1 * sinZ;
      const ny2 = nx1 * sinZ + ny1 * cosZ;
      const nz2 = nz1;

      const ny3 = ny2 * cosX - nz2 * sinX;
      const nz3 = ny2 * sinX + nz2 * cosX;
      const nx3 = nx2;

      let diffKey = nx3 * keyLx + ny3 * keyLy - nz3 * keyLz;
      if (diffKey < 0) {
        diffKey = -diffKey * 0.32;
      }

      let diffFill = nx3 * fillLx + ny3 * fillLy - nz3 * fillLz;
      if (diffFill < 0) {
        diffFill = 0;
      }

      const rim = Math.pow(1 - Math.min(1, Math.abs(nz3)), 2.15) * 0.54;
      const hz = (-keyLz + 1);
      const hLen = Math.hypot(keyLx, keyLy, hz);
      const specDot = Math.max(0, (nx3 * keyLx + ny3 * keyLy + nz3 * hz) / hLen);
      const spec = Math.pow(specDot, 16) * 0.44;

      let lum = (0.11 + diffKey * 0.63 + diffFill * 0.20 + rim + spec) * ao;
      if (part === 5) {
        lum = 0.96;
      }
      lum = Math.max(0.03, Math.min(1.0, lum));

      const charIdx = part === 5
        ? rampMax
        : Math.min(rampMax, Math.max(1, (lum * rampMax) | 0));

      inst.zBuffer[idx] = z3;
      inst.lumBuffer[idx] = lum;
      inst.partBuffer[idx] = part;
      inst.charBuffer[idx] = charIdx;
    };

    const pts = inst.points;
    const nPts = pts.length;

    for (let i = 0; i < nPts; i++) {
      const p = pts[i];
      let px = p.x;
      let py = p.y;
      let pz = p.z;
      const w = p.w;

      if (p.group === 1) {
        py += breath * 0.055 * w + tremor;
        pz += breath * 0.042 * w;
        px *= (1 + breath * 0.035 * w);
      } else if (p.group === 2) {
        py += breath * 0.052 + tremor * 1.4;
        pz += breath * 0.048;
      } else if (p.group === 3) {
        py += (breath * 0.058 + tremor * 1.6) * w;
        pz += breath * 0.044 * w;
      } else if (p.group === 4) {
        px -= breath * 0.085 * w;
        py += breath * 0.095 * w;
        pz -= breath * 0.045 * w;
      } else if (p.group === 5) {
        px += breath * 0.085 * w;
        py += breath * 0.095 * w;
        pz -= breath * 0.045 * w;
      }

      plotPoint(px, py, pz, p.nx, p.ny, p.nz, p.part, p.ao);
    }

    for (let i = 0; i < inst.tears.length; i++) {
      const tear = inst.tears[i];
      const t = tear.phase;
      const tx = tear.side * 0.095 + tear.spreadX;
      const ty = 0.27 - t * 0.78 + breath * 0.04;
      const tz = 0.50 + Math.sin(t * Math.PI) * 0.03 + breath * 0.04;

      for (let dy = -0.02; dy <= 0.02; dy += 0.02) {
        plotPoint(tx, ty + dy, tz, 0, 0.3, -0.95, 5, 1.0);
      }
    }

    const ctx = inst.ctx;
    ctx.clearRect(0, 0, inst.width, inst.height);

    const cellW = inst.cellW;
    const cellH = inst.cellH;
    const halfW = cellW * 0.5;
    const halfH = cellH * 0.5;
    let lastStyle = '';

    for (let r = 0; r < rows; r++) {
      const rowOffset = r * cols;
      const yPos = r * cellH + halfH;

      for (let c = 0; c < cols; c++) {
        const idx = rowOffset + c;
        if (inst.zBuffer[idx] <= -1e8) {
          continue;
        }

        const lum = inst.lumBuffer[idx];
        const part = inst.partBuffer[idx];
        const ch = ramp[inst.charBuffer[idx]];
        const quantizedLum = ((lum * 22) | 0) / 22;
        const color = this.getAngelCellColor(quantizedLum, part);

        if (color !== lastStyle) {
          ctx.fillStyle = color;
          lastStyle = color;
        }

        ctx.fillText(ch, c * cellW + halfW, yPos);
      }
    }
  }
};

if (typeof window !== 'undefined') {
  window.stage3 = stage3;
}
