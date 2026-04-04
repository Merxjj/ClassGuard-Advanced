const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
        role: 'student',
        studentId: '123'
      })
    });
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', text);
  } catch (e) {
    console.error('FETCH ERROR:', e);
  }
}
run();
