# Contributing to SkyHaven

Thank you for your interest in contributing to **SkyHaven**! We are building a modern, high-performance modular monolith for flight search, visual seat selection, and reservation management.

---

## 🛠️ Development Setup

1. **Prerequisites:**
   - Node.js >= 18 (Node 20 recommended)
   - npm >= 9
   - Docker & Docker Compose (optional, for full containerized stack)

2. **Clone and Install Dependencies:**
   ```bash
   git clone https://github.com/Prithviraj-Dhavan/SkyHaven.git
   cd SkyHaven
   npm install
   ```

3. **Database Setup & Seeding:**
   ```bash
   npm run seed --workspace=backend
   ```

4. **Start Dev Servers:**
   ```bash
   npm run dev
   ```
   - Monolith Backend: `http://localhost:5000`
   - Frontend Client: `http://localhost:5173`

---

## 🧪 Testing Guidelines

Always ensure all unit and integration test suites pass before submitting a pull request:

```bash
# Run both backend and frontend tests
npm run test

# Run backend tests only
npm run test --workspace=backend

# Run frontend tests only
npm run test --workspace=frontend
```

---

## 📝 Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

- `feat(scope): ...` — New features or capabilities
- `fix(scope): ...` — Bug fixes
- `docs(scope): ...` — Documentation updates
- `test(scope): ...` — Adding or updating test cases
- `refactor(scope): ...` — Code refactoring without behavioral changes
- `ci(scope): ...` — CI/CD pipeline and workflow changes
- `chore(scope): ...` — Tooling, dependency updates, or chore maintenance

---

## 🚀 Pull Request Process

1. Create a feature branch from `main` (e.g. `feat/seat-selection-enhancement`).
2. Make clean, atomic commits with descriptive messages.
3. Verify typechecking and tests pass locally (`npm run build && npm run test`).
4. Submit a Pull Request targeting `main` with a clear description of your changes.
