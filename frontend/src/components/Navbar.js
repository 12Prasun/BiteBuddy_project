import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Cart from '../screens/Cart';
import Modal from '../Modal';

export default function Navbar() {
  const [cartView, setCartView] = useState(false)
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login")
  }

  const isAuthenticated = localStorage.getItem("authToken");

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-success">
        <div className="container-fluid">
          <Link className="navbar-brand fs-1 fst-italic" to="/">
            🍔 BiteBuddy
          </Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav" 
            aria-controls="navbarNav" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2">
              <li className="nav-item">
                <Link className="nav-link active fs-6" aria-current="page" to="/">
                  Home
                </Link>
              </li>
              {isAuthenticated && (
                <li className="nav-item">
                  <Link className="nav-link active fs-6" aria-current="page" to="/myOrder">
                    My Orders
                  </Link>
                </li>
              )}
            </ul>

            {!isAuthenticated ? (
              <div className='d-flex gap-2 flex-wrap'>
                <Link className="btn btn-light text-success fw-bold" to="/login">
                  Login
                </Link>
                <Link className="btn btn-light text-success fw-bold" to="/createuser">
                  Signup
                </Link>
              </div>
            ) : (
              <div className='d-flex gap-2 flex-wrap align-items-center'>
                <button 
                  className='btn btn-light text-success fw-bold'
                  onClick={() => { setCartView(true) }}
                  aria-label="View shopping cart"
                >
                  🛒 My Cart
                </button>

                {cartView && (
                  <Modal onClose={() => setCartView(false)}>
                    <Cart />
                  </Modal>
                )}

                <button 
                  className='btn btn-light text-success fw-bold'
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}
