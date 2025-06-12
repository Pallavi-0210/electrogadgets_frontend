import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartPage';

function Home() {
    const [search, setSearch] = useState("");
    const [minRating, setMinRating] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [priceRange, setPriceRange] = useState([0, 2000]);
    const [sortBy, setSortBy] = useState("name");
    const [quantity, setQuantity] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [wishlist, setWishlist] = useState(new Set());
    const [compareList, setCompareList] = useState([]);
    const [viewMode, setViewMode] = useState("grid");
    const [showQuickView, setShowQuickView] = useState(null);
    const [featuredOnly, setFeaturedOnly] = useState(false);
    const [loadingId, setLoadingId] = useState(null); // Added for loading state

    const { dispatch } = useCart();

    useEffect(() => {
        const initializeToasts = () => {
            if (window.bootstrap && window.bootstrap.Toast) {
                const toastElList = [].slice.call(document.querySelectorAll('.toast'));
                toastElList.map(function (toastEl) {
                    return new window.bootstrap.Toast(toastEl);
                });
            } else {
                setTimeout(initializeToasts, 100);
            }
        };
        initializeToasts();
    }, []);

    const categories = [
        { id: "all", name: "All Categories", icon: "bi-grid" },
        { id: "smartphones", name: "Smartphones", icon: "bi-phone" },
        { id: "wearables", name: "Wearables", icon: "bi-smartwatch" },
        { id: "audio", name: "Audio", icon: "bi-headphones" },
        { id: "drones", name: "Drones", icon: "bi-airplane" },
        { id: "gaming", name: "Gaming", icon: "bi-controller" },
        { id: "vr", name: "VR/AR", icon: "bi-vr" }
    ];

    const gadgets = [
        {
            id: 'gadget-1',
            title: "Smartphone X2",
            description: "AI-powered performance with stunning cameras and 5G connectivity.",
            img: "/1st.jpg",
            rating: 5,
            price: 799.99,
            category: "smartphones",
            featured: true,
            inStock: true,
            discount: 10,
            specs: ["6.7 inch OLED", "128GB Storage", "5G Ready", "48MP Camera"]
        },
        {
            id: 'gadget-2',
            title: "Smartwatch Pro",
            description: "Track fitness and receive notifications with advanced health monitoring.",
            img: "/2nd.jpg",
            rating: 4,
            price: 199.99,
            category: "wearables",
            featured: false,
            inStock: true,
            discount: 0,
            specs: ["Heart Rate Monitor", "GPS Tracking", "Water Resistant", "7-day Battery"]
        },
        {
            id: 'gadget-3',
            title: "Noise-Free Buds",
            description: "Enjoy immersive audio with active noise cancellation technology.",
            img: "/3rd.jpg",
            rating: 4,
            price: 129.99,
            category: "audio",
            featured: true,
            inStock: true,
            discount: 15,
            specs: ["Active ANC", "20hr Battery", "Wireless Charging", "Hi-Res Audio"]
        },
        {
            id: 'gadget-4',
            title: "4K Drone",
            description: "Capture stunning aerial shots with ultra HD clarity and intelligent flight modes.",
            img: "/4th.jpg",
            rating: 5,
            price: 899.99,
            category: "drones",
            featured: false,
            inStock: false,
            discount: 0,
            specs: ["4K Camera", "30min Flight", "GPS Return", "Obstacle Avoidance"]
        },
        {
            id: 'gadget-5',
            title: "Gaming Laptop",
            description: "Top-notch graphics and blazing speed for professional gaming and content creation.",
            img: "/5th.jpg",
            rating: 5,
            price: 1499.99,
            category: "gaming",
            featured: true,
            inStock: true,
            discount: 5,
            specs: ["RTX 4070", "32GB RAM", "1TB SSD", "144Hz Display"]
        },
        {
            id: 'gadget-6',
            title: "VR Headset",
            description: "Step into the future of immersive entertainment with cutting-edge VR technology.",
            img: "/6th.jpg",
            rating: 3,
            price: 349.99,
            category: "vr",
            featured: false,
            inStock: true,
            discount: 20,
            specs: ["120Hz Display", "Inside-out Tracking", "Wireless", "Hand Tracking"]
        }
    ];

    const getFilteredAndSortedGadgets = () => {
        let filtered = gadgets.filter(gadget => {
            const matchesSearch = gadget.title.toLowerCase().includes(search.toLowerCase()) ||
                gadget.description.toLowerCase().includes(search.toLowerCase());
            const matchesRating = gadget.rating >= minRating;
            const matchesCategory = selectedCategory === "all" || gadget.category === selectedCategory;
            const matchesPrice = gadget.price >= priceRange[0] && gadget.price <= priceRange[1];
            const matchesFeatured = !featuredOnly || gadget.featured;

            return matchesSearch && matchesRating && matchesCategory && matchesPrice && matchesFeatured;
        });

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                case "rating":
                    return b.rating - a.rating;
                case "featured":
                    return b.featured - a.featured;
                case "name":
                default:
                    return a.title.localeCompare(b.title);
            }
        });

        return filtered;
    };

    const filteredGadgets = getFilteredAndSortedGadgets();

    const renderStars = (count) => {
        return [...Array(5)].map((_, idx) => (
            <i
                key={idx}
                className={`bi ${idx < count ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
            ></i>
        ));
    };

    const handleQuantityChange = (id, value) => {
        setQuantity(prevQuantities => ({
            ...prevQuantities,
            [id]: Number(value),
        }));
    };

    const handleAddToCart = async (gadget) => {
        if (!gadget.inStock) {
            showToastMessage("Sorry, this item is out of stock!", "error");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showToastMessage("You must be logged in to add items to the cart", "error");
            return;
        }

        const selectedQuantity = quantity[gadget.id] || 1;
        setLoadingId(gadget.id);

        try {
            const response = await fetch('https://electrogadgets-backend.onrender.com/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: gadget.id,
                    title: gadget.title,
                    price: getDiscountedPrice(gadget.price, gadget.discount),
                    img: gadget.img,
                    quantity: selectedQuantity
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    showToastMessage("Unauthorized: Please log in again", "error");
                } else {
                    showToastMessage(data.error || 'Failed to add item to cart', 'error');
                }
                return;
            }

            dispatch({ type: 'SET_CART', payload: data.cart });
            showToastMessage(`${selectedQuantity} x ${gadget.title} added to cart!`, "success");
        } catch (err) {
            console.error('Error adding to cart:', err);
            showToastMessage('Failed to add item to cart', 'error');
        } finally {
            setLoadingId(null);
        }
    };

    const toggleWishlist = (gadgetId) => {
        setWishlist(prev => {
            const newWishlist = new Set(prev);
            if (newWishlist.has(gadgetId)) {
                newWishlist.delete(gadgetId);
                showToastMessage("Removed from wishlist", "info");
            } else {
                newWishlist.add(gadgetId);
                showToastMessage("Added to wishlist", "info");
            }
            return newWishlist;
        });
    };

    const toggleCompare = (gadget) => {
        setCompareList(prev => {
            const exists = prev.find(item => item.id === gadget.id);
            if (exists) {
                const newList = prev.filter(item => item.id !== gadget.id);
                showToastMessage("Removed from comparison", "info");
                return newList;
            } else if (prev.length < 3) {
                const newList = [...prev, gadget];
                showToastMessage("Added to comparison", "info");
                return newList;
            } else {
                showToastMessage("Maximum 3 items can be compared", "warning");
                return prev;
            }
        });
    };

    const showToastMessage = (message, type = "success") => {
        const colors = {
            success: "bg-success",
            error: "bg-danger",
            warning: "bg-warning",
            info: "bg-info"
        };

        setToastMessage({ text: message, color: colors[type] });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const clearAllFilters = () => {
        setSearch("");
        setMinRating(0);
        setSelectedCategory("all");
        setPriceRange([0, 2000]);
        setSortBy("name");
        setFeaturedOnly(false);
    };

    const getDiscountedPrice = (price, discount) => {
        return discount > 0 ? price * (1 - discount / 100) : price;
    };

    const QuickViewModal = ({ gadget }) => {
        if (!gadget) return null;

        return (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{gadget.title}</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowQuickView(null)}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <img
                                        src={gadget.img}
                                        className="img-fluid rounded"
                                        alt={gadget.title}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <p>{gadget.description}</p>
                                    <div className="mb-2">{renderStars(gadget.rating)}</div>
                                    <div className="mb-3">
                                        <h4 className="text-primary">
                                            ${getDiscountedPrice(gadget.price, gadget.discount).toFixed(2)}
                                            {gadget.discount > 0 && (
                                                <small className="text-muted text-decoration-line-through ms-2">
                                                    ${gadget.price.toFixed(2)}
                                                </small>
                                            )}
                                        </h4>
                                    </div>
                                    <h6>Specifications:</h6>
                                    <ul className="list-unstyled">
                                        {gadget.specs.map((spec, idx) => (
                                            <li key={idx}><i className="bi bi-check-circle text-success me-2"></i>{spec}</li>
                                        ))}
                                    </ul>
                                    <div className="d-flex gap-2 mt-3">
                                        <button
                                            className="btn btn-success"
                                            onClick={() => {
                                                handleAddToCart(gadget);
                                                setShowQuickView(null);
                                            }}
                                            disabled={!gadget.inStock || loadingId === gadget.id}
                                        >
                                            {loadingId === gadget.id ? 'Adding...' : gadget.inStock ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={() => toggleWishlist(gadget.id)}
                                        >
                                            <i className={`bi ${wishlist.has(gadget.id) ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-grow-1">
            <div className="bg-gradient-primary text-white text-center py-5 mb-4 position-relative overflow-hidden">
                <div className="container position-relative z-index-2">
                    <h1 className="display-4 fw-bold mb-3">Welcome to ElectroGadgets</h1>
                    <p className="lead mb-4">Discover the latest technology and innovation</p>
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <div className="input-group input-group-lg">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search for your next gadget..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button className="btn btn-light" type="button">
                                    <i className="bi bi-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
                    <div className="bg-pattern"></div>
                </div>
            </div>

            <div className="container mb-4">
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            <i className={`${category.icon} me-1`}></i>
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="container mb-4">
                <div className="card">
                    <div className="card-body">
                        <div className="row g-3 align-items-center">
                            <div className="col-md-3">
                                <label className="form-label small">Price Range</label>
                                <div className="d-flex gap-2">
                                    <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        placeholder="Min"
                                        value={priceRange[0]}
                                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                    />
                                    <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        placeholder="Max"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                    />
                                </div>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small">Min Rating</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={minRating}
                                    onChange={(e) => setMinRating(Number(e.target.value))}
                                >
                                    <option value="0">All</option>
                                    <option value="3">3+ Stars</option>
                                    <option value="4">4+ Stars</option>
                                    <option value="5">5 Stars</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small">Sort By</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="name">Name</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Rating</option>
                                    <option value="featured">Featured First</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <div className="form-check mt-4">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={featuredOnly}
                                        onChange={(e) => setFeaturedOnly(e.target.checked)}
                                    />
                                    <label className="form-check-label small">Featured Only</label>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="d-flex gap-2 mt-4">
                                    <button className="btn btn-outline-secondary btn-sm" onClick={clearAllFilters}>
                                        <i className="bi bi-arrow-clockwise me-1"></i>Clear All
                                    </button>
                                    <div className="btn-group" role="group">
                                        <button
                                            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <i className="bi bi-grid"></i>
                                        </button>
                                        <button
                                            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setViewMode('list')}
                                        >
                                            <i className="bi bi-list"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mb-3">
                <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">
                        Showing {filteredGadgets.length} of {gadgets.length} products
                    </span>
                    {compareList.length > 0 && (
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary">{compareList.length} items to compare</span>
                            <button className="btn btn-sm btn-outline-primary">
                                <i className="bi bi-bar-chart me-1"></i>Compare
                            </button>
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setCompareList([])}
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="container-fluid px-5">
                <div className={viewMode === 'grid' ? 'row g-4' : ''}>
                    {filteredGadgets.length > 0 ? (
                        filteredGadgets.map((gadget) => {
                            const discountedPrice = getDiscountedPrice(gadget.price, gadget.discount);

                            if (viewMode === 'list') {
                                return (
                                    <div key={gadget.id} className="card mb-3">
                                        <div className="row g-0">
                                            <div className="col-md-3 position-relative">
                                                <img
                                                    src={gadget.img}
                                                    className="img-fluid rounded-start h-100"
                                                    alt={gadget.title}
                                                    style={{ objectFit: 'cover' }}
                                                />
                                                {gadget.featured && (
                                                    <span className="position-absolute top-0 start-0 badge bg-warning text-dark m-2">
                                                        Featured
                                                    </span>
                                                )}
                                                {gadget.discount > 0 && (
                                                    <span className="position-absolute top-0 end-0 badge bg-danger m-2">
                                                        -{gadget.discount}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="col-md-9">
                                                <div className="card-body d-flex justify-content-between">
                                                    <div className="flex-grow-1">
                                                        <h5 className="card-title d-flex align-items-center">
                                                            {gadget.title}
                                                            {!gadget.inStock && (
                                                                <span className="badge bg-secondary ms-2">Out of Stock</span>
                                                            )}
                                                        </h5>
                                                        <p className="card-text">{gadget.description}</p>
                                                        <div className="mb-2">{renderStars(gadget.rating)}</div>
                                                        <div className="mb-3">
                                                            <span className="h5 text-primary">${discountedPrice.toFixed(2)}</span>
                                                            {gadget.discount > 0 && (
                                                                <span className="text-muted text-decoration-line-through ms-2">
                                                                    ${gadget.price.toFixed(2)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="d-flex flex-column gap-2" style={{ minWidth: '200px' }}>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                style={{ width: '70px' }}
                                                                min="1"
                                                                value={quantity[gadget.id] || 1}
                                                                onChange={(e) => handleQuantityChange(gadget.id, e.target.value)}
                                                            />
                                                            <button
                                                                className="btn btn-success btn-sm flex-grow-1"
                                                                onClick={() => handleAddToCart(gadget)}
                                                                disabled={!gadget.inStock || loadingId === gadget.id}
                                                            >
                                                                {loadingId === gadget.id ? 'Adding...' : 'Add to Cart'}
                                                            </button>
                                                        </div>
                                                        <div className="d-flex gap-1">
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm flex-grow-1"
                                                                onClick={() => setShowQuickView(gadget)}
                                                            >
                                                                Quick View
                                                            </button>
                                                            <button
                                                                className={`btn btn-sm ${wishlist.has(gadget.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                                                                onClick={() => toggleWishlist(gadget.id)}
                                                            >
                                                                <i className={`bi ${wishlist.has(gadget.id) ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                                                            </button>
                                                            <button
                                                                className={`btn btn-sm ${compareList.find(item => item.id === gadget.id) ? 'btn-info' : 'btn-outline-info'}`}
                                                                onClick={() => toggleCompare(gadget)}
                                                                disabled={compareList.length >= 3 && !compareList.find(item => item.id === gadget.id)}
                                                            >
                                                                <i className="bi bi-bar-chart"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div className="col-sm-6 col-md-4 col-lg-3" key={gadget.id}>
                                    <div className="card h-100 shadow-sm position-relative">
                                        {gadget.featured && (
                                            <span className="position-absolute top-0 start-0 badge bg-warning text-dark m-2 z-index-1">
                                                Featured
                                            </span>
                                        )}
                                        {gadget.discount > 0 && (
                                            <span className="position-absolute top-0 end-0 badge bg-danger m-2 z-index-1">
                                                -{gadget.discount}%
                                            </span>
                                        )}
                                        <div className="position-relative">
                                            <img
                                                src={gadget.img}
                                                className="card-img-top"
                                                alt={gadget.title}
                                                height="200"
                                                style={{ objectFit: 'cover' }}
                                            />
                                            <div className="position-absolute top-0 end-0 p-2">
                                                <button
                                                    className={`btn btn-sm ${wishlist.has(gadget.id) ? 'btn-danger' : 'btn-outline-light'} rounded-circle me-1`}
                                                    onClick={() => toggleWishlist(gadget.id)}
                                                >
                                                    <i className={`bi ${wishlist.has(gadget.id) ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                                                </button>
                                                <button
                                                    className={`btn btn-sm ${compareList.find(item => item.id === gadget.id) ? 'btn-info' : 'btn-outline-light'} rounded-circle`}
                                                    onClick={() => toggleCompare(gadget)}
                                                    disabled={compareList.length >= 3 && !compareList.find(item => item.id === gadget.id)}
                                                >
                                                    <i className="bi bi-bar-chart"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title">{gadget.title}</h5>
                                            <p className="card-text flex-grow-1">{gadget.description}</p>
                                            <div className="mb-2">{renderStars(gadget.rating)}</div>
                                            <div className="mb-3">
                                                <span className="h5 text-primary">${discountedPrice.toFixed(2)}</span>
                                                {gadget.discount > 0 && (
                                                    <small className="text-muted text-decoration-line-through ms-2">
                                                        ${gadget.price.toFixed(2)}
                                                    </small>
                                                )}
                                            </div>

                                            {!gadget.inStock && (
                                                <div className="alert alert-warning py-1 px-2 small mb-2">
                                                    Out of Stock
                                                </div>
                                            )}

                                            <div className="d-flex align-items-center mb-2">
                                                <label className="form-label mb-0 me-2 small">Qty:</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm me-2"
                                                    style={{ width: '60px' }}
                                                    min="1"
                                                    value={quantity[gadget.id] || 1}
                                                    onChange={(e) => handleQuantityChange(gadget.id, e.target.value)}
                                                />
                                                <button
                                                    className="btn btn-success btn-sm flex-grow-1"
                                                    onClick={() => handleAddToCart(gadget)}
                                                    disabled={!gadget.inStock || loadingId === gadget.id}
                                                >
                                                    {loadingId === gadget.id ? 'Adding...' : <><i className="bi bi-cart-plus me-1"></i>Add</>}
                                                </button>
                                            </div>

                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-outline-primary btn-sm flex-grow-1"
                                                    onClick={() => setShowQuickView(gadget)}
                                                >
                                                    Quick View
                                                </button>
                                                <Link to="/CartPage" className="btn btn-primary btn-sm flex-grow-1">
                                                    Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center w-100 py-5">
                            <i className="bi bi-search display-1 text-muted"></i>
                            <h4 className="mt-3">No products found</h4>
                            <p className="text-muted">Try adjusting your filters or search terms</p>
                            <button className="btn btn-primary" onClick={clearAllFilters}>
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showQuickView && <QuickViewModal gadget={showQuickView} />}

            <div className="toast-container position-fixed bottom-0 end-0 p-3">
                <div className={`toast align-items-center text-white border-0 ${showToast ? 'show' : ''} ${toastMessage.color || 'bg-success'}`} role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="d-flex">
                        <div className="toast-body">
                            {toastMessage.text || toastMessage}
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-white me-2 m-auto"
                            onClick={() => setShowToast(false)}
                            aria-label="Close"
                        ></button>
                    </div>
                </div>
            </div>

            <div className="bg-light py-5 mt-5">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-md-3 mb-4">
                            <div className="card border-0 bg-transparent">
                                <div className="card-body">
                                    <i className="bi bi-truck display-4 text-primary mb-3"></i>
                                    <h5>Free Shipping</h5>
                                    <p className="text-muted">On orders over $100</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 mb-4">
                            <div className="card border-0 bg-transparent">
                                <div className="card-body">
                                    <i className="bi bi-arrow-repeat display-4 text-success mb-3"></i>
                                    <h5>Easy Returns</h5>
                                    <p className="text-muted">30-day return policy</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 mb-4">
                            <div className="card border-0 bg-transparent">
                                <div className="card-body">
                                    <i className="bi bi-shield-check display-4 text-info mb-3"></i>
                                    <h5>Warranty</h5>
                                    <p className="text-muted">1-year manufacturer warranty</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 mb-4">
                            <div className="card border-0 bg-transparent">
                                <div className="card-body">
                                    <i className="bi bi-headset display-4 text-warning mb-3"></i>
                                    <h5>24/7 Support</h5>
                                    <p className="text-muted">Always here to help</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-primary text-white py-4">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h4 className="mb-1">Stay Updated with Latest Tech</h4>
                            <p className="mb-0">Get exclusive deals and early access to new products</p>
                        </div>
                        <div className="col-md-4">
                            <div className="input-group">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Enter your email"
                                />
                                <button className="btn btn-light" type="button">
                                    <i className="bi bi-envelope-check"></i> Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="position-fixed bottom-0 start-0 p-3 d-flex flex-column gap-2" style={{ zIndex: 1000 }}>
                {wishlist.size > 0 && (
                    <button className="btn btn-danger rounded-circle shadow position-relative" style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-heart-fill"></i>
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-light text-dark">
                            {wishlist.size}
                        </span>
                    </button>
                )}
                <button
                    className="btn btn-primary rounded-circle shadow"
                    style={{ width: '50px', height: '50px' }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <i className="bi bi-arrow-up"></i>
                </button>
            </div>

            <style jsx>{`
                .bg-gradient-primary {
                    background: linear-gradient(135deg, #007bff, #0056b3);
                }
                .bg-pattern {
                    background-image: 
                        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%);
                }
                .card:hover {
                    transform: translateY(-2px);
                    transition: transform 0.2s ease-in-out;
                }
                .btn-group .btn {
                    border-radius: 0;
                }
                .btn-group .btn:first-child {
                    border-top-left-radius: 0.375rem;
                    border-bottom-left-radius: 0.375rem;
                }
                .btn-group .btn:last-child {
                    border-top-right-radius: 0.375rem;
                    border-bottom-right-radius: 0.375rem;
                }
                .z-index-1 {
                    z-index: 1;
                }
                .z-index-2 {
                    z-index: 2;
                }
                @media (max-width: 768px) {
                    .container-fluid.px-5 {
                        padding-left: 1rem !important;
                        padding-right: 1rem !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default Home;
