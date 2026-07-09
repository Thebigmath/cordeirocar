document.addEventListener('DOMContentLoaded', () => {
  const id = Number(new URLSearchParams(window.location.search).get('id'));
  const product = products.find(p => p.id === id);

  if (!product) {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('pageTitle').textContent = product.name + ' — Cordeiro CAR';
  document.getElementById('pageDescription').setAttribute('content', product.description || product.name);
  document.getElementById('breadcrumbName').textContent = product.name;

  const badgeEl = document.getElementById('detailBadge');
  if (product.badge) {
    badgeEl.textContent = product.badge;
    badgeEl.dataset.badge = product.badge;
    badgeEl.style.display = 'inline-block';
  }

  const img = document.getElementById('detailImage');
  img.src = assetPath(product.image);
  img.alt = product.name;

  document.getElementById('detailCategory').textContent = getCategoryLabel(product.category);
  document.getElementById('detailName').textContent = product.name;
  document.getElementById('detailPrice').textContent = 'R$ ' + product.price.toFixed(2);
  document.getElementById('detailInstallment').textContent = 'ou 3x de R$ ' + (product.price / 3).toFixed(2) + ' sem juros';
  document.getElementById('detailDescription').textContent = product.description || '';

  if (product.oldPrice) {
    const oldEl = document.getElementById('detailOldPrice');
    oldEl.textContent = 'R$ ' + product.oldPrice.toFixed(2);
    oldEl.style.display = 'inline';
  }

  const featuresList = document.getElementById('detailFeatures');
  if (product.destaques) {
    featuresList.innerHTML = product.destaques.map(f =>
      '<li><i class="fas fa-check-circle"></i><span>' + sanitize(f) + '</span></li>'
    ).join('');
  }

  document.getElementById('btnAddDetail').addEventListener('click', () => addToCart(product.id));
  document.getElementById('btnBuyNow').addEventListener('click', () => addToCart(product.id));
});
