# BiteBuddy 🍔

A full-stack food delivery application built with the MERN stack (MongoDB, Express, React, Node.js).

## Project Structure

```
bitebuddy/
├── backend/          # Node.js + Express server
│   ├── models/       # MongoDB schemas
│   ├── Routes/       # API endpoints
│   ├── db.js         # Database connection
│   └── index.js      # Server entry point
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   └── App.js
│   └── package.json
└── package.json      # Root package.json
```

## Features

- User authentication (Sign up / Login)
- Browse food items by category
- Shopping cart functionality
- Order management
- Responsive UI with Bootstrap

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB account (MongoDB Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB credentials:
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
```

4. Install dependencies:
```bash
npm install
```

5. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Available Scripts

### Backend
- `npm start` - Start the server with nodemon

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Environment Variables

### Backend (.env)
```
MONGO_URI=<your-mongodb-connection-string>
PORT=5000
NODE_ENV=development
JWT_SECRET=<your-jwt-secret>
CORS_ORIGIN=http://localhost:3000
```

## Project Status

🚧 **Under Development** - Following improvements are in progress:
- [ ] Enhanced error handling
- [ ] Input validation
- [ ] Payment integration
- [ ] Email notifications
- [ ] Search and filtering
- [ ] User reviews and ratings
- [ ] Order tracking
- [ ] Unit tests
- [ ] API documentation

## Technologies Used

### Backend
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- dotenv for environment variables

### Frontend
- React 18
- React Router v6
- Bootstrap 5
- Context API for state management

## Contributing

This is a learning project. Feel free to suggest improvements!

## License

ISC

## Author

End to End Development
