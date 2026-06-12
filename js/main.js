/* =========================================
   DA Group — main.js
   ========================================= */

// ===== БРЕНД (меняется в одном месте) =====
const BRAND_NAME = 'DA Agency';

// ===== TELEGRAM-БОТ КОНФИГ =====
// Инструкция:
//   1. Создай бота: напиши @BotFather → /newbot → получи TOKEN
//   2. Узнай свой chat_id: напиши боту, открой
//      https://api.telegram.org/bot<TOKEN>/getUpdates
//      найди "chat":{"id": ...}
//   3. Вставь сюда перед деплоем
//   ВАЖНО: не коммить токен в публичный репозиторий!
//          Используй Cloudflare Worker как прокси (см. CLAUDE.md).
const TG_TOKEN   = 'YOUR_BOT_TOKEN_HERE';   // ← вставить токен
const TG_CHAT_ID = 'YOUR_CHAT_ID_HERE';     // ← вставить chat_id

// ===== МОБИЛЬНОЕ МЕНЮ =====
const navToggle = document.getElementById('navToggle');
const nav       = document.getElementById('nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Закрыть при клике на ссылку
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== АНИМАЦИИ ПРИ СКРОЛЛЕ =====
const animateEls = document.querySelectorAll('[data-animate]');

if (animateEls.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Небольшой stagger для соседних элементов
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, Number(delay));
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  animateEls.forEach(el => io.observe(el));
}

// ===== ФОРМА ЗАЯВКИ =====
const form       = document.getElementById('contactForm');
const submitBtn  = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    clearStatus();

    const data = new FormData(form);
    const name    = data.get('name')    || '';
    const contact = data.get('contact') || '';
    const service = data.get('service') || '';
    const comment = data.get('comment') || '';

    const text = [
      `🔔 *Новая заявка — ${BRAND_NAME}*`,
      ``,
      `👤 *Имя:* ${escape(name)}`,
      `📲 *Контакт:* ${escape(contact)}`,
      `🛠 *Услуга:* ${escape(service)}`,
      comment ? `💬 *Комментарий:* ${escape(comment)}` : '',
    ].filter(Boolean).join('\n');

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id:    TG_CHAT_ID,
            text,
            parse_mode: 'Markdown',
          }),
        }
      );

      const json = await res.json();

      if (json.ok) {
        showStatus('success', '✅ Заявка отправлена! Свяжемся в течение рабочего дня.');
        form.reset();
      } else {
        throw new Error(json.description || 'Ошибка Telegram API');
      }
    } catch (err) {
      console.error('Telegram send error:', err);
      // Показываем fallback — написать напрямую
      showStatus(
        'error',
        'Не удалось отправить форму. Напишите нам напрямую в Telegram — мы ответим быстро.'
      );
    } finally {
      setLoading(false);
    }
  });
}

function validateForm() {
  let ok = true;
  const required = form.querySelectorAll('[required]');
  required.forEach(el => {
    el.classList.remove('is-error');
    if (!el.value.trim()) {
      el.classList.add('is-error');
      ok = false;
    }
  });
  if (!ok) {
    showStatus('error', 'Заполните обязательные поля (*)');
  }
  return ok;
}

function setLoading(loading) {
  submitBtn.classList.toggle('is-loading', loading);
  submitBtn.disabled = loading;
}

function showStatus(type, msg) {
  formStatus.textContent = msg;
  formStatus.className = 'form-status is-' + type;
}

function clearStatus() {
  formStatus.textContent = '';
  formStatus.className = 'form-status';
}

// Безопасный escape для Markdown (Telegram)
function escape(str) {
  return String(str).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

// ===== АКТИВНЫЙ ПУНКТ НАВИГАЦИИ ПРИ СКРОЛЛЕ =====
const navLinks = document.querySelectorAll('.nav__link');
const sections = document.querySelectorAll('section[id]');

if (navLinks.length && sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${id}`
              ? 'var(--text)'
              : '';
          });
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach(s => sectionObserver.observe(s));
}
