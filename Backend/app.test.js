const request = require('supertest');
const server = require('./server');

// Test case for successful registration
test('POST /api/signup should register a new user', async () => {
  const newUser = {
    password: 'Mythri123',
    username: 'mythri.gudibanda' + Math.floor(Math.random() * 90000 + 10000) + '@example.com',
  };

  const res = await request(server)
    .post('/api/signup')
    .send(newUser)
    .expect(200); // Expect a 200 OK response

  expect(res.body).toEqual({
    status: 200,
    success: true,
    response: expect.any(Object),
  });
});

// Test case for registration failure
test('POST /api/signup should handle registration errors', async () => {
  const invalidData = {
    // Required fields are missing
  };

  const res = await request(server)
    .post('/api/signup')
    .send(invalidData)
    .expect(500); // Expect a 500 Internal Server Error

  expect(res.body).toEqual({
    success: false,
    error: expect.any(String),
  });
});
