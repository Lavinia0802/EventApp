# Event Gallery Frontend

A modern React web application for managing events and photo sharing with QR code integration. This frontend provides an intuitive user interface for creating events, generating QR codes, and allowing guests to upload photos without requiring accounts.

## 🚀 Features

- **Event Management**: Create, edit, view, and delete events
- **QR Code Generation**: Automatic QR code generation for easy guest access
- **Photo Upload**: Drag-and-drop photo upload with support for multiple files
- **QR Code Scanner**: Built-in scanner for reading event QR codes
- **Authentication**: Secure Auth0 integration for event creators
- **Dark/Light Theme**: Toggle between dark and light themes with system preference detection
- **Responsive Design**: Mobile-first responsive design using Bootstrap 5
- **Guest Access**: Photo upload without requiring guest authentication

## 🛠️ Tech Stack

- **Framework**: React 19.1.0
- **Routing**: React Router DOM 7.5.0
- **Authentication**: Auth0 React SDK
- **UI Framework**: Bootstrap 5.3.5 with Bootstrap Icons
- **HTTP Client**: Axios for API communication
- **QR Code**: qrcode.react for generation, html5-qrcode for scanning
- **File Upload**: React Dropzone for drag-and-drop functionality
- **Build Tool**: Create React App with CRACO for configuration
- **State Management**: React Context API for theme and authentication

## ⚙️ Environment Configuration

Create a `.env` file in the frontend root directory:

```env
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
REACT_APP_AUTH0_AUDIENCE=your-api-identifier

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Backend API running (see backend README)

### Installation

1. **Navigate to the frontend directory**

   ```bash
   cd EventApp/frontend/eventapp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   - Create a `.env` file in the frontend root
   - Configure Auth0 and API settings
   - Update `src/utils/auth0-config.js` with your Auth0 settings

4. **Start the development server**
   ```bash
   npm start
   ```

The application will start on `http://localhost:3000`.

## 🔧 Available Scripts

- **`npm start`**: Runs the app in development mode
- **`npm build`**: Builds the app for production
- **`npm test`**: Launches the test runner
- **`npm run eject`**: Ejects from Create React App (one-way operation)

## 🎨 Theme System

The application features a comprehensive theming system with:

### Theme Features

- **Auto-detection**: System preference detection on first visit
- **Persistence**: Theme choice saved in localStorage
- **Dynamic switching**: Toggle between light and dark modes
- **Bootstrap integration**: Full Bootstrap component theming
- **CSS Variables**: Centralized color management

### Theme Toggle

Users can switch themes via:

- Navbar toggle button (sun/moon icon)
- Automatic system preference detection
- Persistent user preference storage

## 🔐 Authentication

### Auth0 Integration

- **Single Sign-On**: Secure authentication via Auth0
- **Protected Routes**: Route-level authentication guards
- **User Profile**: Access to user information and preferences

### Route Protection

- **Public Routes**: Home, Photo Upload (via QR code)
- **Protected Routes**: Event management, QR code generation
- **Automatic Redirect**: Unauthenticated users redirected to home

## 📱 Key Features

### Event Management

- **Create Events**: Form-based event creation with validation
- **Edit Events**: In-place editing of event details
- **Delete Events**: Confirmation-based event deletion
- **Event Dashboard**: Overview of all user events

### QR Code Integration

- **Generation**: Automatic unique QR code for each event
- **Display**: Downloadable QR code images
- **Scanning**: Built-in camera-based QR scanner
- **Guest Access**: Direct photo upload via QR code

### Photo Upload

- **Drag & Drop**: Intuitive file upload interface
- **Multiple Files**: Batch upload support
- **Progress Indication**: Upload progress feedback
- **File Validation**: Type and size validation
- **Guest Friendly**: No authentication required for uploads

## 🎯 User Experience

### Navigation

- **Responsive Navbar**: Mobile-friendly navigation
- **Theme Toggle**: Accessible theme switching
- **Authentication Status**: Clear login/logout indicators
- **Breadcrumb Navigation**: Clear page hierarchy

### Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Bootstrap Grid**: Responsive layout system
- **Touch Friendly**: Large touch targets
- **Cross-Browser**: Modern browser compatibility

## 🔧 Configuration

### CRACO Configuration

The project uses CRACO to customize Create React App:

```javascript
// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Custom webpack configuration
      // Excludes html5-qrcode from source maps
      return webpackConfig;
    },
  },
};
```

### API Configuration

API communication is centralized in `src/utils/api.js`:

```javascript
// Base API configuration
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

// Automatic token injection
// Request/response interceptors
// Error handling
```
