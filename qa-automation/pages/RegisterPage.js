class RegisterPage {
  constructor(page) {
    this.page = page;
    this.nameInput = page.locator('form.form input[type="text"]');
    this.emailInput = page.locator('form.form input[type="email"]');
    this.passwordInput = page.locator('form.form input[type="password"]');
    this.submitButton = page.locator('form.form button[type="submit"]');
    this.errorMessage = page.locator('.form-error');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register(name, email, password) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

module.exports = { RegisterPage };
