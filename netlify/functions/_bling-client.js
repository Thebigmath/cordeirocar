const { getStore } = require('@netlify/blobs');

const BLING_TOKEN_URL = 'https://www.bling.com.br/Api/v3/oauth/token';
const TOKEN_KEY = 'tokens';

function tokenStore() {
  return getStore('bling');
}

function basicAuthHeader() {
  const id = process.env.BLING_CLIENT_ID;
  const secret = process.env.BLING_CLIENT_SECRET;
  return 'Basic ' + Buffer.from(id + ':' + secret).toString('base64');
}

async function saveTokens(tokens) {
  const store = tokenStore();
  const expiresAt = Date.now() + (tokens.expires_in - 60) * 1000;
  await store.setJSON(TOKEN_KEY, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: expiresAt
  });
}

async function exchangeCodeForTokens(code, redirectUri) {
  const res = await fetch(BLING_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '1.0',
      'Authorization': basicAuthHeader()
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  });
  if (!res.ok) {
    throw new Error('Falha ao trocar code por token: ' + res.status + ' ' + (await res.text()));
  }
  const tokens = await res.json();
  await saveTokens(tokens);
  return tokens;
}

async function refreshTokens(refreshToken) {
  const res = await fetch(BLING_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '1.0',
      'Authorization': basicAuthHeader()
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });
  if (!res.ok) {
    throw new Error('Falha ao renovar token: ' + res.status + ' ' + (await res.text()));
  }
  const tokens = await res.json();
  await saveTokens(tokens);
  return tokens;
}

async function getValidAccessToken() {
  const store = tokenStore();
  const saved = await store.get(TOKEN_KEY, { type: 'json' });
  if (!saved) {
    throw new Error('Nenhum token salvo. Autorize o app do Bling primeiro em /.netlify/functions/bling-auth');
  }
  if (Date.now() < saved.expires_at) {
    return saved.access_token;
  }
  const refreshed = await refreshTokens(saved.refresh_token);
  return refreshed.access_token;
}

module.exports = { exchangeCodeForTokens, getValidAccessToken };
