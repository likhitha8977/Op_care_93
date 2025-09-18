# OPcare Backend

A Node.js + Express backend for the OPcare hospital booking website.

## Features
- User authentication (JWT)
- Hospital listing & search
- Booking management
- Profile management
- Medical records upload
- Notifications

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file (see `.env.example`).
3. Start the server:
   ```bash
   npm start
   ```

## Folder Structure
- `models/` - Mongoose models
- `routes/` - Express routes
- `controllers/` - Route logic
- `middleware/` - Auth & error middleware

## API Endpoints
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/hospitals` - List hospitals
- `GET/POST/PUT/DELETE /api/bookings` - Manage appointments
- `GET/PUT /api/profile` - Get/update profile
- `GET/POST /api/records` - Upload/view medical records
- `GET /api/notifications` - Get notifications

