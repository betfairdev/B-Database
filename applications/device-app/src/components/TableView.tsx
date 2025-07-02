import React, { useState, useEffect } from 'react';
import { Table, Plus, Search, Filter, Download, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { DBManager, TableMeta, PaginatedResult } from '@dbmanager/core';

interface TableViewProps {
  dbManager: DBManager;
  table: TableMeta;
  onSelectTable: (table: TableMeta) => void;
  onCreateRecord?: () => void;
  onEditRecord?: (record: any) => void;
  onDeleteRecord?: (tableIdentifier: string, recordId: string) => void;
  refreshTableKey?: number;
}

export function TableView({ 
  dbManager, 
  table, 
  onSelectTable, 
  onCreateRecord,
  onEditRecord,
  onDeleteRecord,
  refreshTableKey = 0
}: TableViewProps) {
  const [records, setRecords] = useState<PaginatedResult<any>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 25,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadRecords();
  }, [table.id, currentPage, refreshTableKey]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const result = await dbManager.getRecords(table.identifier, {
        limit: 25,
        offset: (currentPage - 1) * 25,
        search: searchTerm || undefined,
        searchFields: table.fields?.map(f => f.identifier)
      });
      setRecords(result);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadRecords();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      if (onDeleteRecord) {
        onDeleteRecord(table.identifier, recordId);
      } else {
        try {
          await dbManager.deleteRecord(table.identifier, recordId, true);
          loadRecords(); // Refresh the table
        } catch (error) {
          console.error('Failed to delete record:', error);
        }
      }
    }
  };

  const renderFieldValue = (value: any, fieldType: string): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">—</span>;
    }

    switch (fieldType) {
      case 'boolean':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {value ? 'Yes' : 'No'}
          </span>
        );
      
      case 'date':
        return new Date(value).toLocaleDateString();
      
      case 'datetime':
        return new Date(value).toLocaleString();
      
      case 'email':
        return <a href={`mailto:${value}`} className="text-primary-600 hover:underline">{value}</a>;
      
      case 'url':
        return <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{value}</a>;
      
      case 'multiselect':
        return Array.isArray(value) ? value.join(', ') : String(value);
      
      case 'geography':
        if (typeof value === 'object' && value.lat && value.lng) {
          return `${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}`;
        }
        return String(value);
      
      case 'rating':
        const rating = Number(value) || 0;
        return (
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
              </span>
            ))}
            <span className="ml-1 text-xs text-gray-500">({rating})</span>
          </div>
        );
      
      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: value }}
            ></div>
            <span className="text-sm">{value}</span>
          </div>
        );
      
      default:
        const stringValue = String(value);
        return stringValue.length > 50 ? `${stringValue.substring(0, 50)}...` : stringValue;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="card">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Table className="h-6 w-6 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{table.name}</h2>
            <p className="text-sm text-gray-500">
              {records.total} records • {table.fields?.length || 0} fields
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadRecords}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          {onCreateRecord && (
            <button 
              onClick={onCreateRecord}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Record</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
          <button type="button" className="btn-secondary flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </form>
      </div>

      {/* Records Table */}
      <div className="card overflow-hidden">
        {records.data.length === 0 ? (
          <div className="text-center py-12">
            <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first record'}
            </p>
            {onCreateRecord && (
              <button onClick={onCreateRecord} className="btn-primary">
                Add First Record
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {table.fields?.slice(0, 6).map(field => (
                    <th 
                      key={field.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {field.displayName || field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.data.map((record, index) => (
                  <tr key={record.id || index} className="hover:bg-gray-50">
                    {table.fields?.slice(0, 6).map(field => (
                      <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {renderFieldValue(record[field.identifier], field.type)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => console.log('View record:', record)}
                          className="text-primary-600 hover:text-primary-900 p-1"
                          title="View record"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {onEditRecord && (
                          <button 
                            onClick={() => onEditRecord(record)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit record"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {records.total > records.pageSize && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((records.page - 1) * records.pageSize) + 1} to{' '}
              {Math.min(records.page * records.pageSize, records.total)} of{' '}
              {records.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button 
                disabled={!records.hasPrev}
                onClick={() => handlePageChange(currentPage - 1)}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {Math.ceil(records.total / records.pageSize)}
              </span>
              <button 
                disabled={!records.hasNext}
                onClick={() => handlePageChange(currentPage + 1)}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}