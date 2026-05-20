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
  // System prompt — same context as scripts/generate_cv.py CANDIDATE_CONTEXT
  const SYSTEM_PROMPT = `You are the AI assistant on Richard Awe's portfolio website. Answer visitor questions about Richard enthusiastically and accurately — his skills, projects, background, and what makes him exceptional. Be warm, specific, and professional. Reference concrete project names and architectural decisions when relevant. Keep responses to 2–4 paragraphs unless asked for detail. If someone wants to work with Richard, direct them to richard3d7@gmail.com. Do not perform tasks unrelated to Richard.

Richard Awe is an AI Architect & Full-Stack Engineer and Founder of 3d7 Technologies. His signature approach: hybrid deterministic/LLM architectures — code handles correctness-critical decisions; AI handles language, extraction, and generation. Every project ships with GitHub Actions pipelines.

CORE SKILLS: Multi-Agent AI Architecture · GitHub Actions Orchestration · RAG Pipelines · LLM Integration (OpenAI, Claude, OpenRouter) · Transformers.js / Browser-Native ML · Vector Databases · Python 3.12 · TypeScript · JavaScript · PHP 8.4 · React · Next.js · Laravel 13 · Flask · Django · Node.js/Express · MySQL · PostgreSQL · ChromaDB · Playwright · libsodium · JWT · OAuth 2.0 · GitHub Pages · Vercel · cPanel CI/CD

KEY PROJECTS: (1) EU261 Auto-Claim Agent — agentic legal-tech system filing flight compensation claims via GitHub Actions state machine (11 workflows on Issue label transitions), hybrid AI/rules engine, libsodium PII encryption. (2) UK Politics AI Positioning Matrix — live political dashboard updating every 6h via cron, multi-provider AI abstraction swappable at runtime, credibility-weighted signal scoring, fully static Next.js. (3) EV Showcase — autonomous daily EV database growth via LLM + Wikipedia image pipeline, GitHub Actions, static. (4) Brand Reel — browser-native brand video generation, no server, Remotion + Canvas 2D + MediaRecorder. (5) BrowserML — Transformers.js + Web Workers, 100% client-side AI, zero data egress. (6) EnergyTRM — full ETRM portal in production, Laravel 13/PHP 8.4/MySQL, two-stage GitHub Actions CI/CD.

EARLIER WORK: AI Metrics Intelligence Platform · AI Agent Workflow System (5-step multi-agent) · Intelligent Email Assistant (Gmail OAuth + RAG) · DataRadar document intelligence · Humanitarian Intelligence Platform Nigeria · Kidemia AI learning · RegAlertPro regulatory SaaS · DocumentHelp.ai.

BACKGROUND: Lead Business Analyst at Fitch Ratings (Mar 2025–present) · Product Owner at 3D7 Technologies (2024) · Lead BA at RAC Limited (2023–2024) · Lead BA at HMRC (2022–2023) · Lead BA at European Central Bank (2020–2021) · Lead BA at Lloyds Banking Group (2019–2020) · Senior BA at HSBC (2015–2019).`;

  const _raw = window.CHAT_CONFIG || {};
  const cfg  = Object.keys(_raw).length ? _raw : null;
  const CHAT_MODEL = (cfg && cfg.model) || 'openai/gpt-oss-120b:free';

  const trigger     = document.getElementById('chatTrigger');
  const panel       = document.getElementById('chatPanel');
  const closeBtn    = document.getElementById('chatClose');
  const messages    = document.getElementById('chatMessages');
  const form        = document.getElementById('chatForm');
  const input       = document.getElementById('chatInput');
  const sendBtn     = document.getElementById('chatSend');
  const suggestions = document.getElementById('chatSuggestions');

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

    if (!cfg || !cfg.apiKey) {
      assistantEl.classList.remove('typing');
      assistantEl.textContent = 'Chat is not configured on this deployment. Please set OPENROUTER_API_KEY in the repository secrets.';
      history.pop();
      busy = false; input.disabled = false; sendBtn.disabled = false;
      return;
    }

    try {
      // Call OpenRouter directly from the browser — key injected at deploy time by deploy.yml
      const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfg.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': cfg.referer || window.location.origin,
          'X-Title': 'Richard Awe CV',
        },
        body: JSON.stringify({
          model: CHAT_MODEL,
          stream: true,
          max_tokens: 600,
          temperature: 0.7,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history.slice(-8, -1),          // history excluding the message we just pushed
            { role: 'user', content: text },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        assistantEl.classList.remove('typing');
        assistantEl.textContent = err?.error?.message || `API error ${res.status}. Please try again.`;
        history.pop();
        return;
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full   = '';
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
      assistantEl.textContent = 'Network error. Please try again.';
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
