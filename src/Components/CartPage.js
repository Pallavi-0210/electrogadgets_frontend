import React, { useState, useEffect, useContext, createContext, useReducer } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Cart Context
const CartContext = createContext();

// Cart Reducer
const cartReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CART':
            return { ...state, items: action.payload };
        case 'ADD_ITEM':
            const existingItem = state.items.find(item => item.id === action.payload.id);
            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    ),
                };
            }
            return {
                ...state,
                items: [...state.items, action.payload],
            };
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload),
            };
        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
                ),
            };
        case 'CLEAR_CART':
            return { ...state, items: [] };
        default:
            return state;
    }
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });

    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use cart
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

function CartPage() {
    const { state, dispatch } = useCart();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [shippingOption, setShippingOption] = useState('standard');
    const [savedItems, setSavedItems] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Sample promo codes
    const promoCodes = {
        SAVE10: { discount: 10, type: 'percentage', description: '10% off your order' },
        WELCOME20: { discount: 20, type: 'fixed', description: '$20 off your first order' },
        FREESHIP: { discount: 0, type: 'shipping', description: 'Free shipping on this order' },
    };

    // Shipping options
    const shippingOptions = [
        { id: 'standard', name: 'Standard Shipping', price: 9.99, days: '5-7 business days' },
        { id: 'express', name: 'Express Shipping', price: 19.99, days: '2-3 business days' },
        { id: 'overnight', name: 'Overnight Shipping', price: 39.99, days: 'Next business day' },
    ];

    // Fetch cart and saved items on mount
    useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchCart = async () => {
        try {
            const response = await fetch('https://electrogadgets-backend.onrender.com/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch cart');
            const cartData = await response.json();
            dispatch({ type: 'SET_CART', payload: cartData.cart });
        } catch (err) {
            console.error('Error fetching cart:', err);
            showToastMessage('Failed to load cart', 'error');
        }
    };

    const fetchSavedItems = async () => {
        try {
            const response = await fetch('https://electrogadgets-backend.onrender.com/api/cart/saved', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch saved items');
            const savedData = await response.json();
            setSavedItems(savedData.savedItems);
        } catch (err) {
            console.error('Error fetching saved items:', err);
            showToastMessage('Failed to load saved items', 'error');
        }
    };

    const checkAuth = async () => {
        try {
            const response = await fetch('https://electrogadgets-backend.onrender.com/api/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setIsAuthenticated(response.ok);
        } catch (err) {
            setIsAuthenticated(false);
        }
    };

    checkAuth();
    fetchCart();
    fetchSavedItems();
}, [dispatch]);


    // Initialize Bootstrap Toasts
    useEffect(() => {
        const initializeToasts = () => {
            if (window.bootstrap && window.bootstrap.Toast) {
                const toastElList = [].slice.call(document.querySelectorAll('.toast'));
                toastElList.forEach(toastEl => new window.bootstrap.Toast(toastEl));
            } else {
                setTimeout(initializeToasts, 100);
            }
        };
        initializeToasts();
    }, []);

    const getDiscountedPrice = (price, discount) => {
        return discount > 0 ? price * (1 - discount / 100) : price;
    };

    const renderStars = (count) => {
        return [...Array(5)].map((_, idx) => (
            <i
                key={idx}
                className={`bi ${idx < count ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
            ></i>
        ));
    };

    const addItem = async (item) => {
        try {
            const response = await fetch('https://electrogadgets-backend.onrender.com/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(item),
            });
            if (!response.ok) throw new Error('Failed to add item');
            const updatedCart = await response.json();
            dispatch({ type: 'SET_CART', payload: updatedCart.cart });
            showToastMessage(updatedCart.message, 'success');
        } catch (err) {
            console.error('Error adding item:', err);
            showToastMessage('Failed to add item', 'error');
        }
    };


    const updateQuantity = async (id, quantity) => {
        try {
            const response = await fetch(`https://electrogadgets-backend.onrender.com/api/cart/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ quantity }),
            });
            if (!response.ok) throw new Error('Failed to update quantity');
            const updatedCart = await response.json();
            dispatch({ type: 'SET_CART', payload: updatedCart.cart });
            showToastMessage(updatedCart.message, 'success');
        } catch (err) {
            console.error('Error updating quantity:', err);
            showToastMessage('Failed to update quantity', 'error');
        }
    };


    const removeItem = async (id, title = '') => {
        try {
            const response = await fetch(`https://electrogadgets-backend.onrender.com/api/cart/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to remove item');
            const updatedCart = await response.json();
            dispatch({ type: 'SET_CART', payload: updatedCart.cart });
            showToastMessage(updatedCart.message || `${title} removed from cart`, 'info');
        } catch (err) {
            console.error('Error removing item:', err);
            showToastMessage('Failed to remove item', 'error');
        }
    };


    const saveForLater = async (item) => {
        try {
            const response = await fetch('https://electrogadgets-backend.onrender.com/api/cart/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(item),
            });
            if (!response.ok) throw new Error('Failed to save item');
            const updatedSaved = await response.json();
            setSavedItems(updatedSaved.savedItems);
            await removeItem(item.id); // No toast here to avoid duplicate messages
            showToastMessage(`${item.title} saved for later`, 'info');
        } catch (err) {
            console.error('Error saving item:', err);
            showToastMessage('Failed to save item', 'error');
        }
    };


    const moveToCart = async (item) => {
        await addItem({ ...item, quantity: 1 });
        try {
            const response = await fetch(`https://electrogadgets-backend.onrender.com/api/cart/save/${item.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to remove saved item');
            const updatedSaved = await response.json();
            setSavedItems(updatedSaved.savedItems);
            showToastMessage(`${item.title} moved to cart`, 'success');
        } catch (err) {
            console.error('Error moving item to cart:', err);
            showToastMessage('Failed to move item to cart', 'error');
        }
    };


    const clearCart = async () => {
        try {
            const response = await fetch('https://electrogadgets-backend.onrender.com/api/cart', {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to clear cart');
            const result = await response.json();
            dispatch({ type: 'CLEAR_CART' });
            showToastMessage(result.message, 'info');
        } catch (err) {
            console.error('Error clearing cart:', err);
            showToastMessage('Failed to clear cart', 'error');
        }
    };


    const calculateSubtotal = () => {
        return state.items.reduce((total, item) => {
            const discountedPrice = getDiscountedPrice(item.price, item.discount || 0);
            return total + discountedPrice * item.quantity;
        }, 0);
    };

    const calculateShipping = () => {
        if (appliedPromo && appliedPromo.type === 'shipping') return 0;
        const selectedShipping = shippingOptions.find(option => option.id === shippingOption);
        return calculateSubtotal() >= 100 ? 0 : selectedShipping.price;
    };

    const calculateDiscount = () => {
        if (!appliedPromo) return 0;
        const subtotal = calculateSubtotal();
        if (appliedPromo.type === 'percentage') {
            return subtotal * (appliedPromo.discount / 100);
        } else if (appliedPromo.type === 'fixed') {
            return Math.min(appliedPromo.discount, subtotal);
        }
        return 0;
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const shipping = calculateShipping();
        const discount = calculateDiscount();
        const tax = (subtotal - discount) * 0.08; // 8% tax
        return subtotal + shipping + tax - discount;
    };

    const applyPromoCode = () => {
        const promo = promoCodes[promoCode.toUpperCase()];
        if (promo) {
            setAppliedPromo({ ...promo, code: promoCode.toUpperCase() });
            showToastMessage(`Promo code applied: ${promo.description}`, 'success');
            setPromoCode('');
        } else {
            showToastMessage('Invalid promo code', 'error');
        }
    };

    const removePromoCode = () => {
        setAppliedPromo(null);
        showToastMessage('Promo code removed', 'info');
    };

    const showToastMessage = (message, type = 'success') => {
        const colors = {
            success: 'bg-success',
            error: 'bg-danger',
            warning: 'bg-warning',
            info: 'bg-info',
        };
        setToastMessage({ text: message, color: colors[type] });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            showToastMessage('Please log in to proceed to checkout', 'warning');
            navigate('/login', { state: { redirectTo: '/CartPage' } });
            return;
        }
        const subtotal = calculateSubtotal();
        const discount = calculateDiscount();
        const shipping = calculateShipping();
        const tax = (subtotal - discount) * 0.08;
        navigate('/PaymentPage', {
            state: {
                subtotal,
                discount,
                shipping,
                tax,
                total: calculateTotal(),
                items: state.items,
                shippingOption: shippingOptions.find(option => option.id === shippingOption),
                promoCode: appliedPromo ? appliedPromo.code : null,
            },
        });
    };

    return (
        <div className="flex-grow-1">
            {/* Hero Section */}
            <div className="bg-gradient-primary text-white text-center py-4 mb-4 position-relative overflow-hidden">
                <div className="container position-relative z-index-2">
                    <h1 className="display-5 fw-bold mb-2">Shopping Cart</h1>
                    <p className="lead mb-0">Review your items and proceed to checkout</p>
                </div>
                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
                    <div className="bg-pattern"></div>
                </div>
            </div>

            <div className="container">
                {state.items.length > 0 ? (
                    <div className="row">
                        {/* Cart Items */}
                        <div className="col-lg-8">
                            <div className="card mb-4">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Cart Items ({state.items.length})</h5>
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={clearCart}
                                    >
                                        <i className="bi bi-trash me-1"></i>
                                        Clear Cart
                                    </button>
                                </div>
                                <div className="card-body p-0">
                                    {state.items.map((item, index) => {
                                        const discountedPrice = getDiscountedPrice(item.price, item.discount || 0);
                                        return (
                                            <div key={item.id} className={`p-4 ${index !== state.items.length - 1 ? 'border-bottom' : ''}`}>
                                                <div className="row align-items-center">
                                                    <div className="col-md-2">
                                                        <img
                                                            src={item.img}
                                                            className="img-fluid rounded"
                                                            alt={item.title}
                                                            style={{ maxHeight: '80px', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <h6 className="mb-1">{item.title}</h6>
                                                        <p className="text-muted small mb-1">{item.description || 'No description'}</p>
                                                        <div className="mb-1">{renderStars(item.rating || 4)}</div>
                                                        {item.discount > 0 && (
                                                            <span className="badge bg-danger small">-{item.discount}%</span>
                                                        )}
                                                    </div>
                                                    <div className="col-md-2">
                                                        <div className="d-flex align-items-center">
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm"
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            >
                                                                <i className="bi bi-dash"></i>
                                                            </button>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm mx-2 text-center"
                                                                style={{ width: '60px' }}
                                                                value={item.quantity}
                                                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                                                min="0"
                                                            />
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm"
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            >
                                                                <i className="bi bi-plus"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-2 text-center">
                                                        <div className="fw-bold text-primary">${discountedPrice.toFixed(2)}</div>
                                                        {item.discount > 0 && (
                                                            <small className="text-muted text-decoration-line-through">
                                                                ${item.price.toFixed(2)}
                                                            </small>
                                                        )}
                                                        <div className="small text-muted">
                                                            Subtotal: <span>${(discountedPrice * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <div className="d-flex flex-column gap-1">
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm"
                                                                onClick={() => saveForLater(item)}
                                                            >
                                                                <i className="bi bi-bookmark me-1"></i>
                                                                Save
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => removeItem(item.id, item.title)}
                                                            >
                                                                <i className="bi bi-trash me-1"></i>
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Saved Items */}
                            {savedItems.length > 0 && (
                                <div className="card">
                                    <div className="card-header">
                                        <h5 className="mb-0">Saved for Later ({savedItems.length})</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            {savedItems.map(item => (
                                                <div key={`saved-${item.id}`} className="col-md-6">
                                                    <div className="d-flex align-items-center border rounded p-2">
                                                        <img
                                                            src={item.img}
                                                            className="rounded me-3"
                                                            alt={item.title}
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        />
                                                        <div className="flex-grow-1">
                                                            <h6 className="mb-1 small">{item.title}</h6>
                                                            <div className="text-primary small">${item.price.toFixed(2)}</div>
                                                        </div>
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => moveToCart(item)}
                                                        >
                                                            Move to Cart
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="col-lg-4">
                            <div className="card shadow-sm">
                                <div className="card-header">
                                    <h5 className="mb-0">Order Summary</h5>
                                </div>
                                <div className="card-body">
                                    {/* Promo Code */}
                                    <div className="mb-3">
                                        <label className="form-label">Promo Code</label>
                                        {appliedPromo ? (
                                            <div className="alert alert-success d-flex justify-content-between align-items-center py-2">
                                                <small>
                                                    <strong>{appliedPromo.code}</strong> - {appliedPromo.description}
                                                </small>
                                                <button
                                                    className="btn btn-sm text-success"
                                                    onClick={removePromoCode}
                                                >
                                                    <i className="bi bi-x"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter promo code"
                                                    value={promoCode}
                                                    onChange={(e) => setPromoCode(e.target.value)}
                                                />
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={applyPromoCode}
                                                    disabled={!promoCode.trim()}
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        )}
                                        <div className="mt-2">
                                            <small className="text-muted">Try: SAVE10, WELCOME20, or FREESHIP</small>
                                        </div>
                                    </div>

                                    {/* Shipping Options */}
                                    <div className="mb-3">
                                        <label className="form-label">Shipping Method</label>
                                        {shippingOptions.map(option => (
                                            <div key={option.id} className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="shipping"
                                                    id={option.id}
                                                    value={option.id}
                                                    checked={shippingOption === option.id}
                                                    onChange={(e) => setShippingOption(e.target.value)}
                                                />
                                                <label className="form-check-label d-flex justify-content-between w-100" htmlFor={option.id}>
                                                    <div>
                                                        <div>{option.name}</div>
                                                        <small className="text-muted">{option.days}</small>
                                                    </div>
                                                    <div className="text-end">
                                                        {calculateSubtotal() >= 100 || (appliedPromo && appliedPromo.type === 'shipping') ? (
                                                            <span className="text-success">FREE</span>
                                                        ) : (
                                                            `$${option.price.toFixed(2)}`
                                                        )}
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                        {calculateSubtotal() >= 100 && (
                                            <div className="alert alert-success mt-2 py-1 px-2 small">
                                                🎉 Free shipping on orders over $100!
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Breakdown */}
                                    <div className="border-top pt-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Subtotal:</span>
                                            <span>${calculateSubtotal().toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Shipping:</span>
                                            <span>
                                                {calculateShipping() === 0 ? (
                                                    <span className="text-success">FREE</span>
                                                ) : (
                                                    `$${calculateShipping().toFixed(2)}`
                                                )}
                                            </span>
                                        </div>
                                        {appliedPromo && calculateDiscount() > 0 && (
                                            <div className="d-flex justify-content-between mb-2 text-success">
                                                <span>Discount ({appliedPromo.code}):</span>
                                                <span>-${calculateDiscount().toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Tax (8%):</span>
                                            <span>${((calculateSubtotal() - calculateDiscount()) * 0.08).toFixed(2)}</span>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between fw-bold h5">
                                            <span>Total:</span>
                                            <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-success w-100 btn-lg mt-3"
                                        onClick={handleCheckout}
                                    >
                                        <i className="bi bi-credit-card me-2"></i>
                                        Proceed to Checkout
                                    </button>

                                    <div className="mt-3 text-center">
                                        <Link to="/Products" className="btn btn-outline-primary">
                                            <i className="bi bi-arrow-left me-2"></i>
                                            Continue Shopping
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Security & Trust Badges */}
                            <div className="card mt-3">
                                <div className="card-body text-center">
                                    <div className="row text-center">
                                        <div className="col-4">
                                            <i className="bi bi-shield-check text-success mb-2 d-block"></i>
                                            <small>Secure Payment</small>
                                        </div>
                                        <div className="col-4">
                                            <i className="bi bi-truck text-primary mb-2 d-block"></i>
                                            <small>Fast Shipping</small>
                                        </div>
                                        <div className="col-4">
                                            <i className="bi bi-arrow-repeat text-info mb-2 d-block"></i>
                                            <small>Easy Returns</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Empty Cart */
                    <div className="text-center py-5">
                        <i className="bi bi-cart-x display-1 text-muted mb-4"></i>
                        <h3>Your cart is empty</h3>
                        <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet.</p>
                        <Link to="/Products" className="btn btn-primary btn-lg">
                            <i className="bi bi-shop me-2"></i>
                            Start Shopping
                        </Link>
                        {savedItems.length > 0 && (
                            <div className="mt-5">
                                <h5>Items Saved for Later</h5>
                                <div className="row justify-content-center">
                                    {savedItems.map(item => (
                                        <div key={`saved-${item.id}`} className="col-md-4 mb-3">
                                            <div className="card h-100">
                                                <img
                                                    src={item.img}
                                                    className="card-img-top"
                                                    alt={item.title}
                                                    style={{ height: '200px', objectFit: 'cover' }}
                                                />
                                                <div className="card-body text-start">
                                                    <h6 className="card-title">{item.title}</h6>
                                                    <p className="text-primary">${item.price.toFixed(2)}</p>
                                                    <button
                                                        className="btn btn-success btn-sm w-100"
                                                        onClick={() => moveToCart(item)}
                                                    >
                                                        Move to Cart
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Toast Container */}
            <div className="toast-container position-fixed bottom-0 end-0 p-3">
                <div
                    className={`toast align-items-center text-white border-0 ${showToast ? 'show' : ''} ${toastMessage.color || 'bg-success'}`}
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                >
                    <div className="d-flex">
                        <div className="toast-body">{toastMessage.text || toastMessage}</div>
                        <button
                            type="button"
                            className="btn-close btn-close-white me-2 m-auto"
                            onClick={() => setShowToast(false)}
                            aria-label="Close"
                        ></button>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="position-fixed bottom-0 start-0 p-3" style={{ zIndex: 1000 }}>
                <button
                    className="btn btn-primary rounded-circle shadow"
                    style={{ width: '50px', height: '50px' }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <i className="bi bi-arrow-up"></i>
                </button>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #007bff, #0056b3);
        }
        .bg-pattern {
          background-image: radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
        }
        .card:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease-in-out;
        }
        .z-index-1 {
          z-index: 1;
        }
        .z-index-2 {
          z-index: 2;
        }
        .form-check-label {
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .col-md-2,
          .col-md-4 {
            margin-bottom: 1rem;
          }
        }
      `}</style>
        </div>
    );
}

export default CartPage;
