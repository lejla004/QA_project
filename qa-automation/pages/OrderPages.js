class OrderHistoryPage {
  constructor(page) {
    this.page = page;
    this.rows = page.locator('.cart-table tbody tr');
    this.emptyMessage = page.getByText('You have not placed any orders yet.');
  }

  async goto() {
    await this.page.goto('/orders');
  }

  rowByOrderNumber(orderId) {
    return this.rows.filter({ hasText: `#${orderId}` });
  }

  async openOrder(orderId) {
    await this.rowByOrderNumber(orderId).getByRole('link', { name: 'View details' }).click();
  }
}

class OrderDetailsPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.total = page.locator('.cart-total');
    this.notFoundMessage = page.getByText('This order does not exist.');
    this.errorMessage = page.locator('.form-error');
  }

  async goto(orderId) {
    await this.page.goto(`/orders/${orderId}`);
  }
}

module.exports = { OrderHistoryPage, OrderDetailsPage };
