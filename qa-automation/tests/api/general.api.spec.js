const { test, expect } = require('@playwright/test');
const { createClient } = require('../../utils/apiClient');

test.describe('API - General', () => {
  test('API-01: health check returns 200', async () => {
    const client = createClient();
    const response = await client.get('/health');
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  test('API-02: unknown route returns 404 with a JSON body', async () => {
    const client = createClient();
    const response = await client.get('/this-route-does-not-exist');
    expect(response.status).toBe(404);
    expect(response.data.success).toBe(false);
  });

  test('API-03: protected route without a token returns 401', async () => {
    const client = createClient();
    const response = await client.get('/cart');
    expect(response.status).toBe(401);
  });

  test('API-04: protected route with a malformed token returns 401', async () => {
    const client = createClient('this.is.not.a.valid.jwt');
    const response = await client.get('/cart');
    expect(response.status).toBe(401);
  });
});
