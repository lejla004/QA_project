import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cart');
      setItems(response.data.data.items);
      setTotal(response.data.data.total);
    } catch (err) {
      setError('Could not load your cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuantityChange = async (itemId, quantity) => {
    setError('');
    try {
      await api.put(`/cart/items/${itemId}`, { quantity: Number(quantity) });
      loadCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update quantity.');
    }
  };

  const handleRemove = async (itemId) => {
    setError('');
    try {
      await api.delete(`/cart/items/${itemId}`);
      loadCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove item.');
    }
  };

  if (loading) return <p>Loading cart...</p>;

  return (
    <div>
      <h1>Your Cart</h1>
      {error && <p className="form-error">{error}</p>}

      {items.length === 0 ? (
        <p>Your cart is empty. <Link to="/">Browse the catalogue</Link>.</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>${Number(item.price).toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    />
                  </td>
                  <td>${(Number(item.price) * item.quantity).toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleRemove(item.id)} className="link-button">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="cart-total">Total: ${Number(total).toFixed(2)}</p>
          <button onClick={() => navigate('/checkout')}>Proceed to checkout</button>
        </>
      )}
    </div>
  );
}
