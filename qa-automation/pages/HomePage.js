class HomePage {
  constructor(page) {
    this.page = page;
    this.searchInput = page.locator('.filters input[type="text"]');
    this.categorySelect = page.locator('.filters select').first();
    this.sortSelect = page.locator('.filters select').nth(1);
    this.bookCards = page.locator('.book-card');
    this.noResultsMessage = page.getByText('No books match your search.');
  }

  async goto() {
    await this.page.goto('/');
  }

  async searchFor(title) {
    await this.searchInput.fill(title);
    await this.page.waitForTimeout(400); // debounce in the app
  }

  async filterByCategory(categoryName) {
    await this.categorySelect.selectOption({ label: categoryName });
    await this.page.waitForTimeout(400);
  }

  async sortBy(option) {
    await this.sortSelect.selectOption(option);
    await this.page.waitForTimeout(400);
  }

  async openBookByTitle(title) {
    await this.page.locator('.book-card', { hasText: title }).first().click();
  }

  async getBookTitles() {
    return this.bookCards.locator('h3').allTextContents();
  }

  async getBookPrices() {
    const texts = await this.bookCards.locator('.book-price').allTextContents();
    return texts.map((t) => parseFloat(t.replace('$', '')));
  }
}

module.exports = { HomePage };
