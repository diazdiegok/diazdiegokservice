import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { CheckoutSuccess, CheckoutFailure, CheckoutPending } from './pages/CheckoutResult';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Repairs from './pages/Repairs';
import OrderTracking from './pages/OrderTracking';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

const PAGE_TITLES = {
  '/': 'DiazDiegokTechnology — Tu tecnología al mejor precio en Paraná',
  '/catalogo': 'Catálogo — DiazDiegokTechnology',
  '/carrito': 'Carrito de Compras — DiazDiegokTechnology',
  '/checkout': 'Finalizar Compra — DiazDiegokTechnology',
  '/login': 'Ingresar — DiazDiegokTechnology',
  '/registro': 'Crear Cuenta — DiazDiegokTechnology',
  '/perfil': 'Mis Pedidos — DiazDiegokTechnology',
  '/reparaciones': 'Servicio Técnico — DiazDiegokTechnology',
  '/admin': 'Panel de Administración — DiazDiegokTechnology',
};

function PageTitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    // Only update for static routes, dynamic routes (like product detail) handle their own titles
    if (PAGE_TITLES[location.pathname]) {
      document.title = PAGE_TITLES[location.pathname];
    } else if (!location.pathname.startsWith('/producto/')) {
      document.title = 'DiazDiegokTechnology';
    }
  }, [location.pathname]);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter basename="/diazdiegokservice">
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <div className="page-wrapper">
              <ScrollToTop />
              <PageTitleUpdater />
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalogo" element={<Catalog />} />
                  <Route path="/producto/:id" element={<ProductDetail />} />
                  <Route path="/carrito" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  <Route path="/checkout/failure" element={<CheckoutFailure />} />
                  <Route path="/checkout/pending" element={<CheckoutPending />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro" element={<Register />} />
                  <Route path="/perfil" element={<Profile />} />
                  <Route path="/rastreo" element={<OrderTracking />} />
                  <Route path="/reparaciones" element={<Repairs />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
