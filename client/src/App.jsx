import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import { CartProvider }  from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/admin/Sidebar';
import { ProtectedRoute, AdminRoute, PageLoader } from './components/common/index.jsx';
import './styles/globals.css';

// ── Customer Pages ────────────────────────────────────────────
import HomePage         from './pages/customer/HomePage';
import MenuPage         from './pages/customer/MenuPage';
import CartPage         from './pages/customer/CartPage';
import CheckoutPage     from './pages/customer/CheckoutPage';
import { LoginPage, RegisterPage } from './pages/customer/AuthPages';
import { OrdersPage, OrderTrackingPage } from './pages/customer/OrderPages';

// ── Admin Pages ───────────────────────────────────────────────
import AdminLoginPage   from './pages/admin/AdminLoginPage';
import DashboardPage    from './pages/admin/DashboardPage';
import OrdersManagePage from './pages/admin/OrdersManagePage';
import MenuManagePage   from './pages/admin/MenuManagePage';

// ── Layouts ───────────────────────────────────────────────────
const CustomerLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <footer style={{
      background: 'var(--clr-surface)',
      borderTop: '1px solid var(--clr-border)',
      padding: '32px 24px',
      textAlign: 'center',
      color: 'var(--clr-text-muted)',
      fontSize: '0.85rem',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>
        🍽️ Gupta Family
      </div>
      <p>© {new Date().getFullYear()} Gupta Family Restaurant. All rights reserved.</p>
      <p style={{ marginTop: 4, fontSize: '0.75rem' }}>❤️ Apna taste, apna style – Gupta Family Restaurant</p>
    </footer>
  </>
);

const AdminLayout = () => (
  <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--clr-bg)' }}>
    <Sidebar />
    <main style={{ marginLeft: 240, flex: 1, minWidth: 0, overflowX: 'auto' }}>
      <Outlet />
    </main>
  </div>
);

// ── App ───────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Customer routes */}
              <Route element={<CustomerLayout />}>
                <Route path="/"          element={<HomePage />} />
                <Route path="/menu"      element={<MenuPage />} />
                <Route path="/cart"      element={<CartPage />} />
                <Route path="/login"     element={<LoginPage />} />
                <Route path="/register"  element={<RegisterPage />} />
                <Route path="/checkout"  element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/orders"    element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/orders/:id/track" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route path="dashboard"  element={<DashboardPage />} />
                <Route path="orders"     element={<OrdersManagePage />} />
                <Route path="menu"       element={<MenuManagePage />} />
              </Route>
            </Routes>
          </Suspense>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
