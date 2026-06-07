# 💰 WealthFlow – Personal & Business Finance Management System

WealthFlow is a full-stack **Personal & Business Finance Management System** designed to help individuals and businesses manage their financial activities efficiently. The platform enables users to track income, expenses, budgets, and financial insights through an intuitive and responsive dashboard.

The system provides separate personal and business finance management, transaction monitoring, budgeting tools, analytics, and secure authentication to ensure users have complete control over their financial data.

---

# 🚀 Features

* 📊 Income & Expense Tracking
* 💼 Separate Personal & Business Finance Management
* 📅 Transaction History with Filtering
* 📈 Financial Analytics & Dashboard Insights
* 🔐 Secure Authentication System
* 🧾 Category-Based Expense Tracking
* 📉 Budget Management
* 🌐 RESTful API Architecture
* 📱 Responsive User Interface
* 📊 Financial Reports & Summaries

---

# 🧱 Tech Stack

## Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Axios

## Backend

* Node.js
* Express.js

## Database

* PostgreSQL / MongoDB

## Authentication

* JWT (JSON Web Tokens)

## Tools

* Git
* GitHub
* Postman
* dotenv

---

# 📁 Project Structure

```text
WealthFlow/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── middleware/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── api/
│   └── public/
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/wealthflow.git
cd wealthflow
```

## 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
```

Start the backend server:

```bash
npm run dev
```

## 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will run at:

```text
http://localhost:3000
```

The backend will run at:

```text
http://localhost:5000
```

---

# 🔗 API Routes

## 🔐 Authentication Routes

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Authenticate user   |
| GET    | `/api/auth/me`       | Get current user    |
| POST   | `/api/auth/logout`   | Logout user         |

---

## 👤 User Routes

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| GET    | `/api/users/profile` | Get user profile    |
| PUT    | `/api/users/profile` | Update user profile |
| DELETE | `/api/users/profile` | Delete user account |

---

## 💰 Transaction Routes

| Method | Endpoint                | Description           |
| ------ | ----------------------- | --------------------- |
| GET    | `/api/transactions`     | Get all transactions  |
| GET    | `/api/transactions/:id` | Get transaction by ID |
| POST   | `/api/transactions`     | Create transaction    |
| PUT    | `/api/transactions/:id` | Update transaction    |
| DELETE | `/api/transactions/:id` | Delete transaction    |

---

## 📊 Budget Routes

| Method | Endpoint           | Description      |
| ------ | ------------------ | ---------------- |
| GET    | `/api/budgets`     | Get all budgets  |
| GET    | `/api/budgets/:id` | Get budget by ID |
| POST   | `/api/budgets`     | Create budget    |
| PUT    | `/api/budgets/:id` | Update budget    |
| DELETE | `/api/budgets/:id` | Delete budget    |

---

## 📈 Report Routes

| Method | Endpoint                  | Description          |
| ------ | ------------------------- | -------------------- |
| GET    | `/api/reports/summary`    | Financial summary    |
| GET    | `/api/reports/monthly`    | Monthly report       |
| GET    | `/api/reports/yearly`     | Yearly report        |
| GET    | `/api/reports/categories` | Category-wise report |

---

## 📋 Category Routes

| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| GET    | `/api/categories`     | Get all categories |
| POST   | `/api/categories`     | Create category    |
| PUT    | `/api/categories/:id` | Update category    |
| DELETE | `/api/categories/:id` | Delete category    |

---

## 📊 Dashboard Routes

| Method | Endpoint                   | Description         |
| ------ | -------------------------- | ------------------- |
| GET    | `/api/dashboard`           | Dashboard overview  |
| GET    | `/api/dashboard/analytics` | Dashboard analytics |
| GET    | `/api/dashboard/insights`  | Financial insights  |

---

# 📊 Core Modules

| Module                | Description                                 |
| --------------------- | ------------------------------------------- |
| Authentication Module | User registration, login, and authorization |
| User Module           | User profile and account management         |
| Transaction Module    | Income and expense management               |
| Budget Module         | Budget planning and tracking                |
| Analytics Module      | Financial insights and statistics           |
| Dashboard Module      | Centralized financial overview              |
| Reports Module        | Monthly, yearly, and summary reports        |

---

# 🔒 Security Features

* JWT Authentication
* Password Hashing
* Protected Routes
* Request Validation
* Secure Environment Variables
* REST API Security Best Practices

---

# 📈 Application Workflow

1. User registers an account.
2. User logs into the platform.
3. User adds income and expense transactions.
4. Transactions are categorized and stored.
5. Budgets are created and monitored.
6. Analytics engine generates insights.
7. Dashboard displays financial summaries.
8. Reports are generated for review.

---

# 🧪 Testing

Run backend tests:

```bash
npm test
```

Run frontend tests:

```bash
npm test
```

---

# 🚀 Deployment

## Frontend

* Vercel
* Netlify

## Backend

* Render
* Railway
* AWS
* Azure

## Database

* PostgreSQL
* MongoDB Atlas

---

# 🧠 Future Improvements

* AI-Powered Spending Predictions
* PDF Financial Report Generation
* Excel Export Support
* Multi-Currency Support
* Recurring Transactions
* Bank API Integration
* Mobile Application
* Real-Time Notifications
* Investment Portfolio Tracking
* Tax Calculation & Insights

---

# 🤝 Contributing

Contributions are welcome.

## Contribution Steps

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/new-feature
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push your changes.

```bash
git push origin feature/new-feature
```

5. Open a Pull Request.

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Akbar Khan**

GitHub: https://github.com/akbarkhant

---

# ⭐ Support

If you find this project useful:

* ⭐ Star the repository
* 🍴 Fork the repository
* 🐛 Report issues
* 🚀 Contribute improvements

Thank you for supporting WealthFlow!
