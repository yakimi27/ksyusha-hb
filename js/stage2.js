const stage2 = {
  stageElement: null,
  eggScene: null,
  eggTrigger: null,
  eggWrapper: null,
  shardsContainer: null,
  statusContainer: null,
  hintElement: null,
  cardsLayer: null,
  counterFocal: null,
  counterValue: null,
  clickCount: 0,
  maxClicks: 5,
  totalCards: 18,
  isShattered: false,
  isAlignedPhase: false,
  isInitialized: false,
  lastTouchTime: 0,
  crunchTimer: null,
  resizeRafId: null,
  sequenceTimers: [],
  cardElements: [],
  preloadedImages: [],

  photoSources: [
    'media/photo_1.png',
    'media/photo_2.png',
    'media/photo_3.png',
    'media/photo_4.png',
    'media/photo_5.png',
    'media/photo_6.png'
  ],

  preloadAssets() {
    if (this.preloadedImages.length > 0) {
      return;
    }
    this.photoSources.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      this.preloadedImages.push(img);
    });
  },

  init() {
    this.preloadAssets();

    this.stageElement = document.getElementById('stage-2');
    this.eggScene = document.getElementById('stage2-egg-scene');
    this.eggTrigger = document.getElementById('stage2-egg-trigger');
    this.eggWrapper = document.getElementById('stage2-egg-wrapper');
    this.shardsContainer = document.getElementById('stage2-egg-shards');
    this.statusContainer = document.getElementById('stage2-status');
    this.hintElement = document.getElementById('stage2-hint');
    this.cardsLayer = document.getElementById('stage2-cards-layer');
    this.counterFocal = document.getElementById('stage2-counter-focal');
    this.counterValue = document.getElementById('stage2-counter-value');

    if (!this.stageElement || !this.eggTrigger || !this.eggWrapper) {
      return;
    }

    this.resetState();

    if (!this.isInitialized) {
      this.bindEvents();
      this.isInitialized = true;
    }

    const revealTimer = setTimeout(() => {
      if (this.eggScene) {
        this.eggScene.classList.add('is-ready');
      }
    }, 80);
    this.sequenceTimers.push(revealTimer);
  },

  resetState() {
    this.clearTimers();
    this.clickCount = 0;
    this.isShattered = false;
    this.isAlignedPhase = false;
    this.cardElements = [];

    if (this.stageElement) {
      this.stageElement.classList.remove('is-fading-out');
    }

    if (this.eggScene) {
      this.eggScene.classList.remove('is-ready', 'is-hidden');
      this.eggScene.removeAttribute('data-crack');
    }

    if (this.eggWrapper) {
      this.eggWrapper.classList.remove('is-crunching', 'is-shattered');
      this.eggWrapper.classList.add('is-idle');
      this.eggWrapper.removeAttribute('data-crack');
    }

    for (let i = 1; i <= 4; i++) {
      const crackGroup = document.getElementById(`egg-crack-${i}`);
      if (crackGroup) {
        crackGroup.classList.remove('is-visible');
      }
    }

    if (this.statusContainer) {
      this.statusContainer.classList.remove('is-hidden');
    }

    if (this.hintElement) {
      const tapText = typeof i18n !== 'undefined' ? i18n.t('stage2.tapHint') : 'Торкнися яйця';
      this.hintElement.textContent = tapText;
      this.hintElement.classList.remove('is-active-hint');
    }

    if (this.shardsContainer) {
      this.shardsContainer.innerHTML = '';
    }

    if (this.cardsLayer) {
      this.cardsLayer.innerHTML = '';
    }

    if (this.counterFocal) {
      this.counterFocal.classList.remove('is-active', 'is-bumping', 'is-complete', 'is-handed-off');
    }

    if (this.counterValue) {
      this.counterValue.textContent = '0';
    }
  },

  clearTimers() {
    if (this.crunchTimer) {
      clearTimeout(this.crunchTimer);
      this.crunchTimer = null;
    }
    if (this.resizeRafId) {
      cancelAnimationFrame(this.resizeRafId);
      this.resizeRafId = null;
    }
    this.sequenceTimers.forEach((timerId) => clearTimeout(timerId));
    this.sequenceTimers = [];
  },

  bindEvents() {
    const onTouchStart = (event) => {
      if (this.isShattered) {
        return;
      }
      this.lastTouchTime = Date.now();
      event.preventDefault();
      this.handleEggInteraction();
    };

    const onClick = (event) => {
      if (this.isShattered) {
        return;
      }
      if (Date.now() - this.lastTouchTime < 450) {
        return;
      }
      event.preventDefault();
      this.handleEggInteraction();
    };

    this.eggTrigger.addEventListener('touchstart', onTouchStart, { passive: false });
    this.eggTrigger.addEventListener('click', onClick);

    window.addEventListener('resize', () => {
      if (!this.isAlignedPhase || this.cardElements.length === 0 || this.resizeRafId) {
        return;
      }
      this.resizeRafId = requestAnimationFrame(() => {
        this.resizeRafId = null;
        if (this.isAlignedPhase && this.cardElements.length > 0) {
          this.alignCardsInFormation();
        }
      });
    }, { passive: true });
  },

  handleEggInteraction() {
    if (this.isShattered || this.clickCount >= this.maxClicks) {
      return;
    }

    this.clickCount += 1;

    this.spawnTapSparks(this.clickCount === this.maxClicks ? 14 : 7);

    if (this.clickCount < this.maxClicks) {
      this.applyCrackStage(this.clickCount);
      this.playFeedback('crunch', this.clickCount);
    } else {
      this.playFeedback('burst', this.clickCount);
      this.shatterEgg();
    }
  },

  applyCrackStage(level) {
    if (!this.eggWrapper) {
      return;
    }

    this.eggWrapper.setAttribute('data-crack', String(level));
    if (this.eggScene) {
      this.eggScene.setAttribute('data-crack', String(level));
    }

    const crackGroup = document.getElementById(`egg-crack-${level}`);
    if (crackGroup) {
      crackGroup.classList.add('is-visible');
    }

    this.eggWrapper.classList.remove('is-idle', 'is-crunching');
    void this.eggWrapper.offsetWidth;
    this.eggWrapper.classList.add('is-crunching');

    if (this.hintElement) {
      const crackingText = typeof i18n !== 'undefined' ? i18n.t('stage2.cracking') : 'Ще трохи...';
      this.hintElement.textContent = crackingText;
      this.hintElement.classList.add('is-active-hint');
    }

    if (this.crunchTimer) {
      clearTimeout(this.crunchTimer);
    }

    this.crunchTimer = setTimeout(() => {
      if (!this.isShattered && this.eggWrapper) {
        this.eggWrapper.classList.remove('is-crunching');
        this.eggWrapper.classList.add('is-idle');
      }
    }, 390);
  },

  spawnTapSparks(count) {
    if (!this.shardsContainer) {
      return;
    }

    for (let i = 0; i < count; i++) {
      const spark = document.createElement('span');
      spark.className = 'egg-tap-spark';
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const distance = 45 + Math.random() * 65;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      spark.style.setProperty('--spark-tx', `${tx.toFixed(1)}px`);
      spark.style.setProperty('--spark-ty', `${ty.toFixed(1)}px`);
      this.shardsContainer.appendChild(spark);

      const removeTimer = setTimeout(() => {
        if (spark.parentNode) {
          spark.parentNode.removeChild(spark);
        }
      }, 550);
      this.sequenceTimers.push(removeTimer);
    }
  },

  shatterEgg() {
    this.isShattered = true;

    if (this.crunchTimer) {
      clearTimeout(this.crunchTimer);
      this.crunchTimer = null;
    }

    if (this.eggWrapper) {
      this.eggWrapper.classList.remove('is-idle', 'is-crunching');
      this.eggWrapper.classList.add('is-shattered');
    }

    if (this.statusContainer) {
      this.statusContainer.classList.add('is-hidden');
    }

    this.spawnShatterShards();
    this.launchFlyingCardsSequence();

    const hideSceneTimer = setTimeout(() => {
      if (this.eggScene) {
        this.eggScene.classList.add('is-hidden');
      }
    }, 650);
    this.sequenceTimers.push(hideSceneTimer);
  },

  spawnShatterShards() {
    if (!this.shardsContainer) {
      return;
    }

    const shardCount = 14;
    for (let i = 0; i < shardCount; i++) {
      const shard = document.createElement('span');
      shard.className = 'egg-shard';
      const angle = (Math.PI * 2 * i) / shardCount + (Math.random() - 0.5) * 0.3;
      const distance = 90 + Math.random() * 110;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const rot = (Math.random() - 0.5) * 520;
      const size = 18 + Math.random() * 18;

      shard.style.setProperty('--shard-tx', `${tx.toFixed(1)}px`);
      shard.style.setProperty('--shard-ty', `${ty.toFixed(1)}px`);
      shard.style.setProperty('--shard-rot', `${rot.toFixed(0)}deg`);
      shard.style.setProperty('--shard-size', `${size.toFixed(0)}px`);

      this.shardsContainer.appendChild(shard);
      requestAnimationFrame(() => {
        shard.classList.add('is-flying');
      });
    }
  },

  buildCardDeck() {
    const deck = [
      'media/photo_2.png',
      'media/photo_3.png',
      'media/photo_4.png',
      'media/photo_5.png',
      'media/photo_6.png'
    ];

    while (deck.length < this.totalCards) {
      deck.push('media/photo_1.png');
    }

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }

    return deck;
  },

  computeCardDimensions() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (vw >= 1100) {
      const gap = 10;
      const availableW = Math.min(vw - 48, 1360);
      const cardW = Math.max(46, Math.min(68, Math.floor((availableW - gap * 17) / 18)));
      const cardH = Math.round(cardW * 1.28);
      return { cardW, cardH, cols: 18, rows: 1, gapX: gap, gapY: gap, offsetY: Math.round(vh * 0.14) };
    }

    if (vw >= 640) {
      const cols = 6;
      const rows = 3;
      const gapX = 12;
      const gapY = 12;
      const maxW = Math.min(vw - 48, 560);
      const maxH = Math.min(vh * 0.52, 360);
      const cardWByWidth = Math.floor((maxW - gapX * (cols - 1)) / cols);
      const cardHByHeight = Math.floor((maxH - gapY * (rows - 1)) / rows);
      const cardW = Math.max(44, Math.min(72, cardWByWidth, Math.floor(cardHByHeight / 1.28)));
      const cardH = Math.round(cardW * 1.28);
      return { cardW, cardH, cols, rows, gapX, gapY, offsetY: Math.round(vh * 0.14) };
    }

    const cols = 6;
    const rows = 3;
    const gapX = 7;
    const gapY = 9;
    const availableW = vw - 24;
    const availableH = vh * 0.48;
    const cardWByWidth = Math.floor((availableW - gapX * (cols - 1)) / cols);
    const cardHByHeight = Math.floor((availableH - gapY * (rows - 1)) / rows);
    const cardW = Math.max(38, Math.min(56, cardWByWidth, Math.floor(cardHByHeight / 1.28)));
    const cardH = Math.round(cardW * 1.28);
    return { cardW, cardH, cols, rows, gapX, gapY, offsetY: Math.round(vh * 0.15) };
  },

  launchFlyingCardsSequence() {
    if (!this.cardsLayer) {
      return;
    }

    this.cardsLayer.innerHTML = '';
    this.cardElements = [];

    const deck = this.buildCardDeck();
    const layout = this.computeCardDimensions();
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.totalCards; i++) {
      const card = document.createElement('div');
      card.className = 'stage2-photo-card';
      card.style.setProperty('--card-w', `${layout.cardW}px`);
      card.style.setProperty('--card-h', `${layout.cardH}px`);
      card.style.setProperty('--card-x', '0px');
      card.style.setProperty('--card-y', '0px');
      card.style.setProperty('--card-rot', '0deg');
      card.style.setProperty('--card-scale', '0.18');
      card.style.setProperty('--card-dur', '0.95s');

      const img = document.createElement('img');
      img.className = 'stage2-card-img';
      img.src = deck[i];
      img.alt = '';
      card.appendChild(img);

      fragment.appendChild(card);
      this.cardElements.push(card);
    }

    this.cardsLayer.appendChild(fragment);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.scatterCards();
      });
    });

    const driftTimer = setTimeout(() => {
      this.driftScatteredCards();
    }, 950);
    this.sequenceTimers.push(driftTimer);

    const alignTimer = setTimeout(() => {
      this.alignCardsInFormation();
    }, 2000);
    this.sequenceTimers.push(alignTimer);

    const aggregateTimer = setTimeout(() => {
      this.aggregateCardsToCounter();
    }, 3100);
    this.sequenceTimers.push(aggregateTimer);
  },

  scatterCards() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxRadiusX = Math.max(120, vw * 0.43);
    const maxRadiusY = Math.max(140, vh * 0.41);

    this.cardElements.forEach((card, index) => {
      const baseAngle = (Math.PI * 2 * index) / this.totalCards;
      const jitterAngle = baseAngle + (Math.random() - 0.5) * 0.38;
      const radiusFactor = 0.48 + Math.random() * 0.52;
      const targetX = Math.cos(jitterAngle) * maxRadiusX * radiusFactor;
      const targetY = Math.sin(jitterAngle) * maxRadiusY * radiusFactor;
      const rotation = (Math.random() - 0.5) * 68;
      const scale = 0.92 + Math.random() * 0.22;

      card.dataset.scatterX = String(targetX);
      card.dataset.scatterY = String(targetY);
      card.dataset.scatterRot = String(rotation);

      card.classList.add('is-visible');
      card.style.setProperty('--card-dur', `${(0.75 + Math.random() * 0.35).toFixed(2)}s`);
      card.style.setProperty('--card-x', `${targetX.toFixed(1)}px`);
      card.style.setProperty('--card-y', `${targetY.toFixed(1)}px`);
      card.style.setProperty('--card-rot', `${rotation.toFixed(1)}deg`);
      card.style.setProperty('--card-scale', scale.toFixed(2));
    });
  },

  driftScatteredCards() {
    this.cardElements.forEach((card) => {
      const prevX = parseFloat(card.dataset.scatterX || '0');
      const prevY = parseFloat(card.dataset.scatterY || '0');
      const prevRot = parseFloat(card.dataset.scatterRot || '0');

      const driftX = prevX + (Math.random() - 0.5) * 54;
      const driftY = prevY + (Math.random() - 0.5) * 54;
      const driftRot = prevRot + (Math.random() - 0.5) * 26;

      card.style.setProperty('--card-dur', '1.05s');
      card.style.setProperty('--card-x', `${driftX.toFixed(1)}px`);
      card.style.setProperty('--card-y', `${driftY.toFixed(1)}px`);
      card.style.setProperty('--card-rot', `${driftRot.toFixed(1)}deg`);
    });
  },

  alignCardsInFormation() {
    this.isAlignedPhase = true;
    const layout = this.computeCardDimensions();
    const totalGridW = layout.cols * layout.cardW + (layout.cols - 1) * layout.gapX;
    const totalGridH = layout.rows * layout.cardH + (layout.rows - 1) * layout.gapY;
    const startX = -totalGridW / 2 + layout.cardW / 2;
    const startY = -totalGridH / 2 + layout.cardH / 2 + layout.offsetY;

    this.cardElements.forEach((card, index) => {
      const col = index % layout.cols;
      const row = Math.floor(index / layout.cols);
      const posX = startX + col * (layout.cardW + layout.gapX);
      const posY = startY + row * (layout.cardH + layout.gapY);

      card.classList.add('is-aligned');
      card.style.setProperty('--card-w', `${layout.cardW}px`);
      card.style.setProperty('--card-h', `${layout.cardH}px`);
      card.style.setProperty('--card-dur', '0.78s');
      card.style.setProperty('--card-x', `${posX.toFixed(1)}px`);
      card.style.setProperty('--card-y', `${posY.toFixed(1)}px`);
      card.style.setProperty('--card-rot', '0deg');
      card.style.setProperty('--card-scale', '1');
    });
  },

  getFocalCounterOffset() {
    const targetElement = this.counterValue || this.counterFocal;
    if (!targetElement) {
      return { x: 0, y: -window.innerHeight * 0.3 };
    }
    const rect = targetElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 - window.innerWidth / 2;
    const centerY = rect.top + rect.height / 2 - window.innerHeight / 2;
    return { x: centerX, y: centerY };
  },

  aggregateCardsToCounter() {
    this.isAlignedPhase = false;
    if (this.counterFocal) {
      this.counterFocal.classList.add('is-active');
    }

    const focalOffset = this.getFocalCounterOffset();
    const targetX = `${focalOffset.x.toFixed(1)}px`;
    const targetY = `${focalOffset.y.toFixed(1)}px`;
    const stepInterval = 90;
    const flightDuration = 340;
    let currentCounter = 0;

    this.cardElements.forEach((card, index) => {
      const launchDelay = index * stepInterval;

      const launchTimer = setTimeout(() => {
        card.classList.remove('is-aligned');
        card.classList.add('is-particle');
        card.style.setProperty('--card-dur', `${flightDuration}ms`);
        card.style.setProperty('--card-x', targetX);
        card.style.setProperty('--card-y', targetY);
        card.style.setProperty('--card-rot', '0deg');
        card.style.setProperty('--card-scale', '0.26');
      }, launchDelay);
      this.sequenceTimers.push(launchTimer);

      const impactTimer = setTimeout(() => {
        card.classList.add('is-absorbed');
        currentCounter += 1;

        if (this.counterValue) {
          this.counterValue.textContent = String(currentCounter);
        }

        this.playFeedback('tick', currentCounter);
        this.bumpCounterFocal();

        if (currentCounter === this.totalCards) {
          this.handleCounterComplete();
        }
      }, launchDelay + flightDuration);
      this.sequenceTimers.push(impactTimer);
    });
  },

  bumpCounterFocal() {
    if (!this.counterFocal || this.counterFocal.classList.contains('is-complete')) {
      return;
    }

    this.counterFocal.classList.add('is-bumping');
    const bumpTimer = setTimeout(() => {
      if (this.counterFocal) {
        this.counterFocal.classList.remove('is-bumping');
      }
    }, 70);
    this.sequenceTimers.push(bumpTimer);
  },

  handleCounterComplete() {
    if (this.counterFocal) {
      this.counterFocal.classList.remove('is-bumping');
      this.counterFocal.classList.add('is-complete');
    }

    this.playFeedback('complete', 18);

    const transitionTimer = setTimeout(() => {
      this.finishStage2();
    }, 550);
    this.sequenceTimers.push(transitionTimer);
  },

  finishStage2() {
    if (this.stageElement) {
      this.stageElement.classList.add('is-fading-out');
    }

    if (typeof app !== 'undefined' && typeof app.goToStage === 'function') {
      app.goToStage(3);
    } else {
      const stage3Element = document.getElementById('stage-3');
      if (stage3Element) {
        stage3Element.classList.remove('is-hidden');
        stage3Element.classList.add('is-active');
      }
    }

    const doneTimer = setTimeout(() => {
      if (this.stageElement) {
        this.stageElement.classList.remove('is-active');
        this.stageElement.classList.add('is-hidden');
      }
      if (this.counterFocal) {
        this.counterFocal.classList.add('is-handed-off');
      }
      if (this.cardsLayer) {
        this.cardsLayer.innerHTML = '';
      }
      if (this.shardsContainer) {
        this.shardsContainer.innerHTML = '';
      }
      this.cardElements = [];
    }, 520);
    this.sequenceTimers.push(doneTimer);
  },

  playFeedback(type, step) {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        if (type === 'crunch') {
          navigator.vibrate(18 + step * 6);
        } else if (type === 'burst') {
          navigator.vibrate([35, 30, 55]);
        } else if (type === 'complete') {
          navigator.vibrate([25, 40, 65]);
        }
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

      if (type === 'crunch') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140 + step * 28, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.085);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.095);
      } else if (type === 'burst') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(68, now + 0.24);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320 + step * 24, now);
        osc.frequency.exponentialRampToValueAtTime(380 + step * 26, now + 0.045);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.055);
      } else if (type === 'complete') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.38);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.44);
      }
    } catch (e) {
    }
  }
};

if (typeof window !== 'undefined') {
  window.stage2 = stage2;
}
