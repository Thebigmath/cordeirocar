exports.handler = async (event) => {
  const clientId = process.env.BLING_CLIENT_ID;
  const siteUrl = process.env.URL || ('https://' + event.headers.host);
  const redirectUri = siteUrl + '/.netlify/functions/bling-callback';
  const state = Math.random().toString(36).slice(2);

  const authorizeUrl = 'https://www.bling.com.br/Api/v3/oauth/authorize?' + new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    state,
    redirect_uri: redirectUri
  });

  return {
    statusCode: 302,
    headers: { Location: authorizeUrl }
  };
};
