class CartPage {
  constructor(page) {
    this.page = page;
    this.rows = page.locator('.cart-table tbody tr');
    this.total = page.locator('.cart-total');
    this.checkoutButton = page.getByRole('button', { name: 'Proceed to checkout' });
    this.emptyCartMessage = page.getByText('Your cart is empty.');
    this.errorMessage = page.locator('.form-error');
  }

  async goto() {
    await this.page.goto('/cart');
  }

  rowByTitle(title) {
    return this.rows.filter({ hasText: title });
  }

  async setQuantity(title, quantity) {
    await this.rowByTitle(title).locator('input[type="number"]').fill(String(quantity));
    await this.page.locator('body').click(); // blur to trigger onChange handler reliably
  }

  async removeItem(title) {
    await this.rowByTitle(title).getByRole('button', { name: 'Remove' }).click();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }
}

module.exports = { CartPage };
