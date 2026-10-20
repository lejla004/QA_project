const { test, expect } = require('@playwright/test');
const { createClient, loginAndGetToken } = require('../../utils/apiClient');
const { ADMIN, CUSTOMER } = require('../../utils/testData');

let adminToken;
let customerToken;

test.beforeAll(async () => {
  adminToken = await loginAndGetToken(ADMIN.email, ADMIN.password);
  customerToken = await loginAndGetToken(CUSTOMER.email, CUSTOMER.password);
});

test.describe('API - Books', () => {
  test('CAT-01: GET /books returns a list of books', async () => {
    const client = createClient();
    const response = await client.get('/books');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
    expect(response.data.data.length).toBeGreaterThan(0);
  });

  test('CAT-02: GET /books?search= filters by title', async () => {
    const client = createClient();
    const response = await client.get('/books', { params: { search: 'Quantum' } });
    expect(response.status).toBe(200);
    for (const book of response.data.data) {
      expect(book.title.toLowerCase()).toContain('quantum');
    }
  });

  test('CAT-04: GET /books?category= filters by category', async () => {
    const client = createClient();
    const response = await client.get('/books', { params: { category: 'Science' } });
    expect(response.status).toBe(200);
    for (const book of response.data.data) {
      expect(book.category_name).toBe('Science');
    }
  });

  test('CAT-05: GET /books?sort=price_asc returns ascending order', async () => {
    const client = createClient();
    const response = await client.get('/books', { params: { sort: 'price_asc' } });
    const prices = response.data.data.map((b) => Number(b.price));
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('CAT-08: GET /books/:id with a non-existing id returns 404', async () => {
    const client = createClient();
    const response = await client.get('/books/999999');
    expect(response.status).toBe(404);
  });

  test('CAT-09: GET /books/:id with an invalid id format returns 400', async () => {
    const client = createClient();
    const response = await client.get('/books/abc');
    expect(response.status).toBe(400);
  });

  test('ADM-01: admin can create a book', async () => {
    const client = createClient(adminToken);
    const response = await client.post('/books', {
      title: `API Created Book ${Date.now()}`,
      author: 'API QA',
      price: 12.5,
      description: 'Created via API test',
      category_id: 1,
      stock: 10
    });
    expect(response.status).toBe(201);
    expect(response.data.data.id).toBeTruthy();
  });

  test('ADM-02: creating a book with an invalid price returns 400', async () => {
    const client = createClient(adminToken);
    const response = await client.post('/books', {
      title: 'Invalid Price Book',
      author: 'API QA',
      price: -5,
      category_id: 1,
      stock: 10
    });
    expect(response.status).toBe(400);
  });

  test('ADM-06: a customer cannot create a book (403)', async () => {
    const client = createClient(customerToken);
    const response = await client.post('/books', {
      title: 'Should Not Be Created',
      author: 'API QA',
      price: 5,
      category_id: 1,
      stock: 1
    });
    expect(response.status).toBe(403);
  });

  test('ADM-06: creating a book without a token returns 401', async () => {
    const client = createClient();
    const response = await client.post('/books', {
      title: 'No Auth Book', author: 'API QA', price: 5, category_id: 1, stock: 1
    });
    expect(response.status).toBe(401);
  });

  test('ADM-03/04: admin can update then delete a book', async () => {
    const client = createClient(adminToken);
    const createResponse = await client.post('/books', {
      title: `Temp Book ${Date.now()}`,
      author: 'API QA',
      price: 8,
      category_id: 1,
      stock: 4
    });
    const bookId = createResponse.data.data.id;

    const updateResponse = await client.put(`/books/${bookId}`, {
      title: 'Updated Temp Book',
      author: 'API QA Updated',
      price: 9,
      category_id: 1,
      stock: 6
    });
    expect(updateResponse.status).toBe(200);

    const deleteResponse = await client.delete(`/books/${bookId}`);
    expect(deleteResponse.status).toBe(200);

    const getResponse = await client.get(`/books/${bookId}`);
    expect(getResponse.status).toBe(404);
  });
});
