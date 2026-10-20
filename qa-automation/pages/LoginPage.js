class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('form.form input[type="email"]');
    this.passwordInput = page.locator('form.form input[type="password"]');
    this.submitButton = page.locator('form.form button[type="submit"]');
    this.errorMessage = page.locator('.form-error');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

module.exports = { LoginPage };
