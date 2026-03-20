# Willows — Coffee Shop Management System

## Project Overview

**Willows** is a full-stack coffee shop management platform composed of:

| App | Path | Purpose |
|-----|------|---------|
| **Backend API** | `backend/` | REST API + Socket.IO server |
| **Client App** | `frontendClient/` | Employee order-taking interface |
| **Admin App** | `frontendAdmin/` | Management dashboard & analytics |
| **Inventory App** | `frontendInv/` | Ingredient & stock management |

---

## Architecture

```
Willows/
├── backend/                   # Node.js + Express + Sequelize + Socket.IO
│   └── src/
│       ├── app.js             # Entry point, Socket.IO setup, Swagger
│       ├── config/database.js # MySQL connection via Sequelize
│       ├── middleware/authMiddleware.js  # JWT Bearer auth
│       ├── models/            # Sequelize models (User, Item, OrderGroup, OrderItem, Ingredientes, ItemIngredientes)
│       └── routes/            # authRoutes, orderGroupRoutes, inventoryRoutes, ingredientesRoutes, statsRoutes
├── frontendClient/            # Expo React Native — employee POS
├── frontendAdmin/             # Expo React Native — admin panel
└── frontendInv/               # Expo React Native — inventory management
```

---

## Tech Stack

### Backend
- **Node.js** + **Express 4** — REST API
- **MySQL** + **Sequelize 6** — ORM (`alter: true` auto-syncs schema on startup)
- **Socket.IO 4** — real-time events (order updates, inventory changes, user activity)
- **JWT** (`jsonwebtoken`) + **bcrypt** — auth & password hashing
- **Swagger/OpenAPI** — docs at `http://localhost:5000/api-docs`
- **dotenv** — env config; **nodemon** — dev reload

### Frontend (all three apps)
- **React Native 0.74** + **Expo 51**
- **Redux Toolkit** — global state (cart, auth, theme)
- **React Navigation 6** — tab, drawer, stack navigators
- **React Native Paper** — UI components
- **Axios** — HTTP client
- **Socket.IO Client** — real-time sync
- **AsyncStorage** — local persistence

---

## Database Schema

```
Users           — id, username, email, password (bcrypt), role (user|admin)
Items           — id, nome, preco
Ingredientes    — id, nome, quantidade, unidade
OrderGroups     — id, status (pendente|pronto), totalPrice, userId, timestamps
OrderItems      — id, nome, quantidade, OrderGroupId
ItemIngredient  — itemId, ingredienteId  (junction table, many-to-many)
```

**Key relations:**
- `OrderGroup` → `User` (belongsTo)
- `OrderGroup` → `OrderItems` (hasMany)
- `Item` ↔ `Ingredientes` (belongsToMany through ItemIngredient)

---

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/signup` | Register user | — |
| POST | `/auth/login` | Login | — |
| POST | `/auth/login-admin` | Admin login | — |
| GET | `/auth/all` | All users | JWT |
| PATCH | `/auth/update-role/:id` | Change role | JWT |
| DELETE | `/auth/delete/:id` | Delete user | JWT |
| GET | `/api/inventory` | Menu items | JWT |
| POST | `/api/inventory` | Create item | JWT |
| PUT | `/api/inventory/:id` | Update item | JWT |
| DELETE | `/api/inventory/:id` | Delete item | JWT |
| GET | `/api/ingredientes` | Ingredients | JWT |
| POST | `/api/ingredientes` | Create ingredient | JWT |
| PUT | `/api/ingredientes/:id` | Update ingredient | JWT |
| DELETE | `/api/ingredientes/:id` | Delete ingredient | JWT |
| GET | `/api/order-groups` | All orders | JWT |
| POST | `/api/order-groups` | Create order | JWT |
| PATCH | `/api/order-groups/:id` | Update status | JWT |
| DELETE | `/api/order-groups/:id` | Delete order | JWT |
| GET | `/api/stats/profit` | Total profit | JWT |
| GET | `/api/stats/profit-per-user` | Profit by employee | JWT |
| GET | `/api/stats/total-orders-dmw` | Orders daily/weekly/monthly | JWT |
| GET | `/api/stats/orders-per-item` | Popularity per item | JWT |

---

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `newOrder` | server → clients | Broadcast when order is created |
| `orderStatusUpdate` | server → clients | Order status changed (pendente → pronto) |
| `inventoryUpdate` | server → clients | Item or ingredient changed |
| `userLogin` / `userLogout` | server → clients | User activity |

---

## Environment Variables

Create `backend/.env` (never commit):

```env
DB_NAME=willows
DB_USER=root
DB_PASS=yourpassword
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your_strong_secret_here
PORT=5000
```

**First run** auto-creates a default admin account: `admin` / `admin123` — change immediately in production.

---

## Development Commands

### Backend
```bash
cd backend
npm install
npm run dev      # nodemon — auto-reload on change
npm start        # production
```

### Frontend (any app)
```bash
cd frontendClient   # or frontendAdmin / frontendInv
npm install
npm start           # Expo dev server
npm run android     # Android emulator/device
npm run ios         # iOS simulator (macOS only)
npm run web         # Web browser
```

---

## Development Guidelines

### General
- Keep each concern in its layer: models know nothing about routes; routes know nothing about sockets.
- Prefer editing existing files over creating new ones.
- Do not add comments unless the logic is non-obvious.
- Never commit `.env` files or credentials.

### Backend
- All protected routes **must** use `authMiddleware.js` — import and apply it per route group.
- Add Swagger JSDoc comments to any new endpoint so the API docs stay current.
- Sequelize models use `alter: true` in dev — never use `force: true` (drops all data).
- Emit the relevant Socket.IO event whenever an order or inventory record changes.
- Passwords must always be hashed with bcrypt before saving — never store plain text.

### Frontend
- **State**: UI state → local `useState`; shared/async data → Redux slice in `slices/`.
- **API calls**: always go through the `api/` folder — never call Axios directly from a component.
- **Theme**: use the `ThemeContext` / `config/theme.js` tokens; never hardcode colours.
- **Navigation**: keep navigator definitions in `navigation/`; screens live in `screens/`.
- Target both Android and iOS — test layout on multiple screen sizes using `react-native-responsive-screen`.

### Order Flow
```
Employee creates order (frontendClient)
  → POST /api/order-groups
    → server emits `newOrder` via Socket.IO
      → frontendAdmin real-time list updates
        → Admin marks order pronto
          → PATCH /api/order-groups/:id
            → server emits `orderStatusUpdate`
```

---

## Common Pitfalls

| Problem | Solution |
|---------|----------|
| Schema out of sync | Restart backend — `alter: true` auto-migrates |
| JWT 401 errors | Check `Authorization: Bearer <token>` header; token from login response |
| CORS blocked | Backend CORS targets `http://localhost:8081`; match your Expo port |
| Socket events not received | Ensure client connects to same host:port as backend (`PORT` env var) |
| Admin auto-account not created | Only runs when `Users` table is empty; clear table or check seed logic in `app.js` |

---

## Key Files Reference

| File | Responsibility |
|------|---------------|
| `backend/src/app.js` | Server boot, Socket.IO, Swagger, DB sync, admin seed |
| `backend/src/config/database.js` | Sequelize connection pool |
| `backend/src/middleware/authMiddleware.js` | JWT verification |
| `backend/src/models/*.js` | Data models & associations |
| `backend/src/routes/*.js` | Route handlers (business logic lives here) |
| `frontendClient/store.js` | Redux store setup |
| `frontendClient/ThemeContext.js` | Theme provider |
| `frontendAdmin/screens/` | 13 admin screens (stats, orders, users, items…) |
