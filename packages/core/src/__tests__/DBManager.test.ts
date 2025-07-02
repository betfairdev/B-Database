import 'reflect-metadata';
import { DBManager } from '../manager/DBManager';
import { createInMemorySQLiteConfig } from '@dbmanager/adapter-node-sqlite';

describe('DBManager', () => {
  let dbManager: DBManager;

  beforeEach(async () => {
    dbManager = new DBManager({
      mode: 'device',
      env: 'node',
      ...createInMemorySQLiteConfig(),
      logging: {
        level: 'error',
        enableChangeLog: true,
        maxChangeLogEntries: 10
      }
    });
    await dbManager.initialize();
  });

  afterEach(async () => {
    await dbManager.close();
  });

  describe('Database Management', () => {
    test('should create a database', async () => {
      const database = await dbManager.createDatabase('Test DB', 'Test description');
      
      expect(database.name).toBe('Test DB');
      expect(database.description).toBe('Test description');
      expect(database.id).toBeDefined();
    });

    test('should get all databases', async () => {
      await dbManager.createDatabase('DB 1');
      await dbManager.createDatabase('DB 2');
      
      const databases = await dbManager.getDatabases();
      expect(databases).toHaveLength(2);
    });
  });

  describe('Table Management', () => {
    test('should create a table with fields', async () => {
      const database = await dbManager.createDatabase('Test DB');
      
      const table = await dbManager.createTable({
        dbId: database.id,
        name: 'Users',
        fields: [
          { name: 'Name', type: 'text', required: true },
          { name: 'Email', type: 'email', required: true, unique: true },
          { name: 'Age', type: 'number' }
        ]
      });

      expect(table.name).toBe('Users');
      expect(table.dbId).toBe(database.id);
    });

    test('should get tables for a database', async () => {
      const database = await dbManager.createDatabase('Test DB');
      
      await dbManager.createTable({
        dbId: database.id,
        name: 'Users',
        fields: [{ name: 'Name', type: 'text' }]
      });

      const tables = await dbManager.getTables(database.id);
      expect(tables).toHaveLength(1);
      expect(tables[0].name).toBe('Users');
    });
  });

  describe('Record Management', () => {
    test('should create and retrieve records', async () => {
      const database = await dbManager.createDatabase('Test DB');
      const table = await dbManager.createTable({
        dbId: database.id,
        name: 'Users',
        fields: [
          { name: 'Name', type: 'text', required: true },
          { name: 'Email', type: 'email' }
        ]
      });

      const record = await dbManager.createRecord(table.identifier, {
        name: 'John Doe',
        email: 'john@example.com'
      });

      expect(record.name).toBe('John Doe');
      expect(record.email).toBe('john@example.com');

      const records = await dbManager.getRecords(table.identifier);
      expect(records.data).toHaveLength(1);
      expect(records.total).toBe(1);
    });

    test('should update records', async () => {
      const database = await dbManager.createDatabase('Test DB');
      const table = await dbManager.createTable({
        dbId: database.id,
        name: 'Users',
        fields: [{ name: 'Name', type: 'text' }]
      });

      const record = await dbManager.createRecord(table.identifier, {
        name: 'John Doe'
      });

      const updated = await dbManager.updateRecord(table.identifier, record.id, {
        name: 'Jane Doe'
      });

      expect(updated.name).toBe('Jane Doe');
    });

    test('should soft delete records', async () => {
      const database = await dbManager.createDatabase('Test DB');
      const table = await dbManager.createTable({
        dbId: database.id,
        name: 'Users',
        fields: [{ name: 'Name', type: 'text' }]
      });

      const record = await dbManager.createRecord(table.identifier, {
        name: 'John Doe'
      });

      await dbManager.deleteRecord(table.identifier, record.id, true);

      const records = await dbManager.getRecords(table.identifier);
      expect(records.data).toHaveLength(0);

      const recordsWithDeleted = await dbManager.getRecords(table.identifier, {
        includeDeleted: true
      });
      expect(recordsWithDeleted.data).toHaveLength(1);
    });
  });

  describe('Search and Filtering', () => {
    test('should search records', async () => {
      const database = await dbManager.createDatabase('Test DB');
      const table = await dbManager.createTable({
        dbId: database.id,
        name: 'Users',
        fields: [
          { name: 'Name', type: 'text' },
          { name: 'Email', type: 'email' }
        ]
      });

      await dbManager.createRecord(table.identifier, {
        name: 'John Doe',
        email: 'john@example.com'
      });
      await dbManager.createRecord(table.identifier, {
        name: 'Jane Smith',
        email: 'jane@example.com'
      });

      const results = await dbManager.getRecords(table.identifier, {
        search: 'john',
        searchFields: ['name', 'email']
      });

      expect(results.data).toHaveLength(1);
      expect(results.data[0].name).toBe('John Doe');
    });

    test('should paginate results', async () => {
      const database = await dbManager.createDatabase('Test DB');
      const table = await dbManager.createTable({
        dbId: database.id,
        name: 'Users',
        fields: [{ name: 'Name', type: 'text' }]
      });

      // Create 5 records
      for (let i = 1; i <= 5; i++) {
        await dbManager.createRecord(table.identifier, {
          name: `User ${i}`
        });
      }

      const page1 = await dbManager.getRecords(table.identifier, {
        limit: 2,
        offset: 0
      });

      expect(page1.data).toHaveLength(2);
      expect(page1.total).toBe(5);
      expect(page1.hasNext).toBe(true);
      expect(page1.hasPrev).toBe(false);

      const page2 = await dbManager.getRecords(table.identifier, {
        limit: 2,
        offset: 2
      });

      expect(page2.data).toHaveLength(2);
      expect(page2.hasNext).toBe(true);
      expect(page2.hasPrev).toBe(true);
    });
  });
});