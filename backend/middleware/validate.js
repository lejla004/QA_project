const ApiError = require('../utils/ApiError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required.');
  }
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.push('A valid email is required.');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (errors.length) {
    return next(new ApiError(400, 'Validation failed.', errors));
  }
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required.');
  }
  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  if (errors.length) {
    return next(new ApiError(400, 'Validation failed.', errors));
  }
  next();
}

function validateBook(req, res, next) {
  const { title, author, price, category_id, stock } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Title is required.');
  }
  if (!author || typeof author !== 'string' || !author.trim()) {
    errors.push('Author is required.');
  }
  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
    errors.push('Price must be a non-negative number.');
  }
  if (!category_id || isNaN(Number(category_id))) {
    errors.push('A valid category_id is required.');
  }
  if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0 || !Number.isInteger(Number(stock))) {
    errors.push('Stock must be a non-negative integer.');
  }

  if (errors.length) {
    return next(new ApiError(400, 'Validation failed.', errors));
  }
  next();
}

function validateCartItem(req, res, next) {
  const { book_id, quantity } = req.body;
  const errors = [];

  if (!book_id || isNaN(Number(book_id))) {
    errors.push('A valid book_id is required.');
  }
  if (quantity === undefined || isNaN(Number(quantity)) || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
    errors.push('Quantity must be a positive integer.');
  }

  if (errors.length) {
    return next(new ApiError(400, 'Validation failed.', errors));
  }
  next();
}

function validateQuantity(req, res, next) {
  const { quantity } = req.body;
  const errors = [];

  if (quantity === undefined || isNaN(Number(quantity)) || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
    errors.push('Quantity must be a positive integer.');
  }

  if (errors.length) {
    return next(new ApiError(400, 'Validation failed.', errors));
  }
  next();
}

function validateCheckout(req, res, next) {
  const { full_name, address, city, postal_code, phone_number } = req.body;
  const errors = [];

  if (!full_name || !full_name.trim()) errors.push('Full name is required.');
  if (!address || !address.trim()) errors.push('Address is required.');
  if (!city || !city.trim()) errors.push('City is required.');
  if (!postal_code || !postal_code.trim()) errors.push('Postal code is required.');
  if (!phone_number || !phone_number.trim()) errors.push('Phone number is required.');

  if (errors.length) {
    return next(new ApiError(400, 'Validation failed.', errors));
  }
  next();
}

function validateOrderStatus(req, res, next) {
  const { status } = req.body;
  const allowed = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (!status || !allowed.includes(status)) {
    return next(new ApiError(400, `Status must be one of: ${allowed.join(', ')}.`));
  }
  next();
}

function validateIdParam(paramName = 'id') {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      return next(new ApiError(400, `Invalid ${paramName} parameter.`));
    }
    next();
  };
}

module.exports = {
  validateRegister,
  validateLogin,
  validateBook,
  validateCartItem,
  validateQuantity,
  validateCheckout,
  validateOrderStatus,
  validateIdParam
};
