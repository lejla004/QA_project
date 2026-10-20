const { LoginPage } = require('../pages/LoginPage');
const { ADMIN, CUSTOMER } = require('./testData');

async function loginAsCustomer(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(CUSTOMER.email, CUSTOMER.password);
  await page.waitForURL('**/');
}

async function loginAsAdmin(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(ADMIN.email, ADMIN.password);
  await page.waitForURL('**/');
}

module.exports = { loginAsCustomer, loginAsAdmin };
