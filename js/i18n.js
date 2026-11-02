const i18n = {
  currentLanguage: 'uk',
  languages: ['uk', 'ru'],
  dictionary: {
    uk: {
      metaTitle: "З 18-річчям, Ксюша!",
      stage1: {
        badge: "18TH ANNIVERSARY",
        heading: "Оберіть мову"
      },
      stage2: {
        tapHint: "Торкнися яйця",
        cracking: "Ще трохи..."
      },
      stage3: {
        heroTagline: "З днем народження",
        heroName: "Ксюша",
        heroAge: "18 РОКІВ",
        scrollHint: "гортайте вниз",
        cardTitle: "Офіційно доросла",
        greetingText: "Вітаю з повноліттям! Вісімнадцять — це той магічний кордон, коли світ стає ширшим, а кожна мить — більш значущою. Нехай цей рік принесе тобі шалене натхнення, щирих людей поруч і сміливість втілювати найзухваліші мрії. Залишайся такою ж неперевершеною!",
        galleryTitle: "Моменти & Спогади",
        wishesTitle: "Побажання",
        wishes: [
          "Невичерпної енергії та внутрішнього спокою",
          "Людей, які надихають і щиро цінують тебе",
          "Сміливості відкривати нові горизонти без сумнівів",
          "Затишку в серці та гармонії з усім світом"
        ],
        candleAction: "Задути свічку",
        candleWishGranted: "Нехай твоє найзаповітніше бажання здісниться!"
      }
    },
    ru: {
      metaTitle: "С 18-летием, Ксюша!",
      stage1: {
        badge: "18TH ANNIVERSARY",
        heading: "Выберите язык"
      },
      stage2: {
        tapHint: "Коснись яйца",
        cracking: "Ещё чуть-чуть..."
      },
      stage3: {
        heroTagline: "С днем рождения",
        heroName: "Ксюша",
        heroAge: "18 ЛЕТ",
        scrollHint: "листайте вниз",
        cardTitle: "Официально взрослая",
        greetingText: "Поздравляю с совершеннолетием! Восемнадцать — тот особенный рубеж, когда мир распахивает все двери, а каждый день полон новых открытий. Пусть этот год подарит море вдохновения, верных людей рядом и уверенность в каждом твоем шаге. Оставайся такой же невероятной!",
        galleryTitle: "Моменты & Воспоминания",
        wishesTitle: "Пожелания",
        wishes: [
          "Неиссякаемой энергии и внутреннего баланса",
          "Людей, которые вдохновляют и ценят тебя настоящую",
          "Смелости идти к своим целям без оглядки назад",
          "Тепла в душе и ярких счастливых моментов"
        ],
        candleAction: "Задуть свечу",
        candleWishGranted: "Пусть твоё самое заветное желание обязательно исполнится!"
      }
    }
  },
  t(path) {
    const keys = path.split('.');
    let current = this.dictionary[this.currentLanguage];
    for (const key of keys) {
      if (!current || current[key] === undefined) {
        return path;
      }
      current = current[key];
    }
    return current;
  },
  setLanguage(lang) {
    if (this.dictionary[lang]) {
      this.currentLanguage = lang;
      try {
        localStorage.setItem('birthday_language', lang);
      } catch (e) {
      }
      return true;
    }
    return false;
  },
  initLanguage() {
    try {
      const saved = localStorage.getItem('birthday_language');
      if (saved && this.dictionary[saved]) {
        this.currentLanguage = saved;
      }
    } catch (e) {
    }
    return this.currentLanguage;
  }
};

if (typeof window !== 'undefined') {
  window.i18n = i18n;
}
