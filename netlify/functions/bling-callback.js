const { exchangeCodeForTokens } = require('./_bling-client');

exports.handler = async (event) => {
  const code = event.queryStringParameters && event.queryStringParameters.code;
  if (!code) {
    return { statusCode: 400, body: 'Parâmetro "code" ausente. Inicie o fluxo em /.netlify/functions/bling-auth' };
  }

  const siteUrl = process.env.URL || ('https://' + event.headers.host);
  const redirectUri = siteUrl + '/.netlify/functions/bling-callback';

  try {
    await exchangeCodeForTokens(code, redirectUri);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: '<h1>Bling conectado com sucesso!</h1><p>O token foi salvo. Você já pode fechar esta página.</p>'
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: '<h1>Erro ao conectar com o Bling</h1><pre>' + String(err.message) + '</pre>'
    };
  }
};
