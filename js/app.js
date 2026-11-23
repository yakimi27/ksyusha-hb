const app = {
  currentStage: 1,

  init() {
    if (typeof i18n !== 'undefined') {
      i18n.initLanguage();
    }

    if (typeof stage1 !== 'undefined') {
      stage1.init();
    }

    if (typeof stage2 !== 'undefined' && typeof stage2.preloadAssets === 'function') {
      stage2.preloadAssets();
    }
  },

  goToStage(stageNumber) {
    const previousStageElement = document.getElementById(`stage-${this.currentStage}`);
    const nextStageElement = document.getElementById(`stage-${stageNumber}`);

    if (previousStageElement) {
      previousStageElement.classList.remove('is-active');
      previousStageElement.classList.add('is-hidden');
    }

    this.currentStage = stageNumber;

    if (nextStageElement) {
      nextStageElement.classList.remove('is-hidden');
      nextStageElement.classList.add('is-active');
    }

    if (stageNumber === 2 && typeof stage2 !== 'undefined' && typeof stage2.init === 'function') {
      stage2.init();
    } else if (stageNumber === 3 && typeof stage3 !== 'undefined' && typeof stage3.init === 'function') {
      stage3.init();
    }
  }
};

if (typeof window !== 'undefined') {
  window.app = app;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    app.init();
  });
}
