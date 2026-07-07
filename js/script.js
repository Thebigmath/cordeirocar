document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  const filtroParam = new URLSearchParams(window.location.search).get('filtro');
  renderProducts(filtroParam || 'todos');
  if (filtroParam) {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === filtroParam);
    });
  }
  initNavbar();
  initCartSidebar();
  initShippingCalc();
  initCheckout();
  initFilters();
  initCategoryCards();
  initMaterialCards();
  initContactForm();
  initScrollReveal();
});

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileNavLinks');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }
}

/* ==================== PRODUCTS ==================== */

let currentFilter = 'todos';

function renderProducts(filter) {
  currentFilter = filter;
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  let filtered = filter === 'todos' ? products : products.filter(p => p.category === filter);
  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#86868b"><p>Nenhum produto encontrado nesta categoria.</p></div>';
    return;
  }
  grid.innerHTML = filtered.map(product => {
    return '<div class="product-card reveal">' +
      (product.badge ? '<span class="product-badge" data-badge="' + sanitize(product.badge) + '">' + sanitize(product.badge) + '</span>' : '') +
      '<div class="product-image"><img src="' + sanitize(product.image) + '" alt="' + sanitize(product.name) + '" loading="lazy"></div>' +
      '<div class="product-info">' +
      '<div class="product-category">' + sanitize(getCategoryLabel(product.category)) + '</div>' +
      '<h3 class="product-name">' + sanitize(product.name) + '</h3>' +
      '<div class="product-price"><span class="current">R$ ' + product.price.toFixed(2) + '</span>' +
      (product.oldPrice ? '<span class="old">R$ ' + product.oldPrice.toFixed(2) + '</span>' : '') + '</div>' +
      '<div class="product-installment">ou 3x de R$ ' + (product.price / 3).toFixed(2) + ' sem juros</div>' +
      '<button class="btn-add-cart" onclick="addToCart(' + product.id + ')"><i class="fas fa-shopping-bag"></i> Adicionar</button>' +
      '</div></div>';
  }).join('');
  setTimeout(initScrollReveal, 100);
}

function getCategoryLabel(cat) {
  const labels = { ram: 'RAM', fiat: 'Fiat', vw: 'Volkswagen', jeep: 'Jeep' };
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

function initCategoryCards() {
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      const grid = document.getElementById('productsGrid');
      if (!grid) {
        window.location.href = 'catalogo/index.html?filtro=' + encodeURIComponent(cat);
        return;
      }
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === cat);
      });
      const el = document.getElementById('produtos');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      renderProducts(cat);
    });
  });
}

function initMaterialCards() {
  document.querySelectorAll('.material-card').forEach(card => {
    function activate() {
      const filter = card.dataset.filter;
      const grid = document.getElementById('productsGrid');
      if (!grid) return;
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === filter);
      });
      renderProducts(filter);
      const el = document.getElementById('produtos');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
}

/* ==================== CART SIDEBAR ==================== */

function initCartSidebar() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const btnCart = document.getElementById('btnCart');
  const btnClose = document.getElementById('cartClose');
  if (!sidebar) return;
  window.openCart = function() {
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  function close() {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (btnCart) btnCart.addEventListener('click', window.openCart);
  if (btnClose) btnClose.addEventListener('click', close);
  if (overlay) overlay.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) close();
  });
  document.addEventListener('click', e => {
    if (e.target.id === 'continueShopping') close();
  });
}

/* ==================== SHIPPING ==================== */

function initShippingCalc() {
  const cepInput = document.getElementById('shippingCep');
  const btnCalc = document.getElementById('btnCalcShipping');
  const result = document.getElementById('shippingResult');
  if (!cepInput) return;
  cepInput.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').replace(/(\d{5})(?=\d)/, '$1-');
  });
  cepInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') calcShipping();
  });
  if (btnCalc) btnCalc.addEventListener('click', calcShipping);
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
      result.innerHTML = '<div class="shipping-ok"><i class="fas fa-check-circle"></i> Frete para <span>' + calc.region + '</span>: <strong>' + calc.label + '</strong></div>';
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
  if (!btnCheckout) return;
  btnCheckout.addEventListener('click', () => {
    if (cart.length === 0) { showToast('Carrinho vazio! Adicione produtos antes de finalizar.', 'error'); return; }
    openCheckoutModal();
  });
  if (closeBtn) closeBtn.addEventListener('click', closeCheckoutModal);
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeCheckoutModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) closeCheckoutModal();
  });
  document.querySelectorAll('.payment-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPayment = btn.dataset.method;
      const cardSection = document.getElementById('paymentCardSection');
      const pixSection = document.getElementById('paymentPixSection');
      if (cardSection) cardSection.style.display = selectedPayment === 'card' ? 'block' : 'none';
      if (pixSection) pixSection.style.display = selectedPayment === 'pix' ? 'block' : 'none';
    });
  });
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateCheckout()) return;
      const orderNum = String(Math.floor(100000 + Math.random() * 900000));
      const orderEl = document.getElementById('orderNumber');
      if (orderEl) orderEl.textContent = orderNum;
      enviarPedidoParaBling();
      if (selectedPayment === 'pix') {
        closeCheckoutModal();
        openPixModal(orderNum);
      } else {
        closeCheckoutModal();
        openSuccessModal();
        showToast('Pedido #' + orderNum + ' confirmado com sucesso!', 'success');
      }
      cart = [];
      shipping = null;
      saveCart();
    });
  }
  if (btnContinue) {
    btnContinue.addEventListener('click', () => {
      if (successOverlay) successOverlay.classList.remove('open');
      document.body.style.overflow = '';
      const home = document.getElementById('home');
      if (home) home.scrollIntoView({ behavior: 'smooth' });
    });
  }
  const pixContinue = document.getElementById('btnPixContinue');
  if (pixContinue) {
    pixContinue.addEventListener('click', () => {
      document.getElementById('pixOverlay').classList.remove('open');
      document.body.style.overflow = '';
      const home = document.getElementById('home');
      if (home) home.scrollIntoView({ behavior: 'smooth' });
    });
  }
  const pixOverlay = document.getElementById('pixOverlay');
  if (pixOverlay) {
    pixOverlay.addEventListener('click', e => {
      if (e.target === pixOverlay) {
        pixOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
  const cardInput = document.getElementById('checkoutCard');
  if (cardInput) {
    cardInput.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    });
  }
  const expiryInput = document.getElementById('checkoutExpiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/');
    });
  }
  const cvvInput = document.getElementById('checkoutCvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '');
    });
  }
  const cepInput = document.getElementById('checkoutCep');
  if (cepInput) {
    cepInput.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '').replace(/(\d{5})(?=\d)/, '$1-');
    });
  }
}

/* ==================== INTEGRAÇÃO BLING ==================== */

const BLING_FUNCTION_URL = 'https://admirable-wisp-dbe640.netlify.app/.netlify/functions/criar-pedido';

function enviarPedidoParaBling() {
  const itens = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return product ? { nome: product.name, quantidade: item.qty, valor: product.price } : null;
  }).filter(Boolean);

  const payload = {
    nome: document.getElementById('checkoutName').value,
    email: document.getElementById('checkoutEmail').value,
    endereco: document.getElementById('checkoutAddress').value,
    cidade: document.getElementById('checkoutCity').value,
    cep: document.getElementById('checkoutCep').value,
    itens,
    total: getCartTotal(),
    frete: getShippingValue()
  };

  fetch(BLING_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(err => {
    console.warn('Não foi possível enviar o pedido ao Bling:', err);
  });
}

function openCheckoutModal() {
  selectedPayment = 'card';
  document.querySelectorAll('.payment-option').forEach(b => b.classList.remove('active'));
  const defaultPayment = document.querySelector('.payment-option[data-method="card"]');
  if (defaultPayment) defaultPayment.classList.add('active');
  const cardSection = document.getElementById('paymentCardSection');
  const pixSection = document.getElementById('paymentPixSection');
  if (cardSection) cardSection.style.display = 'block';
  if (pixSection) pixSection.style.display = 'none';
  ['checkoutName','checkoutEmail','checkoutAddress','checkoutCity','checkoutCep','checkoutCard','checkoutExpiry','checkoutCvv'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const subtotal = getCartSubtotal();
  const shipVal = getShippingValue();
  const hasShipping = shipping !== null;
  const cs = document.getElementById('checkoutSubtotal');
  if (cs) cs.textContent = 'R$ ' + subtotal.toFixed(2);
  const cship = document.getElementById('checkoutShipping');
  if (cship) {
    cship.textContent = hasShipping ? (shipVal > 0 ? 'R$ ' + shipVal.toFixed(2) : 'Grátis') : 'Calcular no carrinho';
  }
  const ctotal = document.getElementById('checkoutTotal');
  if (ctotal) ctotal.textContent = 'R$ ' + getCartTotal().toFixed(2);
  const overlay = document.getElementById('checkoutOverlay');
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckoutModal() {
  const overlay = document.getElementById('checkoutOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function openSuccessModal() {
  const overlay = document.getElementById('successOverlay');
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function openPixModal(orderNum) {
  const pixOrder = document.getElementById('pixOrderNumber');
  if (pixOrder) pixOrder.textContent = orderNum;
  const overlay = document.getElementById('pixOverlay');
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  showToast('Pedido #' + orderNum + ' gerado! Pague via PIX para confirmar.', 'info');
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
    showToast('Preencha todos os campos obrigatórios.', 'error'); return false;
  }
  if (name.length < 3 || name.length > 100) { showToast('Nome deve ter entre 3 e 100 caracteres.', 'error'); return false; }
  if (!email.includes('@') || !email.includes('.')) { showToast('Insira um e-mail válido.', 'error'); return false; }
  if (address.length < 5) { showToast('Insira um endereço válido.', 'error'); return false; }
  if (selectedPayment === 'card') {
    const card = document.getElementById('checkoutCard').value.replace(/\s/g, '');
    const expiry = document.getElementById('checkoutExpiry').value.trim();
    const cvv = document.getElementById('checkoutCvv').value.trim();
    if (!card || !expiry || !cvv) { showToast('Preencha todos os dados do cartão.', 'error'); return false; }
    if (card.length !== 16 || !/^\d+$/.test(card)) { showToast('Número do cartão inválido.', 'error'); return false; }
    if (expiry.length !== 5 || !/^\d{2}\/\d{2}$/.test(expiry)) { showToast('Data de validade inválida (MM/AA).', 'error'); return false; }
    if (cvv.length < 3 || !/^\d+$/.test(cvv)) { showToast('CVV inválido.', 'error'); return false; }
  }
  return true;
}

function copyPixKey() {
  const keyEl = document.querySelector('.pix-key-row code');
  if (!keyEl) return;
  const key = keyEl.textContent.trim();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(key).then(() => { showToast('Chave PIX copiada!', 'success'); }).catch(() => { fallbackCopy(key); });
  } else { fallbackCopy(key); }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); showToast('Chave PIX copiada!', 'success'); } catch { showToast('Copie manualmente: ' + text, 'info'); }
  document.body.removeChild(ta);
}

/* ==================== CONTACT FORM ==================== */

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = sanitizeInput(document.getElementById('contactNome').value);
    const email = sanitizeInput(document.getElementById('contactEmail').value);
    const msg = sanitizeInput(document.getElementById('contactMsg').value);
    if (!name || !email || !msg) return;
    const text = 'Olá! Meu nome é ' + name + '. ' + msg;
    window.open('https://api.whatsapp.com/send?phone=5511999998888&text=' + encodeURIComponent(text), '_blank');
  });
}

/* ==================== TOAST ==================== */

function showToast(message, type) {
  if (typeof type === 'undefined') type = 'info';
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i><span>' + sanitize(message) + '</span>';
  container.appendChild(toast);
  setTimeout(function() { if (toast.parentNode) toast.remove(); }, 3500);
}

/* ==================== SCROLL REVEAL ==================== */

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-slide');
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  elements.forEach(function(el) { observer.observe(el); });
}
