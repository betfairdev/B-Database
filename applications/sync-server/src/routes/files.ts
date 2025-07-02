import { Router } from 'express';
import multer from 'multer';
import { DBManager } from '@dbmanager/core';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Upload file
router.post('/upload', upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please provide a file to upload'
      });
    }

    const { table, recordId, field } = req.body;
    const dbManager: DBManager = req.dbManager;

    const fileMeta = await dbManager.saveFile(req.file.buffer, {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      table,
      recordId,
      field
    });

    res.status(201).json({
      file: fileMeta,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      error: 'Failed to upload file',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Download file
router.get('/:fileId', async (req: any, res) => {
  try {
    const { fileId } = req.params;
    const dbManager: DBManager = req.dbManager;

    const result = await dbManager.getFile(fileId);
    if (!result) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The requested file could not be found'
      });
    }

    const { file, metadata } = result;

    res.set({
      'Content-Type': metadata.mimeType,
      'Content-Length': metadata.size.toString(),
      'Content-Disposition': `attachment; filename="${metadata.originalName}"`
    });

    res.send(file);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({
      error: 'Failed to download file',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get file metadata
router.get('/:fileId/metadata', async (req: any, res) => {
  try {
    const { fileId } = req.params;
    const dbManager: DBManager = req.dbManager;

    const result = await dbManager.getFile(fileId);
    if (!result) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The requested file could not be found'
      });
    }

    res.json({
      metadata: result.metadata,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('File metadata error:', error);
    res.status(500).json({
      error: 'Failed to get file metadata',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as filesRoutes };