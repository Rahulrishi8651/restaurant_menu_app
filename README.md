# 🍽️ RestaurantOS — Full-Stack Restaurant Web Application

A production-ready restaurant web application with customer-facing ordering system and a full admin panel.

---

## 📁 Project Structure

```
restaurant-app/
├── client/                        # React.js Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Shared UI components
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── customer/          # Customer-facing components
│   │   │   │   ├── HeroBanner.jsx
│   │   │   │   ├── FeaturedDishes.jsx
│   │   │   │   ├── MenuCard.jsx
│   │   │   │   ├── CartDrawer.jsx
│   │   │   │   ├── OrderTracker.jsx
│   │   │   │   └── CheckoutForm.jsx
│   │   │   └── admin/             # Admin panel components
│   │   │       ├── Sidebar.jsx
│   │   │       ├── StatsCard.jsx
│   │   │       ├── SalesChart.jsx
│   │   │       ├── OrderTable.jsx
│   │   │       └── MenuItemForm.jsx
│   │   ├── pages/
│   │   │   ├── customer/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── MenuPage.jsx
│   │   │   │   ├── ItemDetailPage.jsx
│   │   │   │   ├── CartPage.jsx
│   │   │   │   ├── CheckoutPage.jsx
│   │   │   │   ├── OrderTrackingPage.jsx
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminLoginPage.jsx
│   │   │       ├── DashboardPage.jsx
│   │   │       ├── MenuManagePage.jsx
│   │   │       ├── OrdersManagePage.jsx
│   │   │       └── UsersManagePage.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   └── useFetch.js
│   │   ├── services/
│   │   │   ├── api.js             # Axios instance + interceptors
│   │   │   ├── authService.js
│   │   │   ├── menuService.js
│   │   │   ├── orderService.js
│   │   │   └── adminService.js
│   │   ├── utils/
│   │   │   ├── formatCurrency.js
│   │   │   ├── formatDate.js
│   │   │   └── validators.js
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── variables.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                        # Node.js + Express Backend
│   ├── config/
│   │   ├── db.js                  # PostgreSQL connection
│   │   └── multer.js              # File upload config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   ├── adminController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verify
│   │   ├── adminMiddleware.js     # Admin role check
│   │   ├── errorMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── logger.js
│   ├── models/                    # SQL query functions (no ORM)
│   │   ├── User.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   └── OrderItem.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── adminRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── sendResponse.js
│   │   └── logger.js
│   ├── uploads/                   # Multer storage folder
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── database/
│   ├── schema.sql                 # Full DB schema
│   └── seed.sql                  # Sample data
│
└── docs/
    ├── API.md                     # REST API documentation
    └── DEPLOY.md                  # Deployment guide
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/yourname/restaurant-app
cd restaurant-app

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Setup Database
```bash
# Create DB
psql -U postgres -c "CREATE DATABASE restaurantdb;"

# Run schema
psql -U postgres -d restaurantdb -f database/schema.sql

# Seed sample data
psql -U postgres -d restaurantdb -f database/seed.sql
```

### 3. Configure Environment
```bash
cp server/.env.example server/.env
# Edit .env with your values
```

### 4. Run Development Servers
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

---

## 🌐 API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | Public |
| POST | /api/auth/login | Login user | Public |
| POST | /api/auth/admin/login | Admin login | Public |
| GET | /api/menu | Get all menu items | Public |
| GET | /api/menu/:id | Get single item | Public |
| POST | /api/menu | Create menu item | Admin |
| PUT | /api/menu/:id | Update menu item | Admin |
| DELETE | /api/menu/:id | Delete menu item | Admin |
| POST | /api/orders | Place order | User |
| GET | /api/orders/my | Get user orders | User |
| GET | /api/orders/:id/track | Track order | User |
| GET | /api/admin/orders | All orders | Admin |
| PUT | /api/admin/orders/:id/status | Update status | Admin |
| GET | /api/admin/dashboard | Dashboard stats | Admin |
| GET | /api/admin/analytics | Sales analytics | Admin |

---

## 🔐 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurantdb
DB_USER=postgres
DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
ADMIN_JWT_SECRET=admin_super_secret_key

# Payment (Mock)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Client URL (CORS)
CLIENT_URL=http://localhost:5173
```
