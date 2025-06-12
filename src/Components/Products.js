import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartPage';

function ProductPage() {
    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [category, setCategory] = useState("all");
    const [brand, setBrand] = useState("all");
    const [rating, setRating] = useState(0);
    const [inStock, setInStock] = useState(false);
    const [onSale, setOnSale] = useState(false);
    const [freeShipping, setFreeShipping] = useState(false);
    const [quantity, setQuantity] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [wishlist, setWishlist] = useState(new Set());
    const [compare, setCompare] = useState(new Set());
    const [viewMode, setViewMode] = useState("grid");
    const [quickView, setQuickView] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [selectedColor, setSelectedColor] = useState({});
    const [priceRange, setPriceRange] = useState([0, 2000]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [loadingId, setLoadingId] = useState(null);

    const { dispatch } = useCart();

    const products = [
        { id: 1, title: "iPhone 14 Pro Max", description: "Latest Apple smartphone with A16 chip", img: "/1st.jpg", price: 1099.99, originalPrice: 1199.99, rating: 5, reviews: 2534, category: "mobile", brand: "Apple", stock: 15, colors: ["Space Black", "Deep Purple", "Gold"], onSale: true, freeShipping: true, featured: true },
        { id: 2, title: "Apple Watch Ultra", description: "Most rugged Apple Watch ever made", img: "/2nd.jpg", price: 799.99, rating: 5, reviews: 892, category: "wearable", brand: "Apple", stock: 8, colors: ["Titanium", "Orange"], freeShipping: true },
        { id: 3, title: "AirPods Pro 2", description: "Active noise cancellation reimagined", img: "/3rd.jpg", price: 249.99, originalPrice: 299.99, rating: 5, reviews: 4521, category: "audio", brand: "Apple", stock: 25, onSale: true, freeShipping: true },
        { id: 4, title: "DJI Mini 3 Pro", description: "Professional results, Mini size", img: "/4th.jpg", price: 759.99, rating: 5, reviews: 1234, category: "drone", brand: "DJI", stock: 12, colors: ["Gray"], freeShipping: false },
        { id: 5, title: "MacBook Pro M2", description: "Supercharged by M2 Pro and M2 Max", img: "/5th.jpg", price: 1999.99, originalPrice: 2199.99, rating: 5, reviews: 678, category: "computer", brand: "Apple", stock: 6, onSale: true, freeShipping: true, featured: true },
        { id: 6, title: "Meta Quest 3", description: "Mixed reality that lets you blend virtual with real", img: "/6th.jpg", price: 499.99, rating: 4, reviews: 892, category: "vr", brand: "Meta", stock: 20, colors: ["White"], freeShipping: true },
        { id: 7, title: "Samsung SSD T7", description: "Portable SSD with blazing fast speeds", img: "/img2.jpg", price: 89.99, originalPrice: 119.99, rating: 4, reviews: 3421, category: "storage", brand: "Samsung", stock: 50, colors: ["Black", "Blue", "Red"], onSale: true, freeShipping: true },
        { id: 8, title: "Logitech MX Master 3S", description: "Advanced wireless mouse for power users", img: "/img3.jpg", price: 99.99, rating: 5, reviews: 2156, category: "accessories", brand: "Logitech", stock: 35, colors: ["Graphite", "Pale Gray"], freeShipping: true },
        { id: 9, title: "Sony WH-1000XM5", description: "Industry leading noise canceling headphones", img: "/1st.jpg", price: 399.99, originalPrice: 449.99, rating: 5, reviews: 5678, category: "audio", brand: "Sony", stock: 18, colors: ["Black", "Silver"], onSale: true, freeShipping: true, featured: true },
        { id: 10, title: "iPad Pro M2", description: "The ultimate iPad experience", img: "/2nd.jpg", price: 1099.99, rating: 5, reviews: 1892, category: "tablet", brand: "Apple", stock: 14, colors: ["Space Gray", "Silver"], freeShipping: true },
        { id: 11, title: "Surface Laptop 5", description: "Style and speed for everyday multitasking", img: "/3rd.jpg", price: 999.99, originalPrice: 1199.99, rating: 4, reviews: 743, category: "computer", brand: "Microsoft", stock: 9, colors: ["Platinum", "Black"], onSale: true, freeShipping: true },
        { id: 12, title: "Nintendo Switch OLED", description: "Play at home or on the go", img: "/4th.jpg", price: 349.99, rating: 5, reviews: 8234, category: "gaming", brand: "Nintendo", stock: 0, colors: ["Neon", "White"], freeShipping: false }
    ];

    const categories = useMemo(() => ["all", ...new Set(products.map(p => p.category))], []);
    const brands = useMemo(() => ["all", ...new Set(products.map(p => p.brand))], []);
    const maxProductPrice = useMemo(() => Math.max(...products.map(p => p.price)), []);

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

    const showNotification = (message, type = "success") => {
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

    const addToRecentlyViewed = (product) => {
        setRecentlyViewed(prev => {
            const filtered = prev.filter(p => p.id !== product.id);
            return [product, ...filtered].slice(0, 5);
        });
    };

    const handleQuickView = (product) => {
        setQuickView(product);
        addToRecentlyViewed(product);
    };

    const handleQuantityChange = (id, delta) => {
        setQuantity(prev => ({
            ...prev,
            [id]: Math.max(1, Math.min(10, (prev[id] || 1) + delta))
        }));
    };

    const handleAddToCart = async (product) => {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification("You must be logged in to add items to the cart", "error");
            return;
        }

        if (product.stock === 0) {
            showNotification("Sorry, this item is out of stock!", "error");
            return;
        }

        const selectedQuantity = quantity[product.id] || 1;
        const color = selectedColor[product.id] || product.colors?.[0] || "Default";
        const item = {
            id: product.id,
            title: product.title,
            price: product.price,
            img: product.img,
            quantity: selectedQuantity
        };

        setLoadingId(product.id);
        try {
            const response = await fetch('https://electrogadgets-backend.onrender.com/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(item),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    showNotification("Unauthorized: Please log in again", "error");
                } else {
                    showNotification(data.error || 'Failed to add item to cart', 'error');
                }
                return;
            }

            dispatch({ type: 'SET_CART', payload: data.cart });
            showNotification(`${selectedQuantity} x ${product.title} (${color}) added to cart!`, "success");
        } catch (err) {
            console.error('Error adding item:', err);
            showNotification('Failed to add item to cart', 'error');
        } finally {
            setLoadingId(null);
        }
        addToRecentlyViewed(product);
    };

    const toggleWishlist = (product) => {
        setWishlist(prev => {
            const newSet = new Set(prev);
            if (newSet.has(product.id)) {
                newSet.delete(product.id);
                showNotification(`${product.title} removed from wishlist`, "info");
            } else {
                newSet.add(product.id);
                showNotification(`${product.title} added to wishlist!`, "success");
            }
            return newSet;
        });
    };

    const toggleCompare = (product) => {
        setCompare(prev => {
            const newSet = new Set(prev);
            if (newSet.has(product.id)) {
                newSet.delete(product.id);
                showNotification(`${product.title} removed from comparison`, "info");
            } else if (newSet.size >= 4) {
                showNotification("You can only compare up to 4 products!", "warning");
            } else {
                newSet.add(product.id);
                showNotification(`${product.title} added to comparison!`, "success");
            }
            return newSet;
        });
    };

    const clearAllFilters = () => {
        setSearch("");
        setMinPrice("");
        setMaxPrice("");
        setSortBy("default");
        setCategory("all");
        setBrand("all");
        setRating(0);
        setInStock(false);
        setOnSale(false);
        setFreeShipping(false);
        setPriceRange([0, maxProductPrice]);
        showNotification("All filters cleared", "info");
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase()) ||
                product.description.toLowerCase().includes(search.toLowerCase()) ||
                product.brand.toLowerCase().includes(search.toLowerCase());
            const matchesPrice = (minPrice === "" || product.price >= parseFloat(minPrice)) &&
                (maxPrice === "" || product.price <= parseFloat(maxPrice)) &&
                product.price >= priceRange[0] && product.price <= priceRange[1];
            const matchesCategory = category === "all" || product.category === category;
            const matchesBrand = brand === "all" || product.brand === brand;
            const matchesRating = product.rating >= rating;
            const matchesStock = !inStock || product.stock > 0;
            const matchesSale = !onSale || product.onSale;
            const matchesShipping = !freeShipping || product.freeShipping;

            return matchesSearch && matchesPrice && matchesCategory && matchesBrand &&
                matchesRating && matchesStock && matchesSale && matchesShipping;
        });
    }, [search, minPrice, maxPrice, priceRange, category, brand, rating, inStock, onSale, freeShipping]);

    const sortedProducts = useMemo(() => {
        const sorted = [...filteredProducts];
        const sortFunctions = {
            priceAsc: (a, b) => a.price - b.price,
            priceDesc: (a, b) => b.price - a.price,
            ratingDesc: (a, b) => b.rating - a.rating,
            ratingAsc: (a, b) => a.rating - b.rating,
            nameAsc: (a, b) => a.title.localeCompare(b.title),
            nameDesc: (a, b) => b.title.localeCompare(a.title),
            newest: (a, b) => b.id - a.id,
            popular: (a, b) => b.reviews - a.reviews,
            featured: (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        };
        if (sortFunctions[sortBy]) sorted.sort(sortFunctions[sortBy]);
        return sorted;
    }, [filteredProducts, sortBy]);

    const renderStars = (count, interactive = false, onRate = null) => (
        [...Array(5)].map((_, idx) => (
            <i
                key={idx}
                className={`bi ${idx < count ? 'bi-star-fill text-warning' : 'bi-star text-muted'} ${interactive ? 'cursor-pointer' : ''}`}
                onClick={interactive ? () => onRate(idx + 1) : undefined}
            ></i>
        ))
    );

    const paging = () => {
        const pageSize = 8;
        const pageCount = Math.ceil(sortedProducts.length / pageSize);
        const [currentPage, setCurrentPage] = useState(1);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const currentItems = sortedProducts.slice(startIndex, endIndex);
    
        const handlePageChange = (page) => {
            setCurrentPage(page);
        };
    
        return (
            <div className="d-flex justify-content-center mt-4">
                <nav aria-label="Page navigation">
                    <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                Previous
                            </button>
                        </li>
                        {[...Array(pageCount)].map((_, index) => (
                            <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                                    {index + 1}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === pageCount ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pageCount}>
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        );
    };

    const ProductCard = ({ product, isListView }) => (
        <div className={`col-${isListView ? '12' : 'sm-6 col-md-4 col-lg-3'} mb-4`}>
            <div className={`card h-100 shadow-sm border-0 position-relative ${isListView ? 'flex-row p-3' : ''} ${product.featured ? 'border border-warning' : ''}`}>
                {product.featured && (
                    <div className="position-absolute top-0 start-0 bg-warning text-dark px-2 py-1 rounded-end" style={{ fontSize: '0.75rem', zIndex: 1 }}>
                        Featured
                    </div>
                )}
                {product.onSale && (
                    <div className="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 rounded-start" style={{ fontSize: '0.75rem', zIndex: 1 }}>
                        Sale
                    </div>
                )}
                {product.stock === 0 && (
                    <div className="position-absolute top-50 start-50 translate-middle bg-dark text-white px-3 py-2 rounded opacity-75" style={{ zIndex: 2 }}>
                        Out of Stock
                    </div>
                )}

                <div className={isListView ? 'col-md-3' : ''} style={{ opacity: product.stock === 0 ? 0.5 : 1 }}>
                    <img
                        src={product.img}
                        className="card-img-top rounded"
                        alt={product.title}
                        style={{ height: isListView ? '150px' : '200px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => handleQuickView(product)}
                    />
                </div>

                <div className={`card-body d-flex flex-column ${isListView ? 'col-md-9' : ''}`}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 className="card-title fw-bold mb-1">{product.title}</h6>
                            <p className="text-muted small mb-1">{product.description}</p>
                            <div className="mb-1">{renderStars(product.rating)}</div>
                            <small className="text-muted">({product.reviews} reviews)</small>
                        </div>
                        <div className="d-flex flex-column gap-1">
                            <button
                                className={`btn btn-sm ${wishlist.has(product.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={() => toggleWishlist(product)}
                                title="Add to Wishlist"
                            >
                                <i className={`bi ${wishlist.has(product.id) ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                            </button>
                            <button
                                className={`btn btn-sm ${compare.has(product.id) ? 'btn-info' : 'btn-outline-info'}`}
                                onClick={() => toggleCompare(product)}
                                title="Compare"
                                disabled={!compare.has(product.id) && compare.size >= 4}
                            >
                                <i className="bi bi-arrow-left-right"></i>
                            </button>
                        </div>
                    </div>

                    <div className="mb-2">
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="fw-bold text-primary">${product.price.toFixed(2)}</span>
                            {product.originalPrice && (
                                <span className="text-muted text-decoration-line-through small">${product.originalPrice.toFixed(2)}</span>
                            )}
                            {product.onSale && (
                                <span className="badge bg-danger small">
                                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                </span>
                            )}
                        </div>
                        {product.freeShipping && <span className="badge bg-success small">Free Shipping</span>}
                    </div>

                    {product.colors && product.colors.length > 1 && (
                        <div className="mb-2">
                            <small className="text-muted">Color:</small>
                            <select
                                className="form-select form-select-sm mt-1"
                                value={selectedColor[product.id] || product.colors[0]}
                                onChange={(e) => setSelectedColor(prev => ({ ...prev, [product.id]: e.target.value }))}
                            >
                                {product.colors.map(color => (
                                    <option key={color} value={color}>{color}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="d-flex align-items-center gap-2 mt-auto">
                        <div className="btn-group btn-group-sm" role="group">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => handleQuantityChange(product.id, -1)}
                                disabled={quantity[product.id] <= 1}
                            >
                                <i className="bi bi-dash"></i>
                            </button>
                            <input
                                type="number"
                                className="form-control form-control-sm text-center"
                                style={{ width: '60px' }}
                                value={quantity[product.id] || 1}
                                onChange={(e) => setQuantity(prev => ({ ...prev, [product.id]: parseInt(e.target.value) || 1 }))}
                                min="1"
                                max="10"
                            />
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => handleQuantityChange(product.id, 1)}
                                disabled={quantity[product.id] >= 10}
                            >
                                <i className="bi bi-plus"></i>
                            </button>
                        </div>
                        <button
                            className={`btn btn-sm flex-fill ${product.stock === 0 ? 'btn-secondary' : product.onSale ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0 || loadingId === product.id}
                        >
                            <i className="bi bi-cart-plus me-1"></i>
                            {loadingId === product.id ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleQuickView(product)}
                            title="Quick View"
                        >
                            <i className="bi bi-eye"></i>
                        </button>
                    </div>

                    <div className="mt-2">
                        <small className={`text-${product.stock < 5 ? 'danger' : product.stock < 10 ? 'warning' : 'success'}`}>
                            {product.stock === 0 ? 'Out of Stock' : product.stock < 5 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-grow-1">
            <div className="bg-gradient-primary text-white text-center py-4 mb-4 position-relative overflow-hidden">
                <div className="container position-relative z-index-2">
                    <h1 className="display-5 fw-bold mb-2">Premium Electronics Store</h1>
                    <p className="lead mb-4">Discover cutting-edge technology with unbeatable prices</p>
                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                        {compare.size > 0 && (
                            <button className="btn btn-warning" onClick={() => setShowCompareModal(true)}>
                                <i className="bi bi-arrow-left-right me-2"></i>Compare Selected ({compare.size})
                            </button>
                        )}
                        {wishlist.size > 0 && (
                            <Link to="/wishlist" className="btn btn-light text-dark">
                                <i className="bi bi-heart-fill me-2"></i>Wishlist ({wishlist.size})
                            </Link>
                        )}
                        <Link to="/CartPage" className="btn btn-outline-light">
                            <i className="bi bi-cart me-2"></i>View Cart
                        </Link>
                    </div>
                </div>
                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
                    <div className="bg-pattern"></div>
                </div>
            </div>

            <div className="container">
                <div className="card shadow-sm mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0"><i className="bi bi-funnel me-2"></i>Filter Products</h5>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <i className={`bi bi-chevron-${showFilters ? 'up' : 'down'}`}></i> {showFilters ? 'Hide' : 'Show'} Filters
                            </button>
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={clearAllFilters}
                            >
                                <i className="bi bi-arrow-clockwise me-1"></i>Reset Filters
                            </button>
                        </div>
                    </div>

                    <div className={`card-body ${showFilters ? '' : 'd-none'}`}>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Search Products</label>
                                <div className="input-group">
                                    <span className="input-group-text"><i className="bi bi-search"></i></span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search products..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold">Category</label>
                                <select
                                    className="form-select"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold">Brand</label>
                                <select
                                    className="form-select"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                >
                                    {brands.map(b => (
                                        <option key={b} value={b}>
                                            {b === 'all' ? 'All Brands' : b}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold">Min Rating</label>
                                <div className="d-flex align-items-center">
                                    {renderStars(rating, true, setRating)}
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
                                <input
                                    type="range"
                                    className="form-range"
                                    min="0"
                                    max={maxProductPrice}
                                    step="50"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                />
                            </div>
                        </div>
                        <div className="row g-3 mt-2">
                            <div className="col-md-2">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Min Price"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Max Price"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                            <div className="col-md-8">
                                <div className="d-flex gap-3 flex-wrap">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={inStock}
                                            onChange={(e) => setInStock(e.target.checked)}
                                        />
                                        <label className="form-check-label small">In Stock Only</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={onSale}
                                            onChange={(e) => setOnSale(e.target.checked)}
                                        />
                                        <label className="form-check-label small">On Sale</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={freeShipping}
                                            onChange={(e) => setFreeShipping(e.target.checked)}
                                        />
                                        <label className="form-check-label small">Free Shipping</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <select
                            className="form-select w-auto"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="default">Sort by...</option>
                            <option value="featured">Featured First</option>
                            <option value="popular">Most Popular</option>
                            <option value="newest">Newest First</option>
                            <option value="priceAsc">Price: Low to High</option>
                            <option value="priceDesc">Price: High to Low</option>
                            <option value="ratingDesc">Highest Rated</option>
                            <option value="nameAsc">Name: A to Z</option>
                        </select>
                        <div className="btn-group">
                            <button
                                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <i className="bi bi-grid-3x3-gap"></i>
                            </button>
                            <button
                                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <i className="bi bi-list"></i>
                            </button>
                        </div>
                    </div>
                    <div className="text-muted small">
                        Showing <strong>{sortedProducts.length}</strong> of <strong>{products.length}</strong> products
                    </div>
                </div>
            </div>

            {recentlyViewed.length > 0 && (
                <div className="container mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <h5 className="mb-0"><i className="bi bi-clock-history me-2"></i>Recently Viewed</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                {recentlyViewed.map(product => (
                                    <div key={product.id} className="col-md-2 col-4">
                                        <div className="text-center">
                                            <img
                                                src={product.img}
                                                className="img-fluid rounded cursor-pointer"
                                                alt={product.title}
                                                style={{ height: '100px', objectFit: 'cover' }}
                                                onClick={() => handleQuickView(product)}
                                            />
                                            <small className="d-block text-truncate mt-1">{product.title}</small>
                                            <small className="text-primary fw-bold">${product.price.toFixed(2)}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container">
                <div className="row">
                    {sortedProducts.length > 0 ? (
                        sortedProducts.map(product => (
                            <ProductCard key={product.id} product={product} isListView={viewMode === 'list'} />
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <i className="bi bi-search display-1 text-muted mb-4"></i>
                            <h3>No products found</h3>
                            <p className="text-muted mb-4">Try adjusting your filters or search terms</p>
                            <button className="btn btn-primary btn-lg" onClick={clearAllFilters}>
                                <i className="bi bi-arrow-clockwise me-2"></i>Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {quickView && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setQuickView(null)}>
                    <div className="modal-dialog modal-xl" onClick={e => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title d-flex align-items-center">
                                    <img src={quickView.img} width="40" height="40" className="rounded me-3" alt={quickView.title} />
                                    {quickView.title}
                                    {quickView.featured && <span className="badge bg-warning text-dark ms-2">Featured</span>}
                                </h5>
                                <button className="btn-close" onClick={() => setQuickView(null)} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <img src={quickView.img} className="img-fluid rounded shadow" alt={quickView.title} />
                                        {quickView.colors && quickView.colors.length > 1 && (
                                            <div className="mt-3">
                                                <strong>Available Colors:</strong>
                                                <div className="d-flex gap-2 mt-2">
                                                    {quickView.colors.map(color => (
                                                        <span key={color} className="badge bg-secondary">{color}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <h6 className="text-muted">{quickView.brand}</h6>
                                            <p className="lead">{quickView.description}</p>
                                        </div>
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center gap-3 mb-2">
                                                <h3 className="text-primary mb-0">${quickView.price.toFixed(2)}</h3>
                                                {quickView.originalPrice && (
                                                    <>
                                                        <span className="text-muted text-decoration-line-through h5">${quickView.originalPrice.toFixed(2)}</span>
                                                        <span className="badge bg-danger">
                                                            {Math.round((1 - quickView.price / quickView.originalPrice) * 100)}% OFF
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                {renderStars(quickView.rating)}
                                                <span className="text-muted small">({quickView.reviews} reviews)</span>
                                                {quickView.freeShipping && <span className="badge bg-success">Free Shipping</span>}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <div className="row">
                                                <div className="col-6">
                                                    <strong>Stock Status:</strong>
                                                    <div className={`text-${quickView.stock === 0 ? 'danger' : quickView.stock < 5 ? 'warning' : 'success'}`}>
                                                        {quickView.stock === 0 ? 'Out of Stock' : quickView.stock < 5 ? `Only ${quickView.stock} left!` : `${quickView.stock} available`}
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <strong>Category:</strong>
                                                    <div className="text-capitalize">{quickView.category}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            {quickView.colors && quickView.colors.length > 1 && (
                                                <div>
                                                    <small className="text-muted">Color:</small>
                                                    <select
                                                        className="form-select form-select-sm mt-1"
                                                        value={selectedColor[quickView.id] || quickView.colors[0]}
                                                        onChange={(e) => setSelectedColor(prev => ({ ...prev, [quickView.id]: e.target.value }))}
                                                    >
                                                        {quickView.colors.map(color => (
                                                            <option key={color} value={color}>{color}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                        <div className="d-flex gap-2 align-items-center mb-3">
                                            <div className="btn-group btn-group-sm" role="group">
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => handleQuantityChange(quickView.id, -1)}
                                                    disabled={quantity[quickView.id] <= 1}
                                                >
                                                    <i className="bi bi-dash"></i>
                                                </button>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm text-center"
                                                    style={{ width: '60px' }}
                                                    value={quantity[quickView.id] || 1}
                                                    onChange={(e) => setQuantity(prev => ({ ...prev, [quickView.id]: parseInt(e.target.value) || 1 }))}
                                                    min="1"
                                                    max="10"
                                                />
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => handleQuantityChange(quickView.id, 1)}
                                                    disabled={quantity[quickView.id] >= 10}
                                                >
                                                    <i className="bi bi-plus"></i>
                                                </button>
                                            </div>
                                            <button
                                                className={`btn flex-fill ${quickView.stock === 0 ? 'btn-secondary' : 'btn-success'}`}
                                                onClick={() => { handleAddToCart(quickView); setQuickView(null); }}
                                                disabled={quickView.stock === 0 || loadingId === quickView.id}
                                            >
                                                <i className="bi bi-cart-plus me-2"></i>
                                                {loadingId === quickView.id ? 'Adding...' : quickView.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                            </button>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button
                                                className={`btn ${wishlist.has(quickView.id) ? 'btn-danger' : 'btn-outline-danger'} flex-fill`}
                                                onClick={() => toggleWishlist(quickView)}
                                            >
                                                <i className={`bi ${wishlist.has(quickView.id) ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
                                                {wishlist.has(quickView.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                            </button>
                                            <button
                                                className={`btn ${compare.has(quickView.id) ? 'btn-info' : 'btn-outline-info'} flex-fill`}
                                                onClick={() => toggleCompare(quickView)}
                                                disabled={!compare.has(quickView.id) && compare.size >= 4}
                                            >
                                                <i className="bi bi-arrow-left-right me-2"></i>Compare
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setQuickView(null)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCompareModal && compare.size > 0 && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowCompareModal(false)}>
                    <div className="modal-dialog modal-xl" onClick={e => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Compare Products ({compare.size})</h5>
                                <button className="btn-close" onClick={() => setShowCompareModal(false)} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th width="150">Feature</th>
                                                {Array.from(compare).map(id => {
                                                    const product = products.find(p => p.id === id);
                                                    return (
                                                        <th key={id} className="text-center">
                                                            <img src={product.img} width="60" height="60" className="rounded mb-2" alt={product.title} />
                                                            <div className="fw-bold small">{product.title}</div>
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold">Price</td>
                                                {Array.from(compare).map(id => {
                                                    const product = products.find(p => p.id === id);
                                                    return (
                                                        <td key={id} className="text-center">
                                                            <span className="text-primary fw-bold">${product.price.toFixed(2)}</span>
                                                            {product.originalPrice && (
                                                                <div><small className="text-muted text-decoration-line-through">${product.originalPrice.toFixed(2)}</small></div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Rating</td>
                                                {Array.from(compare).map(id => {
                                                    const product = products.find(p => p.id === id);
                                                    return (
                                                        <td key={id} className="text-center">
                                                            {renderStars(product.rating)}
                                                            <div><small>({product.reviews})</small></div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Brand</td>
                                                {Array.from(compare).map(id => {
                                                    const product = products.find(p => p.id === id);
                                                    return <td key={id} className="text-center">{product.brand}</td>;
                                                })}
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Stock</td>
                                                {Array.from(compare).map(id => {
                                                    const product = products.find(p => p.id === id);
                                                    return (
                                                        <td key={id} className="text-center">
                                                            <span className={`badge ${product.stock === 0 ? 'bg-danger' : product.stock < 5 ? 'bg-warning' : 'bg-success'}`}>
                                                                {product.stock === 0 ? 'Out of Stock' : `${product.stock} available`}
                                                            </span>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Features</td>
                                                {Array.from(compare).map(id => {
                                                    const product = products.find(p => p.id === id);
                                                    return (
                                                        <td key={id} className="text-center">
                                                            {product.freeShipping && <span className="badge bg-success me-1">Free Shipping</span>}
                                                            {product.onSale && <span className="badge bg-danger me-1">On Sale</span>}
                                                            {product.featured && <span className="badge bg-warning text-dark">Featured</span>}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Actions</td>
                                                {Array.from(compare).map(id => {
                                                    const product = products.find(p => p.id === id);
                                                    return (
                                                        <td key={id} className="text-center">
                                                            <div className="d-flex flex-column gap-2">
                                                                <button
                                                                    className="btn btn-success btn-sm"
                                                                    onClick={() => handleAddToCart(product)}
                                                                    disabled={product.stock === 0 || loadingId === product.id}
                                                                >
                                                                    <i className="bi bi-cart-plus me-1"></i>
                                                                    {loadingId === product.id ? 'Adding...' : 'Add to Cart'}
                                                                </button>
                                                                <button
                                                                    className="btn btn-outline-primary btn-sm"
                                                                    onClick={() => { setQuickView(product); setShowCompareModal(false); }}
                                                                >
                                                                    <i className="bi bi-eye me-1"></i>Quick View
                                                                </button>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-outline-danger"
                                    onClick={() => setCompare(new Set())}
                                >
                                    <i className="bi bi-trash me-1"></i>Clear All Comparisons
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowCompareModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
                <div
                    className={`toast align-items-center text-white border-0 ${showToast ? 'show' : ''} ${toastMessage.color || 'bg-success'}`}
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                >
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

            <div className="position-fixed bottom-0 start-0 p-3" style={{ zIndex: 1000 }}>
                <div className="d-flex flex-column gap-2">
                    {wishlist.size > 0 && (
                        <button className="btn btn-danger rounded-circle position-relative" style={{ width: '50px', height: '50px' }}>
                            <i className="bi bi-heart-fill"></i>
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                                {wishlist.size}
                            </span>
                        </button>
                    )}
                    {compare.size > 0 && (
                        <button
                            className="btn btn-info rounded-circle position-relative"
                            style={{ width: '50px', height: '50px' }}
                            onClick={() => setShowCompareModal(true)}
                        >
                            <i className="bi bi-arrow-left-right"></i>
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                                {compare.size}
                            </span>
                        </button>
                    )}
                    <button
                        className="btn btn-primary rounded-circle"
                        style={{ width: '50px', height: '50px' }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <i className="bi bi-arrow-up"></i>
                    </button>
                </div>
            </div>

            <div className="container">
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
                .z-index-1 {
                    z-index: 1;
                }
                .z-index-2 {
                    z-index: 2;
                }
                .form-check-label {
                    cursor: pointer;
                }
                .cursor-pointer {
                    cursor: pointer;
                }
                @media (max-width: 768px) {
                    .col-md-2, .col-md-3, .col-md-4 {
                        margin-bottom: 1rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default ProductPage;
