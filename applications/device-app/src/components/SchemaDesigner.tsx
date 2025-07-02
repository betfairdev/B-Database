import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Database, Table, Settings, Link } from 'lucide-react';
import { DBManager, TableMeta, FieldMeta, RelationshipMeta } from '@dbmanager/core';

interface SchemaDesignerProps {
  dbManager: DBManager;
  database: any;
  onClose: () => void;
}

export function SchemaDesigner({ dbManager, database, onClose }: SchemaDesignerProps) {
  const [tables, setTables] = useState<TableMeta[]>([]);
  const [relationships, setRelationships] = useState<RelationshipMeta[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableMeta | null>(null);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [showCreateField, setShowCreateField] = useState(false);
  const [showCreateRelationship, setShowCreateRelationship] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableFieldTypes, setAvailableFieldTypes] = useState<any[]>([]);
  const [groupedFieldTypes, setGroupedFieldTypes] = useState<Record<string, any[]>>({});

  useEffect(() => {
    loadSchema();
    loadFieldTypes();
  }, [database.id]);

  const loadSchema = async () => {
    try {
      const [dbTables, dbRelationships] = await Promise.all([
        dbManager.getTables(database.id),
        dbManager.getRelationships(database.id)
      ]);
      setTables(dbTables);
      setRelationships(dbRelationships);
    } catch (error) {
      console.error('Failed to load schema:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFieldTypes = () => {
    const fieldTypes = dbManager.fieldTypeRegistry.getAll();
    setAvailableFieldTypes(fieldTypes);
    
    const grouped = fieldTypes.reduce((acc, type) => {
      if (!acc[type.category]) acc[type.category] = [];
      acc[type.category].push(type);
      return acc;
    }, {} as Record<string, any[]>);
    
    setGroupedFieldTypes(grouped);
  };

  const handleCreateTable = async (tableData: any) => {
    try {
      await dbManager.createTable({
        dbId: database.id,
        ...tableData
      });
      await loadSchema();
      setShowCreateTable(false);
    } catch (error) {
      console.error('Failed to create table:', error);
    }
  };

  const handleCreateField = async (fieldData: any) => {
    if (!selectedTable) return;
    
    try {
      await dbManager.createField(selectedTable.id, fieldData);
      await loadSchema();
      setShowCreateField(false);
    } catch (error) {
      console.error('Failed to create field:', error);
    }
  };

  const handleCreateRelationship = async (relationshipData: any) => {
    try {
      await dbManager.createRelationship(relationshipData);
      await loadSchema();
      setShowCreateRelationship(false);
    } catch (error) {
      console.error('Failed to create relationship:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading schema designer...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Schema Designer</h2>
              <p className="text-sm text-gray-500">{database.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-full">
          {/* Tables Sidebar */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Tables</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowCreateRelationship(true)}
                    className="btn-secondary text-sm flex items-center space-x-1"
                    title="Add Relationship"
                  >
                    <Link className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowCreateTable(true)}
                    className="btn-primary text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {tables.map(table => (
                  <div
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`p-3 rounded-lg cursor-pointer border ${
                      selectedTable?.id === table.id
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Table className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{table.name}</p>
                        <p className="text-xs text-gray-500">
                          {table.fields?.length || 0} fields
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Relationships Section */}
              {relationships.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Relationships</h4>
                  <div className="space-y-2">
                    {relationships.map(rel => (
                      <div key={rel.id} className="p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="text-xs text-blue-800">
                          {rel.sourceTable?.name} → {rel.targetTable?.name}
                        </div>
                        <div className="text-xs text-blue-600 capitalize">
                          {rel.type.replace('-', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fields Panel */}
          <div className="flex-1 overflow-y-auto">
            {selectedTable ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedTable.name}</h3>
                    <p className="text-sm text-gray-500">{selectedTable.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="btn-secondary text-sm flex items-center space-x-1">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => setShowCreateField(true)}
                      className="btn-primary text-sm flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Field</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedTable.fields?.map(field => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{field.displayName || field.name}</h4>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {field.type}
                            </span>
                            {field.required && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                Required
                              </span>
                            )}
                            {field.unique && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                Unique
                              </span>
                            )}
                            {field.options?.isRelationship && (
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                                Relationship
                              </span>
                            )}
                          </div>
                          {field.description && (
                            <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                          )}
                          {field.defaultValue && (
                            <p className="text-xs text-gray-400 mt-1">
                              Default: {String(field.defaultValue)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-400 hover:text-blue-600 rounded">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 rounded">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a table to view its fields</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Table Modal */}
        {showCreateTable && (
          <CreateTableModal
            onClose={() => setShowCreateTable(false)}
            onCreate={handleCreateTable}
          />
        )}

        {/* Create Field Modal */}
        {showCreateField && (
          <CreateFieldModal
            fieldTypes={groupedFieldTypes}
            onClose={() => setShowCreateField(false)}
            onCreate={handleCreateField}
          />
        )}

        {/* Create Relationship Modal */}
        {showCreateRelationship && (
          <CreateRelationshipModal
            tables={tables}
            onClose={() => setShowCreateRelationship(false)}
            onCreate={handleCreateRelationship}
          />
        )}
      </div>
    </div>
  );
}

// Create Table Modal Component
function CreateTableModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        fields: [
          { name: 'Name', type: 'text', required: true }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create Table</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter table name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Optional description"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Field Modal Component
function CreateFieldModal({ 
  fieldTypes, 
  onClose, 
  onCreate 
}: { 
  fieldTypes: Record<string, any[]>; 
  onClose: () => void; 
  onCreate: (data: any) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [required, setRequired] = useState(false);
  const [unique, setUnique] = useState(false);
  const [defaultValue, setDefaultValue] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await onCreate({
        name: name.trim(),
        type,
        required,
        unique,
        defaultValue: defaultValue.trim() || undefined,
        description: description.trim() || undefined
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create Field</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter field name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {Object.entries(fieldTypes).map(([category, types]) => (
                  <optgroup key={category} label={category}>
                    {types.map(fieldType => (
                      <option key={fieldType.name} value={fieldType.name}>
                        {fieldType.displayName}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Required</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={unique}
                  onChange={(e) => setUnique(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Unique</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Value
              </label>
              <input
                type="text"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Optional default value"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Optional description"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Relationship Modal Component
function CreateRelationshipModal({ 
  tables, 
  onClose, 
  onCreate 
}: { 
  tables: TableMeta[]; 
  onClose: () => void; 
  onCreate: (data: any) => void;
}) {
  const [sourceTableId, setSourceTableId] = useState('');
  const [targetTableId, setTargetTableId] = useState('');
  const [type, setType] = useState<'one-to-many' | 'many-to-one' | 'one-to-one' | 'many-to-many'>('one-to-many');
  const [sourceField, setSourceField] = useState('');
  const [targetField, setTargetField] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceTableId || !targetTableId || !sourceField || !targetField) return;
    
    setLoading(true);
    try {
      await onCreate({
        sourceTableId,
        targetTableId,
        type,
        sourceField: sourceField.trim(),
        targetField: targetField.trim(),
        name: name.trim() || undefined,
        description: description.trim() || undefined
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create Relationship</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="one-to-many">One to Many</option>
                <option value="many-to-one">Many to One</option>
                <option value="one-to-one">One to One</option>
                <option value="many-to-many">Many to Many</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Table *
                </label>
                <select
                  value={sourceTableId}
                  onChange={(e) => setSourceTableId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select table</option>
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>
                      {table.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Table *
                </label>
                <select
                  value={targetTableId}
                  onChange={(e) => setTargetTableId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select table</option>
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>
                      {table.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Field *
                </label>
                <input
                  type="text"
                  required
                  value={sourceField}
                  onChange={(e) => setSourceField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Field name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Field *
                </label>
                <input
                  type="text"
                  required
                  value={targetField}
                  onChange={(e) => setTargetField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Field name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Optional name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Optional description"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !sourceTableId || !targetTableId || !sourceField || !targetField}
            >
              {loading ? 'Creating...' : 'Create Relationship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}