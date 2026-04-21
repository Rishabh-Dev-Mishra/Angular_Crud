# Car Gallery Management System

A full-stack enterprise-grade Car Gallery Management platform built with **Angular**, **Node.js/Express**, and **PostgreSQL**. This application implements advanced role-based access control, JWT authentication, and sophisticated image management for a seamless car catalog experience.

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Advanced Features](#advanced-features)
- [Development Workflow](#development-workflow)
- [Performance Optimizations](#performance-optimizations)
- [Security Considerations](#security-considerations)
- [Deployment](#deployment)

---

## Overview

This Car Gallery Management System is a sophisticated multi-tenant application designed for managing vehicle inventories with granular role-based permissions. The platform supports dual-role architecture with comprehensive administrative capabilities and intuitive user interfaces for standard users.

**Key Statistics:**
- TypeScript: 32.4% | CSS: 29.8% | HTML: 21.8% | JavaScript: 16%
- Full CRUD operations with advanced filtering and pagination
- Production-ready security implementation
- Scalable microservices-ready architecture

---

## Technology Stack

### Frontend
- **Angular 19+** - Progressive web framework
- **TypeScript 5+** - Type-safe development
- **RxJS** - Reactive programming library
- **Angular HTTP Client** - HTTP communication with interceptors
- **CSS3 & HTML5** - Modern markup and styling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **JWT (JSON Web Tokens)** - Stateless authentication
- **Bcrypt** - Password hashing and security
- **Multer** - Multipart/form-data file upload handling

### Security & Performance
- **Auth Guards** - Route protection based on roles
- **HTTP Interceptors** - Automatic JWT token injection
- **Pagination** - Backend-driven data optimization
- **CORS** - Cross-origin request handling

---

## Key Features

### Admin Capabilities
- **Brand Management** - Create, edit, and manage car brands available to the platform
- **Brand Approval System** - Review and approve/reject user brand requests
- **User Management** - View, edit, suspend, and activate user accounts
- **Car Management** - Edit or delete any user's car listings
- **Bulk Operations** - Add cars to multiple users simultaneously
- **Role Assignment** - Promote users to admin status
- **Account Control** - Suspend/activate user accounts for compliance

### User Capabilities
- **Car Listings** - Add personal car entries from available brands
- **Brand Requests** - Request new brands for approval by admin
- **Profile Management** - Update personal information and preferences
- **Advanced Filtering** - Filter cars by multiple criteria (brand, model, year, etc.)
- **Image Upload** - Upload car images with Multer-based processing
- **Pagination** - Efficient data browsing with backend pagination

---

## Architecture
