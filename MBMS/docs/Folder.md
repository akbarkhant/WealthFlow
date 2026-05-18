# 💰 Monthly Budget Management System — Full Project Structure

> Stack: **React + TypeScript** (frontend) · **Node.js/Express + TypeScript** (backend) · **PostgreSQL** (database) · **JWT Auth** · **Docker-ready**

---

```
budget-manager/
│
├── 📄 .env.example                        # Template for all environment variables
├── 📄 .gitignore                          # Git ignore rules
├── 📄 docker-compose.yml                  # Orchestrates app + db + redis containers
├── 📄 docker-compose.prod.yml             # Production overrides
├── 📄 README.md                           # Project overview & setup guide
│
├── 📁 backend/                            # Node.js / Express API
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 .env.example
│   ├── 📄 Dockerfile
│   │
│   ├── 📁 src/
│   │   ├── 📄 app.ts                      # Express app setup (middleware, routes)
│   │   ├── 📄 server.ts                   # HTTP server entry point
│   │   │
│   │   ├── 📁 config/
│   │   │   ├── 📄 index.ts                # Centralized config (reads from .env)
│   │   │   ├── 📄 database.ts             # PostgreSQL connection pool (pg / Drizzle)
│   │   │   ├── 📄 redis.ts                # Redis client for session/token blacklist
│   │   │   └── 📄 logger.ts              # Winston / Pino structured logger
│   │   │
│   │   ├── 📁 modules/                    # Feature-based modular architecture
│   │   │   │
│   │   │   ├── 📁 auth/
│   │   │   │   ├── 📄 auth.router.ts      # POST /auth/register, /login, /refresh, /logout
│   │   │   │   ├── 📄 auth.controller.ts  # Request/response handling
│   │   │   │   ├── 📄 auth.service.ts     # Business logic (bcrypt, JWT signing)
│   │   │   │   ├── 📄 auth.schema.ts      # Zod validation schemas
│   │   │   │   └── 📄 auth.types.ts       # TypeScript interfaces
│   │   │   │
│   │   │   ├── 📁 users/
│   │   │   │   ├── 📄 users.router.ts     # GET/PATCH /users/me, DELETE /users/me
│   │   │   │   ├── 📄 users.controller.ts
│   │   │   │   ├── 📄 users.service.ts
│   │   │   │   ├── 📄 users.repository.ts # All raw DB queries for users
│   │   │   │   ├── 📄 users.schema.ts
│   │   │   │   └── 📄 users.types.ts
│   │   │   │
│   │   │   ├── 📁 budgets/
│   │   │   │   ├── 📄 budgets.router.ts   # CRUD /budgets, /budgets/:id
│   │   │   │   ├── 📄 budgets.controller.ts
│   │   │   │   ├── 📄 budgets.service.ts  # Budget logic (monthly rollover, limits)
│   │   │   │   ├── 📄 budgets.repository.ts
│   │   │   │   ├── 📄 budgets.schema.ts
│   │   │   │   └── 📄 budgets.types.ts
│   │   │   │
│   │   │   ├── 📁 categories/
│   │   │   │   ├── 📄 categories.router.ts  # CRUD /categories
│   │   │   │   ├── 📄 categories.controller.ts
│   │   │   │   ├── 📄 categories.service.ts
│   │   │   │   ├── 📄 categories.repository.ts
│   │   │   │   ├── 📄 categories.schema.ts
│   │   │   │   └── 📄 categories.types.ts
│   │   │   │
│   │   │   ├── 📁 transactions/
│   │   │   │   ├── 📄 transactions.router.ts  # CRUD + filters /transactions
│   │   │   │   ├── 📄 transactions.controller.ts
│   │   │   │   ├── 📄 transactions.service.ts
│   │   │   │   ├── 📄 transactions.repository.ts
│   │   │   │   ├── 📄 transactions.schema.ts
│   │   │   │   └── 📄 transactions.types.ts
│   │   │   │
│   │   │   ├── 📁 reports/
│   │   │   │   ├── 📄 reports.router.ts   # GET /reports/monthly, /yearly, /summary
│   │   │   │   ├── 📄 reports.controller.ts
│   │   │   │   ├── 📄 reports.service.ts  # Aggregations, trend calculations
│   │   │   │   └── 📄 reports.types.ts
│   │   │   │
│   │   │   └── 📁 notifications/
│   │   │       ├── 📄 notifications.service.ts  # Budget alerts, limit warnings
│   │   │       └── 📄 notifications.types.ts
│   │   │
│   │   ├── 📁 middleware/
│   │   │   ├── 📄 authenticate.ts         # JWT verification middleware
│   │   │   ├── 📄 authorize.ts            # Role-based access control (RBAC)
│   │   │   ├── 📄 validate.ts             # Zod request validation wrapper
│   │   │   ├── 📄 rateLimiter.ts          # express-rate-limit config
│   │   │   ├── 📄 errorHandler.ts         # Global error handler (structured errors)
│   │   │   ├── 📄 notFound.ts             # 404 catch-all
│   │   │   └── 📄 requestLogger.ts        # Per-request logging
│   │   │
│   │   ├── 📁 shared/
│   │   │   ├── 📄 AppError.ts             # Custom error class hierarchy
│   │   │   ├── 📄 ApiResponse.ts          # Standardized { success, data, error } wrapper
│   │   │   ├── 📄 constants.ts            # App-wide constants (roles, limits, etc.)
│   │   │   └── 📄 utils.ts               # Pure utility functions (date, currency)
│   │   │
│   │   └── 📁 types/
│   │       ├── 📄 express.d.ts            # Augments req.user with AuthUser type
│   │       └── 📄 environment.d.ts        # Typed process.env
│   │
│   ├── 📁 db/
│   │   ├── 📁 migrations/                 # SQL migration files (Flyway / node-pg-migrate)
│   │   │   ├── 📄 001_create_users.sql
│   │   │   ├── 📄 002_create_categories.sql
│   │   │   ├── 📄 003_create_budgets.sql
│   │   │   └── 📄 004_create_transactions.sql
│   │   └── 📁 seeds/
│   │       └── 📄 dev_seed.ts             # Dev-only seed data
│   │
│   └── 📁 tests/
│       ├── 📁 unit/
│       │   ├── 📄 auth.service.test.ts
│       │   ├── 📄 budgets.service.test.ts
│       │   └── 📄 transactions.service.test.ts
│       ├── 📁 integration/
│       │   ├── 📄 auth.routes.test.ts
│       │   ├── 📄 budgets.routes.test.ts
│       │   └── 📄 transactions.routes.test.ts
│       └── 📄 setup.ts                    # Test DB setup/teardown
│
├── 📁 frontend/                           # React + TypeScript SPA
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 vite.config.ts
│   ├── 📄 .env.example
│   ├── 📄 Dockerfile
│   │
│   ├── 📁 public/
│   │   └── 📄 favicon.ico
│   │
│   └── 📁 src/
│       ├── 📄 main.tsx                    # React root render
│       ├── 📄 App.tsx                     # Router setup + providers
│       │
│       ├── 📁 assets/
│       │   ├── 📁 icons/
│       │   └── 📁 fonts/
│       │
│       ├── 📁 components/                 # Reusable, dumb UI components
│       │   ├── 📁 ui/                     # Base primitives (Button, Input, Modal, Badge)
│       │   │   ├── 📄 Button.tsx
│       │   │   ├── 📄 Input.tsx
│       │   │   ├── 📄 Modal.tsx
│       │   │   ├── 📄 Badge.tsx
│       │   │   ├── 📄 Card.tsx
│       │   │   ├── 📄 Spinner.tsx
│       │   │   └── 📄 index.ts            # Re-export barrel
│       │   │
│       │   ├── 📁 layout/
│       │   │   ├── 📄 Sidebar.tsx
│       │   │   ├── 📄 Topbar.tsx
│       │   │   ├── 📄 AppShell.tsx        # Authenticated layout wrapper
│       │   │   └── 📄 AuthLayout.tsx      # Login/register layout
│       │   │
│       │   └── 📁 charts/
│       │       ├── 📄 SpendingPieChart.tsx
│       │       ├── 📄 MonthlyBarChart.tsx
│       │       └── 📄 TrendLineChart.tsx
│       │
│       ├── 📁 features/                   # Feature-based smart components & logic
│       │   ├── 📁 auth/
│       │   │   ├── 📄 LoginPage.tsx
│       │   │   ├── 📄 RegisterPage.tsx
│       │   │   ├── 📄 useAuth.ts          # Auth state hook
│       │   │   └── 📄 authSlice.ts        # Redux slice (or Zustand store)
│       │   │
│       │   ├── 📁 dashboard/
│       │   │   ├── 📄 DashboardPage.tsx
│       │   │   ├── 📄 SummaryCards.tsx    # Total income/expenses/savings
│       │   │   └── 📄 useDashboard.ts
│       │   │
│       │   ├── 📁 budgets/
│       │   │   ├── 📄 BudgetsPage.tsx
│       │   │   ├── 📄 BudgetCard.tsx      # Progress bar per category
│       │   │   ├── 📄 BudgetForm.tsx
│       │   │   └── 📄 useBudgets.ts
│       │   │
│       │   ├── 📁 transactions/
│       │   │   ├── 📄 TransactionsPage.tsx
│       │   │   ├── 📄 TransactionTable.tsx
│       │   │   ├── 📄 TransactionForm.tsx
│       │   │   ├── 📄 TransactionFilters.tsx
│       │   │   └── 📄 useTransactions.ts
│       │   │
│       │   ├── 📁 categories/
│       │   │   ├── 📄 CategoriesPage.tsx
│       │   │   ├── 📄 CategoryBadge.tsx
│       │   │   └── 📄 useCategories.ts
│       │   │
│       │   └── 📁 reports/
│       │       ├── 📄 ReportsPage.tsx
│       │       ├── 📄 MonthlyReport.tsx
│       │       └── 📄 useReports.ts
│       │
│       ├── 📁 hooks/                      # Shared custom hooks
│       │   ├── 📄 useDebounce.ts
│       │   ├── 📄 usePagination.ts
│       │   └── 📄 useLocalStorage.ts
│       │
│       ├── 📁 lib/
│       │   ├── 📄 api.ts                  # Axios instance (baseURL, interceptors, refresh)
│       │   ├── 📄 queryClient.ts          # React Query client config
│       │   └── 📄 formatters.ts           # Currency, date, percent formatters
│       │
│       ├── 📁 store/
│       │   ├── 📄 index.ts                # Redux store / Zustand root
│       │   └── 📄 authSlice.ts
│       │
│       ├── 📁 router/
│       │   ├── 📄 index.tsx               # Route definitions (React Router v6)
│       │   └── 📄 ProtectedRoute.tsx      # Redirects unauthenticated users
│       │
│       ├── 📁 styles/
│       │   ├── 📄 globals.css             # CSS reset + design tokens
│       │   └── 📄 theme.ts               # Color/spacing/typography tokens
│       │
│       └── 📁 tests/
│           ├── 📁 unit/
│           │   └── 📄 formatters.test.ts
│           └── 📁 integration/
│               └── 📄 TransactionForm.test.tsx
│
├── 📁 infra/                              # Infrastructure & DevOps
│   ├── 📁 nginx/
│   │   └── 📄 nginx.conf                  # Reverse proxy config
│   ├── 📁 postgres/
│   │   └── 📄 init.sql                    # DB init script for Docker
│   └── 📁 scripts/
│       ├── 📄 migrate.sh                  # Run pending migrations
│       └── 📄 backup.sh                   # DB backup script
│
└── 📁 docs/
    ├── 📄 architecture.md                 # System design decisions
    ├── 📄 api.md                          # API endpoint reference
    ├── 📄 security.md                     # Security considerations & practices
    └── 📄 database-schema.md             # ERD and table descriptions
```

---

## 🗄️ Database Schema Overview

```
users
  id, email, password_hash, name, currency, timezone, created_at, updated_at

categories
  id, user_id (FK), name, icon, color, type (income|expense), is_default

budgets
  id, user_id (FK), category_id (FK), month, year, amount_limit, created_at

transactions
  id, user_id (FK), category_id (FK), amount, type (income|expense),
  description, date, receipt_url, created_at, updated_at

refresh_tokens
  id, user_id (FK), token_hash, expires_at, revoked_at
```

---

## 🔐 Security Layers

| Layer | Implementation |
|---|---|
| Passwords | bcrypt (cost factor 12) |
| Auth tokens | JWT access (15min) + refresh token (7d, rotated, stored hashed in DB) |
| Token revocation | Redis blacklist for logout / compromised tokens |
| Input validation | Zod schemas on every endpoint (backend) + React Hook Form (frontend) |
| Rate limiting | express-rate-limit on auth routes (5 req/15min) |
| SQL injection | Parameterized queries only — no raw string interpolation |
| CORS | Whitelist of allowed origins |
| Helmet.js | Security headers (CSP, HSTS, X-Frame-Options) |
| Env secrets | dotenv + never committed; Docker secrets in prod |
| RBAC | Middleware checks `req.user.id` owns the requested resource |

---

## 📦 Key Dependencies

**Backend**
- `express` · `typescript` · `zod` · `bcryptjs` · `jsonwebtoken`
- `pg` (PostgreSQL) · `ioredis` · `helmet` · `express-rate-limit`
- `winston` (logging) · `vitest` (tests)

**Frontend**
- `react` · `typescript` · `vite` · `react-router-dom v6`
- `@tanstack/react-query` · `axios` · `react-hook-form` · `zod`
- `recharts` (charts) · `zustand` or `@reduxjs/toolkit` (state)
- `vitest` + `@testing-library/react` (tests)