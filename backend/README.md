# MyQuoteMate Backend 🚀

A production-ready, Premium-grade SaaS backend for AI-powered contractor quote analysis, built specifically for Australian homeowners.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Features

### Core Functionality
- 📄 **PDF Upload & Processing** - Text extraction + OCR for scanned documents
- 🤖 **AI Analysis** - OpenAI-powered quote analysis with structured output
- 💰 **Tiered Access Control** - Free, Standard, and Premium tiers with backend enforcement
- 💳 **Payment Processing** - Stripe integration with webhook verification
- 🗄️ **Data Retention** - Automated cleanup per Australian Privacy Principles
- 📊 **Audit Logging** - Comprehensive tracking for compliance

### Security
- 🔐 JWT authentication with refresh tokens
- 🛡️ Rate limiting (global + endpoint-specific)
- ✅ Request validation with Joi schemas
- 🚫 NoSQL injection protection
- 🔒 Secure file storage with signed URLs
- 👤 Account lockout after failed login attempts

### Performance & Scalability
- ⚡ Async job processing with Bull queues
- 🔄 Horizontal scaling ready (stateless design)
- 💾 Redis for queue management
- 📈 MongoDB with optimized indexing
- 🗂️ S3-compatible storage

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB 5.0+
- **Cache/Queue**: Redis 6.0+
- **Storage**: AWS S3 / MinIO
- **Payment**: Stripe
- **AI**: OpenAI GPT-4

### Key Dependencies
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bull` - Job queue processing
- `stripe` - Payment processing
- `openai` - AI integration
- `bcryptjs` - Password hashing
- `jsonwebtoken` - Authentication
- `helmet` - Security headers
- `winston` - Logging

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **MongoDB** >= 5.0 ([Download](https://www.mongodb.com/try/download/community))
- **Redis** >= 6.0 ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/downloads))

### External Services Required
- **AWS Account** (for S3 storage)
- **Stripe Account** (for payments)
- **OpenAI API Key** (for AI analysis)
- **SMTP Service** (SendGrid, Gmail, or Mailgun)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourorg/myquotemate-backend.git
cd myquotemate-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your credentials
nano .env
```

**Important**: See [Configuration](#-configuration) section for detailed setup.

### 4. Create Required Directories

```bash
mkdir -p logs uploads
```

### 5. Verify Installation

```bash
# Check Node version
node --version  # Should be >= 18.0.0

# Check MongoDB connection
mongosh --eval "db.version()"

# Check Redis connection
redis-cli ping  # Should return PONG
```

---

## ⚙️ Configuration

### Environment Variables

Edit your `.env` file with the following required variables:

#### 🔴 Critical (Must Change Before Production)

```env
# Generate new secrets using:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

JWT_SECRET=your-generated-secret-here
JWT_REFRESH_SECRET=your-generated-refresh-secret-here
```

#### 🔵 Essential Services

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/myquotemate

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI
OPENAI_API_KEY=sk-your-openai-key-here

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET=myquotemate-documents

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM=noreply@myquotemate.com.au
```

#### 🟢 Optional (Can Use Defaults)

```env
NODE_ENV=development
PORT=3000
API_VERSION=v1
LOG_LEVEL=info
```

### AWS S3 Setup

1. Create an S3 bucket:
```bash
aws s3 mb s3://myquotemate-documents-dev --region ap-southeast-2
```

2. Enable encryption:
```bash
aws s3api put-bucket-encryption \
  --bucket myquotemate-documents-dev \
  --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
```

3. Set up IAM user with these permissions:
   - `s3:PutObject`
   - `s3:GetObject`
   - `s3:DeleteObject`
   - `s3:ListBucket`

### Stripe Setup

1. Get your API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Create products and prices for Standard and Premium tiers
3. Set up webhook endpoint: `https://your-api.com/api/v1/webhooks/stripe`
4. Copy the webhook secret to `.env`

### OpenAI Setup

1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `.env` as `OPENAI_API_KEY`
3. Ensure you have GPT-4 access or change model to `gpt-3.5-turbo`

---

## 🏃 Running the Application

### Development Mode

#### Terminal 1: Start API Server
```bash
npm run dev
```

#### Terminal 2: Start Worker Process
```bash
npm run worker:dev
```

The API will be available at `https://myquotemate-7u5w.onrender.com`

### Production Mode

```bash
# Start API server
npm start

# Start worker (in separate terminal/process)
npm run worker
```

### Using PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start both API and worker
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Monitor
pm2 monit

# Stop all
pm2 stop all
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [
    {
      name: 'myquotemate-api',
      script: './src/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'myquotemate-worker',
      script: './src/workers/server.js',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

---

## 📁 Project Structure

```
myquotemate-backend/
├── src/
│   ├── api/                      # API layer
│   │   ├── controllers/          # Request handlers
│   │   │   ├── AuthController.js
│   │   │   ├── JobController.js
│   │   │   ├── PaymentController.js
│   │   │   ├── UserController.js
│   │   │   └── WebhookController.js
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── rateLimit.middleware.js
│   │   │   └── validation.middleware.js
│   │   └── routes/               # Route definitions
│   │       ├── index.js
│   │       ├── auth.routes.js
│   │       ├── job.routes.js
│   │       ├── payment.routes.js
│   │       ├── user.routes.js
│   │       └── webhook.routes.js
│   ├── config/                   # Configuration files
│   │   ├── app.js
│   │   ├── database.js
│   │   ├── openai.js
│   │   ├── queue.js
│   │   ├── storage.js
│   │   └── stripe.js
│   ├── db/                       # Database
│   │   ├── connection.js
│   │   └── migrations/
│   ├── models/                   # Mongoose models
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Document.js
│   │   ├── Result.js
│   │   ├── Payment.js
│   │   ├── Lead.js
│   │   ├── Supplier.js
│   │   └── AuditLog.js
│   ├── services/                 # Business logic
│   │   ├── ai/
│   │   │   ├── AIOrchestrator.js
│   │   │   └── PromptBuilder.js
│   │   ├── auth/
│   │   │   ├── AuthService.js
│   │   │   └── TokenService.js
│   │   ├── email/
│   │   │   └── EmailService.js
│   │   ├── ocr/
│   │   │   └── OCRService.js
│   │   ├── payment/
│   │   │   └── StripeService.js
│   │   ├── retention/
│   │   │   └── DataRetentionService.js
│   │   └── storage/
│   │       └── StorageService.js
│   ├── utils/                    # Utilities
│   │   ├── logger.js
│   │   ├── errors.js
│   │   ├── retry.js
│   │   └── validator.js
│   ├── workers/                  # Background jobs
│   │   ├── processors/
│   │   │   ├── documentProcessor.js
│   │   │   ├── aiProcessor.js
│   │   │   └── emailProcessor.js
│   │   └── server.js
│   └── server.js                 # Main entry point
├── tests/                        # Test files
│   ├── unit/
│   └── integration/
├── logs/                         # Log files
├── .env                          # Environment variables
├── .env.example                  # Example env file
├── .gitignore                    # Git ignore rules
├── .eslintrc.json               # ESLint config
├── .prettierrc                   # Prettier config
├── package.json                  # Dependencies
├── ecosystem.config.js           # PM2 config
└── README.md                     # This file
```

---

## 📚 API Documentation

### Base URL

```
Development: https://myquotemate-7u5w.onrender.com/api/v1
Production: https://api.myquotemate.com.au/api/v1
```

### Authentication

Include JWT token in requests:

```bash
Authorization: Bearer <your_access_token>
```

### Endpoints Overview

#### Authentication
```
POST   /auth/register         - Register new user
POST   /auth/login            - Login
POST   /auth/refresh          - Refresh access token
POST   /auth/logout           - Logout
GET    /auth/me               - Get current user
```

#### Jobs
```
POST   /jobs                  - Create job & upload PDF
GET    /jobs                  - List user jobs
GET    /jobs/:jobId           - Get job details
DELETE /jobs/:jobId           - Delete job
```

#### Payments
```
POST   /payments/create-intent - Create payment intent
GET    /payments/:paymentId    - Get payment details
```

#### Users
```
GET    /users/me              - Get profile
PUT    /users/me              - Update profile
DELETE /users/me              - Delete account
```

### Request Examples

#### 1. Register User

```bash
curl -X POST https://myquotemate-7u5w.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65abc123...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci...",
      "expiresIn": "7d"
    }
  }
}
```

#### 2. Upload Quote PDF

```bash
curl -X POST https://myquotemate-7u5w.onrender.com/api/v1/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "document=@/path/to/quote.pdf" \
  -F "email=user@example.com" \
  -F "tier=free"
```

#### 3. Create Payment

```bash
curl -X POST https://myquotemate-7u5w.onrender.com/api/v1/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jobId": "abc123",
    "tier": "standard",
    "customerData": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }'
```

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Watch mode
npm run test:watch
```

### Manual API Testing

Use the provided Postman collection or test with curl:

```bash
# Health check
curl https://myquotemate-7u5w.onrender.com/health

# Detailed health check
curl https://myquotemate-7u5w.onrender.com/health/detailed
```

---

## 🚢 Deployment

### Docker Deployment

#### 1. Build Docker Image

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
```

```bash
docker build -t myquotemate-backend .
```

#### 2. Run with Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - mongodb
      - redis

  worker:
    build: .
    command: npm run worker
    env_file:
      - .env
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

volumes:
  mongo-data:
```

```bash
docker-compose up -d
```

### AWS Deployment

1. **Elastic Beanstalk**: Upload `.zip` of your application
2. **ECS/Fargate**: Use Docker containers
3. **EC2**: Run with PM2

### Production Checklist

- [ ] Change all JWT secrets
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or replica set
- [ ] Configure Redis with persistence
- [ ] Enable S3 bucket encryption
- [ ] Set up Stripe live keys
- [ ] Configure SSL/TLS
- [ ] Set up monitoring (CloudWatch, DataDog)
- [ ] Configure log aggregation
- [ ] Set up automated backups
- [ ] Configure auto-scaling
- [ ] Set up CI/CD pipeline
- [ ] Configure CORS for production domain
- [ ] Enable rate limiting at load balancer
- [ ] Set up error tracking (Sentry)

---

## 🔒 Security

### Best Practices Implemented

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT tokens with expiration
- ✅ Rate limiting to prevent abuse
- ✅ NoSQL injection protection
- ✅ XSS protection via Helmet
- ✅ CORS configuration
- ✅ Account lockout mechanism
- ✅ Audit logging
- ✅ Secure file storage
- ✅ Input validation

### Security Recommendations

1. **Secrets Management**: Use AWS Secrets Manager or HashiCorp Vault
2. **Network Security**: Use VPC and security groups
3. **Regular Updates**: Keep dependencies updated
4. **Monitoring**: Set up security alerts
5. **Backups**: Regular automated backups
6. **SSL/TLS**: Use Let's Encrypt or ACM
7. **Penetration Testing**: Regular security audits

---

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Failed

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check connection
mongosh
```

#### Redis Connection Failed

```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server

# Or as service
sudo systemctl start redis
```

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

#### Worker Not Processing Jobs

```bash
# Check Redis connection
redis-cli ping

# Check queue status
redis-cli KEYS "bull:*"

# Restart worker
pm2 restart myquotemate-worker
```

#### OpenAI API Errors

- Check API key is valid
- Verify you have GPT-4 access
- Check rate limits
- Review OpenAI status page

### Logs

```bash
# View logs
tail -f logs/combined.log

# View error logs only
tail -f logs/error.log

# With PM2
pm2 logs myquotemate-api
```

---

## 📖 Additional Documentation

- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Guide](docs/SECURITY.md)
- [Contributing Guide](CONTRIBUTING.md)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

Proprietary - All Rights Reserved

Copyright (c) 2024 MyQuoteMate

---

## 📞 Support

- **Email**: support@myquotemate.com.au
- **Documentation**: https://docs.myquotemate.com.au
- **Issues**: https://github.com/yourorg/myquotemate-backend/issues

---

## 🙏 Acknowledgments

Built with ❤️ for Australian homeowners

**Powered by:**
- Node.js
- MongoDB
- Redis
- OpenAI
- Stripe
- AWS