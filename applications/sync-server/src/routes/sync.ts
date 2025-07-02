import { Router } from 'express';
import { DBManager } from '@dbmanager/core';

const router = Router();

// Check for updates since last sync
router.post('/check-updates', async (req: any, res) => {
  try {
    const { lastSync } = req.body;
    const dbManager: DBManager = req.dbManager;
    
    const hasUpdates = await dbManager.checkForUpdates();
    
    res.json({
      hasUpdates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Check updates error:', error);
    res.status(500).json({
      error: 'Failed to check for updates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get schema version
router.get('/schema/version', async (req: any, res) => {
  try {
    const dbManager: DBManager = req.dbManager;
    const databases = await dbManager.getDatabases();
    
    // Calculate schema version based on all database metadata
    const schemaHash = databases
      .map(db => `${db.id}-${db.updatedAt.getTime()}`)
      .join('|');
    
    res.json({
      version: Buffer.from(schemaHash).toString('base64'),
      timestamp: new Date().toISOString(),
      databases: databases.length
    });
  } catch (error) {
    console.error('Schema version error:', error);
    res.status(500).json({
      error: 'Failed to get schema version',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get schema migrations since version
router.post('/schema/migrations', async (req: any, res) => {
  try {
    const { since } = req.body;
    const dbManager: DBManager = req.dbManager;
    
    // Get all databases and tables with their metadata
    const databases = await dbManager.getDatabases();
    const migrations = [];
    
    for (const database of databases) {
      if (!since || database.updatedAt > new Date(since)) {
        const tables = await dbManager.getTables(database.id);
        
        migrations.push({
          type: 'database',
          operation: 'create_or_update',
          data: database,
          tables: tables.map(table => ({
            ...table,
            fields: table.fields || []
          }))
        });
      }
    }
    
    res.json({
      migrations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Schema migrations error:', error);
    res.status(500).json({
      error: 'Failed to get schema migrations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Push operations from client
router.post('/operations', async (req: any, res) => {
  try {
    const { operations } = req.body;
    const dbManager: DBManager = req.dbManager;
    
    const results = [];
    
    for (const operation of operations) {
      try {
        let result;
        
        switch (operation.operation) {
          case 'create':
            result = await dbManager.createRecord(operation.table, operation.data);
            break;
          case 'update':
            result = await dbManager.updateRecord(operation.table, operation.recordId, operation.data);
            break;
          case 'delete':
            result = await dbManager.deleteRecord(operation.table, operation.recordId, true);
            break;
        }
        
        results.push({
          id: operation.id,
          status: 'success',
          result
        });
      } catch (error) {
        results.push({
          id: operation.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    res.json({
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Push operations error:', error);
    res.status(500).json({
      error: 'Failed to process operations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Pull operations for client
router.get('/operations', async (req: any, res) => {
  try {
    const { since, table } = req.query;
    const dbManager: DBManager = req.dbManager;
    
    // Get change log entries since the specified time
    const operations = [];
    
    // This would typically query the change log
    // For now, return empty array as we'd need to implement change log querying
    
    res.json({
      operations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Pull operations error:', error);
    res.status(500).json({
      error: 'Failed to get operations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Full sync endpoint
router.post('/full-sync', async (req: any, res) => {
  try {
    const dbManager: DBManager = req.dbManager;
    const syncReport = await dbManager.sync();
    
    res.json({
      syncReport,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Full sync error:', error);
    res.status(500).json({
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as syncRoutes };