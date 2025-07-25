import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Products from './pages/Products';
import Profile from './pages/Profile';
import About from './pages/About';
import FAQs from './pages/FAQs';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import PaymentSuccess from './pages/PaymentSuccess';
import { CartProvider } from './contexts/CartContext';
import MobileWalletPayment from './pages/MobileWalletPayment';

const App = () => (
  <CartProvider>
  <Router>
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/products" element={<Products />} /> 
      <Route path="/cart" element={<Cart/>}/>
      <Route path="/about" element={<About />} />
      <Route path="/faqs" element={<FAQs />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
      <Route path="/mobile-wallet-payment" element={<MobileWalletPayment />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      
    </Routes>
  </Router>
  </CartProvider>
);

export default App;
