# DailyPizza

A pizza delivery app with Express/TypeScript/MongoDB backend and React/Redux Toolkit frontend.

## What it does

- User signup with email verification
- Build custom pizzas (base, sauce, cheese, toppings)
- Track orders in real-time
- Razorpay payments
- Admin panel for orders and inventory
- Low stock alerts via email

## Tech Stack

**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Socket.io, Nodemailer, Razorpay, node-cron, Zod

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
JWT_EXPIRY=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
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
```

Run:
```bash
pnpm run dev
```

## API

**Auth:** POST /api/auth/register, POST /api/auth/login, GET /api/auth/verify-email/:token, POST /api/auth/forgot-password, POST /api/auth/reset-password/:token, GET /api/auth/me

**Orders:** POST /api/orders/create-razorpay-order, POST /api/orders/verify-payment, GET /api/orders/my-orders, GET /api/orders/:id, GET /api/orders/admin/all, PATCH /api/orders/:id/status

**Pizza:** GET /api/pizza/options, PATCH /api/pizza/options/stock

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

## Troubleshooting

**MongoDB:** Make sure it's running and check MONGODB_URI in .env. For Atlas, whitelist your IP.

**Email:** Use Gmail App Password (not regular password), enable 2FA.

**Socket.io:** Check VITE_SOCKET_URL matches backend URL and CORS settings.
