const { test, expect } = require('@playwright/test');
const { createClient } = require('../../utils/apiClient');
const { uniqueEmail, CUSTOMER } = require('../../utils/testData');

test.describe('API - Auth', () => {
  test('AUTH-01: register with valid data returns 201 and a token', async () => {
    const client = createClient();
    const response = await client.post('/auth/register', {
      name: 'API Test User',
      email: uniqueEmail('apiregister'),
      password: 'Password123!'
    });

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data.token).toBeTruthy();
    expect(response.data.data.user.role).toBe('customer');
  });

  test('AUTH-02: register with a duplicate email returns 409', async () => {
    const client = createClient();
    const response = await client.post('/auth/register', {
      name: 'Duplicate',
      email: CUSTOMER.email,
      password: 'Password123!'
    });

    expect(response.status).toBe(409);
    expect(response.data.success).toBe(false);
  });

  test('AUTH-03: register with missing fields returns 400 with details', async () => {
    const client = createClient();
    const response = await client.post('/auth/register', { email: 'incomplete@example.com' });

    expect(response.status).toBe(400);
    expect(Array.isArray(response.data.details)).toBe(true);
    expect(response.data.details.length).toBeGreaterThan(0);
  });

  test('AUTH-04: register with a short password returns 400', async () => {
    const client = createClient();
    const response = await client.post('/auth/register', {
      name: 'Short Pw',
      email: uniqueEmail('shortpw'),
      password: '123'
    });

    expect(response.status).toBe(400);
  });

  test('AUTH-05: login with valid customer credentials returns 200 and a token', async () => {
    const client = createClient();
    const response = await client.post('/auth/login', {
      email: CUSTOMER.email,
      password: CUSTOMER.password
    });

    expect(response.status).toBe(200);
    expect(response.data.data.token).toBeTruthy();
    expect(response.data.data.user.role).toBe('customer');
  });

  test('AUTH-07: login with wrong password returns 401', async () => {
    const client = createClient();
    const response = await client.post('/auth/login', {
      email: CUSTOMER.email,
      password: 'WrongPassword123'
    });

    expect(response.status).toBe(401);
  });

  test('AUTH-08: login with non-existing email returns 401', async () => {
    const client = createClient();
    const response = await client.post('/auth/login', {
      email: uniqueEmail('ghost'),
      password: 'Whatever123!'
    });

    expect(response.status).toBe(401);
  });
});
