function sanitize(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}

function sanitizeInput(str) {
  return String(str).replace(/<[^>]*>/g, '').trim();
}

let cart = [];
let shipping = null;

function loadCart() {
  try {
    const saved = localStorage.getItem('cordeirocar_cart');
    if (saved) cart = JSON.parse(saved);
  } catch { cart = []; }
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('cordeirocar_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  saveCart();
  showToast(`${sanitize(product.name)} adicionado ao carrinho!`, 'success');
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  if (item.qty === 0) removeFromCart(productId);
  saveCart();
}

function getCartSubtotal() {
  return cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getShippingValue() {
  return shipping ? shipping.value : 0;
}

function getCartTotal() {
  return getCartSubtotal() + getShippingValue();
}

function calcularFrete(cep) {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length < 8) return null;

  const firstDigit = parseInt(cepLimpo[0]);
  const subtotal = getCartSubtotal();

  if (subtotal >= 299) {
    return { value: 0, label: 'Grátis', region: 'Frete Grátis (acima de R$ 299)' };
  }

  const regions = [
    { digits: [0], value: 14.90, label: 'R$ 14,90', region: 'SP Capital e região metropolitana' },
    { digits: [1], value: 12.90, label: 'R$ 12,90', region: 'Interior de SP' },
    { digits: [2, 3], value: 14.90, label: 'R$ 14,90', region: 'Sudeste (RJ / MG)' },
    { digits: [4], value: 18.90, label: 'R$ 18,90', region: 'ES / BA / SE' },
    { digits: [5, 6], value: 24.90, label: 'R$ 24,90', region: 'Nordeste' },
    { digits: [7], value: 22.90, label: 'R$ 22,90', region: 'Centro-Oeste / Norte' },
    { digits: [8], value: 17.90, label: 'R$ 17,90', region: 'Paraná / Santa Catarina' },
    { digits: [9], value: 19.90, label: 'R$ 19,90', region: 'Rio Grande do Sul' },
  ];

  const match = regions.find(r => r.digits.includes(firstDigit));
  return match || { value: 19.90, label: 'R$ 19,90', region: 'Demais regiões' };
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  const shippingEl = document.getElementById('cartShipping');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-cart"></i>
        <p>Seu carrinho está vazio</p>
        <a href="#produtos" class="btn btn-primary" id="continueShopping">Ver Produtos</a>
      </div>
    `;
    footer.style.display = 'none';
    if (shippingEl) { shippingEl.style.display = 'none'; }
    shipping = null;
    document.getElementById('shippingResult').innerHTML = '';
    return;
  }

  footer.style.display = 'block';
  if (shippingEl) shippingEl.style.display = 'block';

  let html = '';
  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return;
    const subtotal = product.price * item.qty;
    html += `
      <div class="cart-item">
        <div class="cart-item-image"><i class="fas ${product.icon}"></i></div>
        <div class="cart-item-info">
          <h4>${sanitize(product.name)}</h4>
          <div class="cart-item-price">R$ ${subtotal.toFixed(2)}</div>
          <div class="cart-item-qty">
            <button onclick="updateQty(${item.id}, -1)"><i class="fas fa-minus"></i></button>
            <span>${item.qty}</span>
            <button onclick="updateQty(${item.id}, 1)"><i class="fas fa-plus"></i></button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;
  });

  container.innerHTML = html;

  const subtotal = getCartSubtotal();
  const ship = getShippingValue();

  document.getElementById('cartSubtotal').textContent = `R$ ${subtotal.toFixed(2)}`;

  const shippingLine = document.getElementById('cartShippingLine');
  if (ship > 0) {
    shippingLine.style.display = 'flex';
    document.getElementById('cartShippingValue').textContent = `R$ ${ship.toFixed(2)}`;
  } else if (shipping && ship === 0) {
    shippingLine.style.display = 'flex';
    document.getElementById('cartShippingValue').textContent = 'Grátis';
  } else {
    shippingLine.style.display = 'none';
  }

  document.getElementById('cartTotal').textContent = `R$ ${getCartTotal().toFixed(2)}`;
}
