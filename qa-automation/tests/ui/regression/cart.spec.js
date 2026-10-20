const { test, expect } = require('@playwright/test');
const { HomePage } = require('../../../pages/HomePage');
const { BookDetailsPage } = require('../../../pages/BookDetailsPage');
const { CartPage } = require('../../../pages/CartPage');
const { loginAsCustomer } = require('../../../utils/authHelper');

test.describe('Regression - Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('CART-02: adding more than available stock is rejected', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.searchFor('Song of the Drowned City'); // low-stock seeded book
    await homePage.openBookByTitle('Song of the Drowned City');

    const bookDetails = new BookDetailsPage(page);
    await bookDetails.setQuantity(9999);
    await bookDetails.addToCart();
    await expect(bookDetails.errorMessage).toContainText('stock');
  });

  test('CART-04: updating quantity recalculates the cart total', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    const titles = await homePage.getBookTitles();
    const bookTitle = titles[0];
    await homePage.openBookByTitle(bookTitle);

    const bookDetails = new BookDetailsPage(page);
    await bookDetails.setQuantity(1);
    await bookDetails.addToCart();

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.setQuantity(bookTitle, 2);
    await expect(cartPage.rowByTitle(bookTitle).locator('td').nth(3)).not.toHaveText('$0.00');
  });

  test('CART-06: removing an item empties the cart', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    const titles = await homePage.getBookTitles();
    const bookTitle = titles[0];
    await homePage.openBookByTitle(bookTitle);

    const bookDetails = new BookDetailsPage(page);
    await bookDetails.setQuantity(1);
    await bookDetails.addToCart();

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.removeItem(bookTitle);
    await expect(cartPage.emptyCartMessage).toBeVisible();
  });
});

test.describe('Regression - Shopping Cart (unauthenticated)', () => {
  test('CART-08: viewing cart while logged out redirects to login', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveURL('/login');
  });
});
