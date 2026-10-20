const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../pages/LoginPage');
const { RegisterPage } = require('../../../pages/RegisterPage');
const { uniqueEmail, CUSTOMER } = require('../../../utils/testData');

test.describe('Regression - Authentication', () => {
  test('AUTH-01: register with valid data logs the user in', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register('New QA User', uniqueEmail('register'), 'Password123!');
    await expect(page).toHaveURL('/');
  });

  test('AUTH-02: register with a duplicate email is rejected', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register('Duplicate User', CUSTOMER.email, 'Password123!');
    await expect(registerPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL('/register');
  });

  test('AUTH-04: register with a short password is rejected', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register('Short Pw', uniqueEmail('shortpw'), '123');
    // Browser-level minLength validation should block submission,
    // or the API rejects it - either way the user stays on /register.
    await expect(page).toHaveURL('/register');
  });

  test('AUTH-07: login with wrong password is rejected', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(CUSTOMER.email, 'DefinitelyWrongPassword');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('AUTH-08: login with a non-existing email is rejected', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(uniqueEmail('doesnotexist'), 'Whatever123!');
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('AUTH-10: accessing a protected page while logged out redirects to login', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveURL('/login');
  });
});
