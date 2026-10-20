const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

/**
 * Creates an axios instance for API tests.
 * Does not throw on non-2xx responses so tests can assert status codes directly.
 */
function createClient(token) {
  return axios.create({
    baseURL: API_URL,
    validateStatus: () => true,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

async function loginAndGetToken(email, password) {
  const client = createClient();
  const response = await client.post('/auth/login', { email, password });
  if (response.status !== 200) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(response.data)}`);
  }
  return response.data.data.token;
}

module.exports = { createClient, loginAndGetToken, API_URL };
