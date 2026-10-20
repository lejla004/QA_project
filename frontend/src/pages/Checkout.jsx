import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Checkout() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    address: '',
    city: '',
    postal_code: '',
    phone_number: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/orders', form);
      navigate(`/orders/${response.data.data.orderId}`, { state: { justPlaced: true } });
    } catch (err) {
      const details = err.response?.data?.details;
      setError(
        (details && details.join(' ')) ||
        err.response?.data?.message ||
        'Checkout failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-narrow">
      <h1>Checkout</h1>
      <p>This is a demo checkout. No real payment is processed.</p>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Full name
          <input type="text" name="full_name" value={form.full_name} onChange={handleChange} required />
        </label>
        <label>
          Address
          <input type="text" name="address" value={form.address} onChange={handleChange} required />
        </label>
        <label>
          City
          <input type="text" name="city" value={form.city} onChange={handleChange} required />
        </label>
        <label>
          Postal code
          <input type="text" name="postal_code" value={form.postal_code} onChange={handleChange} required />
        </label>
        <label>
          Phone number
          <input type="text" name="phone_number" value={form.phone_number} onChange={handleChange} required />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Placing order...' : 'Place order'}</button>
      </form>
    </div>
  );
}
