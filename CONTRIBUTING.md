# Contributing to ExpenseTracker

Thank you for your interest in contributing to the **ExpenseTracker** project! We maintain rigorous software engineering standards to ensure high code quality, security, and consistent architecture.

---

## 📑 Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Branch Naming Convention](#branch-naming-convention)
3. [Commit Message Guidelines](#commit-message-guidelines)
4. [Pull Request Procedure](#pull-request-procedure)
5. [Code Style & Best Practices](#code-style--best-practices)
6. [Testing & Verification Procedure](#testing--verification-procedure)

---

## 1. Code of Conduct
- Maintain a respectful, inclusive, and professional environment.
- Constructive feedback during code reviews is strongly encouraged.
- Ensure all contributions follow university academic integrity standards.

---

## 2. Branch Naming Convention

All branches must branch off `develop` (or `main` for hotfixes) using the following structured prefixes:

| Branch Type | Syntax | Example |
| :--- | :--- | :--- |
| **Feature** | `feature/<short-description>` | `feature/recurring-expense-reminders` |
| **Bug Fix** | `bugfix/<short-description>` | `bugfix/budget-percentage-overflow` |
| **Hotfix** | `hotfix/<short-description>` | `hotfix/session-expiry-redirect` |
| **Docs** | `docs/<short-description>` | `docs/update-architecture-readme` |
| **Refactor** | `refactor/<short-description>` | `refactor/storage-service-layer` |

---

## 3. Commit Message Guidelines

We follow the **Conventional Commits** specification (`<type>(<scope>): <subject>`):

### Types
- `feat`: A new user-facing feature.
- `fix`: A bug fix.
- `docs`: Documentation changes only.
- `style`: Changes that do not affect code meaning (formatting, spacing).
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `perf`: Performance improvement.
- `test`: Adding or correcting tests.
- `chore`: Build process or tooling changes.

### Examples
- `feat(auth): implement session restoration from localstorage`
- `feat(budgets): add monthly spending limit warning indicators`
- `fix(accounts): prevent deletion of accounts with existing transactions`
- `refactor(charts): optimize recharts code splitting in vite build`
- `docs(readme): add detailed localstorage architecture documentation`

---

## 4. Pull Request Procedure

1. **Keep PRs Focused:** Submit small, logical pull requests that address a single feature or bug.
2. **Self-Review:** Perform a self-review of changes, removing any `console.log` statements or dead code.
3. **Verify Build:** Always run `npm run build` locally before opening a pull request.
4. **PR Description Template:**
   ```markdown
   ### Summary
   Brief 1-2 sentence description of what this PR introduces.

   ### Changes Made
   - Added `computeNextDue` helper function
   - Created UI notification banner for overdue subscriptions

   ### Verification Checklist
   - [ ] Tested on Chrome / Firefox / Edge
   - [ ] Tested mobile responsiveness (max-width: 768px)
   - [ ] Tested `npm run build` with zero errors
   - [ ] Verified LocalStorage persistence after refresh
   ```

---

## 5. Code Style & Best Practices

- **Components:** Functional components with React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
- **Imports:** Group external library imports first, internal components second, contexts/hooks third, and utils/styles last.
- **Naming:**
  - Components: PascalCase (`TransactionForm.jsx`)
  - Hooks: camelCase starting with `use` (`useAuth.js`)
  - Utilities: camelCase (`formatCurrency`)
  - CSS Variables: kebab-case (`--bg-card`, `--primary`)
- **Modularity:** Keep components under 300 lines where practical. Extract reusable UI pieces into `src/components/ui/`.
- **Defensive LocalStorage:** Always wrap `localStorage.getItem` in `try/catch` and provide safe defaults.

---

## 6. Testing & Verification Procedure

Before creating commits or opening PRs, execute this verification sequence:

```bash
# 1. Clean installation check
npm install

# 2. Production build check
npm run build

# 3. Preview verification
npm run preview
```

### Manual Verification Checklist:
1. **Auth Flow:** Log in as `user@example.com`, verify session persists after browser refresh.
2. **Data Isolation:** Add a transaction as `user@example.com`, log out, log in as `admin@example.com`, and verify user/admin dashboards remain isolated.
3. **Responsive Check:** Inspect using Chrome DevTools across Mobile (375px), Tablet (768px), and Desktop (1440px).
