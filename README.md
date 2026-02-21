# 🚀 Coding Competition Platform

A secure, fair, and immersive coding assessment platform with authentication, real-time code execution, and 15+ curated problems across multiple programming languages.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Guide](#setup-guide)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Docker Support](#docker-support)
- [Security](#security)

---

## ✨ Features

### 🔐 Authentication System
- **User Registration**: Secure signup with email validation
- **Login**: JWT-based authentication with 7-day token expiration
- **Google OAuth**: Seamless login with Google accounts
- **Password Management**: 
  - Secure password hashing (bcrypt with 10 rounds)
  - Forgot password with email-based reset
  - 15-minute expiring reset tokens
- **Profile Management**: Protected user profile endpoint

### 💻 Coding Problems
- **15 Comprehensive Problems** across 5 test categories:
  - Test 1: Basic Operations
  - Test 2: String Manipulation
  - Test 3: Array Operations
  - Test 4: Algorithms
  - Test 5: Advanced Problems
- **3 Difficulty Levels**: Easy, Medium, Hard
- **5 Test Cases** per problem (75 total)
- **Multi-Language Support**: JavaScript, Python, Java, C, C++

### ⚡ Code Execution
- Real-time code compilation and execution
- Isolated sandbox environments (Docker-based)
- Instant test case feedback
- Error diagnostics with stderr output
- Resource limits (CPU, memory, time)

### 🔒 Security
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization)
- CSRF protection (built-in with express)
- Helmet security headers
- CORS configuration
- Input validation (express-validator)

### 📧 Email Service
- SendGrid integration for password reset emails
- Professional HTML email templates
- Graceful fallback if email service unavailable

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (ES6 modules)
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL with pg 8.10.0
- **Authentication**: JWT (jsonwebtoken 9.0.0), Passport.js with Google OAuth 2.0
- **Security**: Bcrypt 5.1.0, Helmet 6.0.1
- **Email**: SendGrid @sendgrid/mail 7.7.0
- **Validation**: express-validator 7.0.0

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite
- **Styling**: CSS
- **API Client**: Axios/Fetch

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Languages**: Python 3, Java, Node.js, GCC (C/C++)

---

## 📁 Project Structure

```
coding-platform/
├── server/                              # Backend application
│   ├── start.js                        # Entry point (dotenv loader)
│   ├── server.js                       # Main Express app
│   ├── package.json                    # Dependencies
│   ├── .env                            # Environment variables (gitignored)
│   ├── Dockerfile                      # Container definition
│   └── src/
│       ├── config/
│       │   ├── passport.js            # Google OAuth configuration
│       │   └── db.js                  # PostgreSQL connection pool
│       ├── controllers/
│       │   ├── authController.js      # Local auth business logic
│       │   └── googleAuthController.js # Google OAuth logic
│       ├── middleware/
│       │   └── authMiddleware.js      # JWT verification
│       ├── models/
│       │   └── User.js                # PostgreSQL user schema
│       ├── routes/
│       │   └── authRoutes.js          # Authentication endpoints
│       └── utils/
│           └── sendEmail.js           # SendGrid integration
│
├── src/                                 # Frontend application
│   ├── App.js                          # Main React component
│   ├── App.css                         # Styling
│   ├── problems.js                     # 15 coding problems
│   ├── components/
│   │   ├── AuthForm.jsx               # Login/Signup UI
│   │   ├── Account.jsx                # User profile
│   │   ├── ForgotPassword.jsx         # Password reset request
│   │   └── ResetPassword.jsx          # New password form
│   └── services/
│       └── authService.js             # API client
│
├── judge/                               # Code execution images
│   └── images/
│       ├── python/                    # Python runner
│       ├── java/                      # Java runner
│       ├── node/                      # Node.js runner
│       ├── c/                         # C compiler
│       └── cpp/                       # C++ compiler
│
├── public/                              # Static assets
├── docker-compose.yml                   # Container orchestration
├── package.json                         # Frontend dependencies
├── README.md                            # This file
├── SCHEMA.md                            # Database schema
├── PR_CHECKLIST.md                      # PR verification
├── QUICKSTART.md                        # Quick setup guide
└── .gitignore                           # Git ignore rules
```

---

## 🎯 Prerequisites

- **Node.js**: 14.0.0 or higher
- **PostgreSQL**: 12.0 or higher (running on localhost:5432)
- **Docker** (optional): For code execution sandboxing
- **Git**: For version control

---

## 🚀 Setup Guide

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd coding-platform
```

### Step 2: Install Dependencies

**Frontend**:
```bash
npm install
```

**Backend**:
```bash
cd server
npm install
cd ..
```

### Step 3: Setup PostgreSQL

Create database:
```bash
psql -U postgres
```

```sql
CREATE DATABASE "coding-platform";
```

### Step 4: Create Environment Variables

Create `server/.env`:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/coding-platform
JWT_SECRET=your-super-secret-key-change-in-production
SENDGRID_API_KEY=SG.your-sendgrid-key-here
EMAIL_FROM=Coding Platform <noreply@codingplatform.com>
FRONTEND_URL=http://localhost:3000
```

### Step 5: Start Backend

```bash
cd server
npm run dev
```

**Expected output**:
```
✅ PostgreSQL connected successfully
✅ Database schema initialized
✅ Server listening on port 3001
```

### Step 6: Start Frontend (in new terminal)

```bash
npm start
```

**Expected output**:
```
✅ Compiled successfully!
✅ Opening http://localhost:3000 in browser
```

### Step 7: Test the Application

1. **Sign Up**: Click "Sign in" → "Create new account" → Fill form → Submit
2. **Sign In**: Enter email and password
3. **View Profile**: See account information
4. **Forgot Password**: Test password reset flow
5. **View Problems**: See 15 problems with difficulty levels

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201)**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Sign In
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200)**:
```json
{
  "message": "Sign in successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Get User Profile (Protected)
```http
GET /auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2026-02-17T10:30:00Z"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response (200)**:
```json
{
  "message": "Password reset email sent",
  "token": "abc123def456..." 
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "abc123def456...",
  "password": "NewSecurePass456!"
}
```

**Response (200)**:
```json
{
  "message": "Password reset successful"
}
```

---

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret for signing JWT tokens | `your-super-secret-key` |
| `SENDGRID_API_KEY` | SendGrid API key for emails | `SG.xxxxx` |
| `EMAIL_FROM` | Default sender email | `noreply@codingplatform.com` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

---

## 🧪 Running Tests

### Manual Testing

**Sign Up Flow**:
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Sign In Flow**:
```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Protected Endpoint**:
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Database Verification
```bash
# Connect to database
psql -U postgres -d coding-platform

# Check users table
SELECT * FROM users;
```

---

## 🐳 Docker Support

### Build judge images for code execution
```bash
docker build -t coding-judge-python judge/images/python
docker build -t coding-judge-java   judge/images/java
docker build -t coding-judge-node   judge/images/node
docker build -t coding-judge-c      judge/images/c
docker build -t coding-judge-cpp    judge/images/cpp
```

### Run with Docker Compose
```bash
docker-compose up
```

---

## 🔒 Security

### Implementation Details

- **Password Hashing**: Bcrypt with 10 salt rounds
- **Token Strategy**: JWT with HS256 algorithm
- **Token Expiry**: 7 days
- **Reset Tokens**: Hashed with 15-minute expiry
- **SQL Injection**: Prevented via parameterized queries
- **Password Reset**: Secure token generation using crypto
- **CORS**: Configured for frontend origin only
- **Headers**: Helmet.js for security headers
- **Input Validation**: express-validator for all inputs

### Best Practices Implemented

✅ No passwords logged  
✅ No secrets in code (environment variables only)  
✅ No sensitive data in localStorage  
✅ HTTPS-ready (use in production)  
✅ Protected routes require authentication  
✅ Rate limiting ready (can add with express-rate-limit)  
✅ Error messages don't leak information  

---

## 📱 Database Schema

### users table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  password_reset_token VARCHAR(255),
  password_reset_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes with clear commits
3. Test thoroughly before submitting PR
4. Ensure no secrets are committed (.env is gitignored)
5. Update documentation as needed

---

## 📚 Coding Problems

The platform includes 15 pre-configured problems:

### Test 1: Basic Operations
- Reverse a number
- Find max/min
- Count digits

### Test 2: String Manipulation
- Palindrome checker
- String reversal
- Character frequency

### Test 3: Array Operations
- Array sum
- Find duplicate
- Rotate array

### Test 4: Algorithms
- Binary search
- Sort algorithm
- Hash problems

### Test 5: Advanced Problems
- Dynamic programming
- Graph algorithms
- Complex logic

Each problem includes:
- Problem description
- Input/output format
- 5 test cases
- Support for all 5 languages (JS, Python, Java, C, C++)

---

## 🚀 Deployment

### Production Checklist

- [ ] Update DATABASE_URL to production database
- [ ] Change JWT_SECRET to strong random value
- [ ] Update SENDGRID_API_KEY for production SendGrid account
- [ ] Set NODE_ENV=production
- [ ] Update FRONTEND_URL to production domain
- [ ] Enable HTTPS
- [ ] Setup database backups
- [ ] Configure monitoring/logging
- [ ] Review security audit
- [ ] Load test the platform

---

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Quick setup and testing guide
- **[PR_CHECKLIST.md](PR_CHECKLIST.md)** - Complete feature checklist
- **[SCHEMA.md](SCHEMA.md)** - Database schema documentation
- **[CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md)** - PR cleanup details

---

## 📞 Support

For issues or questions:

1. Check the documentation files above
2. Review the backend console logs for error messages
3. Verify PostgreSQL is running: `psql -U postgres`
4. Clear Node cache: `rm -rf node_modules && npm install`
5. Kill stray Node processes: `taskkill /F /IM node.exe`

---

## 📄 License

This project is part of the OSL platform initiative.

---

## ✅ Status

**Ready for Production** ✅

- Authentication system complete
- Password reset fully functional
- 15 coding problems with test cases
- Multi-language support enabled
- Security best practices implemented
- Documentation complete





