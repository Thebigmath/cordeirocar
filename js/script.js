document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  initParticles();
  renderProducts('todos');
  initNavbar();
  initCartSidebar();
  initShippingCalc();
  initCheckout();
  initFilters();
  initCategoryCards();
  initContactForm();
  initScrollReveal();
  initCounters();
});

/* ==================== PARTICLES ==================== */
function initParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 50; i++) {
    const span = document.createElement('span');
    span.style.left = Math.random() * 100 + '%';
    span.style.top = Math.random() * 100 + '%';
    span.style.animationDelay = Math.random() * 8 + 's';
    span.style.animationDuration = (6 + Math.random() * 6) + 's';
    span.style.width = span.style.height = (2 + Math.random() * 4) + 'px';
    container.appendChild(span);
  }
}

/* ==================== PRODUCTS ==================== */
function renderProducts(filter) {
  const grid = document.getElementById('productsGrid');
  let filtered = filter === 'todos' ? products : products.filter(p => p.category === filter);

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted)"><p>Nenhum produto encontrado nesta categoria.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const stars = Array(5).fill('').map((_, i) =>
      `<i class="fas fa-star${i < product.rating ? '' : ' star-empty'}"></i>`
    ).join('');

    return `
      <div class="product-card reveal">
        ${product.badge ? `<span class="product-badge">${sanitize(product.badge)}</span>` : ''}
        <div class="product-image">
          <i class="fas ${product.icon}"></i>
        </div>
        <div class="product-info">
          <div class="product-category">${sanitize(getCategoryLabel(product.category))}</div>
          <h3 class="product-name">${sanitize(product.name)}</h3>
          <div class="product-rating">
            ${stars}
            <span>(${product.reviews})</span>
          </div>
          <div class="product-price">
            <span class="current">R$ ${product.price.toFixed(2)}</span>
            ${product.oldPrice ? `<span class="old">R$ ${product.oldPrice.toFixed(2)}</span>` : ''}
          </div>
          <button class="btn-add-cart" onclick="addToCart(${product.id})">
            <i class="fas fa-shopping-bag"></i> Adicionar ao Carrinho
          </button>
        </div>
      </div>
    `;
  }).join('');

  setTimeout(initScrollReveal, 100);
}

function getCategoryLabel(cat) {
  const labels = { empilhadeira: 'Empilhadeira', iluminacao: 'Lanternas' };
  return labels[cat] || cat;
}

/* ==================== FILTERS ==================== */
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts(btn.dataset.filter);
    });
  });
}

/* ==================== CATEGORY CARDS ==================== */
function initCategoryCards() {
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === cat);
      });
      document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
      renderProducts(cat);
    });
  });
}

/* ==================== NAVBAR ==================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
    });
  });

  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 150;
      if (window.scrollY >= top) current = section.id;
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });
}

/* ==================== CART SIDEBAR ==================== */
function initCartSidebar() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const btnCart = document.getElementById('btnCart');
  const btnClose = document.getElementById('cartClose');

  function open() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  window.openCart = open;

  btnCart.addEventListener('click', open);
  btnClose.addEventListener('click', close);
  overlay.addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) close();
  });

  document.addEventListener('click', e => {
    if (e.target.id === 'continueShopping') {
      close();
    }
  });
}

/* ==================== SHIPPING CALC ==================== */
function initShippingCalc() {
  const cepInput = document.getElementById('shippingCep');
  const btnCalc = document.getElementById('btnCalcShipping');
  const result = document.getElementById('shippingResult');

  cepInput.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').replace(/(\d{5})(?=\d)/, '$1-');
  });

  cepInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') calcShipping();
  });

  btnCalc.addEventListener('click', calcShipping);

  function calcShipping() {
    const cep = cepInput.value.trim();
    if (cep.replace(/\D/g, '').length < 8) {
      result.innerHTML = '<div class="shipping-err">Digite um CEP válido com 8 dígitos.</div>';
      return;
    }

    result.innerHTML = '<div class="shipping-load"><i class="fas fa-spinner fa-spin"></i> Calculando frete...</div>';

    setTimeout(() => {
      const calc = calcularFrete(cep);
      if (!calc) {
        result.innerHTML = '<div class="shipping-err">CEP inválido. Tente novamente.</div>';
        return;
      }

      shipping = calc;
      renderCartItems();

      result.innerHTML = `
        <div class="shipping-ok">
          <i class="fas fa-check-circle"></i>
          Frete para <span>${calc.region}</span>: <strong>${calc.label}</strong>
        </div>
      `;
    }, 600);
  }
}

/* ==================== CHECKOUT ==================== */
let selectedPayment = 'card';

function initCheckout() {
  const btnCheckout = document.getElementById('btnCheckout');
  const overlay = document.getElementById('checkoutOverlay');
  const closeBtn = document.getElementById('closeCheckout');
  const form = document.getElementById('checkoutForm');
  const successOverlay = document.getElementById('successOverlay');
  const btnContinue = document.getElementById('btnContinue');

  btnCheckout.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Carrinho vazio! Adicione produtos antes de finalizar.', 'error');
      return;
    }
    openCheckoutModal();
  });

  closeBtn.addEventListener('click', closeCheckoutModal);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeCheckoutModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeCheckoutModal();
  });

  document.querySelectorAll('.payment-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPayment = btn.dataset.method;
      document.getElementById('paymentCardSection').style.display = selectedPayment === 'card' ? 'block' : 'none';
      document.getElementById('paymentPixSection').style.display = selectedPayment === 'pix' ? 'block' : 'none';
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateCheckout()) return;

    const orderNum = String(Math.floor(100000 + Math.random() * 900000));
    document.getElementById('orderNumber').textContent = orderNum;

    if (selectedPayment === 'pix') {
      closeCheckoutModal();
      openPixModal(orderNum);
      cart = [];
      shipping = null;
      saveCart();
    } else {
      closeCheckoutModal();
      openSuccessModal();
      cart = [];
      shipping = null;
      saveCart();
      showToast(`Pedido #${orderNum} confirmado com sucesso!`, 'success');
    }
  });

  btnContinue.addEventListener('click', () => {
    successOverlay.classList.remove('open');
    document.body.style.overflow = '';
    document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('btnPixContinue').addEventListener('click', () => {
    document.getElementById('pixOverlay').classList.remove('open');
    document.body.style.overflow = '';
    document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('pixOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('pixOverlay')) {
      document.getElementById('pixOverlay').classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  document.getElementById('checkoutCard').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
  });

  document.getElementById('checkoutExpiry').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/');
  });

  document.getElementById('checkoutCvv').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
  });

  document.getElementById('checkoutCep').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').replace(/(\d{5})(?=\d)/, '$1-');
  });
}

function openCheckoutModal() {
  selectedPayment = 'card';
  document.querySelectorAll('.payment-option').forEach(b => b.classList.remove('active'));
  document.querySelector('.payment-option[data-method="card"]').classList.add('active');
  document.getElementById('paymentCardSection').style.display = 'block';
  document.getElementById('paymentPixSection').style.display = 'none';

  document.getElementById('checkoutName').value = '';
  document.getElementById('checkoutEmail').value = '';
  document.getElementById('checkoutAddress').value = '';
  document.getElementById('checkoutCity').value = '';
  document.getElementById('checkoutCep').value = '';
  document.getElementById('checkoutCard').value = '';
  document.getElementById('checkoutExpiry').value = '';
  document.getElementById('checkoutCvv').value = '';

  const subtotal = getCartSubtotal();
  const shipVal = getShippingValue();
  const hasShipping = shipping !== null;

  document.getElementById('checkoutSubtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
  document.getElementById('checkoutShipping').textContent = hasShipping
    ? (shipVal > 0 ? `R$ ${shipVal.toFixed(2)}` : 'Grátis')
    : 'Calcular no carrinho';
  document.getElementById('checkoutTotal').textContent = `R$ ${getCartTotal().toFixed(2)}`;

  document.getElementById('checkoutOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  document.getElementById('checkoutOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function openSuccessModal() {
  document.getElementById('successOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openPixModal(orderNum) {
  document.getElementById('pixOrderNumber').textContent = orderNum;
  document.getElementById('pixOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  showToast(`Pedido #${orderNum} gerado! Pague via PIX para confirmar.`, 'info');
}

function validateCheckout() {
  const name = sanitizeInput(document.getElementById('checkoutName').value);
  const email = sanitizeInput(document.getElementById('checkoutEmail').value);
  const address = sanitizeInput(document.getElementById('checkoutAddress').value);
  const city = sanitizeInput(document.getElementById('checkoutCity').value);
  const cep = sanitizeInput(document.getElementById('checkoutCep').value);

  document.getElementById('checkoutName').value = name;
  document.getElementById('checkoutEmail').value = email;
  document.getElementById('checkoutAddress').value = address;
  document.getElementById('checkoutCity').value = city;
  document.getElementById('checkoutCep').value = cep;

  if (!name || !email || !address || !city || !cep) {
    showToast('Preencha todos os campos obrigatórios.', 'error');
    return false;
  }

  if (name.length < 3 || name.length > 100) {
    showToast('Nome deve ter entre 3 e 100 caracteres.', 'error');
    return false;
  }

  if (!email.includes('@') || !email.includes('.')) {
    showToast('Insira um e-mail válido.', 'error');
    return false;
  }

  if (address.length < 5) {
    showToast('Insira um endereço válido.', 'error');
    return false;
  }

  if (selectedPayment === 'card') {
    const card = document.getElementById('checkoutCard').value.replace(/\s/g, '');
    const expiry = document.getElementById('checkoutExpiry').value.trim();
    const cvv = document.getElementById('checkoutCvv').value.trim();

    if (!card || !expiry || !cvv) {
      showToast('Preencha todos os dados do cartão.', 'error');
      return false;
    }

    if (card.length !== 16 || !/^\d+$/.test(card)) {
      showToast('Número do cartão inválido.', 'error');
      return false;
    }

    if (expiry.length !== 5 || !/^\d{2}\/\d{2}$/.test(expiry)) {
      showToast('Data de validade inválida (MM/AA).', 'error');
      return false;
    }

    if (cvv.length < 3 || !/^\d+$/.test(cvv)) {
      showToast('CVV inválido.', 'error');
      return false;
    }
  }

  return true;
}

function copyPixKey() {
  const keyEl = document.querySelector('.pix-key-row code');
  if (!keyEl) return;
  const key = keyEl.textContent.trim();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(key).then(() => {
      showToast('Chave PIX copiada!', 'success');
    }).catch(() => {
      fallbackCopy(key);
    });
  } else {
    fallbackCopy(key);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); showToast('Chave PIX copiada!', 'success'); }
  catch { showToast('Copie manualmente: ' + text, 'info'); }
  document.body.removeChild(ta);
}

/* ==================== CONTACT FORM ==================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = sanitizeInput(document.getElementById('newsName').value);
    const email = sanitizeInput(document.getElementById('newsEmail').value);

    document.getElementById('newsName').value = name;
    document.getElementById('newsEmail').value = email;

    if (!name || !email) {
      showToast('Preencha nome e e-mail para se inscrever.', 'error');
      return;
    }

    if (name.length < 2 || name.length > 100) {
      showToast('Nome inválido.', 'error');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      showToast('Insira um e-mail válido.', 'error');
      return;
    }

    showToast('Inscrição realizada com sucesso! Bem-vindo(a) à Cordeiro CAR.', 'success');
    form.reset();
  });
}

/* ==================== TOAST ==================== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${sanitize(message)}</span>`;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

/* ==================== SCROLL REVEAL ==================== */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ==================== COUNTERS ==================== */
function initCounters() {
  const counters = document.querySelectorAll('.stat-num');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const max = parseInt(target.dataset.count);
        animateCounter(target, max);
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el, max) {
  let current = 0;
  const increment = Math.ceil(max / 60);
  const timer = setInterval(() => {
    current += increment;
    if (current >= max) {
      current = max;
      clearInterval(timer);
    }
    el.textContent = current + '+';
  }, 25);
}
