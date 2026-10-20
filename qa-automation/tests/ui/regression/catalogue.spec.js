const { test, expect } = require('@playwright/test');
const { HomePage } = require('../../../pages/HomePage');
const { BookDetailsPage } = require('../../../pages/BookDetailsPage');

test.describe('Regression - Book Catalogue', () => {
  test('CAT-02: search filters books by title', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.searchFor('Silent Orchard');
    const titles = await homePage.getBookTitles();
    expect(titles.length).toBeGreaterThan(0);
    for (const title of titles) {
      expect(title.toLowerCase()).toContain('silent orchard');
    }
  });

  test('CAT-03: search with no matches shows empty state', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.searchFor('zzzzznonexistentbook');
    await expect(homePage.noResultsMessage).toBeVisible();
  });

  test('CAT-04: filtering by category shows only that category', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.filterByCategory('Fantasy');
    const count = await homePage.bookCards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(homePage.bookCards.nth(i).locator('.book-category')).toHaveText('Fantasy');
    }
  });

  test('CAT-05: sorting by price ascending orders books correctly', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.sortBy('price_asc');
    const prices = await homePage.getBookPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('CAT-06: sorting by price descending orders books correctly', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.sortBy('price_desc');
    const prices = await homePage.getBookPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  test('CAT-08: viewing a non-existing book shows a not-found message', async ({ page }) => {
    const bookDetails = new BookDetailsPage(page);
    await bookDetails.goto(999999);
    await expect(page.getByText('This book does not exist.')).toBeVisible();
  });
});
