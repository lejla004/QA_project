import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (sort) params.sort = sort;

      const response = await api.get('/books', { params });
      setBooks(response.data.data);
    } catch (err) {
      setError('Could not load books. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    api.get('/books/categories').then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchBooks, 300); // light debounce for search typing
    return () => clearTimeout(timeout);
  }, [fetchBooks]);

  return (
    <div>
      <h1>Book Catalogue</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort by...</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {loading && <p>Loading books...</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && books.length === 0 && <p>No books match your search.</p>}

      <div className="book-grid">
        {books.map((book) => (
          <Link to={`/books/${book.id}`} key={book.id} className="book-card">
            <h3>{book.title}</h3>
            <p className="book-author">{book.author}</p>
            <p className="book-category">{book.category_name}</p>
            <p className="book-price">${Number(book.price).toFixed(2)}</p>
            <p className={book.stock > 0 ? 'in-stock' : 'out-of-stock'}>
              {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
