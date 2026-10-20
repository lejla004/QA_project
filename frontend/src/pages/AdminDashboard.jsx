import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY_BOOK_FORM = { title: '', author: '', price: '', description: '', category_id: '', stock: '' };
const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bookForm, setBookForm] = useState(EMPTY_BOOK_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadBooks = () => api.get('/books').then((res) => setBooks(res.data.data));
  const loadCategories = () => api.get('/books/categories').then((res) => setCategories(res.data.data));
  const loadOrders = () => api.get('/admin/orders').then((res) => setOrders(res.data.data));

  useEffect(() => {
    loadBooks();
    loadCategories();
    loadOrders();
  }, []);

  const resetForm = () => {
    setBookForm(EMPTY_BOOK_FORM);
    setEditingId(null);
  };

  const handleFormChange = (e) => {
    setBookForm({ ...bookForm, [e.target.name]: e.target.value });
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const payload = {
      ...bookForm,
      price: Number(bookForm.price),
      category_id: Number(bookForm.category_id),
      stock: Number(bookForm.stock)
    };
    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, payload);
        setMessage('Book updated.');
      } else {
        await api.post('/books', payload);
        setMessage('Book created.');
      }
      resetForm();
      loadBooks();
    } catch (err) {
      const details = err.response?.data?.details;
      setError((details && details.join(' ')) || err.response?.data?.message || 'Could not save book.');
    }
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setBookForm({
      title: book.title,
      author: book.author,
      price: book.price,
      description: book.description || '',
      category_id: book.category_id,
      stock: book.stock
    });
  };

  const handleDelete = async (id) => {
    setError('');
    setMessage('');
    try {
      await api.delete(`/books/${id}`);
      setMessage('Book deleted.');
      loadBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete book.');
    }
  };

  const handleStatusChange = async (orderId, status) => {
    setError('');
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update order status.');
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <div className="tabs">
        <button className={tab === 'books' ? 'tab active' : 'tab'} onClick={() => setTab('books')}>Books</button>
        <button className={tab === 'orders' ? 'tab active' : 'tab'} onClick={() => setTab('orders')}>Orders</button>
      </div>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="form-success">{message}</p>}

      {tab === 'books' && (
        <>
          <h2>{editingId ? `Edit Book #${editingId}` : 'Add a New Book'}</h2>
          <form onSubmit={handleBookSubmit} className="form">
            <label>Title
              <input name="title" value={bookForm.title} onChange={handleFormChange} required />
            </label>
            <label>Author
              <input name="author" value={bookForm.author} onChange={handleFormChange} required />
            </label>
            <label>Price
              <input name="price" type="number" step="0.01" min="0" value={bookForm.price} onChange={handleFormChange} required />
            </label>
            <label>Category
              <select name="category_id" value={bookForm.category_id} onChange={handleFormChange} required>
                <option value="">Select a category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Stock
              <input name="stock" type="number" min="0" value={bookForm.stock} onChange={handleFormChange} required />
            </label>
            <label>Description
              <textarea name="description" value={bookForm.description} onChange={handleFormChange} />
            </label>
            <div className="form-actions">
              <button type="submit">{editingId ? 'Save changes' : 'Add book'}</button>
              {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>

          <h2>All Books</h2>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Title</th><th>Author</th><th>Category</th><th>Price</th><th>Stock</th><th></th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.category_name}</td>
                  <td>${Number(book.price).toFixed(2)}</td>
                  <td>{book.stock}</td>
                  <td>
                    <button className="link-button" onClick={() => handleEdit(book)}>Edit</button>{' '}
                    <button className="link-button" onClick={() => handleDelete(book.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'orders' && (
        <>
          <h2>All Orders</h2>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_name} ({order.customer_email})</td>
                  <td>${Number(order.total_price).toFixed(2)}</td>
                  <td>
                    <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
