# NestJS Production Backend

A production-grade NestJS backend with TypeORM multi-database support, Firebase authentication, and offline-first sync capabilities.

## Features

- **Multi-Database Support**: PostgreSQL, MySQL, MariaDB, MSSQL, SQLite, Oracle, CockroachDB
- **Firebase Authentication**: JWT token validation with automatic user creation
- **Multi-Tenancy**: Workspace-based isolation with role-based access control
- **Offline-First Sync**: Conflict resolution with version vectors
- **File Management**: MinIO S3-compatible storage with image thumbnails
- **Real-time Sync**: Push/pull synchronization endpoints
- **Production Ready**: Docker, migrations, comprehensive error handling

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Firebase project with Admin SDK credentials

### Installation

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Configure your `.env` file with:
   - Database credentials
   - Firebase Admin SDK credentials
   - MinIO settings

4. Start with Docker Compose:
   ```bash
   docker-compose up -d
   ```

5. Run migrations:
   ```bash
   npm run migration:run
   ```

6. Seed the database:
   ```bash
   npm run seed
   ```

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```

## API Documentation

Once running, visit `http://localhost:3000/api/docs` for Swagger documentation.

## Architecture

### Core Entities

- **User**: Firebase UID mapping to internal user
- **Workspace**: Multi-tenant isolation
- **TableSchema**: Dynamic table definitions
- **FieldSchema**: Field definitions with validation
- **DataRow**: Actual data with versioning
- **SyncLog**: Change tracking for sync

### Sync System

The offline-first sync system uses:
- **Version Vectors**: Track changes per client
- **Conflict Resolution**: Configurable merge strategies
- **Change Log**: Append-only sync history

### File Management

- **MinIO**: S3-compatible object storage
- **Thumbnails**: Automatic image thumbnail generation
- **Presigned URLs**: Secure direct uploads

## Database Support

Configure via `DB_TYPE` environment variable:

- `postgres` - PostgreSQL
- `mysql` - MySQL
- `mariadb` - MariaDB
- `mssql` - Microsoft SQL Server
- `sqlite` - SQLite
- `oracle` - Oracle Database
- `cockroachdb` - CockroachDB

## Deployment

### Docker

```bash
# Build and run
docker-compose up -d

# Scale services
docker-compose up -d --scale app=3
```

### Environment Variables

Key configuration options:

```env
# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=nestjs_backend

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

## API Endpoints

### Authentication
- `GET /auth/me` - Get current user

### Workspaces
- `GET /workspaces` - List workspaces
- `POST /workspaces` - Create workspace
- `GET /workspaces/:id` - Get workspace
- `PATCH /workspaces/:id` - Update workspace
- `DELETE /workspaces/:id` - Delete workspace

### Tables & Fields
- `GET /workspaces/:id/tables` - List tables
- `POST /workspaces/:id/tables` - Create table
- `GET /workspaces/:id/tables/:tableId/fields` - List fields
- `POST /workspaces/:id/tables/:tableId/fields` - Create field

### Data
- `GET /workspaces/:id/tables/:tableId/rows` - List data rows
- `POST /workspaces/:id/tables/:tableId/rows` - Create data row
- `PATCH /workspaces/:id/tables/:tableId/rows/:rowId` - Update data row

### Sync
- `POST /sync/push` - Push local changes
- `GET /sync/pull` - Pull server changes

### Files
- `GET /files/upload-url` - Get presigned upload URL

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.