```markdown
#  Car Gallery Management System

A full-stack enterprise application for managing car galleries with role-based access control, built with Angular 19, Node.js/Express, and PostgreSQL.

##  Quick Navigation
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [Deployment](#deployment)

---

## Overview

The Car Gallery Management System provides a secure platform for users to manage personal car collections while allowing administrators to oversee brand management, user management, and content moderation. The system implements JWT-based authentication, role-based access control, image upload capabilities, and advanced filtering.

**Key Components:**
- **Frontend**: Angular 19 with TypeScript, RxJS
- **Backend**: Node.js with Express.js REST API
- **Database**: PostgreSQL with optimized indexing
- **Security**: JWT tokens, bcrypt hashing, role-based guards

---

## Technology Stack

### Frontend (32.4% TypeScript, 29.8% CSS, 21.8% HTML, 16% JavaScript)
```
Angular 19.2.22 | TypeScript 5.6+ | RxJS 7.8+ | CSS3 | HTML5
```

### Backend
```
Node.js 16+ | Express.js 4.18+ | PostgreSQL 13+ | JWT 9.0+ | Bcrypt 5.1+
```

### Tools & Libraries
```
Multer (File Upload) | Nodemon (Dev) | CORS | Express Validator
```

---

## Features

###  Admin Capabilities
 **Brand Management** - Create and manage car brands
 **Brand Approval** - Review and approve/reject user brand requests
 **User Management** - Edit, suspend, delete users; assign admin roles
 **Car Management** - Edit or delete any user's car listings
 **Bulk Operations** - Add multiple cars to multiple users
 **Account Control** - Suspend/activate user accounts

###  User Capabilities
 **Add Cars** - Create car listings with images
 **Request Brands** - Request new brands for approval
 **Profile Management** - Update personal information
 **Advanced Filtering** - Filter cars by brand, year, model
 **Pagination** - Efficient data browsing
 **Image Upload** - Upload car images with validation

---

## Installation

### Prerequisites
- Node.js v16+ | npm 8+ | Angular CLI 19+ | PostgreSQL 13+

### Frontend Setup
```bash
git clone https://github.com/Rishabh-Dev-Mishra/Angular_Crud.git
cd Angular_Crud
npm install
ng serve
# Navigate to http://localhost:4200
```

### Backend Setup
```bash
git clone <backend-repo-url>
cd backend
npm install
npm run migrate
npm run dev
# Server runs on http://localhost:3000
```

### Environment Configuration

**Frontend** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  tokenKey: 'auth_token'
};
```

**Backend** (`.env`):
```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/car_gallery
JWT_SECRET=your_secret_key
JWT_EXPIRE=24h
CORS_ORIGIN=http://localhost:4200
MULTER_UPLOAD_DIR=./uploads
```

---

## API Endpoints

### Authentication
```
POST /api/auth/register     - Register new user
POST /api/auth/login        - Login user
POST /api/auth/validate     - Validate token
```

### Brands
```
GET  /api/brands                - Get all brands
POST /api/brands                - Create brand (admin)
POST /api/brands/requests       - Request brand (user)
GET  /api/brands/requests       - Get requests (admin)
PATCH /api/brands/requests/:id  - Approve/reject (admin)
```

### Cars
```
GET    /api/cars              - Get all cars (paginated, filterable)
POST   /api/cars              - Add car (user)
PATCH  /api/cars/:id          - Update car
DELETE /api/cars/:id          - Delete car
POST   /api/cars/bulk-add     - Add to multiple users (admin)
```

### Users
```
GET    /api/users             - Get all users (admin)
GET    /api/users/profile     - Get current user
PATCH  /api/users/profile     - Update profile
PATCH  /api/users/:id         - Update user (admin)
PATCH  /api/users/:id/status  - Suspend/activate (admin)
DELETE /api/users/:id         - Delete user (admin)
```

---

## Project Structure

### Frontend
```
src/app/
├── components/
│   ├── auth/        (Login, Register)
│   ├── admin/       (Management panels)
│   ├── user/        (Gallery, Profile)
│   └── shared/      (Navbar, Footer)
├── services/        (API calls)
├── guards/          (Auth, Admin)
├── interceptors/    (JWT, Error)
├── models/          (Interfaces)
└── app.module.ts
```

### Backend
```
src/
├── routes/          (Endpoints)
├── controllers/     (Logic)
├── models/          (Database)
├── middleware/      (Auth, Validation)
├── services/        (Business logic)
└── app.js
```

---

## Authentication & Authorization

### JWT Token
```
Payload: { sub, email, name, role, status }
Expiration: 24 hours
```

### Guards
- **AuthGuard**: Protects authenticated routes
- **AdminGuard**: Protects admin-only routes

### HTTP Interceptor
- Automatically attaches JWT token to requests

---

## Database Schema

### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user'),
  status ENUM('active', 'suspended'),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Brands
```sql
CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Cars
```sql
CREATE TABLE cars (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  brand_id INT REFERENCES brands(id),
  model VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Brand Requests
```sql
CREATE TABLE brand_requests (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  brand_name VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected'),
  requested_at TIMESTAMP DEFAULT NOW()
);
```

---

## Advanced Features

### Image Upload with Multer
- Validates file type and size
- Stores images to /uploads directory
- Max file size: 5MB

### Pagination
- Backend-driven pagination
- Configurable page size
- Total count for UI

### Advanced Filtering
```bash
GET /api/cars?brand=Toyota&year=2023&page=1&limit=10
```

### Bcrypt Password Security
- 10 salt rounds
- Secure password comparison

### Bulk Operations
- Add cars to multiple users simultaneously

---

## Performance Optimizations

 Backend pagination reduces memory
 Database indexes on frequently queried columns
 Angular lazy loading
 Change detection strategy (OnPush)
 HTTP caching

---

## Security Practices

 JWT authentication with expiration
 Role-based access control
 Bcrypt password hashing
 Frontend and backend validation
 CORS configuration
 Environment variables for secrets

---

## Deployment

### Frontend
```bash
ng build --configuration production
# Deploy to Vercel, Netlify, or AWS
```

### Backend
```bash
# Create Procfile: web: npm start
# Deploy to Heroku, Railway, or Render
git push <platform> main
```

---

## Development

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
ng serve
```

---

## Testing

```bash
ng test                    # Frontend tests
ng test --code-coverage   # Coverage report
npm test                  # Backend tests
```

---

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push and open PR

---

## Support

 Email: rishabhdevmishra388@gmail.com


---

**Built with ❤️ by Rishabh Dev Mishra**

*Last Updated: 2026-04-21* | *Status: Active* | *Production Ready: *
```


