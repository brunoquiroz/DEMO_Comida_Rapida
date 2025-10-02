import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import { ToastContainer } from './components/ui/Toast';
import { CartProvider } from './context/CartContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Routes>
          <ToastContainer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;