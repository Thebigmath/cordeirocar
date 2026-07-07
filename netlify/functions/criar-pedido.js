const { getValidAccessToken } = require('./_bling-client');

const ALLOWED_ORIGIN = process.env.SITE_ORIGIN || 'https://thebigmath.github.io';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
  }

  let pedido;
  try {
    pedido = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ ok: false, erro: 'JSON inválido' }) };
  }

  const { nome, email, endereco, cidade, cep, itens, total, frete } = pedido || {};
  if (!nome || !email || !Array.isArray(itens) || itens.length === 0) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ ok: false, erro: 'Dados do pedido incompletos' }) };
  }

  const blingPayload = {
    contato: { nome, email },
    itens: itens.map(item => ({
      descricao: item.nome,
      quantidade: item.quantidade,
      valor: item.valor
    })),
    parcelas: [{ valor: total }],
    transporte: {
      frete: frete || 0,
      etiqueta: { endereco, cidade, cep }
    }
  };

  try {
    const accessToken = await getValidAccessToken();
    const res = await fetch('https://www.bling.com.br/Api/v3/pedidos/vendas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '1.0',
        'Authorization': 'Bearer ' + accessToken
      },
      body: JSON.stringify(blingPayload)
    });

    if (!res.ok) {
      const errText = await res.text();
      return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ ok: false, erro: 'Bling recusou o pedido', detalhe: errText }) };
    }

    const data = await res.json();
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ ok: true, blingId: data.data ? data.data.id : null }) };
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ ok: false, erro: String(err.message) }) };
  }
};
