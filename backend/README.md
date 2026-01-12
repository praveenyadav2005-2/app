# Backend API - Express.js

Node.js Express backend for game authentication and authorization.

## Features

- ✅ User Registration
- ✅ User Login
- ✅ JWT Authentication
- ✅ Game Completion Tracking
- ✅ One-time Game Play Restriction (players cannot re-enter after completing)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secret key for JWT tokens (use a strong random string in production)
- `PORT`: Server port (default: 5000)

4. Make sure MongoDB is running

5. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### Register
- **POST** `/api/auth/register`
- Body: `{ username, email, password }`
- Returns: `{ success, token, user }`

#### Login
- **POST** `/api/auth/login`
- Body: `{ email, password }`
- Returns: `{ success, token, user }`

#### Get Current User
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, user }`

### Game

#### Complete Game
- **POST** `/api/game/complete`
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, message, user }`
- **Note**: Can only be called once per user

#### Check Game Status
- **GET** `/api/game/status`
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, canPlay, gameCompleted, gameCompletedAt }`

#### Check Access
- **GET** `/api/game/check-access`
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, message, canPlay }`
- **Note**: Returns 403 if user has already completed the game

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Game Completion Rule

Once a player completes the game (by calling `/api/game/complete`), they cannot:
- Access game routes that use `checkGameNotCompleted` middleware
- Complete the game again
- Re-enter the game

This is enforced by the `checkGameNotCompleted` middleware which checks the `gameCompleted` flag on the user model.

