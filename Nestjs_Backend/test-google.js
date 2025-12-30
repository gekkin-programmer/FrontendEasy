// test-google.js
const { google } = require('google-auth-library');

async function getTestToken() {
  const client = new google.auth.OAuth2(
    '1009996442240-sf5hc2i6rh26pvakgto3qd3qd2hg8ige.apps.googleusercontent.com',
    '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',
    'http://localhost:3001/auth/google/callback'
  );
  
  // URL d'autorisation
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
  });
  
  console.log('1. Visitez cette URL :', url);
  console.log('2. Après autorisation, Google redirige vers :');
  console.log('   http://localhost:3001/auth/google/callback?code=XXXX');
  console.log('3. Copiez le code et utilisez-le avec cURL');
}

getTestToken();
