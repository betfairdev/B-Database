# Metadata Platform - TypeScript Monorepo

A production-ready TypeScript monorepo for a metadata-driven, multi-tenant data platform with real-time synchronization capabilities.

## 🏗️ Architecture Overview

This monorepo contains the following packages:

- **@metadata-platform/core** - Core entities, storage abstractions, and business logic
- **@metadata-platform/sync-server** - NestJS-based synchronization server with WebSocket support
- **@metadata-platform/auth-service** - Authentication service with Firebase integration
- **@metadata-platform/local-app** - SQLite-based local application with offline capabilities

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ LTS
- npm 8+
- PostgreSQL (for sync server)
- Redis (for caching and real-time features)

### Installation

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

### Development

```bash
# Start sync server in development mode
npm run dev:sync-server

# Start auth service in development mode
npm run dev:auth-service

# Start local app in development mode
npm run dev:local-app
```

## 📦 Package Details

### Core Package (@metadata-platform/core)

The core package provides:

- **TypeORM Entities**: Full entity definitions with proper relationships and indexes
- **Storage Abstractions**: Interface-based storage layer with multiple adapter support
- **Field Type System**: 50+ built-in field types with validation and formatting
- **Sync Engine**: CRDT-based synchronization with conflict resolution
- **Permissions**: Role-based access control with fine-grained permissions
- **Feature Flags**: Progressive rollout and A/B testing capabilities

Key entities:
- `Tenant` - Multi-tenant organization management
- `User` - User management with roles and permissions
- `DataSource` - External data source connections
- `DataTable` - Logical table/collection definitions
- `DataField` - Field/column definitions with metadata

### Sync Server Package (@metadata-platform/sync-server)

NestJS-based server providing:

- **Real-time Sync**: WebSocket-based real-time synchronization
- **REST API**: Full CRUD operations with OpenAPI documentation
- **Multi-tenancy**: Complete tenant isolation
- **Authentication**: JWT-based authentication with role validation
- **Rate Limiting**: Configurable rate limiting and throttling
- **Health Checks**: Comprehensive health monitoring

Endpoints:
- `POST /api/v1/sync/events` - Submit sync events
- `GET /api/v1/sync/events` - Retrieve sync events
- `GET /api/v1/sync/status` - Get sync status
- `WebSocket /sync` - Real-time sync connection

### Auth Service Package (@metadata-platform/auth-service)

Authentication service featuring:

- **Firebase Integration**: Firebase Admin SDK for token validation
- **JWT Management**: Access and refresh token handling
- **OAuth Support**: Multiple OAuth provider support
- **User Management**: User registration and profile management
- **Session Handling**: Secure session management

### Local App Package (@metadata-platform/local-app)

SQLite-based local application with:

- **Offline Capabilities**: Full offline functionality with sync when online
- **Local Database**: SQLite with TypeORM integration
- **Sync Management**: Automatic synchronization with conflict resolution
- **Plugin System**: Extensible plugin architecture
- **Backup/Restore**: Complete data backup and restore functionality

## 🔧 Configuration

### Environment Variables

#### Sync Server
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=metadata_platform

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

#### Auth Service
```env
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1h
```

## 🏛️ Database Schema

The platform uses a comprehensive database schema with:

- **Multi-tenancy**: Tenant-based data isolation
- **Audit Trails**: Full audit logging with user tracking
- **Versioning**: Optimistic locking with version control
- **Soft Deletes**: Recoverable data deletion
- **Indexing**: Optimized indexes for performance

## 🔄 Synchronization

The platform implements a sophisticated synchronization system:

- **CRDT-based**: Conflict-free replicated data types for consistency
- **Real-time**: WebSocket-based real-time updates
- **Conflict Resolution**: Multiple strategies for handling conflicts
- **Offline Support**: Queue operations when offline, sync when online
- **Incremental Sync**: Only sync changes since last update

## 🔐 Security

Security features include:

- **Authentication**: Multiple authentication methods (Firebase, JWT, OAuth)
- **Authorization**: Role-based access control with resource-level permissions
- **Data Encryption**: Sensitive data encryption at rest
- **Rate Limiting**: Protection against abuse and DDoS
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers and protections

## 🧪 Testing

The monorepo includes comprehensive testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests for specific package
npm run test -w packages/core
```

Test coverage includes:
- Unit tests for all business logic
- Integration tests for API endpoints
- End-to-end tests for critical workflows
- Performance tests for synchronization

## 📊 Monitoring

Built-in monitoring features:

- **Health Checks**: Application and dependency health monitoring
- **Metrics**: Performance and usage metrics collection
- **Logging**: Structured logging with multiple levels
- **Error Tracking**: Comprehensive error logging and tracking

## 🚀 Deployment

### Docker Support

```dockerfile
# Example Dockerfile for sync server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Production Considerations

- Use environment-specific configuration
- Enable SSL/TLS for all connections
- Set up database connection pooling
- Configure Redis for high availability
- Implement backup strategies
- Set up monitoring and alerting
- Use container orchestration (Kubernetes/Docker Swarm)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation in each package's README
- Review the API documentation at `/api/docs`
- Open an issue for bugs or feature requests
- Join our community discussions

---

Built with ❤️ using TypeScript, NestJS, TypeORM, and modern web technologies.