# SparkGlow - E-Commerce Platform

A modern, full-stack e-commerce platform for bath and body care products built with the MERN stack.

## Features

- **User Authentication**: JWT-based authentication with Google OAuth support
- **Product Management**: Full CRUD operations for products with image uploads
- **Shopping Cart**: Persistent cart with real-time updates
- **Order Management**: Complete order processing and tracking system
- **Admin Dashboard**: Comprehensive admin panel for managing products, orders, users, and categories
- **Real-time Notifications**: Socket.IO integration for live updates
- **Responsive Design**: Mobile-first design approach
- **Sales Analytics**: Date-filtered sales reports and statistics
- **Message System**: Contact form with admin message management
- **Category Management**: Organize products by categories
- **Review System**: Customer reviews and ratings

## Tech Stack

### Frontend
- React 18
- React Router v6
- Framer Motion (animations)
- React Hot Toast (notifications)
- Axios (HTTP client)
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- Passport.js (OAuth)
- Multer (file uploads)
- JWT authentication

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

4. Start the backend server:
```bash
npm start
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
SparkGlow/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── uploads/            # Uploaded files
│   └── server.js           # Entry point
│
└── frontend/
    ├── public/             # Static assets
    └── src/
        ├── components/     # Reusable components
        ├── context/        # React context providers
        ├── pages/          # Page components
        ├── services/       # API services
        └── utils/          # Utility functions
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products/:id/reviews` - Add product review

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user orders

### Admin (Protected)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/users` - Manage users
- `GET /api/admin/sales` - Sales analytics
- `GET /api/admin/messages` - View messages

## Currency

The platform uses Ghana Cedi (GH₵) as the default currency.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support, please contact the development team.
