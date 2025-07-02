# DBManager - Virtual Database Manager 

A production-ready, TypeScript-based virtual database manager library with metadata-driven dynamic schema management, real-time synchronization, and multi-environment support.

## 🚀 Features

### Core Features
- **Metadata-Driven Architecture**: Dynamic entity generation based on database metadata
- **50+ Built-in Field Types**: Text, Number, Boolean, DateTime, Email, Phone, File, Image, JSON, Geography, and more
- **Dual-Mode Operation**: Device mode for offline-first apps, Sync-server mode for centralized management
- **Real-time Synchronization**: WebSocket-based sync with conflict resolution
- **Soft Deletion**: Change history tracking with configurable retention
- **File Management**: Integrated file storage with thumbnail generation
- **Multi-Environment Support**: Node.js, Browser, and Native (Capacitor) adapters

### Technical Highlights
- **TypeScript-First**: Comprehensive type safety throughout the stack
- **TypeORM Integration**: Robust database abstraction with multiple adapter support
- **Modular Architecture**: Clean separation of concerns with plugin system
- **Production-Ready**: Comprehensive error handling, logging, and monitoring
- **Extensible**: Custom field types, conflict resolution strategies, and storage adapters

## 📁 Project Structure

```
dbmanager-workspace/
├── packages/
│   ├── core/                    # Core DBManager library
│   │   ├── src/
│   │   │   ├── entity/         # Metadata entities
│   │   │   ├── manager/        # DBManager class & sync engine
│   │   │   ├── services/       # Field registry, file manager, etc.
│   │   │   ├── types/          # TypeScript definitions
│   │   │   └── utils/          # Utilities and helpers
│   │   └── package.json
│   └── adapters/
│       ├── node-sqlite/        # SQLite adapter for Node.js
│       ├── node-postgres/      # PostgreSQL adapter for Node.js
│       ├── browser-sqljs/      # SQL.js adapter for browsers
│       ├── capacitor-fs/       # Capacitor filesystem adapter
│       └── modefs/            # Mode FS adapter
├── applications/
│   ├── device-app/            # React demo app (device mode)
│   └── sync-server/           # Express + WebSocket sync server
├── .github/workflows/         # CI/CD pipelines
└── package.json              # Workspace root
```

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL (for sync-server mode)
- npm or yarn

### Installation & Setup

```bash
# Clone and install dependencies
git clone <repository>
cd dbmanager-workspace
npm install

# Start both applications
npm run dev

# Or start individually:
npm run dev:device-app    # React app on http://localhost:5173
npm run dev:sync-server   # API server on http://localhost:3000
```

### Device Mode (Offline-First)

```typescript
import { DBManager } from '@dbmanager/core';
import { createSQLJSConfig } from '@dbmanager/adapter-browser-sqljs';

const dbManager = new DBManager({
  mode: 'device',
  env: 'browser',
  ...createSQLJSConfig(),
  sync: {
    enabled: true,
    serverUrl: 'http://localhost:3000',
    pollingIntervalMs: 30000
  }
});

await dbManager.initialize();

// Create a database
const database = await dbManager.createDatabase('My App Data');

// Create a table with dynamic fields
const table = await dbManager.createTable({
  dbId: database.id,
  name: 'Users',
  fields: [
    { name: 'Name', type: 'text', required: true },
    { name: 'Email', type: 'email', required: true, unique: true },
    { name: 'Age', type: 'number' },
    { name: 'Avatar', type: 'image' },
    { name: 'Location', type: 'geography' }
  ]
});

// Create records
const user = await dbManager.createRecord('users', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  location: { lat: 40.7128, lng: -74.0060 }
});

// Query with advanced filtering
const results = await dbManager.getRecords('users', {
  search: 'john',
  searchFields: ['name', 'email'],
  where: { age: { $gte: 25 } },
  orderBy: { createdAt: 'DESC' },
  limit: 10
});
```

### Sync-Server Mode

```typescript
import { DBManager } from '@dbmanager/core';
import { createPostgreSQLConfig } from '@dbmanager/adapter-node-postgres';

const dbManager = new DBManager({
  mode: 'sync-server',
  env: 'node',
  ...createPostgreSQLConfig({
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'dbmanager'
  }),
  fileManager: {
    storageAdapter: 'local',
    basePath: './uploads'
  }
});

await dbManager.initialize();
```

## 🔧 Built-in Field Types

The DBManager includes 50+ field types organized by category:

### Basic Types
- `text` - Single line text
- `textarea` - Multi-line text  
- `number` - Numeric input
- `boolean` - True/false checkbox
- `date` - Date picker
- `datetime` - Date and time picker

### Advanced Types
- `email` - Email validation
- `phone` - Phone number formatting
- `url` - URL validation
- `uuid` - UUID generation/validation
- `json` - JSON data storage
- `richtext` - WYSIWYG editor

### Selection Types
- `dropdown` - Single select
- `multiselect` - Multiple selections
- `rating` - Star rating
- `color` - Color picker

### Media Types
- `file` - File upload
- `image` - Image upload with thumbnails
- `barcode` - Barcode scanner
- `qrcode` - QR code scanner

### Geographic Types
- `geography` - Lat/lng coordinates with map picker

### Calculation Types
- `formula` - Calculated fields
- `lookup` - Reference to other tables

## 🔄 Synchronization

### Conflict Resolution Strategies

```typescript
import { ConflictService } from '@dbmanager/core';

const conflictService = new ConflictService('custom');
conflictService.setCustomResolver(async (conflict) => {
  // Custom logic for conflict resolution
  if (conflict.field === 'updatedAt') {
    return 'remote'; // Always use remote timestamp
  }
  
  if (conflict.field === 'status') {
    return 'merge'; // Merge status changes
  }
  
  return 'manual'; // Require manual resolution
});
```

### Real-time Sync via WebSocket

```typescript
// Client-side
const socket = io('http://localhost:3000');

socket.emit('join-database', databaseId);

socket.on('record-updated', (data) => {
  console.log('Record updated:', data);
  // Update UI accordingly
});

socket.on('schema-updated', (data) => {
  console.log('Schema changed:', data);
  // Refresh schema and regenerate forms
});
```

## 📦 Custom Field Types

Create custom field types by extending the FieldTypeRegistry:

```typescript
import { FieldTypeRegistry } from '@dbmanager/core';

const registry = new FieldTypeRegistry();

registry.register({
  name: 'markdown',
  displayName: 'Markdown',
  description: 'Markdown text editor',
  category: 'advanced',
  validate: (value) => typeof value === 'string',
  serialize: (value) => value,
  deserialize: (value) => value,
  ui: { 
    component: 'MarkdownEditor',
    props: { 
      preview: true,
      toolbar: ['bold', 'italic', 'link', 'code']
    }
  }
});
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Test specific package
cd packages/core && npm test
```

## 🚀 Deployment

### Docker Deployment (Sync Server)

```bash
# Build and run with Docker
cd applications/sync-server
docker build -t dbmanager-sync-server .
docker run -p 3000:3000 -e DB_HOST=postgres dbmanager-sync-server
```

### Environment Variables

Create `.env` file in sync-server:

```env
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_NAME=dbmanager
UPLOAD_PATH=./uploads
JWT_SECRET=your-secret-key
```

## 🏗️ Architecture

### Core Components

1. **DBManager**: Main class orchestrating all operations
2. **DynamicEntityGenerator**: Creates TypeORM entities from metadata
3. **FieldTypeRegistry**: Manages field type definitions and validation
4. **SyncEngine**: Handles bidirectional synchronization
5. **FileManager**: File storage with thumbnail generation
6. **ConflictService**: Resolves data conflicts during sync

### Data Flow

```
Client App ↔ DBManager ↔ TypeORM ↔ Database
    ↕              ↕
WebSocket    FileManager
    ↕              ↕
Sync Server  File Storage
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following our coding standards
4. Add tests for your changes
5. Run the test suite: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Start development servers
npm run dev

# Run linting
npm run lint

# Format code
npm run format
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [API Reference](docs/api.md)
- **Examples**: Check the `examples/` directory
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

## 🗺️ Roadmap

- [ ] GraphQL API support
- [ ] Real-time collaboration features
- [ ] Advanced formula engine
- [ ] Data visualization components
- [ ] Mobile SDK (React Native)
- [ ] Cloud storage adapters (AWS S3, Google Cloud)
- [ ] Advanced security features (RLS, field-level permissions)
- [ ] Plugin marketplace

---

**Built with ❤️ using TypeScript, TypeORM, React, and Express**
