const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Global in-memory variable (retained within warm Lambda container)
let globalSession = {
  accessToken: process.env.ADMIN_GOOGLE_ACCESS_TOKEN || '',
  email: 'feel.ix.ee@gmail.com',
  updatedAt: process.env.ADMIN_GOOGLE_ACCESS_TOKEN ? new Date().toISOString() : '',
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        connected: Boolean(globalSession.accessToken || process.env.ADMIN_GOOGLE_ACCESS_TOKEN),
        email: globalSession.email,
        updatedAt: globalSession.updatedAt,
        accessToken: globalSession.accessToken || process.env.ADMIN_GOOGLE_ACCESS_TOKEN || '',
      }),
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { accessToken, email } = JSON.parse(event.body || '{}');
      if (accessToken) {
        globalSession = {
          accessToken,
          email: email || 'feel.ix.ee@gmail.com',
          updatedAt: new Date().toISOString(),
        };
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, connected: true }),
        };
      }
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'accessToken is required' }),
      };
    } catch (e) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Invalid JSON body' }),
      };
    }
  }

  return {
    statusCode: 405,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: 'Method Not Allowed' }),
  };
};
