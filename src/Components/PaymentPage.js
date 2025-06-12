import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Smartphone, Wallet, Building2, QrCode, DollarSign, Truck } from 'lucide-react';

const PaymentPage = () => {
  // Use useLocation to get the state passed from the CartPage
  const stripe = useStripe();
  const elements = useElements();
  const { state } = useLocation();
  const subtotal = state?.subtotal || 0;
  const tax = state?.tax || 0;
  const codFee = 3.00;

  const [selectedMethod, setSelectedMethod] = useState('card');
  const [formData, setFormData] = useState({
    email: '', cardNumber: '', expiryDate: '', cvv: '', cardName: '',
    paypalEmail: '', cryptoWallet: '', bankAccount: '', routingNumber: '',
    phoneNumber: '', deliveryAddress: '', deliveryPhone: '', deliveryNotes: ''
  });

  // This 'total' variable correctly calculates the final amount.
  const total = (subtotal + tax + (selectedMethod === 'cod' ? codFee : 0)).toFixed(2);

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, popular: true },
    { id: 'paypal', name: 'PayPal', icon: Wallet },
    { id: 'apple', name: 'Apple Pay', icon: Smartphone },
    { id: 'google', name: 'Google Pay', icon: Smartphone },
    { id: 'crypto', name: 'Cryptocurrency', icon: QrCode },
    { id: 'bank', name: 'Bank Transfer', icon: Building2 },
    { id: 'klarna', name: 'Klarna', icon: DollarSign },
    { id: 'afterpay', name: 'Afterpay', icon: DollarSign },
    { id: 'cod', name: 'Cash on Delivery', icon: Truck }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Handle different payment methods
    switch (selectedMethod) {
      case 'card':
        await handleStripePayment();
        break;
      case 'paypal':
        await handlePayPalPayment();
        break;
      case 'apple':
        await handleApplePayment();
        break;
      case 'google':
        await handleGooglePayment();
        break;
      case 'crypto':
        await handleCryptoPayment();
        break;
      case 'bank':
        await handleBankTransfer();
        break;
      case 'klarna':
        await handleKlarnaPayment();
        break;
      case 'afterpay':
        await handleAfterpayPayment();
        break;
      case 'cod':
        await handleCODOrder();
        break;
      default:
        alert('Please select a payment method');
    }
  };

  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      alert('Stripe is not loaded. Please refresh the page.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      alert('Card element not found');
      return;
    }

    // Create payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        email: formData.email,
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    try {
      // Convert total to cents for Stripe (Stripe expects amounts in cents)
      const amountInCents = Math.round(parseFloat(total) * 100);

      const response = await fetch('https://electrogadgets-backend.onrender.com/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method_id: paymentMethod.id,
          amount: amountInCents, // Use actual cart total
          currency: 'usd', // Add currency
          email: formData.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const paymentResult = await response.json();

      if (paymentResult.error) {
        alert(paymentResult.error);
      } else if (paymentResult.success) {
        alert('Payment successful!');
        // Redirect to success page or clear cart
      } else if (paymentResult.requires_action) {
        // Handle 3D Secure / OTP step
        const result = await stripe.confirmCardPayment(paymentResult.payment_intent_client_secret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: formData.email,
            },
          },
          return_url: window.location.origin + '/payment-complete',
        });

        if (result.error) {
          alert(result.error.message);
        } else if (result.paymentIntent.status === 'succeeded') {
          alert('Payment succeeded after authentication!');
          // Redirect to success page
        }
      } else {
        alert('Something went wrong with the payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  // Placeholder functions for other payment methods
  const handlePayPalPayment = async () => {
    alert('Redirecting to PayPal...');
    // Implement PayPal integration
  };

  const handleApplePayment = async () => {
    alert('Opening Apple Pay...');
    // Implement Apple Pay integration
  };

  const handleGooglePayment = async () => {
    alert('Opening Google Pay...');
    // Implement Google Pay integration
  };

  const handleCryptoPayment = async () => {
    alert('Generating crypto payment QR code...');
    // Implement crypto payment
  };

  const handleBankTransfer = async () => {
    alert('Processing bank transfer...');
    // Implement bank transfer
  };

  const handleKlarnaPayment = async () => {
    alert('Redirecting to Klarna...');
    // Implement Klarna integration
  };

  const handleAfterpayPayment = async () => {
    alert('Redirecting to Afterpay...');
    // Implement Afterpay integration
  };

  const handleCODOrder = async () => {
    if (!formData.deliveryAddress || !formData.deliveryPhone) {
      alert('Please fill in delivery address and phone number');
      return;
    }

    try {
      // Send COD order to your backend
      const response = await fetch('https://electrogadgets-backend.onrender.com/api/create-cod-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          deliveryAddress: formData.deliveryAddress,
          deliveryPhone: formData.deliveryPhone,
          deliveryNotes: formData.deliveryNotes,
          total: parseFloat(total),
          subtotal: subtotal,
          tax: tax,
          codFee: codFee,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`COD Order placed successfully! Order ID: ${result.orderId}`);
        // Redirect to order confirmation page
      } else {
        alert('Failed to place COD order. Please try again.');
      }
    } catch (error) {
      console.error('COD order error:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  // Add amount here

  return (
    <>
      <div className="payment-container">
        <div className="payment-card">
          <div className="payment-header">
            <h1>Complete Your Payment</h1>
            <div className="order-summary">
              <div className="summary-item">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {selectedMethod === 'cod' && (
                <div className="summary-item">
                  <span>COD Fee</span>
                  <span>${codFee.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-item total">
                <span>Total</span>
                {/* CORRECTED: Used the 'total' variable instead of the undefined 'totalAmount' */}
                <span>${total}</span>
              </div>
            </div>
          </div>

          <div className="payment-form">
            <div className="contact-section">
              <h3>Contact Information</h3>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="payment-methods">
              <h3>Payment Method</h3>
              <div className="methods-grid">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <div
                      key={method.id}
                      className={`payment-method ${selectedMethod === method.id ? 'selected' : ''}`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className="method-content">
                        <IconComponent size={20} />
                        <span>{method.name}</span>
                        {method.popular && <span className="popular-badge">Popular</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="payment-details">
              {selectedMethod === 'card' && (
                <div className="card-form">
                  <div className="form-group">
                    <label htmlFor="card-element">Card Details</label>
                    <CardElement id="card-element" className="form-input stripe-card" />
                  </div>
                </div>
              )}


              {selectedMethod === 'paypal' && (
                <div className="paypal-form">
                  <input
                    type="email"
                    name="paypalEmail"
                    placeholder="PayPal email address"
                    value={formData.paypalEmail}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                  <div className="paypal-notice">
                    You'll be redirected to PayPal to complete your payment
                  </div>
                </div>
              )}

              {(selectedMethod === 'apple' || selectedMethod === 'google') && (
                <div className="digital-wallet">
                  <div className="wallet-info">
                    <p>You'll be redirected to {selectedMethod === 'apple' ? 'Apple Pay' : 'Google Pay'} to complete your payment securely.</p>
                    <div className="security-badges">
                      <span className="security-badge">🔒 Secure</span>
                      <span className="security-badge">⚡ Fast</span>
                      <span className="security-badge">📱 Touch ID</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'crypto' && (
                <div className="crypto-form">
                  <select className="form-input crypto-select">
                    <option>Select cryptocurrency</option>
                    <option>Bitcoin (BTC)</option>
                    <option>Ethereum (ETH)</option>
                    <option>Litecoin (LTC)</option>
                    <option>Bitcoin Cash (BCH)</option>
                  </select>
                  <input
                    type="text"
                    name="cryptoWallet"
                    placeholder="Wallet address"
                    value={formData.cryptoWallet}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                  <div className="crypto-notice">
                    A QR code will be generated for payment
                  </div>
                </div>
              )}

              {selectedMethod === 'bank' && (
                <div className="bank-form">
                  <input
                    type="text"
                    name="bankAccount"
                    placeholder="Account number"
                    value={formData.bankAccount}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                  <input
                    type="text"
                    name="routingNumber"
                    placeholder="Routing number"
                    value={formData.routingNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                  <div className="bank-notice">
                    Processing may take 3-5 business days
                  </div>
                </div>
              )}

              {(selectedMethod === 'klarna' || selectedMethod === 'afterpay') && (
                <div className="bnpl-form">
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                  <div className="bnpl-info">
                    <h4>Pay in 4 installments of ${(total / 4).toFixed(2)}</h4>
                    <div className="installments">
                      {/* Dynamic installment calculation */}
                      <span>Today: <strong>${(total / 4).toFixed(2)}</strong></span>
                      <span>In 2 weeks: <strong>${(total / 4).toFixed(2)}</strong></span>
                      <span>In 4 weeks: <strong>${(total / 4).toFixed(2)}</strong></span>
                      <span>In 6 weeks: <strong>${(total / 4).toFixed(2)}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'cod' && (
                <div className="cod-form">
                  <input
                    type="text"
                    name="deliveryAddress"
                    placeholder="Complete delivery address"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                  <input
                    type="tel"
                    name="deliveryPhone"
                    placeholder="Phone number for delivery"
                    value={formData.deliveryPhone}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                  <textarea
                    name="deliveryNotes"
                    placeholder="Delivery instructions (optional)"
                    value={formData.deliveryNotes}
                    onChange={handleInputChange}
                    className="form-input delivery-notes"
                    rows="3"
                  />
                  <div className="cod-info">
                    <h4>Cash on Delivery Details</h4>
                    <div className="cod-details">
                      <div className="cod-item">
                        <span>💰 Payment Method:</span>
                        <span>Cash only (exact change preferred)</span>
                      </div>
                      <div className="cod-item">
                        <span>🚚 Delivery Time:</span>
                        <span>3-7 business days</span>
                      </div>
                      <div className="cod-item">
                        <span>💵 COD Fee:</span>
                        <span>${codFee.toFixed(2)}</span>
                      </div>
                      <div className="cod-item">
                        <span>📞 Verification:</span>
                        <span>We'll call before delivery</span>
                      </div>
                    </div>
                  </div>
                  <div className="cod-notice">
                    Please ensure someone is available at the delivery address to receive the order and make payment in cash.
                  </div>
                </div>
              )}
            </div>

            <div className="security-info">
              <div className="security-badges">
                <span className="security-badge">🔒 SSL Encrypted</span>
                <span className="security-badge">🛡️ PCI Compliant</span>
                <span className="security-badge">✅ Secure Checkout</span>
              </div>
            </div>

            <button type="button" onClick={handleSubmit} className="pay-button">
              {/* CORRECTED: Used 'total' here for the button text */}
              {selectedMethod === 'cod'
                ? `Place Order - $${total}`
                : `Complete Payment - $${total}`}
            </button>

            <div className="payment-logos">
              <div className="logo-grid">
                <span className="payment-logo">💳 Visa</span>
                <span className="payment-logo">💳 Mastercard</span>
                <span className="payment-logo">💳 Amex</span>
                <span className="payment-logo">🅿️ PayPal</span>
                <span className="payment-logo">🍎 Apple Pay</span>
                <span className="payment-logo">🅶 Google Pay</span>
                <span className="payment-logo">🚚 COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
      .payment-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .payment-card {
        max-width: 900px;
        margin: 0 auto;
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .payment-header {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        color: white;
        padding: 30px;
        text-align: center;
      }

      .payment-header h1 {
        margin: 0 0 20px 0;
        font-size: 28px;
        font-weight: 700;
      }

      .order-summary {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 20px;
        backdrop-filter: blur(10px);
      }

      .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 16px;
      }

      .summary-item.total {
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        padding-top: 10px;
        font-weight: 700;
        font-size: 18px;
      }

      .payment-form {
        padding: 30px;
      }

      .contact-section h3,
      .payment-methods h3 {
        color: #1a202c;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 15px;
      }

      .form-input {
        width: 100%;
        padding: 15px;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        font-size: 16px;
        transition: all 0.3s ease;
        margin-bottom: 15px;
        box-sizing: border-box;
      }

      .form-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .delivery-notes {
        resize: vertical;
        min-height: 80px;
      }

      .methods-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
        margin-bottom: 25px;
      }

      .payment-method {
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: white;
      }

      .payment-method:hover {
        border-color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }

      .payment-method.selected {
        border-color: #667eea;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }

      .method-content {
        display: flex;
        align-items: center;
        gap: 10px;
        position: relative;
      }

      .popular-badge {
        background: #10b981;
        color: white;
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 12px;
        margin-left: auto;
      }

      .payment-method.selected .popular-badge {
        background: rgba(255, 255, 255, 0.2);
      }

      .form-row {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 15px;
      }

      .paypal-notice,
      .crypto-notice,
      .bank-notice,
      .cod-notice {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
        font-size: 14px;
        color: #4a5568;
        margin-top: 10px;
      }

      .digital-wallet {
        text-align: center;
        padding: 20px;
        background: #f7fafc;
        border-radius: 10px;
      }

      .wallet-info p {
        margin-bottom: 15px;
        color: #4a5568;
      }

      .security-badges {
        display: flex;
        justify-content: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .security-badge {
        background: #e6fffa;
        color: #234e52;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
      }

      .crypto-select {
        margin-bottom: 15px;
      }

      .bnpl-info,
      .cod-info {
        background: #f7fafc;
        border-radius: 8px;
        padding: 15px;
        margin-top: 10px;
      }

      .bnpl-info h4,
      .cod-info h4 {
        margin: 0 0 10px 0;
        color: #1a202c;
      }

      .installments {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;
      }

      .installments span {
        background: white;
        padding: 8px;
        border-radius: 6px;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
      }

      .cod-details {
        display: grid;
        gap: 8px;
      }

      .cod-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        background: white;
        border-radius: 6px;
        font-size: 14px;
      }

      .cod-item span:first-child {
        font-weight: 600;
        color: #2d3748;
      }

      .cod-item span:last-child {
        color: #4a5568;
      }

      .security-info {
        margin: 25px 0;
        text-align: center;
      }

      .pay-button {
        width: 100%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 18px;
        border-radius: 10px;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 20px;
      }

      .pay-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
      }

      .payment-logos {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
      }

      .logo-grid {
        display: flex;
        justify-content: center;
        gap: 15px;
        flex-wrap: wrap;
      }

      .payment-logo {
        color: #718096;
        font-size: 14px;
        font-weight: 500;
      }

      @media (max-width: 768px) {
        .payment-container {
          padding: 10px;
        }
        
        .methods-grid {
          grid-template-columns: 1fr;
        }
        
        .form-row {
          grid-template-columns: 1fr;
        }
        
        .installments {
          grid-template-columns: 1fr 1fr;
        }

        .cod-details {
          gap: 6px;
        }

        .cod-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
      }
    `}</style>
    </>
  );
};


export default PaymentPage;