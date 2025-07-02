import { Router } from 'express';
import { DBManager } from '@dbmanager/core';

const router = Router();

// Get database analytics
router.get('/databases/:dbId', async (req: any, res) => {
  try {
    const { dbId } = req.params;
    const dbManager: DBManager = req.dbManager;
    
    const tables = await dbManager.getTables(dbId);
    const analytics = {
      totalTables: tables.length,
      totalFields: 0,
      totalRecords: 0,
      tableStats: [],
      fieldTypeDistribution: {},
      recentActivity: []
    };

    for (const table of tables) {
      analytics.totalFields += table.fields?.length || 0;
      
      try {
        const records = await dbManager.getRecords(table.identifier, { limit: 1 });
        analytics.totalRecords += records.total;
        
        (analytics.tableStats as any[]).push({
          name: table.name,
          records: records.total,
          fields: table.fields?.length || 0,
          lastModified: table.updatedAt
        });
      } catch (error) {
        console.warn(`Failed to get analytics for table ${table.name}:`, error);
      }

      // Field type distribution
      table.fields?.forEach(field => {
        const dist = analytics.fieldTypeDistribution as any;
        dist[field.type] = (dist[field.type] || 0) + 1;
      });
    }

    res.json({
      analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get table analytics
router.get('/tables/:tableId', async (req: any, res) => {
  try {
    const { tableId } = req.params;
    const dbManager: DBManager = req.dbManager;
    
    // This would need table lookup by ID
    // For now, return placeholder
    res.json({
      analytics: {
        recordCount: 0,
        fieldCount: 0,
        recentChanges: []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Table analytics error:', error);
    res.status(500).json({
      error: 'Failed to get table analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as analyticsRoutes };