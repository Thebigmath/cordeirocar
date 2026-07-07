document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initContactForm();
});

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });

  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });
}

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  elements.forEach(el => observer.observe(el));
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = sanitizeInput(document.getElementById('contactNome').value);
    const email = sanitizeInput(document.getElementById('contactEmail').value);
    const msg = sanitizeInput(document.getElementById('contactMsg').value);
    if (!name || !email || !msg) return;
    const text = `Olá! Meu nome é ${name}. ${msg}`;
    window.open('https://api.whatsapp.com/send?phone=5511999998888&text=' + encodeURIComponent(text), '_blank');
  });
}
