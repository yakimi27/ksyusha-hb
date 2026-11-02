const stage1 = {
  headingElement: null,
  optionsContainer: null,
  zhButton: null,
  easterEggOverlay: null,
  easterEggTimer: null,
  headingCycleTimer: null,
  touchResetTimer: null,
  isEasterEggActive: false,
  easterEggDismissed: false,

  headingItems: [
    { text: "Оберіть мову", lang: "uk" },
    { text: "Выберите язык", lang: "ru" },
    { text: "选择语言", lang: "zh" }
  ],
  currentIndex: 0,

  init() {
    this.headingElement = document.getElementById('stage1-heading');
    this.optionsContainer = document.getElementById('stage1-options');
    this.zhButton = document.getElementById('lang-btn-zh');
    this.easterEggOverlay = document.getElementById('easter-egg-overlay');

    if (!this.headingElement || !this.optionsContainer) {
      return;
    }

    this.setupHeadingRotation();
    this.setupLanguageButtons();
    this.setupEasterEggEvents();
  },

  setupHeadingRotation() {
    if (this.headingCycleTimer) {
      clearInterval(this.headingCycleTimer);
    }

    this.headingCycleTimer = setInterval(() => {
      this.rotateHeading();
    }, 2800);
  },

  rotateHeading() {
    if (!this.headingElement || this.headingItems.length <= 1) {
      return;
    }

    this.headingElement.classList.add('is-changing');

    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.headingItems.length;
      this.headingElement.textContent = this.headingItems[this.currentIndex].text;
      this.headingElement.classList.remove('is-changing');
    }, 400);
  },

  setupLanguageButtons() {
    const buttons = this.optionsContainer.querySelectorAll('.lang-btn');
    buttons.forEach((btn) => {
      const lang = btn.getAttribute('data-lang');

      const handleSelection = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.clearButtonExpansion();

        if (lang === 'zh') {
          this.triggerEasterEgg();
        } else {
          this.chooseLanguage(lang);
        }
      };

      const handleExpand = () => {
        if (btn.classList.contains('collapsed')) {
          return;
        }
        if (this.touchResetTimer) {
          clearTimeout(this.touchResetTimer);
          this.touchResetTimer = null;
        }
        this.optionsContainer.classList.add('has-expanded');
        buttons.forEach((b) => {
          if (b !== btn) {
            b.classList.remove('is-expanded');
          }
        });
        btn.classList.add('is-expanded');
      };

      const handleCollapse = () => {
        btn.classList.remove('is-expanded');
        const anyExpanded = Array.from(buttons).some((b) => b.classList.contains('is-expanded'));
        if (!anyExpanded) {
          this.optionsContainer.classList.remove('has-expanded');
        }
      };

      const handleTouchEnd = () => {
        if (this.touchResetTimer) {
          clearTimeout(this.touchResetTimer);
        }
        this.touchResetTimer = setTimeout(() => {
          handleCollapse();
        }, 320);
      };

      btn.addEventListener('click', handleSelection);
      btn.addEventListener('mouseenter', handleExpand);
      btn.addEventListener('mouseleave', handleCollapse);
      btn.addEventListener('focus', handleExpand);
      btn.addEventListener('blur', handleCollapse);
      btn.addEventListener('touchstart', handleExpand, { passive: true });
      btn.addEventListener('touchend', handleTouchEnd, { passive: true });
      btn.addEventListener('touchcancel', handleCollapse, { passive: true });
    });
  },

  clearButtonExpansion() {
    if (this.touchResetTimer) {
      clearTimeout(this.touchResetTimer);
      this.touchResetTimer = null;
    }
    if (this.optionsContainer) {
      this.optionsContainer.classList.remove('has-expanded');
      const buttons = this.optionsContainer.querySelectorAll('.lang-btn');
      buttons.forEach((b) => b.classList.remove('is-expanded'));
    }
  },

  setupEasterEggEvents() {
    if (!this.easterEggOverlay) {
      return;
    }

    const dismissHandler = (event) => {
      if (!this.isEasterEggActive) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.dismissEasterEgg();
    };

    this.easterEggOverlay.addEventListener('click', dismissHandler);
    this.easterEggOverlay.addEventListener('touchend', dismissHandler);
  },

  triggerEasterEgg() {
    if (this.easterEggDismissed || this.isEasterEggActive) {
      return;
    }

    this.clearButtonExpansion();
    this.isEasterEggActive = true;
    this.easterEggOverlay.classList.add('is-active');

    if (this.easterEggTimer) {
      clearTimeout(this.easterEggTimer);
    }

    this.easterEggTimer = setTimeout(() => {
      this.dismissEasterEgg();
    }, 3000);
  },

  dismissEasterEgg() {
    if (!this.isEasterEggActive) {
      return;
    }

    this.isEasterEggActive = false;
    this.easterEggDismissed = true;

    if (this.easterEggTimer) {
      clearTimeout(this.easterEggTimer);
      this.easterEggTimer = null;
    }

    this.easterEggOverlay.classList.remove('is-active');

    if (this.zhButton) {
      this.zhButton.classList.remove('is-expanded');
      this.zhButton.classList.add('collapsed');
      this.zhButton.setAttribute('aria-hidden', 'true');
      this.zhButton.tabIndex = -1;
    }

    this.clearButtonExpansion();

    this.headingItems = this.headingItems.filter(item => item.lang !== 'zh');
    if (this.currentIndex >= this.headingItems.length) {
      this.currentIndex = 0;
    }
  },

  chooseLanguage(lang) {
    if (this.headingCycleTimer) {
      clearInterval(this.headingCycleTimer);
      this.headingCycleTimer = null;
    }

    this.clearButtonExpansion();

    if (typeof i18n !== 'undefined') {
      i18n.setLanguage(lang);
    }

    const stage1Element = document.getElementById('stage-1');
    if (stage1Element) {
      stage1Element.classList.remove('is-active');
      stage1Element.classList.add('is-hidden');
    }

    if (typeof app !== 'undefined' && typeof app.goToStage === 'function') {
      app.goToStage(2);
    } else {
      const stage2Element = document.getElementById('stage-2');
      if (stage2Element) {
        stage2Element.classList.remove('is-hidden');
        stage2Element.classList.add('is-active');
      }
    }
  }
};

if (typeof window !== 'undefined') {
  window.stage1 = stage1;
}
