import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/books/${id}`)
      .then((res) => setBook(res.data.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else setError('Could not load this book.');
      });
  }, [id]);

  const handleAddToCart = async () => {
    setError('');
    setMessage('');
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await api.post('/cart/items', { book_id: Number(id), quantity: Number(quantity) });
      setMessage('Added to cart.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add this book to the cart.');
    }
  };

  if (notFound) return <p>This book does not exist.</p>;
  if (error && !book) return <p className="form-error">{error}</p>;
  if (!book) return <p>Loading...</p>;

  return (
    <div className="page-narrow">
      <h1>{book.title}</h1>
      <p className="book-author">by {book.author}</p>
      <p className="book-category">{book.category_name}</p>
      <p>{book.description}</p>
      <p className="book-price">${Number(book.price).toFixed(2)}</p>
      <p className={book.stock > 0 ? 'in-stock' : 'out-of-stock'}>
        {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
      </p>

      {book.stock > 0 && (
        <div className="add-to-cart">
          <label>
            Quantity
            <input
              type="number"
              min="1"
              max={book.stock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
          <button onClick={handleAddToCart}>Add to cart</button>
        </div>
      )}

      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
