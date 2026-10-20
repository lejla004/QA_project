require('dotenv').config();

function uniqueEmail(prefix = 'qa') {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`;
}

const ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@bookstore.com',
  password: process.env.ADMIN_PASSWORD || 'Admin123!'
};

const CUSTOMER = {
  email: process.env.CUSTOMER_EMAIL || 'customer@bookstore.com',
  password: process.env.CUSTOMER_PASSWORD || 'Customer123!'
};

const VALID_SHIPPING_INFO = {
  full_name: 'Jane Customer',
  address: '123 Main St',
  city: 'Sarajevo',
  postal_code: '71000',
  phone_number: '+387 61 000 000'
};

module.exports = { uniqueEmail, ADMIN, CUSTOMER, VALID_SHIPPING_INFO };
