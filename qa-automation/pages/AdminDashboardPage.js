class AdminDashboardPage {
  constructor(page) {
    this.page = page;
    this.booksTabButton = page.getByRole('button', { name: 'Books' });
    this.ordersTabButton = page.getByRole('button', { name: 'Orders' });

    // Book form
    this.titleInput = page.locator('input[name="title"]');
    this.authorInput = page.locator('input[name="author"]');
    this.priceInput = page.locator('input[name="price"]');
    this.categorySelect = page.locator('select[name="category_id"]');
    this.stockInput = page.locator('input[name="stock"]');
    this.descriptionInput = page.locator('textarea[name="description"]');
    this.saveBookButton = page.getByRole('button', { name: /add book|save changes/i });

    this.bookRows = page.locator('.cart-table tbody tr');
    this.errorMessage = page.locator('.form-error');
    this.successMessage = page.locator('.form-success');
  }

  async goto() {
    await this.page.goto('/admin');
  }

  async openBooksTab() {
    await this.booksTabButton.click();
  }

  async openOrdersTab() {
    await this.ordersTabButton.click();
  }

  async fillBookForm({ title, author, price, categoryLabel, stock, description }) {
    if (title !== undefined) await this.titleInput.fill(title);
    if (author !== undefined) await this.authorInput.fill(author);
    if (price !== undefined) await this.priceInput.fill(String(price));
    if (categoryLabel !== undefined) await this.categorySelect.selectOption({ label: categoryLabel });
    if (stock !== undefined) await this.stockInput.fill(String(stock));
    if (description !== undefined) await this.descriptionInput.fill(description);
  }

  async submitBookForm() {
    await this.saveBookButton.click();
  }

  bookRowByTitle(title) {
    return this.bookRows.filter({ hasText: title });
  }

  async editBook(title) {
    await this.bookRowByTitle(title).getByRole('button', { name: 'Edit' }).click();
  }

  async deleteBook(title) {
    await this.bookRowByTitle(title).getByRole('button', { name: 'Delete' }).click();
  }

  orderRowByOrderNumber(orderId) {
    return this.bookRows.filter({ hasText: `#${orderId}` });
  }

  async setOrderStatus(orderId, status) {
    await this.orderRowByOrderNumber(orderId).locator('select').selectOption(status);
  }
}

module.exports = { AdminDashboardPage };
