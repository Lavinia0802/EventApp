# Event Management Backend API

A robust Node.js/Express backend API for managing events with photo sharing capabilities, QR code generation, and Auth0 authentication.

## 🚀 Features

- **Event Management**: Create, read, update, and delete events
- **Photo Sharing**: Upload and manage event photos
- **QR Code Integration**: Generate unique QR codes for each event
- **Authentication**: Secure Auth0 JWT-based authentication
- **File Upload**: Support for photo uploads with validation
- **Database**: MongoDB with Mongoose ODM
- **CORS Enabled**: Cross-origin resource sharing for frontend integration

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Auth0 (express-oauth2-jwt-bearer)
- **File Upload**: Multer & express-fileupload
- **QR Code**: qrcode library
- **Environment**: dotenv for configuration

## 🏗️ Project Structure

```
backend/
├── server.js              # Main application entry point
├── package.json           # Dependencies and scripts
├── config/
│   └── db.js              # MongoDB connection configuration
├── models/
│   ├── Event.js           # Event data model
│   └── Photo.js           # Photo data model
├── routes/
│   ├── eventRoutes.js     # Event-related API endpoints
│   └── photoRoutes.js     # Photo-related API endpoints
└── uploads/               # Static file storage for uploaded photos
```

## ⚙️ Environment Configuration

Create a `.env` file in the backend root directory with the following variables:

```env
# Server Configuration
PORT=3001

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/eventapp
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eventapp

# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Auth0 account for authentication setup

### Installation

1. **Clone the repository** (if not already done)

   ```bash
   git clone <repository-url>
   cd EventApp/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   - Copy the environment template above
   - Replace placeholder values with your actual configuration
   - Save as `.env` in the backend directory

4. **Start MongoDB**

   - For local MongoDB: Ensure MongoDB service is running
   - For MongoDB Atlas: Ensure your connection string is correct

5. **Run the application**
   ```bash
   npm start
   ```

The server will start on `http://localhost:3001` (or your configured PORT).

## 📡 API Endpoints

### Events

| Method | Endpoint             | Description                           | Auth Required |
| ------ | -------------------- | ------------------------------------- | ------------- |
| GET    | `/api/events`        | Get all events for authenticated user | ✅            |
| GET    | `/api/events/:id`    | Get specific event by ID              | ❌            |
| POST   | `/api/events`        | Create new event                      | ✅            |
| PUT    | `/api/events/:id`    | Update existing event                 | ✅            |
| DELETE | `/api/events/:id`    | Delete event                          | ✅            |
| GET    | `/api/events/:id/qr` | Get QR code for event                 | ❌            |

### Photos

| Method | Endpoint                      | Description                 | Auth Required |
| ------ | ----------------------------- | --------------------------- | ------------- |
| GET    | `/api/photos/event/:eventId`  | Get all photos for an event | ❌            |
| POST   | `/api/photos/upload/:eventId` | Upload photo to event       | ❌            |
| DELETE | `/api/photos/:photoId`        | Delete specific photo       | ✅            |

### Base

| Method | Endpoint | Description      |
| ------ | -------- | ---------------- |
| GET    | `/`      | API health check |

## 🔐 Authentication

This API uses Auth0 for authentication with JWT tokens. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Setting up Auth0

1. Create an Auth0 account at [auth0.com](https://auth0.com)
2. Create a new API in your Auth0 dashboard
3. Configure the audience and domain in your `.env` file
4. Set up your frontend application to authenticate with Auth0

## 📁 File Upload

The API supports photo uploads with the following specifications:

- **Supported formats**: JPEG, JPG, PNG, GIF
- **File size limit**: 50MB (configurable)
- **Storage**: Local filesystem in `/uploads` directory
- **Validation**: File type and size validation included
