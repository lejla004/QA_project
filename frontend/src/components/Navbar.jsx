import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Online Book Store</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Catalogue</Link>
        {user && <Link to="/cart">Cart</Link>}
        {user && <Link to="/orders">My Orders</Link>}
        {user && user.role === 'admin' && <Link to="/admin">Admin</Link>}
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        {user && (
          <span className="navbar-user">
            {user.name} ({user.role})
            <button onClick={handleLogout} className="link-button">Logout</button>
          </span>
        )}
      </div>
    </nav>
  );
}
