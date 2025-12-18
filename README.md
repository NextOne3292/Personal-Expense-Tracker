# Expense Tracker – MERN Backend

A MERN stack backend application for managing income, expenses, categories, and dashboard analytics with JWT authentication.

## Features
- JWT-based user authentication
- CRUD operations for income, expenses, and categories
- Protected routes using middleware
- Dashboard analytics with MongoDB aggregation

## Tech Stack
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT

## Project Structure
server/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── config/
├── index.js
└── package.json
## How to Run Locally

```bash
git clone https://github.com/NextOne3292/Expense-tracker.git
cd Expense-tracker/server
### 2. Install dependencies
```bash
npm install

### 3. Create environment variables
Create a `.env` file inside the `server` folder:
```env
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET_KEY=your_secret
### 4. Start the development server
```bash
npm run dev

  
 
