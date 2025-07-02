import React, { useState, useEffect } from 'react';
import { Database, Table, Plus, Settings, Sync, Layers, Users, BarChart3 } from 'lucide-react';
import { DBManager } from '@dbmanager/core';
import { createSQLJSConfig } from '@dbmanager/adapter-browser-sqljs';
import { DatabaseList } from './components/DatabaseList';
import { TableView } from './components/TableView';
import { CreateDatabaseModal } from './components/CreateDatabaseModal';
import { CreateTableModal } from './components/CreateTableModal';
import { RecordModal } from './components/RecordModal';
import { SchemaDesigner } from './components/SchemaDesigner';

function App() {
  const [dbManager, setDbManager] = useState<DBManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'databases' | 'table' | 'schema'>('databases');
  const [selectedDatabase, setSelectedDatabase] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [showCreateDatabase, setShowCreateDatabase] = useState(false);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showSchemaDesigner, setShowSchemaDesigner] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [refreshTableKey, setRefreshTableKey] = useState(0);

  useEffect(() => {
    initializeDBManager();
  }, []);

  const initializeDBManager = async () => {
    try {
      setLoading(true);
      const config = {
        mode: 'device' as const,
        env: 'browser' as const,
        ...createSQLJSConfig(),
        logging: {
          level: 'info' as const,
          enableChangeLog: true,
          maxChangeLogEntries: 100
        },
        fileManager: {
          storageAdapter: 'memory' as const,
          removeOrphansOnPurge: true
        },
        sync: {
          enabled: true,
          serverUrl: 'http://localhost:3000',
          pollingIntervalMs: 30000
        }
      };

      const manager = new DBManager(config);
      await manager.initialize();
      setDbManager(manager);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize database manager');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshTable = () => {
    setRefreshTableKey(prev => prev + 1);
  };

  const handleCreateDatabase = async (name: string, description?: string) => {
    if (!dbManager) return;
    
    try {
      await dbManager.createDatabase(name, description);
      setShowCreateDatabase(false);
      // Refresh the view
      if (currentView === 'databases') {
        window.location.reload(); // Simple refresh for demo
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create database');
    }
  };

  const handleCreateTable = async (tableData: any) => {
    if (!dbManager || !selectedDatabase) return;
    
    try {
      await dbManager.createTable({
        dbId: selectedDatabase.id,
        ...tableData
      });
      setShowCreateTable(false);
      handleRefreshTable();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create table');
    }
  };

  const handleSelectDatabase = (database: any) => {
    setSelectedDatabase(database);
  };

  const handleSelectTable = (table: any) => {
    setSelectedTable(table);
    setCurrentView('table');
  };

  const handleBackToDatabases = () => {
    setCurrentView('databases');
    setSelectedDatabase(null);
    setSelectedTable(null);
  };

  const handleSync = async () => {
    if (!dbManager) return;
    
    try {
      setSyncStatus('syncing');
      await dbManager.sync();
      setSyncStatus('idle');
    } catch (err) {
      setSyncStatus('error');
      setError(err instanceof Error ? err.message : 'Sync failed');
    }
  };

  const handleCreateRecord = () => {
    setEditingRecord(null);
    setShowRecordModal(true);
  };

  const handleEditRecord = (record: any) => {
    setEditingRecord(record);
    setShowRecordModal(true);
  };

  const handleDeleteRecord = async (tableIdentifier: string, recordId: string) => {
    if (!dbManager) return;
    
    try {
      await dbManager.deleteRecord(tableIdentifier, recordId, true);
      handleRefreshTable();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
    }
  };

  const handleSaveRecord = async (record: any) => {
    setShowRecordModal(false);
    setEditingRecord(null);
    handleRefreshTable();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Database Manager...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              initializeDBManager();
            }}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DBManager</h1>
                <p className="text-sm text-gray-500">Virtual Database Manager</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Sync Status */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleSync}
                  disabled={syncStatus === 'syncing'}
                  className={`p-2 rounded-lg transition-colors ${
                    syncStatus === 'syncing' 
                      ? 'text-blue-600 bg-blue-50' 
                      : syncStatus === 'error'
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Sync className={`h-5 w-5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                </button>
                <span className={`text-xs font-medium ${
                  syncStatus === 'syncing' 
                    ? 'text-blue-600' 
                    : syncStatus === 'error'
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Sync Error' : 'Synced'}
                </span>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentView('databases')}
                  className={`p-2 rounded-lg transition-colors ${
                    currentView === 'databases' 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Databases"
                >
                  <Database className="h-5 w-5" />
                </button>
                
                {selectedDatabase && (
                  <button 
                    onClick={() => setShowSchemaDesigner(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Schema Designer"
                  >
                    <Layers className="h-5 w-5" />
                  </button>
                )}
                
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="Analytics">
                  <BarChart3 className="h-5 w-5" />
                </button>
                
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="Settings">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Breadcrumb */}
      {currentView !== 'databases' && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 py-3">
              <button 
                onClick={handleBackToDatabases}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Databases
              </button>
              {selectedDatabase && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 font-medium">{selectedDatabase.name}</span>
                </>
              )}
              {selectedTable && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 font-medium">{selectedTable.name}</span>
                </>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'databases' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Databases</h2>
              <button 
                onClick={() => setShowCreateDatabase(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Database</span>
              </button>
            </div>
            
            <DatabaseList 
              dbManager={dbManager!}
              onSelectDatabase={handleSelectDatabase}
              onCreateTable={(db) => {
                setSelectedDatabase(db);
                setShowCreateTable(true);
              }}
              onSelectTable={handleSelectTable}
            />
          </div>
        )}

        {currentView === 'table' && selectedTable && (
          <TableView 
            dbManager={dbManager!}
            table={selectedTable}
            onSelectTable={handleSelectTable}
            onCreateRecord={handleCreateRecord}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handleDeleteRecord}
            refreshTableKey={refreshTableKey}
          />
        )}
      </main>

      {/* Modals */}
      {showCreateDatabase && (
        <CreateDatabaseModal 
          onClose={() => setShowCreateDatabase(false)}
          onCreate={handleCreateDatabase}
        />
      )}

      {showCreateTable && selectedDatabase && (
        <CreateTableModal 
          onClose={() => setShowCreateTable(false)}
          onCreate={handleCreateTable}
        />
      )}

      {showRecordModal && selectedTable && (
        <RecordModal
          dbManager={dbManager!}
          table={selectedTable}
          record={editingRecord}
          onClose={() => {
            setShowRecordModal(false);
            setEditingRecord(null);
          }}
          onSave={handleSaveRecord}
        />
      )}

      {showSchemaDesigner && selectedDatabase && (
        <SchemaDesigner
          dbManager={dbManager!}
          database={selectedDatabase}
          onClose={() => setShowSchemaDesigner(false)}
        />
      )}
    </div>
  );
}

export default App;