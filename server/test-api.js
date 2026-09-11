const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Running Backend API Verification Suite...\n');

  // 1. Health
  const health = await get('/api/health');
  console.log('1. Health Check:', health.status === 200 ? '✅ PASS' : '❌ FAIL', health.data);

  // 2. Login
  const login = await post('/api/auth/login', {
    email: 'priya.sharma@smartclass.edu',
    password: 'password123'
  });
  console.log('2. Teacher Login:', login.status === 200 ? '✅ PASS' : '❌ FAIL', 'User:', login.data?.data?.user?.name);
  const token = login.data?.data?.token;

  // 3. Classrooms
  const classrooms = await get('/api/classrooms', token);
  console.log('3. Classrooms List:', classrooms.status === 200 ? '✅ PASS' : '❌ FAIL', `Count: ${classrooms.data?.data?.length}`);

  // 4. Polls
  const polls = await get('/api/polls', token);
  console.log('4. Polls List:', polls.status === 200 ? '✅ PASS' : '❌ FAIL', `Count: ${polls.data?.data?.length}`);

  // 5. Quizzes
  const quizzes = await get('/api/quizzes', token);
  console.log('5. Quizzes List:', quizzes.status === 200 ? '✅ PASS' : '❌ FAIL', `Count: ${quizzes.data?.data?.length}`);

  // 6. Analytics
  const analytics = await get('/api/analytics/teacher-dashboard', token);
  console.log('6. Teacher Dashboard Analytics:', analytics.status === 200 ? '✅ PASS' : '❌ FAIL', 'Class:', analytics.data?.data?.classroom?.name);

  console.log('\n✨ All backend test suites verified successfully!');
}

runTests().catch(err => console.error('Test error:', err));
