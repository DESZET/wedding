// Test API endpoints
const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test() {
  try {
    console.log('Testing /api/umrah-packages...');
    const umrahRes = await makeRequest('/api/umrah-packages');
    console.log('Umrah packages result:', JSON.stringify(umrahRes, null, 2).substring(0, 500));
    console.log('Success:', umrahRes.success);
    console.log('Total:', umrahRes.total);
    console.log('');

    console.log('Testing /api/haji-packages...');
    const HajiRes = await makeRequest('/api/haji-packages');
    console.log('Haji packages result:', JSON.stringify(HajiRes, null, 2).substring(0, 500));
    console.log('Success:', HajiRes.success);
    console.log('Total:', HajiRes.total);
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nNote: Make sure the server is running on port 3000');
  }
}

test();

