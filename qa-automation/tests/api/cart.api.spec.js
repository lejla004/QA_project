const { test, expect } = require('@playwright/test');
const { createClient, loginAndGetToken } = require('../../utils/apiClient');
const { CUSTOMER, ADMIN } = require('../../utils/testData');

let customerToken;
let adminToken;
let testBookId;

test.beforeAll(async () => {
  customerToken = await loginAndGetToken(CUSTOMER.email, CUSTOMER.password);
  adminToken = await loginAndGetToken(ADMIN.email, ADMIN.password);

  // Create a dedicated low-stock book so cart/stock tests don't depend on
  // (and don't corrupt) the shared seeded catalogue.
  const adminClient = createClient(adminToken);
  const createResponse = await adminClient.post('/books', {
    title: `Cart Test Book ${Date.now()}`,
    author: 'API QA',
    price: 10,
    category_id: 1,
    stock: 3
  });
  testBookId = createResponse.data.data.id;
});

test.describe('API - Cart', () => {
  test('CART-01: adding an in-stock item succeeds', async () => {
    const client = createClient(customerToken);
    const response = await client.post('/cart/items', { book_id: testBookId, quantity: 1 });
    expect(response.status).toBe(201);
  });

  test('CART-02: adding more than available stock returns 400', async () => {
    const client = createClient(customerToken);
    const response = await client.post('/cart/items', { book_id: testBookId, quantity: 9999 });
    expect(response.status).toBe(400);
  });

  test('cart item validation: negative quantity returns 400', async () => {
    const client = createClient(customerToken);
    const response = await client.post('/cart/items', { book_id: testBookId, quantity: -1 });
    expect(response.status).toBe(400);
  });

  test('CART-08: adding to cart without a token returns 401', async () => {
    const client = createClient();
    const response = await client.post('/cart/items', { book_id: testBookId, quantity: 1 });
    expect(response.status).toBe(401);
  });

  test('GET /cart returns items and a correct total', async () => {
    const client = createClient(customerToken);
    const response = await client.get('/cart');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data.items)).toBe(true);
    const expectedTotal = response.data.data.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
    expect(response.data.data.total).toBeCloseTo(expectedTotal, 2);
  });

  test('CART-06: removing a cart item succeeds', async () => {
    const client = createClient(customerToken);
    const cartResponse = await client.get('/cart');
    const item = cartResponse.data.data.items.find((i) => i.book_id === testBookId);
    expect(item).toBeTruthy();

    const deleteResponse = await client.delete(`/cart/items/${item.id}`);
    expect(deleteResponse.status).toBe(200);
  });

  test('removing a non-existing cart item returns 404', async () => {
    const client = createClient(customerToken);
    const response = await client.delete('/cart/items/999999');
    expect(response.status).toBe(404);
  });
});
