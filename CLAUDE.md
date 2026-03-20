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
├── backend/
│   └── src/
│       ├── app.js                    # Entry point, Socket.IO, Swagger, DB sync, admin seed
│       ├── config/database.js        # MySQL + Sequelize connection
│       ├── middleWare/
│       │   └── authMiddleware.js     # authenticateToken + requireAdmin exports
│       ├── models/                   # Sequelize models (6)
│       └── routes/                   # Route handlers (5)
├── frontendClient/                   # Expo React Native — employee POS
├── frontendAdmin/                    # Expo React Native — admin panel
└── frontendInv/                      # Expo React Native — inventory management
```

---

## Tech Stack

### Backend
- **Node.js** + **Express 4** — REST API
- **MySQL** + **Sequelize 6** — ORM (`alter: true` auto-syncs schema on start)
- **Socket.IO 4** — real-time events
- **JWT** (`jsonwebtoken`) — 12h for users, 8h for admins
- **bcrypt** — password hashing (hook on `User.beforeCreate`)
- **Swagger/OpenAPI** — docs at `http://localhost:5000/api-docs`

### Frontend (all three apps)
- **React Native 0.74** + **Expo 51**
- **Redux Toolkit** — cart state
- **React Navigation 6** — tab, drawer, stack
- **React Native Paper** — UI components
- **Axios** / `fetch` — HTTP client
- **Socket.IO Client** — real-time sync
- **AsyncStorage** — token persistence
- **react-native-responsive-screen** — responsive sizing

---

## Database Schema

```
Users           — id, username, email, password (bcrypt), role (user|admin)
Items           — id, nome, preco (DECIMAL), descricao, categoria (ENUM), disponivel (BOOL)
Ingredientes    — id, nome, quantidade, unidade, quantidadeMinima
OrderGroups     — id, status (pendente|em_preparo|pronto), mesa, totalPrice, userId, timestamps
OrderItems      — id, nome, quantidade, orderGroupId, itemId
ItemIngredient  — itemId (FK), ingredienteId (FK), quantidade  ← junction table
```

**Key relations:**
- `OrderGroup` → `User` (belongsTo, as: "user")
- `OrderGroup` → `OrderItems` (hasMany, as: "items")
- `OrderItem` → `Item` (belongsTo)
- `Item` ↔ `Ingredientes` (belongsToMany through ItemIngredient)

**Item categories:** `bebidas_quentes` | `bebidas_frias` | `petiscos` | `bolos` | `outros`

**Order flow:** `pendente` → `em_preparo` → `pronto`
- Ingredient deduction happens only when status becomes `pronto`

---

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Login funcionário (→ token 12h) | — |
| POST | `/auth/login-admin` | Login admin (→ token 8h) | — |
| POST | `/auth/signup` | Criar funcionário | JWT + Admin |
| GET | `/auth/all` | Listar utilizadores | JWT + Admin |
| GET | `/auth/:id` | Ver utilizador | JWT |
| PATCH | `/auth/update-role/:id` | Mudar role | JWT + Admin |
| DELETE | `/auth/delete/:id` | Eliminar utilizador | JWT + Admin |
| GET | `/api/inventory` | Menu items (suporta `?categoria=&disponivel=`) | — |
| GET | `/api/inventory/:id` | Item específico | — |
| POST | `/api/inventory` | Criar item | JWT + Admin |
| PUT | `/api/inventory/:id` | Atualizar item | JWT + Admin |
| DELETE | `/api/inventory/:id` | Eliminar item | JWT + Admin |
| GET | `/api/ingredientes` | Listar ingredientes | JWT |
| GET | `/api/ingredientes/stock-baixo` | Stock abaixo do mínimo | JWT |
| POST | `/api/ingredientes` | Criar ingrediente | JWT + Admin |
| PUT | `/api/ingredientes/:id` | Atualizar ingrediente | JWT + Admin |
| DELETE | `/api/ingredientes/:id` | Eliminar ingrediente | JWT + Admin |
| GET | `/api/order-groups` | Listar pedidos (suporta `?status=`) | JWT |
| POST | `/api/order-groups` | Criar pedido | JWT |
| PATCH | `/api/order-groups/:id` | Avançar status | JWT |
| DELETE | `/api/order-groups/:id` | Eliminar pedido | JWT |
| GET | `/api/order-groups/user/:id` | Pedidos por utilizador | JWT |
| GET | `/api/stats/profit` | Lucro dia/semana/mês (só `pronto`) | JWT |
| GET | `/api/stats/profit-per-user` | Lucro por funcionário (só `pronto`) | JWT |
| GET | `/api/stats/total-orders-dmw` | Pedidos dia/semana/mês | JWT |
| GET | `/api/stats/orders-per-item` | Popularidade + totalVendido | JWT |
| GET | `/api/stats/resumo` | Painel operacional resumido | JWT |

---

## Socket.IO Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `orderGroupCreated` | POST /order-groups | Full order group |
| `orderGroupUpdated` | PATCH /order-groups/:id | `{id, status, mesa}` |
| `orderGroupDeleted` | DELETE /order-groups/:id | `{id}` |
| `itemCreated` | POST /inventory | Full item with ingredients |
| `itemUpdated` | PUT /inventory/:id | Full item with ingredients |
| `itemDeleted` | DELETE /inventory/:id | `{id}` |
| `ingredienteCreated` | POST /ingredientes | Ingredient object |
| `ingredienteUpdated` | PUT /ingredientes/:id | Ingredient object |
| `ingredienteDeleted` | DELETE /ingredientes/:id | `{id}` |
| `userCreated` | POST /auth/signup | Safe user (no password) |
| `userDeleted` | DELETE /auth/delete/:id | `{id}` |
| `userRoleUpdated` | PATCH /auth/update-role/:id | Safe user |
| `userLoggedIn` | POST /auth/login | `{username}` |
| `adminLoggedIn` | POST /auth/login-admin | `{username}` |

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

**First run** auto-creates admin: `admin` / `admin123` — change immediately in production.

Frontend `.env` files (each app root):

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AUTH_URL=http://localhost:5000/auth
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## Development Commands

### Backend
```bash
cd backend
npm install
npm run dev      # nodemon — auto-reload
npm start        # production
```

### Frontend (any app)
```bash
cd frontendClient   # or frontendAdmin / frontendInv
npm install
npm start           # Expo dev server
npm run android
npm run ios
```

---

## Auth Middleware

Two exports from `authMiddleware.js`:

```js
const authenticateToken = require("../middleWare/authMiddleware");
const { requireAdmin } = require("../middleWare/authMiddleware");

// Usage:
router.delete("/:id", authenticateToken, requireAdmin, handler);
```

- `authenticateToken` — verifies JWT, sets `req.user = { id, role }`
- `requireAdmin` — checks `req.user.role === "admin"`, must come after `authenticateToken`

---

## Development Guidelines

### Backend
- All admin-only routes **must** use both `authenticateToken` and `requireAdmin`.
- Never return `password` in responses — use the `safeUser()` helper in `authRoutes.js`.
- Never emit Socket.IO events on GET requests (only on mutations).
- Ingredient deduction happens in PATCH when `status === "pronto"` — don't duplicate elsewhere.
- Stats routes use `status: "pronto"` filter for revenue — pending orders don't count as profit.
- Date ranges use `startOf()` helper (native Date, no moment dependency).
- `alter: true` in dev — never use `force: true` (drops all data).

### Frontend
- **State**: UI state → local `useState`; shared data → Redux.
- **API calls**: always through `api/` folder — never call fetch/axios from a component.
- **Socket URL**: always from `REACT_APP_SOCKET_URL` env var, never hardcoded.
- **Theme**: use `COLORS` from `ThemeContext` — never hardcode colours.
- **Cart**: `decrementQuantity` removes item when quantity reaches 1 (both frontendClient and frontendAdmin).
- **Menu**: filter by `disponivel: true` — items marked unavailable don't appear in orders.
- **Totals**: always format with `.toFixed(2)` before display.

### Order Flow
```
Employee creates order (frontendClient)
  → POST /api/order-groups {items, mesa}
    → server emits orderGroupCreated
      → Admin sees order as "Pendente"
        → Admin taps "Iniciar Preparo"
          → PATCH status: em_preparo
            → Admin taps "Marcar Pronto"
              → PATCH status: pronto
                → Ingredients deducted from stock
```

---

## Common Pitfalls

| Problem | Cause | Solution |
|---------|-------|----------|
| Admin auto-account has role "user" | Old bug (fixed) — `role` was not passed to `User.create` | Restart with fresh DB or update role manually |
| 401 on protected routes | Token expired (12h users / 8h admin) | Re-login |
| 403 on admin routes | `requireAdmin` failing | Ensure user role is "admin" in DB |
| Schema out of sync | Added new column | Restart backend — `alter: true` auto-migrates |
| Items not showing in menu | `disponivel: false` | Toggle in admin inventory |
| Stats show 0 | Profit only counts `status: "pronto"` | Complete orders first |
| CORS blocked | Backend CORS set to `*` | Should work from any origin |
| Socket events not received | Client connecting to wrong URL | Check `REACT_APP_SOCKET_URL` env var |

---

## Key Files Reference

| File | Responsibility |
|------|---------------|
| `backend/src/app.js` | Server boot, associations, Socket.IO, DB sync, admin seed |
| `backend/src/config/database.js` | Sequelize connection pool |
| `backend/src/middleWare/authMiddleware.js` | `authenticateToken` + `requireAdmin` |
| `backend/src/models/Item.js` | Menu item (nome, preco, descricao, categoria, disponivel) |
| `backend/src/models/OrderGroup.js` | Order (status, mesa, totalPrice, userId) |
| `backend/src/models/Ingredientes.js` | Ingredient (nome, quantidade, unidade, quantidadeMinima) |
| `backend/src/models/ItemIngredientes.js` | Junction: itemId + ingredienteId + quantidade |
| `backend/src/routes/orderGroupRoutes.js` | Order CRUD + status flow + inventory deduction |
| `backend/src/routes/statsRoutes.js` | Analytics (native Date, no moment) |
| `frontendClient/slices/cartSlice.js` | Cart state — decrementQuantity removes at 0 |
| `frontendClient/screens/PedidosScreen.js` | Menu grid with category filter tabs |
| `frontendClient/screens/CartScreen.js` | Cart with mesa input + formatted total |
| `frontendClient/screens/GerirPedidos.js` | Active orders with 3-step status flow |
| `frontendAdmin/screens/GerirPedidos.js` | Admin order management (uses `user` from join, not N+1) |
| `frontendAdmin/screens/StatsScreen.js` | Analytics dashboard |
