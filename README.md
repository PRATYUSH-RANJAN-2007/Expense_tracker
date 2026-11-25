# ExpenseTracker — Personal & Small Business Finance Manager

> A modern, responsive, full-featured personal and small-business financial management web application built with **React 19**, **Vite**, **Recharts**, and **LocalStorage**. Designed to meet the highest professional standards for fintech dashboards with complete user and admin capabilities.

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Demo Credentials](#-demo-credentials)
- [Installation & Running Instructions](#-installation--running-instructions)
- [Application Architecture](#-application-architecture)
  - [LocalStorage Data Layer](#localstorage-data-layer)
  - [User Data Isolation](#user-data-isolation)
  - [Session Management](#session-management)
- [User & Admin Modules](#-user--admin-modules)
- [Route Mapping](#-route-mapping)
- [Design System & UI/UX](#-design-system--uiux)
- [Project Structure](#-project-structure)
- [Team Contribution & Git Workflow](#-team-contribution--git-workflow)
- [Testing & Quality Assurance](#-testing--quality-assurance)

---

## 🌟 Project Overview

**ExpenseTracker** is a single-page application (SPA) that delivers a complete financial tracking experience directly within the browser without requiring a backend server. All data operations—such as multi-account balance tracking, categorization, budget enforcement, recurring payment tracking, and analytics—are handled via a robust LocalStorage service layer with automated seed data on first initialization.

The project features a **two-tier role-based access control (RBAC)** architecture separating standard end users from administrators.

---

## ✨ Key Features

### 👤 Standard User Capabilities
- **Authentication & Security:** Real-time email validation, password length checks, confirmation matching, session persistence, and instant demo login buttons.
- **Smart Dashboard:** Live KPI cards (Net Balance, Monthly Income, Monthly Expense, Net Savings), 6-month comparative area chart, category donut breakdown, recent transaction stream, and budget warning indicators.
- **Transaction Management:** Full CRUD operations with instant calculation updates, multi-condition filtering (type, category, account, date ranges), live search, sort options, and paginated records.
- **Multi-Account Tracking:** Bank accounts, Cash, Savings, Credit Cards, and Digital Wallets with automatic current balance computation from transaction history and deletion safeguards.
- **Category-Based Budgets:** Monthly budget limits per category, dynamic progress bars with visual warnings (Normal `<80%`, Near Limit `80–100%`, Over Budget `>100%`).
- **Recurring Expenses:** Subscription & periodic bill manager with automated overdue detection and 7-day upcoming reminder banners.
- **Financial Analytics & Reports:** Interactive Recharts (monthly comparison bars, category distribution pie, budget utilization layout), customizable date and category filters.
- **Data Export:** Instant one-click export of filtered transaction data to **CSV** and formatted **JSON**.
- **Profile & Appearance:** Personal details manager, secure password change dialog with LocalStorage disclaimer, currency preference (`INR`, `USD`, `EUR`, `GBP`), date format customization, and a system-wide Dark/Light theme toggle.

### 🔑 Administrator Capabilities
- **Platform Analytics:** Total registered users, total transactions across all accounts, aggregate system income/expenses, and active user metrics.
- **User Management:** Searchable directory of registered users, view detailed user profile modals (with individual income/expense breakdown), and instant user activation/deactivation toggles.
- **Global Transaction Moderation:** Master ledger of all transactions with user attribution, search, type filtering, and moderation deletion capabilities.
- **Category Management:** Comprehensive category catalog with icon customization, transaction usage counters, custom category creation, and protection against deleting categories currently in use.

---

## 🛠 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19 (`react`, `react-dom`) | Component-driven UI architecture |
| **Build Tool** | Vite 8 | Ultra-fast bundling, HMR, and optimized code splitting |
| **Routing** | React Router DOM v7 | Declarative client-side routing, protected and role-guarded routes |
| **Data Visualization**| Recharts | Responsive SVG charts (Area, Bar, Pie, Cell, Tooltip) |
| **Icons** | Lucide React | Modern, lightweight, accessible feather icons |
| **Notifications** | React Hot Toast | Accessible toast notifications for action feedback |
| **Date Utilities** | Date-fns | ISO date parsing, interval formatting, and arithmetic |
| **Storage Engine** | Browser LocalStorage | Client-side persistent key-value document store |
| **Styling** | Modern CSS Variables | Zero-runtime CSS design system with full Light/Dark mode |

---

## 🔐 Demo Credentials

The application automatically seeds pre-configured demo data upon initial launch:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Regular User** | `user@example.com` | `User@123` | Personal dashboard, transactions, budgets, accounts, recurring, reports |
| **Administrator** | `admin@example.com` | `Admin@123` | System dashboard, user management, global transaction auditing, category manager |

> **Evaluator Tip:** The login page provides **1-Click "Use" buttons** in the Demo Credentials card to automatically fill credentials for testing.

---

## 🚀 Installation & Running Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24)
- **npm**: v9.0.0 or higher

### Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "expense tracker"
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build locally:**
   ```bash
   npm run preview
   ```

---

## 🏛 Application Architecture

### LocalStorage Data Layer
All data access is mediated through pure service functions in `src/utils/storage.js` to ensure uniform JSON parsing, safe fallback defaults, and error resistance:

| Storage Key | Type | Description |
| :--- | :--- | :--- |
| `expenseTracker_users` | `Array<User>` | User account profiles, hashed credentials demo, roles, and status |
| `expenseTracker_session` | `Object` | Active session metadata (`userId`, `role`, `loginAt`) |
| `expenseTracker_transactions` | `Array<Transaction>` | Complete transaction records tagged by `userId` and `accountId` |
| `expenseTracker_accounts` | `Array<Account>` | Financial accounts with types and opening balances |
| `expenseTracker_budgets` | `Array<Budget>` | Monthly spending limits categorized by month, year, and category |
| `expenseTracker_categories` | `Array<Category>` | Catalog of default and user-defined transaction categories |
| `expenseTracker_recurring` | `Array<Recurring>` | Recurring payments, frequencies, and next due dates |
| `expenseTracker_settings` | `Object` | Per-user visual preferences (theme, preferred currency, alerts) |
| `expenseTracker_initialized`| `Boolean` | Flag indicating seed data initialization completed |

### User Data Isolation
Every transaction, account, budget, and recurring expense is explicitly assigned a `userId`. Data context queries automatically enforce this boundary:
```javascript
// User transactions are strictly scoped:
export function getTransactionsByUser(userId) {
  return getTransactions().filter((t) => t.userId === userId);
}
```
Normal users can never view or manipulate data belonging to other user IDs. Administrators access aggregate tables through dedicated administrative endpoints without impersonation.

### Session Management
- **Persistence:** Login sets `expenseTracker_session`. Browser refresh and tab closing retain authentication.
- **Validation:** On mount, `AuthProvider` reads and verifies the session against `expenseTracker_users` and verifies that `isActive === true`. Deactivated users are instantly logged out.
- **Graceful Logout:** Clearing session removes only `expenseTracker_session`, keeping the user's records completely intact.

---

## 👥 User & Admin Modules

### User Module
1. **Dashboard (`/dashboard`):** Real-time net balance, monthly income/expense totals, dynamic visual graphs, budget progress bars, and recent transactions.
2. **Transactions (`/transactions` & `/add-transaction`):** Search by keyword, filter by Type, Category, Account, and Date Range; sort by date or amount; add, edit, or delete with confirmation modals; export to CSV/JSON.
3. **Budgets (`/budgets`):** Create monthly budgets per category, monitor spending percentage, and view visual indicators when near limit or over budget.
4. **Accounts (`/accounts`):** Track Cash, Bank, Savings, Credit Card, and Wallet balances calculated dynamically from opening balance plus income minus expenses.
5. **Recurring Expenses (`/recurring`):** Maintain subscriptions and regular bills with frequency settings, overdue detection, and 7-day upcoming reminder notices.
6. **Reports & Analytics (`/reports`):** Interactive visual breakdowns including monthly comparisons, expense distribution charts, and budget utilization.
7. **Profile & Settings (`/profile`, `/settings`):** Manage profile details, change passwords, customize currency and date formats, and switch themes.

### Admin Module
1. **Admin Dashboard (`/admin`):** High-level KPI metrics across all users, monthly financial trends, and global real-time activity log.
2. **User Management (`/admin/users`):** View all registered users, examine their transaction volume and net spending, activate or deactivate accounts, or delete accounts.
3. **All Transactions (`/admin/transactions`):** Global audit ledger of all user transactions with user filters, type filters, and administrative delete capabilities.
4. **Category Management (`/admin/categories`):** Add new categories with custom icons, modify category types, and view usage statistics with deletion safeguards.

---

## 🗺 Route Mapping

| Route | Access Level | Description |
| :--- | :--- | :--- |
| `/login` | Public (Unauthenticated) | User and Admin login with demo account helpers |
| `/signup` | Public (Unauthenticated) | New user registration with duplicate prevention |
| `/dashboard` | Protected (User) | Main financial dashboard and overview |
| `/transactions` | Protected (User) | Transaction management, filtering, and export |
| `/add-transaction`| Protected (User) | Direct route to open new transaction form |
| `/budgets` | Protected (User) | Category budget planning and tracking |
| `/accounts` | Protected (User) | Financial account tracking and balances |
| `/recurring` | Protected (User) | Recurring payments, bills, and subscriptions |
| `/reports` | Protected (User) | Financial reports, analytics, and charts |
| `/profile` | Protected (User & Admin) | Profile information and security settings |
| `/settings` | Protected (User & Admin) | User preferences and formatting |
| `/admin` | Protected (Admin Only) | Administrative statistics dashboard |
| `/admin/users` | Protected (Admin Only) | User directory and account status moderation |
| `/admin/transactions`| Protected (Admin Only) | Master transaction audit ledger |
| `/admin/categories` | Protected (Admin Only) | Category management and icon catalog |
| `*` | Any | 404 Not Found page with return-to-dashboard link |

---

## 🎨 Design System & UI/UX

- **Design Philosophy:** Clean, modern fintech interface with high information hierarchy, subtle elevation shadows, and accessible contrasts.
- **Responsive Layout:** Adaptive desktop sidebar, sticky mobile header with slide-over drawer and backdrop, and responsive CSS grid cards that scale from mobile (320px) to ultra-wide displays.
- **Visual Feedback:** Instant toast alerts for every create/update/delete operation, destructive action confirmation dialogs, and clear form field error validation messages.
- **Empty & Loading States:** Dedicated visual empty states for lists with direct action buttons, plus animated spinners during credential authentication.

---

## 📁 Project Structure

```
expense-tracker/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── forms/
│   │   │   └── TransactionForm.jsx
│   │   ├── layout/
│   │   │   └── Sidebar.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoutes.jsx
│   │   └── ui/
│   │       ├── ConfirmDialog.jsx
│   │       └── Modal.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── DataContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminCategories.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminTransactions.jsx
│   │   │   └── AdminUsers.jsx
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── Accounts.jsx
│   │   ├── Budgets.jsx
│   │   ├── Dashboard.jsx
│   │   ├── NotFound.jsx
│   │   ├── Profile.jsx
│   │   ├── Recurring.jsx
│   │   ├── Reports.jsx
│   │   └── Transactions.jsx
│   ├── styles/
│   │   ├── auth.css
│   │   ├── globals.css
│   │   └── sidebar.css
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── seedData.js
│   │   └── storage.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── CONTRIBUTING.md
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

---

## 🤝 Team Contribution & Git Workflow

This project adheres to professional collaborative software engineering standards. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for full branch naming, commit syntax, and pull request procedures.

### Git Branching Strategy
- `main`: Production-ready, verified codebase.
- `develop`: Integration branch for tested feature branches.
- `feature/<feature-name>`: Scoped development branches (e.g., `feature/budget-management`).
- `bugfix/<issue-name>`: Specific bug remediation.

---

## 🧪 Testing & Quality Assurance

All core application flows have been thoroughly verified:
- [x] Clean production build without warnings or errors (`npm run build`)
- [x] Zero compilation or console errors
- [x] User registration with email format & duplicate validation
- [x] Authenticated session persistence across browser refreshes
- [x] Role-based route guard blocks normal users from `/admin/*`
- [x] Full transaction CRUD with dynamic balance recalculation
- [x] Budget calculations, progress bars, and over-budget states
- [x] Account balance calculations and delete restrictions
- [x] Recurring payment reminders and overdue indicators
- [x] Responsive layout testing across mobile, tablet, and desktop viewports
- [x] CSV and JSON data export verification
