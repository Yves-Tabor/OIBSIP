# DailyPizza

A full-featured pizza delivery application with Express/TypeScript/MongoDB backend and React/Redux Toolkit frontend.

## Features

### User Side
- **User Registration with Email Verification** - Users can register with email verification (auto-verified in development mode for testing)
- **JWT-Based Authentication** - Secure login system with JWT tokens and authorization middleware
- **Forgot Password Flow** - Email-based password reset with secure token links
- **Custom Pizza Builder** - Interactive 4-step builder:
  - Step 1: Choose pizza base (5+ options)
  - Step 2: Choose sauce (5+ options) 
  - Step 3: Choose cheese type (5+ options)
  - Step 4: Select vegetables (multiple selection)
- **Order Summary** - Real-time price calculation and order review before payment
- **Paddle Payment Integration** - Secure payment processing via Paddle (sandbox mode for development)
- **Real-Time Order Tracking** - Live status updates from Order Received → In Kitchen → Sent to Delivery → Delivered
- **Order History** - View all past orders with status and details

### Admin Side
- **Role-Based Access Control** - Separate admin access with middleware protection
- **Admin Dashboard** - Central hub for managing orders, inventory, and analytics
- **Inventory Management** - Complete stock control for:
  - Pizza bases
  - Sauces
  - Cheeses
  - Vegetables
- **Automatic Stock Decrement** - Inventory automatically updated after each order
- **Manual Stock Updates** - Add, edit, and delete inventory items with image support
- **Low Stock Alerts** - Automated email notifications when items fall below threshold (via node-cron)
- **Order Management Panel** - View all orders, update status, and manage workflow
- **Real-Time Status Updates** - Socket.io integration for instant status reflection on user dashboards

## Tech Stack

**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Socket.io, Nodemailer, Paddle, node-cron, Zod

**Frontend:** React 18, TypeScript, Redux Toolkit, React Router, Axios, Tailwind CSS, Lucide React, Socket.io-client

## Project Structure

```
dailyPizza/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── sockets/
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── app/
    │   ├── components/
    │   ├── features/
    │   ├── hooks/
    │   ├── pages/
    │   ├── types/
    │   ├── utils/
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    └── .env
```

## Setup

**Prerequisites:** Node.js 18+, MongoDB, pnpm

**Backend:**
```bash
cd backend
pnpm install
```

Create `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dailypizza
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=DailyPizza <noreply@dailypizza.com>

# Paddle Payment
PADDLE_ENVIRONMENT=sandbox
PADDLE_SANDBOX_API_KEY=pdl_sdbx_apikey_YOUR_SANDBOX_API_KEY_HERE
PADDLE_SANDBOX_WEBHOOK_SECRET=
PADDLE_PRODUCTION_API_KEY=pdl_live_apikey_YOUR_PRODUCTION_API_KEY_HERE
PADDLE_PRODUCTION_WEBHOOK_SECRET=pdl_webhook_secret_YOUR_PRODUCTION_WEBHOOK_SECRET_HERE

FRONTEND_URL=http://localhost:5173
```

Run:
```bash
npm run dev
```

**Frontend:**
```bash
cd frontend
pnpm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Paddle Payment
VITE_PADDLE_ENVIRONMENT=sandbox
VITE_PADDLE_SANDBOX_CLIENT_TOKEN=test_YOUR_SANDBOX_CLIENT_TOKEN_HERE
VITE_PADDLE_PRODUCTION_CLIENT_TOKEN=pdl_YOUR_PRODUCTION_CLIENT_TOKEN_HERE
```

Run:
```bash
pnpm run dev
```

## API

**Auth:** POST /api/auth/register, POST /api/auth/login, GET /api/auth/verify-email/:token, POST /api/auth/forgot-password, POST /api/auth/reset-password/:token, GET /api/auth/me

**Orders:** POST /api/orders/initialize-payment, POST /api/orders/verify-payment, POST /api/orders/paddle/webhook, GET /api/orders/my-orders, GET /api/orders/:id, GET /api/orders/admin/all, PATCH /api/orders/:id/status

**Pizza:** GET /api/pizza/options

**Inventory:** GET /api/inventory, POST /api/inventory, PATCH /api/inventory/:id, DELETE /api/inventory/:id

## Production

**Backend:**
```bash
cd backend
pnpm run build
pnpm start
```

**Frontend:**
```bash
cd frontend
pnpm run build
pnpm run preview
```

## Admin Setup

To create an admin user, you need to manually set the role in the database:

```bash
# Connect to your MongoDB database
# Find the user and update their role to 'admin'
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

Alternatively, you can create a script to seed an admin user during development.

## Troubleshooting

**MongoDB:** Make sure it's running and check MONGODB_URI in .env. For Atlas, whitelist your IP.

**Email:** Use Gmail App Password (not regular password), enable 2FA. In development mode, email verification is auto-disabled if sending fails.

**Paddle:** Update your Paddle API keys and client tokens in .env with your sandbox or production credentials from the Paddle dashboard. The webhook secret is optional for development.

**Socket.io:** Check that the frontend VITE_SOCKET_URL matches the backend URL and CORS settings are properly configured.

**Environment Variables:** Ensure all required environment variables are set in both backend and frontend .env files before running the application.

