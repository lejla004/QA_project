const { test, expect } = require('@playwright/test');
const { AdminDashboardPage } = require('../../../pages/AdminDashboardPage');
const { loginAsAdmin, loginAsCustomer } = require('../../../utils/authHelper');

test.describe('Regression - Admin Dashboard', () => {
  test('ADM-02: adding a book with a negative price is rejected', async ({ page }) => {
    await loginAsAdmin(page);
    const admin = new AdminDashboardPage(page);
    await admin.goto();
    await admin.openBooksTab();

    await admin.fillBookForm({
      title: `Invalid Price Book ${Date.now()}`,
      author: 'QA Author',
      price: -5,
      categoryLabel: 'Fiction',
      stock: 1
    });
    await admin.submitBookForm();
    await expect(admin.errorMessage).toBeVisible();
  });

  test('ADM-03: editing a book updates its details', async ({ page }) => {
    await loginAsAdmin(page);
    const admin = new AdminDashboardPage(page);
    await admin.goto();
    await admin.openBooksTab();

    const originalTitle = `Editable Book ${Date.now()}`;
    await admin.fillBookForm({
      title: originalTitle,
      author: 'QA Author',
      price: 10,
      categoryLabel: 'Fiction',
      stock: 3
    });
    await admin.submitBookForm();
    await expect(admin.bookRowByTitle(originalTitle)).toBeVisible();

    await admin.editBook(originalTitle);
    await admin.fillBookForm({ price: 15.5, stock: 8 });
    await admin.submitBookForm();
    await expect(admin.successMessage).toContainText('updated');
  });

  test('ADM-04: deleting a book removes it from the list', async ({ page }) => {
    await loginAsAdmin(page);
    const admin = new AdminDashboardPage(page);
    await admin.goto();
    await admin.openBooksTab();

    const title = `Deletable Book ${Date.now()}`;
    await admin.fillBookForm({
      title, author: 'QA Author', price: 5, categoryLabel: 'Fiction', stock: 1
    });
    await admin.submitBookForm();
    await expect(admin.bookRowByTitle(title)).toBeVisible();

    await admin.deleteBook(title);
    await expect(admin.bookRowByTitle(title)).toHaveCount(0);
  });

  test('ADM-06: a customer cannot reach the admin dashboard route', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/admin');
    await expect(page).toHaveURL('/');
  });
});
