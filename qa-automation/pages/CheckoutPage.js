class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.fullNameInput = page.locator('input[name="full_name"]');
    this.addressInput = page.locator('input[name="address"]');
    this.cityInput = page.locator('input[name="city"]');
    this.postalCodeInput = page.locator('input[name="postal_code"]');
    this.phoneInput = page.locator('input[name="phone_number"]');
    this.submitButton = page.getByRole('button', { name: /place order/i });
    this.errorMessage = page.locator('.form-error');
  }

  async goto() {
    await this.page.goto('/checkout');
  }

  async fillShippingInfo({ full_name, address, city, postal_code, phone_number }) {
    if (full_name !== undefined) await this.fullNameInput.fill(full_name);
    if (address !== undefined) await this.addressInput.fill(address);
    if (city !== undefined) await this.cityInput.fill(city);
    if (postal_code !== undefined) await this.postalCodeInput.fill(postal_code);
    if (phone_number !== undefined) await this.phoneInput.fill(phone_number);
  }

  async submit() {
    await this.submitButton.click();
  }
}

module.exports = { CheckoutPage };
