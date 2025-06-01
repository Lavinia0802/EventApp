# Event Gallery 📸

A modern full-stack web application for event management and photo sharing. Create events, generate QR codes, and allow guests to upload photos without requiring them to create accounts - all through a simple QR code scan!

![Event Gallery Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Frontend](https://img.shields.io/badge/Frontend-React%2019-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)
![Database](https://img.shields.io/badge/Database-MongoDB-orange)
![Authentication](https://img.shields.io/badge/Auth-Auth0-red)

## 🌟 Overview

Event Gallery is a comprehensive solution for managing events and collecting photos from attendees. Event organizers can create events and generate unique QR codes, while guests can simply scan the code to upload their photos instantly - no app downloads or account creation required.

### ✨ Key Highlights

- **🎯 Zero Friction for Guests**: No app installation or account creation required
- **📱 QR Code Integration**: Generate and scan QR codes for instant access
- **🔐 Secure Authentication**: Auth0-powered authentication for event organizers
- **🌙 Modern UI/UX**: Dark/light theme support with responsive design
- **📁 File Management**: Drag-and-drop photo uploads with batch processing
- **🚀 Production Ready**: Scalable architecture with modern tech stack

## 🏗️ Architecture

```
Event Gallery
├── 🌐 Frontend (React SPA)
│   ├── User authentication & management
│   ├── Event creation & editing
│   ├── QR code generation & scanning
│   ├── Photo upload interface
│   └── Responsive UI with theming
│
├── ⚡ Backend (Node.js API)
│   ├── RESTful API endpoints
│   ├── Auth0 JWT validation
│   ├── File upload handling
│   ├── QR code generation
│   └── Database operations
│
└── 🗄️ Database (MongoDB)
    ├── Event data storage
    ├── Photo metadata
    └── User associations
```

## 🚀 Features

### For Event Organizers

- **Event Management**: Create, edit, and delete events with detailed information
- **QR Code Generation**: Automatic unique QR code creation for each event
- **Photo Gallery**: View all uploaded photos organized by event
- **Secure Access**: Protected dashboard with Auth0 authentication
- **Export Options**: Download individual photos or bulk export

### For Guests

- **QR Code Scanning**: Built-in camera scanner for quick access
- **Easy Upload**: Drag-and-drop photo upload interface
- **No Registration**: Upload photos without creating accounts
- **Multiple Files**: Support for batch photo uploads
- **Real-time Feedback**: Upload progress and success indicators

### Technical Features

- **Responsive Design**: Mobile-first design that works on all devices
- **Theme Support**: Light and dark themes with system preference detection
- **Performance Optimized**: Lazy loading, code splitting, and optimized builds
- **Error Handling**: Comprehensive error handling and user feedback
- **Security**: JWT-based authentication and input validation

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19.1.0 with Create React App
- **Routing**: React Router DOM 7.5.0
- **UI Library**: Bootstrap 5.3.5 with Bootstrap Icons
- **Authentication**: Auth0 React SDK
- **HTTP Client**: Axios
- **QR Code**: qrcode.react (generation) + html5-qrcode (scanning)
- **File Upload**: React Dropzone
- **State Management**: React Context API

### Backend

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Auth0 JWT Bearer
- **File Handling**: Multer + express-fileupload
- **QR Generation**: qrcode library
- **CORS**: Enabled for frontend integration

### Infrastructure

- **Database**: MongoDB (local or Atlas)
- **Authentication**: Auth0 service
- **File Storage**: Local filesystem (configurable for cloud storage)
- **Environment**: Docker-ready with environment configuration

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or Atlas account)
- **Auth0 Account** (free tier available)
- **Git** for version control

### 1. Clone the Repository

```powershell
git clone <repository-url>
cd EventApp
```

### 2. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
New-Item -Path ".env" -ItemType File

# Add configuration to .env:
# PORT=3001
# MONGO_URI=mongodb://localhost:27017/eventapp
# AUTH0_DOMAIN=your-auth0-domain.auth0.com
# AUTH0_AUDIENCE=your-api-identifier

# Start the backend server
npm start
```

### 3. Frontend Setup

```powershell
# Navigate to frontend directory (from root)
cd frontend/eventapp

# Install dependencies
npm install

# Create environment file
New-Item -Path ".env" -ItemType File

# Add configuration to .env:
# REACT_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com
# REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
# REACT_APP_AUTH0_AUDIENCE=your-api-identifier
# REACT_APP_API_BASE_URL=http://localhost:3001

# Start the development server
npm start
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/

## ⚙️ Configuration

### Auth0 Setup

1. **Create Auth0 Account**: Sign up at [auth0.com](https://auth0.com)

2. **Create Application**:

   - Application Type: Single Page Application
   - Allowed Callback URLs: `http://localhost:3000`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`

3. **Create API**:

   - Identifier: `https://events-api/` (or your preferred identifier)
   - Signing Algorithm: RS256

4. **Update Configuration**:
   - Copy Domain, Client ID, and Audience to environment files
   - Update `src/utils/auth0-config.js` in frontend

## 📖 API Documentation

### Events Endpoints

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| GET    | `/api/events`        | Get user's events | ✅            |
| GET    | `/api/events/:id`    | Get event by ID   | ❌            |
| POST   | `/api/events`        | Create new event  | ✅            |
| PUT    | `/api/events/:id`    | Update event      | ✅            |
| DELETE | `/api/events/:id`    | Delete event      | ✅            |
| GET    | `/api/events/:id/qr` | Get QR code       | ❌            |

### Photos Endpoints

| Method | Endpoint                      | Description      | Auth Required |
| ------ | ----------------------------- | ---------------- | ------------- |
| GET    | `/api/photos/event/:eventId`  | Get event photos | ❌            |
| POST   | `/api/photos/upload/:eventId` | Upload photo     | ❌            |
| DELETE | `/api/photos/:photoId`        | Delete photo     | ✅            |
