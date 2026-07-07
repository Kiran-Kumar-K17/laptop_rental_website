# Laptop Rental Website 🖥️

A full-stack rental marketplace built with **React** and **Node.js** that provides a seamless booking experience for laptop rentals. The platform features a complete booking lifecycle with KYC verification, automated inventory management, late fee calculations, and secure payment processing.

## 🌟 Features

### Core Functionality
- **Complete Booking Lifecycle**: Browse laptops, reserve, verify identity, and complete payment
- **KYC Verification**: Secure identity verification process for all users
- **Inventory Management**: Automated tracking of laptop availability and rental status
- **Late Fee Calculation**: Smart system to calculate and manage late fees
- **Secure Payments**: Integrated Razorpay payment gateway for safe transactions

### User Features
- **Laptop Browsing**: Filter and search through available laptops
- **Booking Management**: View active, completed, and upcoming bookings
- **User Dashboard**: Personal profile management and booking history
- **Payment Integration**: Seamless checkout experience with Razorpay

### Admin Features
- **Inventory Management**: Add, update, and manage laptop listings
- **User Management**: Monitor registered users and their KYC status
- **Booking Analytics**: Track rental trends and revenue
- **Late Fee Management**: Monitor and manage overdue rentals

## 🛠️ Tech Stack

### Frontend
- **React**: Modern UI framework for interactive components
- **CSS**: Styling and responsive design
- **JavaScript**: Client-side logic and API integration

### Backend
- **Node.js**: Server runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data storage

### Payment Integration
- **Razorpay**: Secure payment gateway for transactions

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local or MongoDB Atlas account)
- **Razorpay Account** (for payment integration)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Kiran-Kumar-K17/laptop_rental_website.git
cd laptop_rental_website
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create a .env file in the backend directory
cat > .env << EOF
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NODE_ENV=development
EOF

# Start the backend server
npm start
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create a .env file in the frontend directory
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
EOF

# Start the development server
npm start
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
laptop_rental_website/
├── backend/
│   ├── models/              # Database schemas
│   ├── routes/              # API endpoints
│   ├── controllers/         # Business logic
│   ├── middleware/          # Authentication & validation
│   ├── config/              # Configuration files
│   ├── .env                 # Environment variables
│   └── server.js            # Express server entry point
├��─ frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service calls
│   │   ├── context/         # React Context for state
│   │   ├── styles/          # CSS stylesheets
│   │   └── App.js           # Main App component
│   ├── public/              # Static assets
│   └── .env                 # Environment variables
└── README.md
```

## 🔑 Key APIs

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Laptops
- `GET /api/laptops` - Get all available laptops
- `GET /api/laptops/:id` - Get laptop details
- `POST /api/laptops` - Add new laptop (Admin)
- `PUT /api/laptops/:id` - Update laptop details (Admin)
- `DELETE /api/laptops/:id` - Delete laptop (Admin)

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking status
- `POST /api/bookings/:id/complete` - Complete booking and calculate fees

### KYC Verification
- `POST /api/kyc` - Submit KYC documentation
- `GET /api/kyc/:userId` - Get KYC status
- `PUT /api/kyc/:id` - Update KYC status (Admin)

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/laptop_rental
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxx
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

## 📖 Usage

### For Users
1. **Sign Up**: Create an account with email and password
2. **Complete KYC**: Upload required identity verification documents
3. **Browse Laptops**: Explore available laptops with filters
4. **Make Booking**: Select dates and confirm booking
5. **Payment**: Complete payment through Razorpay
6. **Manage Bookings**: Track your rental status and return laptops

### For Admins
1. **Login**: Use admin credentials
2. **Manage Inventory**: Add/update/delete laptop listings
3. **Verify KYC**: Review and approve user KYC submissions
4. **Monitor Bookings**: Track all rental activities
5. **View Analytics**: Check revenue and rental statistics

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@laptoprental.com or open an issue in the repository.

## 🔗 Links

- [Live Demo](#) - Link to deployed application
- [API Documentation](#) - Detailed API docs
- [Issue Tracker](https://github.com/Kiran-Kumar-K17/laptop_rental_website/issues)

## 🙏 Acknowledgments

- Razorpay for payment processing
- MongoDB for database services
- React team for the amazing UI library
- Node.js and Express.js communities

---

**Made with ❤️ by [Kiran Kumar K17](https://github.com/Kiran-Kumar-K17)**
