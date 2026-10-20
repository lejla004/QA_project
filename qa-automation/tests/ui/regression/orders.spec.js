const { test, expect } = require('@playwright/test');
const { OrderDetailsPage } = require('../../../pages/OrderPages');
const { loginAsCustomer } = require('../../../utils/authHelper');

test.describe('Regression - Order History & Details', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('ORD-04: viewing a non-existing order shows a not-found message', async ({ page }) => {
    const orderDetails = new OrderDetailsPage(page);
    await orderDetails.goto(999999);
    await expect(orderDetails.notFoundMessage).toBeVisible();
  });

  test('ORD-01: order history page loads without error', async ({ page }) => {
    await page.goto('/orders');
    await expect(page.locator('h1')).toHaveText('My Orders');
  });
});
