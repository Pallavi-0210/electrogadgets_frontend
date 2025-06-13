import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './Components/CartPage';
import Home from './Components/Home';
import ProductPage from './Components/Products';
import CartPage from './Components/CartPage';
import Login from './Components/Login';
import Layout from './Components/Layout';
import Signup from './Components/signup';
import PrivateRoute from './Components/PrivateRoute';
import PaymentPage from './Components/PaymentPage';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


// Load your Stripe publishable key
const stripePromise = loadStripe('pk_test_51RXLojQ5veLc9qfeK8Um23THsupUMQMDx0VHyfMqreJhHTUtYyJ6FF8TeyjtWkuXdkvaFimrCvniSJzGLgTvApBn00wICVWm57');

function App() {
  return (
    <CartProvider>
      <Elements stripe={stripePromise}>
        <Routes>
          <Route
            path="/Signup"
            element={
              <Layout>
                <Signup />
              </Layout>
            }
          />
          <Route
            path="/PaymentPage"
            element={
              <PrivateRoute>
                <Layout>
                  <PaymentPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/Login"
            element={
              <Layout>
                <Login />
              </Layout>
            }
          />
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/Products"
            element={
              <PrivateRoute>
                <Layout>
                  <ProductPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/CartPage"
            element={
              <PrivateRoute>
                <Layout>
                  <CartPage />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Elements>
    </CartProvider>
  );
}

export default App;
