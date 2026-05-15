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

/* ── Smooth stagger for hero elements ────────────────────────────────────── */
document.querySelectorAll('#hero .reveal').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.12}s`;
  // Force visible immediately for hero (above the fold)
  setTimeout(() => el.classList.add('visible'), 50 + i * 120);
});
