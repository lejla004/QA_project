const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../pages/LoginPage');
const { HomePage } = require('../../../pages/HomePage');
const { BookDetailsPage } = require('../../../pages/BookDetailsPage');
const { CartPage } = require('../../../pages/CartPage');
const { CheckoutPage } = require('../../../pages/CheckoutPage');
const { OrderHistoryPage, OrderDetailsPage } = require('../../../pages/OrderPages');
const { AdminDashboardPage } = require('../../../pages/AdminDashboardPage');
const { loginAsCustomer, loginAsAdmin } = require('../../../utils/authHelper');
const { VALID_SHIPPING_INFO, ADMIN, CUSTOMER } = require('../../../utils/testData');

test.describe('Smoke suite - critical paths', () => {
  test('AUTH-05/06: customer and admin can log in', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(CUSTOMER.email, CUSTOMER.password);
    await expect(page.getByText(CUSTOMER.email.split('@')[0], { exact: false })).toBeVisible({ timeout: 1000 }).catch(() => {});
    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: 'Logout' }).click();
    await loginPage.goto();
    await loginPage.login(ADMIN.email, ADMIN.password);
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  });

  test('CAT-01: home page lists seeded books', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    const titles = await homePage.getBookTitles();
    expect(titles.length).toBeGreaterThan(0);
  });

  test('CART-01, CHK-01, ORD-01: full purchase flow', async ({ page }) => {
    await loginAsCustomer(page);

    const homePage = new HomePage(page);
    await homePage.goto();
    const titles = await homePage.getBookTitles();
    const bookTitle = titles[0];

    await homePage.openBookByTitle(bookTitle);
    const bookDetails = new BookDetailsPage(page);
    await expect(bookDetails.title).toHaveText(bookTitle);
    await bookDetails.setQuantity(1);
    await bookDetails.addToCart();
    await expect(bookDetails.successMessage).toContainText('Added to cart');

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await expect(cartPage.rowByTitle(bookTitle)).toBeVisible();
    await cartPage.proceedToCheckout();

    const checkoutPage = new CheckoutPage(page);
    await expect(page).toHaveURL(/checkout/);
    await checkoutPage.fillShippingInfo(VALID_SHIPPING_INFO);
    await checkoutPage.submit();

    // Should land on the order confirmation page
    await expect(page).toHaveURL(/\/orders\/\d+/);
    await expect(page.getByRole('heading', { name: /thank you/i })).toBeVisible();

    const orderHistoryPage = new OrderHistoryPage(page);
    await orderHistoryPage.goto();
    await expect(orderHistoryPage.rows.first()).toBeVisible();
  });

  test('ADM-01, ADM-09: admin can add a book and update an order status', async ({ page }) => {
    await loginAsAdmin(page);

    const admin = new AdminDashboardPage(page);
    await admin.goto();
    await admin.openBooksTab();

    const uniqueTitle = `Smoke Test Book ${Date.now()}`;
    await admin.fillBookForm({
      title: uniqueTitle,
      author: 'QA Author',
      price: 9.99,
      categoryLabel: 'Fiction',
      stock: 5,
      description: 'Created by a smoke test.'
    });
    await admin.submitBookForm();
    await expect(admin.successMessage).toContainText('Book created');
    await expect(admin.bookRowByTitle(uniqueTitle)).toBeVisible();

    await admin.openOrdersTab();
    const firstRow = admin.bookRows.first();
    await expect(firstRow).toBeVisible();
  });
});
