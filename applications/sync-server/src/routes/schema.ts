import { Router } from 'express';
import { DBManager } from '@dbmanager/core';

const router = Router();

// Get all databases
router.get('/databases', async (req: any, res) => {
  try {
    const dbManager: DBManager = req.dbManager;
    const databases = await dbManager.getDatabases();
    
    res.json({
      databases,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get databases error:', error);
    res.status(500).json({
      error: 'Failed to get databases',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create database
router.post('/databases', async (req: any, res) => {
  try {
    const { name, description } = req.body;
    const dbManager: DBManager = req.dbManager;
    
    const database = await dbManager.createDatabase(name, description);
    
    res.status(201).json({
      database,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create database error:', error);
    res.status(500).json({
      error: 'Failed to create database',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get tables for a database
router.get('/databases/:dbId/tables', async (req: any, res) => {
  try {
    const { dbId } = req.params;
    const dbManager: DBManager = req.dbManager;
    
    const tables = await dbManager.getTables(dbId);
    
    res.json({
      tables,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({
      error: 'Failed to get tables',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create table
router.post('/databases/:dbId/tables', async (req: any, res) => {
  try {
    const { dbId } = req.params;
    const tableData = req.body;
    const dbManager: DBManager = req.dbManager;
    
    const table = await dbManager.createTable({
      dbId,
      ...tableData
    });
    
    res.status(201).json({
      table,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({
      error: 'Failed to create table',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get fields for a table
router.get('/tables/:tableId/fields', async (req: any, res) => {
  try {
    const { tableId } = req.params;
    const dbManager: DBManager = req.dbManager;
    
    const fields = await dbManager.getFields(tableId);
    
    res.json({
      fields,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get fields error:', error);
    res.status(500).json({
      error: 'Failed to get fields',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create field
router.post('/tables/:tableId/fields', async (req: any, res) => {
  try {
    const { tableId } = req.params;
    const fieldData = req.body;
    const dbManager: DBManager = req.dbManager;
    
    const field = await dbManager.createField(tableId, fieldData);
    
    res.status(201).json({
      field,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create field error:', error);
    res.status(500).json({
      error: 'Failed to create field',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as schemaRoutes };