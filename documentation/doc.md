# E-Commerce Application - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Authentication & Security](#authentication--security)
6. [Payment Integration](#payment-integration)
7. [API Documentation](#api-documentation)
8. [Deployment](#deployment)
9. [Development Setup](#development-setup)
10. [Environment Configuration](#environment-configuration)
11. [Docker Configuration](#docker-configuration)
12. [Monitoring & Logging](#monitoring--logging)

## Project Overview

This is a full-stack e-commerce application built with a microservices architecture using Node.js/Express for the backend and React for the frontend. The application features user authentication, shopping cart functionality, order management, and integrated payment processing through Paymob.

### Key Features
- User registration and authentication with JWT tokens
- Product catalog and browsing
- Shopping cart management
- Order placement and tracking
- Mobile wallet payment integration (Paymob)
- Responsive React frontend
- Dockerized deployment with Docker Compose

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│  (PostgreSQL)   │
│   Port: 8080    │    │   Port: 4000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │  (Caching)      │
                       │   Port: 6379    │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Paymob API    │
                       │ (Payment Gateway)│
                       └─────────────────┘
```

### Directory Structure
```
e-commerce-app/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Authentication & validation
│   │   ├── services/       # Business logic & integrations
│   │   ├── database/       # Database configuration
│   │   └── seeder/         # Database seeders
│   └── Dockerfile
├── frontend/               # React application
│   └── react-auth-app/
│       ├── src/
│       │   ├── components/ # Reusable UI components
│       │   ├── pages/      # Route components
│       │   ├── contexts/   # React contexts
│       │   └── api/        # API client functions
│       └── Dockerfile
├── docker-compose.yaml     # Multi-container orchestration
└── documentation/
    └── doc.md             # This file
```

## Technology Stack

### Backend
- **Runtime**: Node.js 22.x
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL 16 (Alpine)
- **ORM**: Sequelize 6.37.7
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcrypt 6.0.0
- **Caching**: Redis (Alpine)
- **Payment Gateway**: Paymob API Integration

### Frontend
- **Framework**: React 19.1.0
- **Build Tool**: Vite 6.3.5
- **Routing**: React Router DOM 7.6.3
- **HTTP Client**: Axios 1.10.0
- **Styling**: CSS3 with modular components

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (Alpine) for frontend
- **Process Management**: Multi-stage Docker builds
- **Environment**: Development/Production configurations

### Development Tools
- **Linting**: ESLint 9.25.0
- **Development Server**: Nodemon 3.1.10 (backend), Vite dev server (frontend)
- **API Testing**: Built-in testing capabilities

## Database Schema

### Entity Relationship Diagram
```sql
Users (1) ──── (M) Cart_Items (M) ──── (1) Products
  │                                        │
  │                                        │
  └─── (1:M) Orders (1) ──── (M) Order_Items (M) ────┘
```

### Tables

#### Users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Products
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    image_url VARCHAR(255),
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Cart_Items
```sql
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Orders
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Order_Items
```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Authentication & Security

### JWT Token Strategy
- **Access Tokens**: 15-minute expiry for API access
- **Refresh Tokens**: 7-day expiry for token renewal
- **Storage**: HTTP-only cookies for security
- **Middleware**: Route protection with token validation

### Security Implementations
```javascript
// Password hashing with bcrypt
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// JWT token generation
const accessToken = jwt.sign(
    { userId, email }, 
    process.env.ACCESS_TOKEN_SECRET, 
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
);

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
```

### Protected Routes
- Authentication middleware validates JWT tokens
- Route-level protection for user-specific resources
- Session management with automatic token refresh

## Payment Integration

### Paymob Mobile Wallet Integration

The application integrates with Paymob's mobile wallet API for payment processing:

#### Payment Flow
1. **Authentication**: Get auth token from Paymob API
2. **Order Creation**: Create order with line items
3. **Payment Token**: Generate payment token for transaction
4. **Mobile Wallet Request**: Process mobile wallet payment
5. **Callback Handling**: Process payment confirmation/failure

#### Key Components
```javascript
class PaymobService {
    constructor() {
        this.apiKey = 'YOUR_API_KEY';
        this.secretKey = 'YOUR_SECRET_KEY';
        this.integrationId = '5211141'; // Mobile Wallet Integration
        this.baseURL = 'https://accept.paymob.com/api';
    }

    async processPayment(orderData, customerData) {
        // 1. Get auth token
        const authToken = await this.getAuthToken();
        
        // 2. Create order
        const order = await this.createOrder(authToken, orderData);
        
        // 3. Generate payment token
        const paymentToken = await this.createPaymentToken(authToken, order, customerData);
        
        // 4. Process mobile wallet payment
        return await this.processMobileWalletPayment(paymentToken, customerData.phoneNumber);
    }
}
```

#### Supported Payment Methods
- **Mobile Wallets**: Vodafone Cash, Orange Money, Etisalat Cash
- **Integration Type**: API-based with callback handling
- **Currency**: Egyptian Pound (EGP)

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
    "username": "string",
    "email": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string"
}
```

**Response:**
```json
{
    "message": "User registered successfully",
    "user": {
        "id": "number",
        "username": "string",
        "email": "string"
    }
}
```

#### POST /api/auth/login
Authenticate user and receive tokens.

**Request Body:**
```json
{
    "email": "string",
    "password": "string"
}
```

**Response:**
```json
{
    "message": "Login successful",
    "user": {
        "id": "number",
        "username": "string",
        "email": "string"
    }
}
```

### Product Endpoints

#### GET /api/products
Retrieve all products with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category

**Response:**
```json
{
    "products": [
        {
            "id": "number",
            "name": "string",
            "description": "string",
            "price": "number",
            "stock_quantity": "number",
            "image_url": "string",
            "category": "string"
        }
    ],
    "totalPages": "number",
    "currentPage": "number"
}
```

### Cart Endpoints

#### GET /api/cart
Get current user's cart items.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
    "cartItems": [
        {
            "id": "number",
            "product_id": "number",
            "quantity": "number",
            "product": {
                "name": "string",
                "price": "number",
                "image_url": "string"
            }
        }
    ],
    "totalAmount": "number"
}
```

#### POST /api/cart/add
Add item to cart.

**Request Body:**
```json
{
    "product_id": "number",
    "quantity": "number"
}
```

### Order Endpoints

#### POST /api/orders/create
Create a new order from cart items.

**Request Body:**
```json
{
    "paymentMethod": "mobile_wallet",
    "phoneNumber": "string"
}
```

**Response:**
```json
{
    "order": {
        "id": "number",
        "total_amount": "number",
        "status": "string",
        "payment_url": "string"
    }
}
```

## Deployment

### Docker Compose Architecture

The application uses Docker Compose for orchestration with the following services:

#### Services Configuration
```yaml
services:
  frontend:
    build: ./frontend/react-auth-app
    ports: ["8080:80"]
    depends_on: [backend]
    
  backend:
    build: ./backend
    ports: ["4000:4000"]
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://postgres:admin@postgres:5432/e-commerce
      
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      
  redis:
    image: redis:alpine
    ports: ["6379:6379"]
    volumes: [redis_data:/data]
```

### Multi-Stage Docker Builds

#### Backend Dockerfile
```dockerfile
# Build stage
FROM node:20 AS node-builder
WORKDIR /build
COPY package.json ./
RUN npm install
COPY src/ ./src/

# Production stage
FROM alpine:3.19
RUN apk add --update nodejs bash
RUN addgroup -S node && adduser -S node -G node
USER node
WORKDIR /home/node/code
COPY --from=node-builder --chown=node:node /build .
EXPOSE 4000
```

#### Frontend Dockerfile
```dockerfile
# Build stage
FROM node:20 AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /build/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### Deployment Commands

#### Development Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build
```

#### Production Deployment
```bash
# Production build with optimizations
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose up --scale backend=3 --scale frontend=2
```

## Development Setup

### Prerequisites
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 20+ (for local development)
- **Git**: Latest version

### Local Development Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd e-commerce-app
```

2. **Environment Configuration**
```bash
# Backend environment
cp backend/.env.example backend/.env

# Configure environment variables
# Database, JWT secrets, Paymob credentials
```

3. **Docker Development**
```bash
# Start development environment
docker-compose up -d

# Monitor logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

4. **Local Development (Alternative)**
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend/react-auth-app
npm install
npm run dev
```

### Database Setup

#### Initialize Database
```bash
# Database will be initialized automatically with init.sql
# Seed data (optional)
docker-compose exec backend npm run seed
```

#### Database Migrations
```bash
# Run migrations
docker-compose exec backend npm run migrate

# Rollback migration
docker-compose exec backend npm run migrate:undo
```

## Environment Configuration

### Backend Environment Variables
```bash
# Database Configuration
DB_USER=postgres
DB_HOST=postgres
DB_NAME=e-commerce
DB_PASSWORD=admin
DB_PORT=5432
DATABASE_URL=postgresql://postgres:admin@postgres:5432/e-commerce

# Server Configuration
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:8080

# JWT Configuration
ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Paymob Configuration
PAYMOB_API_KEY=your-paymob-api-key
PAYMOB_SECRET_KEY=your-paymob-secret-key
PAYMOB_PUBLIC_KEY=your-paymob-public-key
PAYMOB_INTEGRATION_ID=5211141
```

### Frontend Environment Variables
```bash
# API Configuration
VITE_API_URL=http://localhost:4000

# Build Configuration
VITE_NODE_ENV=development
```

### Production Environment
```bash
# Use production-ready secrets
ACCESS_TOKEN_SECRET=$(openssl rand -hex 64)
REFRESH_TOKEN_SECRET=$(openssl rand -hex 64)

# Production database
DATABASE_URL=postgresql://user:password@prod-db:5432/ecommerce

# Production client URL
CLIENT_URL=https://yourdomain.com
```

## Docker Configuration

### Network Architecture
```yaml
networks:
  app-network:
    driver: bridge
```

**Benefits:**
- Isolated container communication
- Service discovery by name
- Security through network isolation

### Volume Management
```yaml
volumes:
  postgres_data:     # Persistent database storage
  redis_data:        # Persistent cache storage
```

**Data Persistence:**
- Database data survives container restarts
- Redis cache persistence for performance
- Backup and restore capabilities

### Health Checks
```yaml
postgres:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 5s
    timeout: 5s
    retries: 5
```

**Monitoring:**
- Automatic service health monitoring
- Dependency management with health checks
- Graceful service startup ordering

## Monitoring & Logging

### Application Logs
```javascript
// Structured logging in backend
console.log('🔄 Syncing database models...');
console.log('✅ Products table synced successfully');
console.error('❌ Error getting auth token:', error.message);
```

### Database Monitoring
```bash
# Check database connections
docker-compose exec postgres pg_isready -U postgres

# View database logs
docker-compose logs postgres

# Monitor query performance
docker-compose exec postgres psql -U postgres -d e-commerce -c "SELECT * FROM pg_stat_activity;"
```

### Performance Monitoring
```bash
# Container resource usage
docker stats

# Service-specific metrics
docker-compose exec backend top
docker-compose exec frontend top
```

### Log Aggregation
```bash
# Centralized logging
docker-compose logs -f --tail=100

# Service-specific logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

## Security Considerations

### Production Security Checklist

#### Environment Security
- [ ] Use strong, unique JWT secrets (64+ characters)
- [ ] Enable HTTPS/SSL in production
- [ ] Use environment-specific database credentials
- [ ] Implement rate limiting on API endpoints
- [ ] Enable CORS only for trusted domains

#### Database Security
- [ ] Use non-default database passwords
- [ ] Enable database SSL connections
- [ ] Implement database connection pooling
- [ ] Regular database backups
- [ ] Database access logging

#### Container Security
- [ ] Use non-root users in containers
- [ ] Scan images for vulnerabilities
- [ ] Implement resource limits
- [ ] Regular image updates
- [ ] Network segmentation

#### Application Security
- [ ] Input validation and sanitization
- [ ] SQL injection prevention (Sequelize ORM)
- [ ] XSS protection with content security policy
- [ ] Secure cookie configuration
- [ ] Regular dependency updates

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database status
docker-compose ps postgres

# Verify database connectivity
docker-compose exec backend npm run test:db

# Reset database
docker-compose down -v
docker-compose up -d
```

#### Authentication Problems
```bash
# Check JWT secrets
docker-compose exec backend printenv | grep TOKEN

# Verify cookie settings
# Check browser developer tools > Application > Cookies
```

#### Payment Integration Issues
```bash
# Test Paymob connectivity
docker-compose exec backend npm run test:paymob

# Check Paymob credentials
# Verify integration ID in Paymob dashboard
```

#### Container Issues
```bash
# Rebuild containers
docker-compose build --no-cache

# Check container logs
docker-compose logs --tail=50 <service-name>

# Restart specific service
docker-compose restart <service-name>
```

### Performance Optimization

#### Database Optimization
- Index frequently queried columns
- Implement database connection pooling
- Use Redis for caching frequently accessed data
- Optimize Sequelize queries with includes

#### Frontend Optimization
- Implement code splitting with React.lazy()
- Use React.memo for component optimization
- Implement virtual scrolling for large lists
- Optimize bundle size with tree shaking

#### Backend Optimization
- Implement API response caching
- Use compression middleware
- Optimize database queries
- Implement request/response logging

---

## Conclusion

This e-commerce application demonstrates a modern, scalable architecture using contemporary web technologies. The containerized deployment ensures consistency across environments, while the modular structure allows for easy maintenance and feature additions.

For additional support or contributions, please refer to the project repository and submit issues or pull requests following the established guidelines.

**Last Updated**: September 19, 2025
**Version**: 1.0.0
**Author**: E-Commerce Development Team