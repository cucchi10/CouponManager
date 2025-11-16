<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="150" alt="Nest Logo" /></a>
</p>

# 🏗️ NestJS Boilerplate + Coupon Book System

A production-ready **NestJS** boilerplate with enterprise-grade architecture, TypeORM, Redis caching, comprehensive observability, and a complete **Coupon Book Management System**.

## 🚀 Quick Start

**Want to start testing quickly?**

👉 **[View Quick Start Guide](docs/QUICK_START.md)** – Setup, environment variables, authentication, and Postman examples.

📮 **[Complete Postman Collection](postman/README.md)** – Full automated flow: Login → Create Book → Generate Codes → Assign → Lock → Redeem

## 📖 Overview

This project provides a solid foundation for building scalable server-side applications with **NestJS**, plus a fully implemented **Coupon Book System** demonstrating real-world patterns for:
- ✅ Multi-layer concurrency control
- ✅ Distributed locking with Redis
- ✅ Optimistic locking with PostgreSQL
- ✅ Pattern-based code generation
- ✅ RESTful API design
- ✅ Scalable AWS deployment

## 🎟️ **Featured: Coupon Book System**

Complete coupon management implementation with:
- **14 RESTful endpoints** for coupon lifecycle
- **Multi-layer locking** (Redis + Database + Optimistic)
- **Flexible redemption rules** (single or multi-use)
- **Pattern-based generation** (`SUMMER{XXXX}`)
- **Optimized batch inserts** (5000 codes per batch using PostgreSQL `unnest`)
- **High-performance code generation** (10k codes in ~2-5 seconds, 100k in ~20-30 seconds)
- **Concurrency handling** for 1000+ concurrent redemptions
- **Complete documentation** (architecture, deployment, usage)

📚 **[View Complete System Documentation](docs/TECHNICAL_DESIGN_PROPOSAL.md)**

## 🏗️ Architecture & Technologies

### **Core Technologies**

- **NestJS v11** - Framework for building efficient and scalable server-side applications
- **Node.js v22+** - Runtime environment
- **TypeScript v5.7+** - Type-safe development with strict configuration
- **PostgreSQL** - Relational database for data persistence
- **Redis** - In-memory cache for high-performance caching
- **Swagger/OpenAPI** - API documentation and testing interface
- **Joi** - Schema validation for environment variables
- **class-validator & class-transformer** - DTO validation and transformation

### **Security & Authentication**

- **JWT Authentication** - Token-based authentication system (guards ready)
- **API Key Guards** - API key validation middleware
- **Encryption Interceptor** - Data encryption layer
- **CORS** - Cross-Origin Resource Sharing configuration
- **Timing-Safe Comparisons** - Constant-time comparison utilities to prevent timing attacks

### **Development Tools**

- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **Jest** - Unit and E2E testing
- **Commitlint** - Conventional commits enforcement
- **Simple Git Hooks** - Pre-commit and pre-push validation

### **Cloud & Infrastructure**

- **AWS ECS Fargate** - Container-based deployment (ready for cloud)
- **Redis** - Caching layer with multiple namespace support
- **AWS Secrets Manager** - Secure storage for sensitive configuration
- **Environment Management** - Multi-stage deployment (development/production/staging)

## 📁 Project Structure

```
nestjs-boilerplate/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root application module
│   ├── types/
│   │   ├── express.types.ts       # Express request extensions
│   │   ├── auth.types.ts          # Authentication type extensions
│   │   └── index.ts               # Type exports
│   ├── config/
│   │   ├── app.bootstrap.ts       # Application bootstrap configuration
│   │   ├── app.config.ts          # Global app configuration (CORS, validation, prefix)
│   │   ├── app.constants.ts       # Application constants
│   │   └── environment/           # Environment configuration
│   │       ├── env.keys.ts        # Environment variable keys
│   │       ├── env.schema.ts      # Joi validation schema
│   │       └── index.ts
│   ├── decorators/
│   │   ├── skip-jwt.decorator.ts  # Decorator to skip JWT authentication
│   │   └── skip-response-transform.decorator.ts
│   ├── guards/
│   │   ├── api-key/               # API key authentication guard
│   │   ├── jwt-auth/              # JWT authentication guard
│   │   └── monitoring-auth/       # Monitoring endpoint authentication
│   ├── interceptors/
│   │   ├── encryption.interceptor.ts       # Request/response encryption
│   │   ├── observability.interceptor.ts    # Request logging
│   │   └── response-transform.interceptor.ts  # Standardized success responses
│   ├── middleware/
│   │   └── correlation-id.middleware.ts  # Correlation ID tracking for all requests
│   └── modules/
│       ├── common/                # Shared utilities and components
│       │   ├── dto/               # Common DTOs (encrypted envelopes)
│       │   ├── filters/           # Global exception filters
│       │   │   ├── constants/     # Error code constants
│       │   │   ├── interfaces/    # Response interfaces
│       │   │   ├── utils/         # HTTP status utilities
│       │   │   └── http-exception.filter.ts
│       │   ├── interfaces/        # Common interfaces
│       │   ├── correlation/       # Correlation ID global service
│       │   │   ├── correlation.service.ts   # AsyncLocalStorage wrapper
│       │   │   └── index.ts
│       │   ├── logger/            # Structured logging service
│       │   │   ├── interfaces/    # Log context interfaces
│       │   │   ├── utils/         # PII masking and request logging
│       │   │   │   ├── masking.utils.ts
│       │   │   │   └── request-logger.utils.ts
│       │   │   ├── structured-logger.service.ts  # Pino-based logger
│       │   │   └── index.ts
│       │   ├── security/          # Security utilities
│       │   │   ├── safe-equal.ts  # Constant-time comparison
│       │   │   └── index.ts
│       │   ├── swagger/           # Swagger/OpenAPI documentation
│       │   │   ├── config/        # Swagger configuration
│       │   │   ├── constants/     # Swagger examples and constants
│       │   │   ├── decorators/    # Custom Swagger decorators
│       │   │   ├── dto/           # Swagger DTOs
│       │   │   └── utils/         # Swagger utilities
│       │   └── validation/        # Validation utilities
│       │       ├── constants.ts
│       │       ├── exception.ts   # Custom validation exception
│       │       ├── interfaces.ts
│       │       └── utils.ts
│       ├── auth/                  # Authentication module (MOCK)
│       │   ├── interfaces/
│       │   │   ├── jwt.interface.ts
│       │   │   └── index.ts
│       │   ├── auth.constants.ts
│       │   ├── auth.service.ts    # Mock auth service
│       │   ├── auth.controller.ts
│       │   └── auth.module.ts
│       ├── coupons/               # ⭐ Coupon Book System (COMPLETE)
│       │   ├── books/             # Coupon Books domain
│       │   │   ├── dto/           # Book-related DTOs
│       │   │   ├── entities/      # CouponBook entity
│       │   │   ├── coupon-books.controller.ts
│       │   │   └── coupon-books.service.ts
│       │   ├── coupons/           # Coupons domain
│       │   │   ├── dto/           # Coupon operation DTOs
│       │   │   ├── entities/      # Coupon & CouponAssignment entities
│       │   │   ├── coupons.controller.ts
│       │   │   └── coupons.service.ts
│       │   ├── shared/            # Shared resources
│       │   │   ├── enums/         # CouponStatus enum
│       │   │   └── utils/         # CodeGenerator utility
│       │   └── coupons.module.ts
│       ├── health/                # Health check module
│       │   ├── config/
│       │   ├── constants/
│       │   ├── dto/
│       │   ├── health.controller.ts
│       │   ├── health.module.ts
│       │   └── health.service.ts
│       └── [your-modules]/        # Add your business logic modules here
│   ├── services/                  # Application-level reusable services
│   │   ├── cache/                 # Redis cache configuration
│   │   │   ├── cache-config.constants.ts
│   │   │   ├── cache-config.interfaces.ts
│   │   │   ├── cache-config.service.ts
│   │   │   ├── cache.constants.ts
│   │   │   ├── cache.enums.ts
│   │   │   ├── cache.module.ts
│   │   │   └── cache.service.ts
│   │   ├── database/              # Database configuration
│   │   │   ├── database-config.constants.ts
│   │   │   ├── database-config.interfaces.ts
│   │   │   └── database-config.service.ts
│   │   └── secrets/               # Secret manager service
│   │       └── secrets.service.ts
├── test/                          # E2E, unit and integration tests
├── package.json
├── tsconfig.json
├── nest-cli.json
└── eslint.config.mjs
```

## ✨ Features

### **Core Modules**

#### **Auth Module** (MOCK) 
- JWT token generation and validation
- Mock authentication service (ready to replace with real logic)
- Bearer token support
- Integration with JWT Guard
- Example endpoints for testing

> **⚠️ Important**: This is a **MOCK** implementation. Replace the logic in `AuthService` with your real authentication (database, password hashing, etc.)

#### **Coupons Module** ⭐ **NEW**
- **Complete coupon book management system**
- Create books, upload/generate codes
- **Optimized batch inserts** (5000 codes per batch using PostgreSQL `unnest`)
- **High-performance code generation** (10k codes in ~2-5 seconds, 100k in ~20-30 seconds)
- Random and specific coupon assignment
- Temporary locking during checkout
- Redemption with multi-layer concurrency control
- User coupon tracking and status checks
- Paginated listing with essential info only
- Duplicate validation (name + description)
- Status validation (prevents operations on deactivated books)

#### **Health Module** (`/api/health`)
- Health check endpoints
- Database connectivity check
- Redis connectivity check
- Ready for Kubernetes liveness/readiness probes

#### **Common Module**
- **Exception Filters**: Global exception handling with RFC 7807 compliance
- **Structured Logger**: Pino-based JSON logging with PII masking
- **Swagger Documentation**: Auto-generated API documentation
- **Validation**: Custom validation pipes and decorators
- **Correlation Service**: Global context management with AsyncLocalStorage

### **Security Features**

- **Global API Prefix**: All endpoints are prefixed with `/api`
- **JWT Authentication**: Complete JWT implementation with mock AuthService
- **API Key Validation**: Guard implementation for API key authentication
- **Timing-Safe Comparisons**: `safeEqual` utility for constant-time comparison
- **Skip JWT**: `@SkipJwt()` decorator to bypass JWT authentication
- **Request Validation**: Automatic DTO validation with whitelist and transformation
- **Data Encryption**: Interceptor for encrypting sensitive data
- **CORS Configuration**: Enabled with credentials support

#### **Using JWT Guard**

```typescript
// Protect an endpoint with JWT
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  // Return only data - ResponseTransformInterceptor wraps it
  return {
    userId: req.user.sub,
    email: req.user.email
  };
}

// Make an endpoint public (bypass JWT)
@SkipJwt()
@Get('public-data')
getPublicData() {
  // Return only data - ResponseTransformInterceptor wraps it
  return {
    message: 'No auth required',
    timestamp: new Date().toISOString()
  };
}

// Handle errors by throwing exceptions
@Post('login')
async login(@Body() credentials: LoginDto) {
  const isValid = await this.authService.validate(credentials);
  
  if (!isValid) {
    // Throw exception - HttpExceptionFilter handles it
    throw new UnauthorizedException({
      message: 'Invalid credentials',
      code: ErrorCode.UNAUTHORIZED_ERROR
    });
  }
  
  return { accessToken: 'token...' };
}
```

**Response format (automatic):**
```json
{
  "statusCode": 200,
  "success": true,
  "code": "OK",
  "data": {
    "userId": "123",
    "email": "user@example.com"
  },
  "message": "Request successful",
  "path": "/api/profile",
  "method": "GET",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "correlationId": "uuid"
}
```

> **⚠️ Important**: The `AuthService` is currently a MOCK. Replace the validation logic with your real authentication (database, bcrypt, etc.)
>
> **📝 Note**: Controllers return only data. The `ResponseTransformInterceptor` wraps it automatically. For errors, throw exceptions and `HttpExceptionFilter` handles them.

### **Request Tracking & Observability**

#### **Comprehensive Observability System**

- **Structured JSON Logs**: High-performance logging with Pino and automatic PII masking
- **Distributed Tracing**: Correlation ID and Request ID propagation
- **Context Propagation**: CLS (Continuation Local Storage) for automatic context enrichment
- **Reusable Utilities**: Standardized functions for building log contexts
- **AWS Integration**: Native support for CloudWatch Logs and CloudWatch Metrics

**Key Features:**
- 📝 **Structured Logs**: JSON format with mandatory fields and automatic PII masking
- 🔍 **Request Tracing**: correlationId and requestId automatically added to all logs
- 🎯 **Automatic Context Enrichment**: No need to pass IDs through function parameters
- 🚀 **Zero Config**: Works out of the box with default settings

#### **Correlation Service (Global Context Management)**

A global service that provides easy access to request context from anywhere in the application using AsyncLocalStorage:

**Features:**
- **Global Availability**: Injected automatically without needing to import modules
- **AsyncLocalStorage**: Maintains request context throughout async operations
- **Clean API**: Simple methods to access `correlationId` and `requestId`
- **Type-Safe**: Full TypeScript support
- **No Manual Propagation**: No need to pass IDs as parameters

**Usage Example:**
```typescript
import { Injectable } from '@nestjs/common';
import { CorrelationService } from '@/modules/common/correlation';

@Injectable()
export class YourService {
  constructor(private readonly correlation: CorrelationService) {}

  async processData(id: string) {
    // Get context information without passing as parameters
    const { correlationId, requestId } = this.correlation.getContext();
    
    console.log(`[${correlationId}][${requestId}] Processing data ${id}`);
    
    // Your logic here...
  }
}
```

### **Response Standardization**

The application implements a comprehensive system for standardizing all API responses:

#### **Success Response Format**
```json
{
  "statusCode": 200,
  "success": true,
  "code": "OK",
  "data": {
    "id": 1,
    "name": "John Doe"
  },
  "message": "Request successful",
  "path": "/api/users/1",
  "method": "GET",
  "timestamp": "2025-11-07T10:30:00.000Z",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### **Error Response Format**
```json
{
  "statusCode": 400,
  "success": false,
  "error": "Bad Request",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": ["error detail"]
  },
  "path": "/api/users",
  "method": "POST",
  "timestamp": "2025-11-07T15:30:00.000Z",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### **Documentation**

- **Swagger UI**: Available at `/docs` endpoint
- **JSON Schema**: Available at `/docs-json` endpoint
- **Interactive API Testing**: Try-it-out feature enabled
- **Bearer Authentication**: JWT token support in Swagger UI
- **Postman Collection**: Complete workflow collection available in [`postman/`](postman/README.md) directory

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js v22 or higher
- Yarn package manager
- Docker & Docker Compose (for local development)
- Redis instance (or use Docker Compose)
- PostgreSQL instance (or use Docker Compose)

### **Environment Configuration**

The application uses the following environment variables (validated with Joi):

```env
# Application
NODE_ENV=development              # development | production | staging
SCOPE=development                 # development | production | staging
PORT=8080                         # Application port
LOG_LEVEL=info                    # Logging level (debug | info | warn | error | fatal)

# Cache (Redis) Configuration
CACHE_HOST=localhost              # Cache server host
CACHE_PORT=6379                   # Cache server port
CACHE_PASSWORD=                   # Cache password (optional for local)

# Database Configuration
DB_HOST=localhost                 # Database host
DB_PORT=5432                      # Database port
DB_USERNAME=user                  # Database username
DB_NAME=app_db                    # Database name
DB_PASSWORD=password              # Database password

# Security (configure these for production)
JWT_SECRET=your-jwt-secret        # JWT signing secret
API_KEY=your-api-key              # API key for authentication
ENCRYPTION_KEY=your-encryption-key # Master encryption key
```

### **Installation Steps**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nestjs-boilerplate
   ```

2. **Start local services with Docker Compose**
   
   Create a `docker-compose.yml` file in the root directory:
   
   ```yaml
    version: "3.8"

    services:
      postgres:
        image: postgres:latest
        container_name: postgres
        restart: always
        environment:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: app_db
        ports:
          - "5432:5432"
        volumes:
          - ./data:/var/lib/postgresql/data

      redis:
        image: redis:latest
        container_name: redis
        restart: always
        ports:
          - "6379:6379"

    networks:
      default:
        name: app_network
   ```

   Start the services:
   ```bash
    docker-compose up -d
   ```

3. **Install dependencies**
   ```bash
   yarn install:all
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run in development mode**
   ```bash
   yarn start:dev
   ```

6. **Build the application**
   ```bash
   yarn build
   ```

7. **Run in production mode**
   ```bash
   yarn start:prod
   ```

## 🐳 Docker Compose - Local Development

For local development, you can use Docker Compose to run all required services (PostgreSQL and Redis).

### **Services Included**

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Database server |
| Redis | 6379 | Cache server |

### **Usage**

```bash
# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clears data)
docker-compose down -v
```

### **Accessing Services**

- **PostgreSQL Connection**:
  - Host: `localhost`
  - Port: `5432`
  - Database: `app_db`
  - User: `user`
  - Password: `password`

- **Redis**:
  - Host: `localhost`
  - Port: `6379`
  - No password (local development)

## 📜 Available Scripts

```bash
# Development
yarn start:dev          # Start in development mode with watch
yarn start:debug        # Start in debug mode

# Build & Production
yarn build              # Build the application
yarn start:prod         # Run production build

# Code Quality
yarn lint               # Run ESLint
yarn lint:fix           # Fix ESLint issues
yarn prettier           # Check code formatting
yarn prettier:fix       # Fix code formatting

# Testing
yarn test               # Run unit tests
yarn test:watch         # Run tests in watch mode
yarn test:cov           # Run tests with coverage
yarn test:e2e           # Run end-to-end tests

# Git Hooks
yarn prepare            # Setup git hooks
```

## 🔒 Git Hooks

The project includes automatic code quality checks:

- **Pre-commit**: Runs Prettier and ESLint to format and lint staged files
- **Pre-push**: Runs test suite to ensure code quality
- **Commit-msg**: Validates commit messages follow conventional commits

## 📚 Documentation

### **API Documentation**

Once the application is running, you can access:

- **Swagger UI**: `http://localhost:PORT/docs`
- **JSON Schema**: `http://localhost:PORT/docs-json`

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Interactive testing with authentication
- Try-it-out functionality for all endpoints

## 🧪 Testing

This project follows a structured testing approach:

### Test Structure
```
test/
├── unit/           # Unit tests - Test individual components in isolation
├── integration/    # Integration tests - Test module interactions
└── e2e/            # End-to-end tests - Test complete application flows
```

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Generate coverage report
yarn test:cov

# Run E2E tests (requires database connection)
yarn test:e2e
```

## 🚀 Deployment

The application is designed for deployment on AWS using ECS Fargate:

1. Ensure all required secrets are configured in AWS Secrets Manager
2. Set up ElastiCache Redis instance for caching
3. Set up RDS PostgreSQL instance for database
4. Configure environment variables for the target environment
5. Build Docker image and deploy to ECS Fargate
6. Configure Application Load Balancer for traffic distribution

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.
