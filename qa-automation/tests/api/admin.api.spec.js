const { test, expect } = require('@playwright/test');
const { createClient, loginAndGetToken } = require('../../utils/apiClient');
const { ADMIN, CUSTOMER, VALID_SHIPPING_INFO } = require('../../utils/testData');

let adminToken;
let customerToken;
let orderId;

test.beforeAll(async () => {
  adminToken = await loginAndGetToken(ADMIN.email, ADMIN.password);
  customerToken = await loginAndGetToken(CUSTOMER.email, CUSTOMER.password);

  // Create a fresh order to manage in these tests
  const adminClient = createClient(adminToken);
  const bookResponse = await adminClient.post('/books', {
    title: `Admin Order Test Book ${Date.now()}`,
    author: 'API QA',
    price: 20,
    category_id: 1,
    stock: 5
  });

  const customerClient = createClient(customerToken);
  await customerClient.post('/cart/items', { book_id: bookResponse.data.data.id, quantity: 1 });
  const orderResponse = await customerClient.post('/orders', VALID_SHIPPING_INFO);
  orderId = orderResponse.data.data.orderId;
});

test.describe('API - Admin Order Management', () => {
  test('ADM-07: admin can view all orders', async () => {
    const client = createClient(adminToken);
    const response = await client.get('/admin/orders');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
    expect(response.data.data.length).toBeGreaterThan(0);
  });

  test('ADM-08: admin can filter orders by status', async () => {
    const client = createClient(adminToken);
    const response = await client.get('/admin/orders', { params: { status: 'Pending' } });
    expect(response.status).toBe(200);
    for (const order of response.data.data) {
      expect(order.status).toBe('Pending');
    }
  });

  test('ADM-09: admin can update an order\'s status', async () => {
    const client = createClient(adminToken);
    const response = await client.put(`/admin/orders/${orderId}/status`, { status: 'Processing' });
    expect(response.status).toBe(200);

    const verify = await client.get('/admin/orders');
    const updated = verify.data.data.find((o) => o.id === orderId);
    expect(updated.status).toBe('Processing');
  });

  test('ADM-10: updating an order with an invalid status returns 400', async () => {
    const client = createClient(adminToken);
    const response = await client.put(`/admin/orders/${orderId}/status`, { status: 'NotARealStatus' });
    expect(response.status).toBe(400);
  });

  test('ADM-11: a customer cannot access admin order endpoints (403)', async () => {
    const client = createClient(customerToken);
    const response = await client.get('/admin/orders');
    expect(response.status).toBe(403);
  });

  test('updating status on a non-existing order returns 404', async () => {
    const client = createClient(adminToken);
    const response = await client.put('/admin/orders/999999/status', { status: 'Shipped' });
    expect(response.status).toBe(404);
  });
});
