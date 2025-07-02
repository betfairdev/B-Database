import React, { useState, useEffect } from 'react';
import { Database, Table, Plus, Eye, Settings, Layers, BarChart3 } from 'lucide-react';
import { DBManager, DatabaseMeta, TableMeta } from '@dbmanager/core';

interface DatabaseListProps {
  dbManager: DBManager;
  onSelectDatabase: (database: DatabaseMeta) => void;
  onCreateTable: (database: DatabaseMeta) => void;
  onSelectTable: (table: TableMeta) => void;
}

export function DatabaseList({ dbManager, onSelectDatabase, onCreateTable, onSelectTable }: DatabaseListProps) {
  const [databases, setDatabases] = useState<DatabaseMeta[]>([]);
  const [expandedDb, setExpandedDb] = useState<string | null>(null);
  const [tables, setTables] = useState<Record<string, TableMeta[]>>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, any>>({});

  useEffect(() => {
    loadDatabases();
  }, []);

  const loadDatabases = async () => {
    try {
      const dbs = await dbManager.getDatabases();
      setDatabases(dbs);
      
      // Load stats for each database
      const dbStats: Record<string, any> = {};
      for (const db of dbs) {
        const dbTables = await dbManager.getTables(db.id);
        let totalRecords = 0;
        
        for (const table of dbTables) {
          try {
            const records = await dbManager.getRecords(table.identifier, { limit: 1 });
            totalRecords += records.total;
          } catch (error) {
            console.warn(`Failed to get record count for table ${table.name}:`, error);
          }
        }
        
        dbStats[db.id] = {
          tables: dbTables.length,
          records: totalRecords,
          lastModified: db.updatedAt
        };
      }
      setStats(dbStats);
    } catch (error) {
      console.error('Failed to load databases:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async (dbId: string) => {
    try {
      const dbTables = await dbManager.getTables(dbId);
      setTables(prev => ({ ...prev, [dbId]: dbTables }));
    } catch (error) {
      console.error('Failed to load tables:', error);
    }
  };

  const handleToggleDatabase = async (database: DatabaseMeta) => {
    if (expandedDb === database.id) {
      setExpandedDb(null);
    } else {
      setExpandedDb(database.id);
      if (!tables[database.id]) {
        await loadTables(database.id);
      }
    }
    onSelectDatabase(database);
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {databases.length === 0 ? (
        <div className="card text-center py-12">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No databases yet</h3>
          <p className="text-gray-500 mb-4">Create your first database to get started</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {databases.map(database => {
            const dbStats = stats[database.id] || { tables: 0, records: 0 };
            const isExpanded = expandedDb === database.id;
            
            return (
              <div key={database.id} className="card hover:shadow-md transition-shadow">
                <div 
                  className="cursor-pointer"
                  onClick={() => handleToggleDatabase(database)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Database className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{database.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {database.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{dbStats.tables}</div>
                      <div className="text-xs text-gray-500">Tables</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{dbStats.records}</div>
                      <div className="text-xs text-gray-500">Records</div>
                    </div>
                  </div>

                  {/* Last Modified */}
                  <div className="text-xs text-gray-400 mb-4">
                    Modified {formatDate(database.updatedAt)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateTable(database);
                      }}
                      className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full hover:bg-primary-200 transition-colors"
                      title="Create table"
                    >
                      <Plus className="h-3 w-3 inline mr-1" />
                      Table
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open schema designer
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                      title="Schema designer"
                    >
                      <Layers className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open analytics
                      }}
                      className="p-1 text-gray-400 hover:text-green-600 rounded"
                      title="Analytics"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open settings
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      title="Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Tables list */}
                {isExpanded && tables[database.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Tables</h4>
                    <div className="space-y-2">
                      {tables[database.id].length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No tables in this database</p>
                      ) : (
                        tables[database.id].map(table => (
                          <div 
                            key={table.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTable(table);
                            }}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100"
                          >
                            <div className="flex items-center space-x-3">
                              <Table className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{table.name}</p>
                                <p className="text-xs text-gray-500">
                                  {table.fields?.length || 0} fields
                                </p>
                              </div>
                            </div>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTable(table);
                              }}
                              className="p-1 text-gray-400 hover:text-primary-600 rounded"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}