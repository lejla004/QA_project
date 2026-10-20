const { test, expect } = require('@playwright/test');
const { createClient, loginAndGetToken } = require('../../utils/apiClient');
const { CUSTOMER, ADMIN, VALID_SHIPPING_INFO, uniqueEmail } = require('../../utils/testData');

let customerToken;
let adminToken;
let placedOrderId;

test.beforeAll(async () => {
  customerToken = await loginAndGetToken(CUSTOMER.email, CUSTOMER.password);
  adminToken = await loginAndGetToken(ADMIN.email, ADMIN.password);
});

async function ensureCartHasOneItem(token) {
  const adminClient = createClient(adminToken);
  const bookResponse = await adminClient.post('/books', {
    title: `Order Test Book ${Date.now()}`,
    author: 'API QA',
    price: 15,
    category_id: 1,
    stock: 5
  });
  const bookId = bookResponse.data.data.id;

  const client = createClient(token);
  await client.post('/cart/items', { book_id: bookId, quantity: 1 });
  return bookId;
}

test.describe('API - Orders / Checkout', () => {
  test('CHK-01: checkout with items in cart creates an order', async () => {
    await ensureCartHasOneItem(customerToken);

    const client = createClient(customerToken);
    const response = await client.post('/orders', VALID_SHIPPING_INFO);

    expect(response.status).toBe(201);
    expect(response.data.data.orderId).toBeTruthy();
    expect(response.data.data.status).toBe('Pending');
    placedOrderId = response.data.data.orderId;
  });

  test('CHK-02: checkout with an empty cart returns 400', async () => {
    // Drain the cart first
    const client = createClient(customerToken);
    const cartResponse = await client.get('/cart');
    for (const item of cartResponse.data.data.items) {
      await client.delete(`/cart/items/${item.id}`);
    }

    const response = await client.post('/orders', VALID_SHIPPING_INFO);
    expect(response.status).toBe(400);
  });

  test('CHK-03: checkout with missing shipping fields returns 400', async () => {
    await ensureCartHasOneItem(customerToken);
    const client = createClient(customerToken);
    const response = await client.post('/orders', { full_name: '' });
    expect(response.status).toBe(400);
  });

  test('ORD-01: GET /orders returns the customer\'s order history', async () => {
    const client = createClient(customerToken);
    const response = await client.get('/orders');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  test('ORD-02: GET /orders/:id returns full order details for the owner', async () => {
    const client = createClient(customerToken);
    const response = await client.get(`/orders/${placedOrderId}`);
    expect(response.status).toBe(200);
    expect(response.data.data.items.length).toBeGreaterThan(0);
  });

  test('ORD-03: another customer cannot view this order (403)', async () => {
    const registerClient = createClient();
    const registerResponse = await registerClient.post('/auth/register', {
      name: 'Other Customer',
      email: uniqueEmail('otherorder'),
      password: 'Password123!'
    });
    const otherToken = registerResponse.data.data.token;

    const client = createClient(otherToken);
    const response = await client.get(`/orders/${placedOrderId}`);
    expect(response.status).toBe(403);
  });

  test('ORD-04: GET /orders/:id for a non-existing order returns 404', async () => {
    const client = createClient(customerToken);
    const response = await client.get('/orders/999999');
    expect(response.status).toBe(404);
  });

  test('ORD-05: GET /orders/:id with an invalid id returns 400', async () => {
    const client = createClient(customerToken);
    const response = await client.get('/orders/abc');
    expect(response.status).toBe(400);
  });

  test('an admin CAN view any customer\'s order', async () => {
    const client = createClient(adminToken);
    const response = await client.get(`/orders/${placedOrderId}`);
    expect(response.status).toBe(200);
  });
});
