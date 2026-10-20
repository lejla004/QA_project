class BookDetailsPage {
  constructor(page) {
    this.page = page;
    this.title = page.locator('h1');
    this.quantityInput = page.locator('.add-to-cart input[type="number"]');
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.successMessage = page.locator('.form-success');
    this.errorMessage = page.locator('.form-error');
    this.stockText = page.locator('.in-stock, .out-of-stock');
  }

  async goto(bookId) {
    await this.page.goto(`/books/${bookId}`);
  }

  async setQuantity(qty) {
    await this.quantityInput.fill(String(qty));
  }

  async addToCart() {
    await this.addToCartButton.click();
  }
}

module.exports = { BookDetailsPage };
