/* Shared, deterministic content format. Used by the site, admin and server. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TaisContent = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const CONTENT_RE = /(<script\b[^>]*\bid=["']site-content["'][^>]*>)([\s\S]*?)(<\/script\s*>)/i;
  const DEFAULT_ABOUT = {
  "title": "ТАНЦЕВАЛЬНОЕ ШОУ НА МЕРОПРИЯТИЯ",
  "blocks": [
    {
      "image": "./about1.webp?v=1791593000",
      "title": "Что вас ждет на шоу",
      "text": "Мы предлагаем эксклюзивное выездное танцевальное шоу, которое станет главным украшением вашего мероприятия. Команда профессиональных артистов приедет на вашу площадку, чтобы создать невероятную атмосферу красоты и праздника, адаптируясь под формат вашего события."
    },
    {
      "image": "./about2.webp?v=1791593000",
      "title": "Роскошные костюмы",
      "text": "Особую атмосферу красоты и магии в нашем представлении создают роскошные костюмы и уникальные образы артистов в танцевальных номерах. Каждый костюм шоу является эксклюзивным, уникальным,изделием ручной работы дизайнеров и мастеров. Эти детали не просто дополняют яркое выступление, но и подчеркивают неповторимый стиль шоу Та-Ис, создавая ту самую магическую атмосферу праздника!"
    },
    {
      "image": "./about3.webp?v=1791593000",
      "title": "Встреча гостей (Пре-шоу)",
      "text": "Помимо основной танцевальной программы, мы предлагаем красивую встречу ваших гостей. Где артисты в роскошных сценических костюмах будут приветствовать приглашенных перед началом мероприятия, подчеркивая тем самым праздничную атмосферу. Это идеальные условия для создания памятных фотографий с первых минут"
    }
  ]
};
  const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)(?:[?#]|$)/i;
  const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(?:[?#]|$)/i;
  function asset(value) {
    if (typeof value !== 'string' || !value || value.length > 2000 ||
        /[\x00-\x1f<>"'\\]/.test(value) || /(?:^|\/)\.\.(?:\/|$)/.test(value) ||
        /^(?:blob:|data:|javascript:|\/\/)/i.test(value) ||
        (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^https:\/\//i.test(value))) {
      throw new Error('Недопустимый адрес медиафайла');
    }
    return value;
  }
  function webLink(value) {
    if (!value) return '';
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.username || u.password) throw new Error('Ссылки должны начинаться с https://');
    return u.href;
  }
  function clean(value) {
    return JSON.parse(JSON.stringify(value, (key, val) => {
      if (key.startsWith('_') || ['__proto__', 'prototype', 'constructor'].includes(key)) return undefined;
      if (typeof val === 'string' && val.startsWith('blob:')) return undefined;
      return val;
    }));
  }
  function validate(input) {
    const data = clean(input);
    if (!data || !Array.isArray(data.monthsData) || data.monthsData.length !== 10) {
      throw new Error('Нужно ровно 10 шоу. Публикация пустых или неполных данных заблокирована.');
    }
    const ids = new Set();
    data.monthsData.forEach((show, index) => {
      show.id = show.id || 'show-' + (index + 1);
      if (!/^[a-zA-Z0-9_-]+$/.test(show.id) || ids.has(show.id)) throw new Error('Некорректный идентификатор шоу');
      ids.add(show.id);
      if (typeof show.title !== 'string' || !show.title.trim() || show.title.length > 300) throw new Error('Заполните название каждого шоу');
      asset(show.image);
      if (show.mobileImage) asset(show.mobileImage);
      if (show.detailsText != null && typeof show.detailsText !== 'string') throw new Error('Некорректное описание');
      if (!Array.isArray(show.media)) throw new Error('Некорректный список материалов');
      show.media.forEach(item => {
        asset(item.url);
        // An image selected through the old "video" input must remain viewable.
        if (IMAGE_EXT.test(item.url)) item.type = 'image';
        else if (VIDEO_EXT.test(item.url)) item.type = 'video';
        else throw new Error('Поддерживаются фото и видео MP4/WebM/MOV');
        if (item.poster) asset(item.poster);
        if (item.pos && !/^(?:left|right|center|top|bottom|\d{1,3}(?:\.\d+)?%)(?:\s+(?:left|right|center|top|bottom|\d{1,3}(?:\.\d+)?%))?$/.test(item.pos)) throw new Error('Некорректное положение фото');
        if (item.scale != null && (!Number.isFinite(item.scale) || item.scale < 0.1 || item.scale > 10)) throw new Error('Некорректный масштаб');
      });
    });
    data.showPosMap = data.showPosMap || {};
    for (const entry of Object.values(data.showPosMap)) {
      const pos = typeof entry === 'string' ? entry : entry.pos;
      if (typeof pos !== 'string' || !/^(?:left|right|center|top|bottom|\d{1,3}(?:\.\d+)?%)(?:\s+(?:left|right|center|top|bottom|\d{1,3}(?:\.\d+)?%))?$/.test(pos)) throw new Error('Некорректное положение карточки');
      if (typeof entry === 'object' && entry.scale != null && (!Number.isFinite(entry.scale) || entry.scale < 0.1 || entry.scale > 10)) throw new Error('Некорректный масштаб карточки');
    }
    data.links = data.links || {};
    ['max', 'telegram', 'vkPersonal', 'vkGroup', 'instagram'].forEach(key => {
      data.links[key] = webLink(data.links[key]);
    });
    ['phone', 'email', 'address'].forEach(key => {
      if (data.links[key] != null && (typeof data.links[key] !== 'string' || data.links[key].length > 500)) throw new Error('Некорректные контакты');
    });
    data.banner = data.banner || { desktopImage: 'img/index/banner.png', mobileImage: 'img/index/Banner_mobile.png' };
    asset(data.banner.desktopImage);
    asset(data.banner.mobileImage);
    data.about = data.about || JSON.parse(JSON.stringify(DEFAULT_ABOUT));
    if (typeof data.about.title !== 'string' || !data.about.title.trim() || data.about.title.length > 300 || !Array.isArray(data.about.blocks) || data.about.blocks.length !== 3) throw new Error('Заполните заголовок раздела и все три блока о шоу');
    data.about.blocks.forEach(block => {
      if (typeof block.title !== 'string' || !block.title.trim() || block.title.length > 300 || typeof block.text !== 'string' || !block.text.trim() || block.text.length > 10000) throw new Error('Заполните заголовок и текст каждого блока о шоу');
      asset(block.image);
      if (!IMAGE_EXT.test(block.image)) throw new Error('Для блока о шоу нужно изображение');
    });
    data.version = 1;
    data.ticketPrices = null;
    return data;
  }
  function stringify(data) {
    // Never allow data to terminate its application/json script element.
    return JSON.stringify(validate(data), null, 2)
      .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
      .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  }
  function read(html) {
    const match = html.match(CONTENT_RE);
    if (!match) throw new Error('Блок данных сайта не найден. Публикация отменена, файлы не изменены.');
    return validate(JSON.parse(match[2]));
  }
  function write(html, data) {
    if (!CONTENT_RE.test(html)) throw new Error('Блок данных сайта не найден');
    const serialized = stringify(data);
    const result = html.replace(CONTENT_RE, (_, start, old, end) => start + '\n' + serialized + '\n' + end);
    if (stringify(read(result)) !== serialized) throw new Error('Проверка сохранённых данных не пройдена');
    return result;
  }
  function safeHtml(html) {
    // Descriptions are authored as plain text; retain existing basic formatting only.
    return String(html || '')
      .replace(/<(script|style|iframe|object|embed|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
      .replace(/<(?!\/?(?:h[1-4]|p|br|ul|ol|li|strong|b|em|i|span)\b)[^>]*>/gi, '')
      .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/\s+(?:src|href|srcdoc)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  }
  return { asset, clean, validate, stringify, read, write, safeHtml };
});