/* ── Nav scroll effect ────────────────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── Mobile hamburger ─────────────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ── Scroll reveal ────────────────────────────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger cards in the earlier grid
      const delay = entry.target.closest('.earlier-grid') ? i * 60 : 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── Architecture accordions ──────────────────────────────────────────────── */
document.querySelectorAll('.arch-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    const body   = btn.nextElementSibling;

    // Close all others
    document.querySelectorAll('.arch-toggle').forEach(other => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        other.nextElementSibling.classList.remove('open');
      }
    });

    btn.setAttribute('aria-expanded', String(!isOpen));
    body.classList.toggle('open', !isOpen);

    // Scroll card into view if opening
    if (!isOpen) {
      setTimeout(() => {
        btn.closest('.project-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  });
});

/* ── Active nav link on scroll ────────────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navAs    = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAs.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${entry.target.id}`
          ? '#fff' : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ── Colour tint on project cards ─────────────────────────────────────────── */
document.querySelectorAll('.project-card').forEach(card => {
  const color = card.dataset.color || '#3b82f6';
  card.addEventListener('mouseenter', () => {
    card.style.borderColor = color + '40';
    card.style.boxShadow   = `0 8px 48px ${color}18`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.borderColor = '';
    card.style.boxShadow   = '';
  });
});

/* ── Typing cursor on hero name ───────────────────────────────────────────── */
const heroName = document.querySelector('.hero-name');
if (heroName) {
  heroName.style.borderRight = 'none';
}

/* ── Professional Background accordion ───────────────────────────────────── */
const bgToggle = document.querySelector('.bg-toggle');
if (bgToggle) {
  bgToggle.addEventListener('click', () => {
    const isOpen = bgToggle.getAttribute('aria-expanded') === 'true';
    bgToggle.setAttribute('aria-expanded', String(!isOpen));
    bgToggle.nextElementSibling.classList.toggle('open', !isOpen);
    bgToggle.querySelector('span').textContent = isOpen ? 'Show employment history' : 'Hide employment history';
  });
}

/* ── Smooth stagger for hero elements ────────────────────────────────────── */
document.querySelectorAll('#hero .reveal').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.12}s`;
  // Force visible immediately for hero (above the fold)
  setTimeout(() => el.classList.add('visible'), 50 + i * 120);
});

/* ── Chat Widget ─────────────────────────────────────────────────────────── */
(function () {
  const trigger      = document.getElementById('chatTrigger');
  const panel        = document.getElementById('chatPanel');
  const closeBtn     = document.getElementById('chatClose');
  const messages     = document.getElementById('chatMessages');
  const form         = document.getElementById('chatForm');
  const input        = document.getElementById('chatInput');
  const sendBtn      = document.getElementById('chatSend');
  const suggestions  = document.getElementById('chatSuggestions');

  let history = [];
  let busy    = false;

  function openChat() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    trigger.classList.add('hidden');
    input.focus();
  }

  function closeChat() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    trigger.classList.remove('hidden');
  }

  trigger.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);

  // Dismiss suggestions once user has interacted
  function hideSuggestions() {
    if (suggestions) suggestions.style.display = 'none';
  }

  document.querySelectorAll('.chat-suggest').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.textContent;
      hideSuggestions();
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });
  });

  function appendMsg(text, role) {
    const div = document.createElement('div');
    div.className = `chat-msg chat-msg-${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  async function sendMessage(text) {
    if (busy) return;
    busy = true;
    input.disabled = true;
    sendBtn.disabled = true;

    hideSuggestions();
    appendMsg(text, 'user');
    history.push({ role: 'user', content: text });

    const assistantEl = appendMsg('', 'assistant');
    assistantEl.classList.add('typing');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(-8) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        assistantEl.textContent = data.error || 'Something went wrong. Please try again.';
        assistantEl.classList.remove('typing');
        history.pop();
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';
      assistantEl.classList.remove('typing');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const json = JSON.parse(data);
            if (json.error) { assistantEl.textContent = json.error; return; }
            const delta = json.choices?.[0]?.delta?.content ?? '';
            full += delta;
            assistantEl.textContent = full;
            messages.scrollTop = messages.scrollHeight;
          } catch {}
        }
      }

      history.push({ role: 'assistant', content: full });
    } catch {
      assistantEl.classList.remove('typing');
      assistantEl.textContent = 'Connection error — is the server running?';
      history.pop();
    } finally {
      busy = false;
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendMessage(text);
  });
}());
