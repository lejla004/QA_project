import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else setError(err.response?.data?.message || 'Could not load this order.');
      });
  }, [id]);

  if (notFound) return <p>This order does not exist.</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!order) return <p>Loading...</p>;

  return (
    <div className="page-narrow">
      {justPlaced && <h1>Thank you for your order!</h1>}
      {!justPlaced && <h1>Order #{order.id}</h1>}

      <p>Status: <strong>{order.status}</strong></p>
      <p>Placed on {new Date(order.created_at).toLocaleString()}</p>

      <h3>Shipping details</h3>
      <p>{order.full_name}</p>
      <p>{order.address}, {order.city} {order.postal_code}</p>
      <p>{order.phone_number}</p>

      <h3>Items</h3>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Unit price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.book_title}</td>
              <td>${Number(item.unit_price).toFixed(2)}</td>
              <td>{item.quantity}</td>
              <td>${(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="cart-total">Total: ${Number(order.total_price).toFixed(2)}</p>

      <Link to="/orders">Back to order history</Link>
    </div>
  );
}
