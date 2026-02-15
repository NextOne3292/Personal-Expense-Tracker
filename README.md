# 🚀 Expense Tracker – MERN Stack Application

A full-stack Expense Tracker application built using the MERN stack (MongoDB, Express, React, Node.js).

This application allows users to manage income, expenses, categories, and view dashboard analytics with secure JWT authentication.

---

## ✨ Features

### 🔐 Authentication
- User registration & login
- JWT-based authentication
- Protected routes
- User-specific data isolation

### 💰 Income & Expense Management
- Add, update, delete income
- Add, update, delete expenses
- Category-based validation
- Ownership security checks

### 📂 Category Management
- Separate income & expense categories
- Type validation
- User-specific categories

### 📊 Dashboard
- Total income
- Total expense
- Current balance
- 5 recent transactions
- Combined transaction history

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Fetch API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

---

## 📁 Project Structure

```
expense-tracker/
│
├── client/              # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│
├── server/              # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── config/
│   └── package.json
│
└── README.md
```

---

## 🔐 Environment Variables (Backend)

Create a `.env` file inside `server/`:

```
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET_KEY=your_secret_key
```

---

## ▶️ Run Locally

### 1️⃣ Clone Repo

```bash
git clone <your-repo-url>
cd expense-tracker
```

---

### 2️⃣ Start Backend

```bash
cd server
npm install
npm run dev
```

Backend runs at:

```
http://localhost:3000
```

---

### 3️⃣ Start Frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 📡 Main API Endpoints

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`

### Income
- GET `/api/income`
- POST `/api/income`
- PUT `/api/income/:id`
- DELETE `/api/income/:id`

### Expense
- GET `/api/expenses`
- POST `/api/expenses`
- PUT `/api/expenses/:id`
- DELETE `/api/expenses/:id`

### Categories
- GET `/api/categories`
- POST `/api/categories`
- PUT `/api/categories/:id`
- DELETE `/api/categories/:id`

### Transactions
- GET `/api/transactions`
  - Supports: `type`, `date`, `month`, `limit`

### Dashboard
- GET `/api/dashboard/overview`

---

## 📌 Future Improvements
- Pagination for transactions
- Chart analytics
- Export reports (PDF/CSV)
- Role-based access
- Deployment to cloud

---

## 👨‍💻 Author
Aswathy v