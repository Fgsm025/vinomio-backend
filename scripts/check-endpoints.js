import http from 'http';

const BASE_URL = 'http://localhost:3000';

const endpoints = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/firebase-login',
  '/api/auth/firebase-register',
];

console.log('=== Verificación de Endpoints del Backend ===\n');

endpoints.forEach((endpoint) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const req = http.request(url, { method: 'POST' }, (res) => {
    const status = res.statusCode;
    if (status === 404) {
      console.log(`❌ ${endpoint}: NO ENCONTRADO (404)`);
    } else if (status === 400 || status === 401 || status === 422) {
      console.log(`✅ ${endpoint}: EXISTE (${status} - esperado para POST sin datos)`);
    } else {
      console.log(`⚠️  ${endpoint}: ${status}`);
    }
  });

  req.on('error', (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.log(`❌ ${endpoint}: SERVIDOR NO ESTÁ CORRIENDO`);
    } else {
      console.log(`❌ ${endpoint}: ERROR - ${error.message}`);
    }
  });

  req.end();
});

setTimeout(() => {
  console.log('\n=== Instrucciones ===');
  console.log('Si ves ❌ para firebase-login o firebase-register:');
  console.log('1. Ve a la terminal del backend');
  console.log('2. Presiona Ctrl+C (o Cmd+C en Mac) para detener el servidor');
  console.log('3. Ejecuta: npm run start:dev');
  console.log('4. Espera a que veas "Nest application successfully started"');
  process.exit(0);
}, 2000);
