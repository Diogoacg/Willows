# Willows - Coffee Shop Management System

A comprehensive multi-platform application for coffee shop management with separate interfaces for administration, client ordering, and inventory management.

## 🏗️ Project Structure

```
Willows/
├── backend/                 # Node.js/Express API server
├── frontendAdmin/          # React Native admin interface
├── frontendClient/         # React Native client/employee interface
├── frontendInv/           # React Native inventory management interface
└── images/               # Project assets
```

## 🚀 Features

### Backend API

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Order Management**: Complete order lifecycle management with real-time updates
- **Inventory Control**: Item and ingredient tracking with automatic stock updates
- **Statistics & Analytics**: Profit tracking, user rankings, and business insights
- **Real-time Communication**: Socket.IO integration for live updates
- **API Documentation**: Swagger/OpenAPI documentation

### Frontend Applications

#### Admin Interface (frontendAdmin)

- **Employee Management**: Create, edit, and manage staff accounts
- **Order Oversight**: Monitor and manage all orders across the system
- **Inventory Administration**: Full inventory control and item management
- **Analytics Dashboard**: View business statistics and performance metrics
- **Real-time Monitoring**: Live updates on orders and system activity

#### Client Interface (frontendClient)

- **Order Placement**: Simple interface for employees to place customer orders
- **Order Tracking**: Real-time order status updates
- **Menu Management**: Browse available items and their details

#### Inventory Interface (frontendInv)

- **Stock Management**: Track ingredient quantities and availability
- **Item Creation**: Add new menu items with ingredient requirements
- **Inventory Updates**: Real-time stock level monitoring
- **Ingredient Management**: Complete ingredient lifecycle management

## 🛠️ Technology Stack

### Backend

- **Node.js** with **Express.js**
- **Sequelize ORM** with **MySQL** database
- **JWT** for authentication
- **Socket.IO** for real-time communication
- **Swagger** for API documentation
- **bcrypt** for password hashing

### Frontend

- **React Native** with **Expo**
- **Redux Toolkit** for state management
- **React Navigation** for routing
- **Socket.IO Client** for real-time updates
- **AsyncStorage** for local data persistence
- **React Native Vector Icons** for UI icons

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL database server
- Expo CLI (`npm install -g @expo/cli`)
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Willows
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
DB_NAME=willows_db
DB_USER=your_database_user
DB_PASS=your_database_password
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

Create the MySQL database:

```sql
CREATE DATABASE willows_db;
CREATE USER 'willows_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON willows_db.* TO 'willows_user'@'localhost';
FLUSH PRIVILEGES;
```

Start the backend server:

```bash
npm start
```

The API will be available at `http://localhost:5000`
Swagger documentation: `http://localhost:5000/api-docs`

### 3. Frontend Setup

For each frontend application (Admin, Client, Inventory):

```bash
cd frontendAdmin  # or frontendClient or frontendInv
npm install
```

Create a `.env` file in each frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AUTH_URL=http://localhost:5000/api/auth
```

Start the development server:

```bash
npx expo start
```

## 🎯 Usage

### Default Admin Account

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`

### API Endpoints

#### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/login-admin` - Admin login

#### Orders

- `GET /api/order-groups` - Get all orders
- `POST /api/order-groups` - Create new order
- `PUT /api/order-groups/:id/status` - Update order status

#### Inventory

- `GET /api/inventory` - Get all items
- `POST /api/inventory` - Create new item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item

#### Ingredients

- `GET /api/ingredientes` - Get all ingredients
- `POST /api/ingredientes` - Create new ingredient
- `PUT /api/ingredientes/:id` - Update ingredient
- `DELETE /api/ingredientes/:id` - Delete ingredient

#### Statistics

- `GET /api/stats/profit-per-user` - User profit rankings
- `GET /api/stats/profit` - Overall profit statistics

## 🔄 Real-time Features

The application uses Socket.IO for real-time updates:

- **Order Updates**: Live order status changes
- **Inventory Changes**: Real-time stock updates
- **User Activity**: Live user login/logout notifications
- **System Events**: Real-time system-wide notifications

## 🏛️ Database Schema

### Main Tables

- **Users**: Employee accounts with role-based access
- **Items**: Menu items with pricing and ingredients
- **Ingredientes**: Raw ingredients with quantities
- **OrderGroups**: Customer orders
- **OrderItems**: Individual items within orders
- **ItemIngredients**: Many-to-many relationship between items and ingredients

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin/User role separation
- **Password Hashing**: bcrypt for secure password storage
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Environment Variables**: Secure configuration management

## 📱 Mobile Features

- **Responsive Design**: Adaptive UI for different screen sizes
- **Dark/Light Theme**: User preference-based theming
- **Offline Support**: Local data persistence with AsyncStorage
- **Touch Animations**: Smooth user interactions
- **Navigation**: Intuitive navigation between screens

## 🔍 Monitoring & Analytics

- **User Activity Tracking**: Monitor employee login/logout
- **Order Analytics**: Track order volume and revenue
- **Inventory Monitoring**: Real-time stock level alerts
- **Performance Metrics**: System usage statistics

## 🚨 Troubleshooting

### Database Connection Issues

1. Ensure MySQL server is running
2. Verify database credentials in `.env`
3. Check if database and user exist
4. Verify network connectivity

### Frontend API Connection

1. Check backend server status
2. Verify API URLs in frontend `.env` files
3. Ensure CORS is properly configured
4. Check network connectivity between frontend and backend

### Build Issues

1. Clear node_modules and reinstall dependencies
2. Check Node.js version compatibility
3. Verify all environment variables are set
4. Review error logs for specific issues

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Note**: This is a development setup. For production deployment, ensure proper security configurations, environment variable management, and database optimization.
