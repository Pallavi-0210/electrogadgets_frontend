import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ darkMode, setDarkMode }) {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    const handleSignOut = () => {
        localStorage.removeItem('isLoggedIn');
        // Clear any other data if needed
        navigate('/Login');
    };

    return (
        <nav className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'} shadow-sm`}>
            <div className="container-fluid px-md-5">
                <Link className="navbar-brand fw-bold" to="/">
                    <img src="https://www.shutterstock.com/image-vector/electronics-text-assorted-devices-floating-260nw-2271252449.jpg" alt="ElectroGadgets Logo" width="30" height="30" className="d-inline-block align-text-top me-2" />
                    ElectroGadgets
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
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/Products">Products</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/CartPage">Cart</Link>
                        </li>


                        {isLoggedIn ? (
                            <li className="nav-item">
                                <button className="btn btn-outline-danger" onClick={handleSignOut}>Log Out</button>
                            </li>
                        ) : (
                            <li className="nav-item">
                                <Link className="nav-link" to="/Login">Login/Sign-up</Link>
                            </li>
                        )}

                        <li className="nav-item d-flex align-items-center ms-lg-3">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="darkModeSwitch"
                                    checked={darkMode}
                                    onChange={() => setDarkMode(!darkMode)}
                                />
                                <label className="form-check-label text-muted" htmlFor="darkModeSwitch">
                                    {darkMode ? 'Dark Mode' : 'Light Mode'}
                                </label>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
