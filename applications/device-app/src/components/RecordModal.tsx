import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Upload, MapPin } from 'lucide-react';
import { DBManager, TableMeta, FieldMeta } from '@dbmanager/core';

interface RecordModalProps {
  dbManager: DBManager;
  table: TableMeta;
  record?: any;
  onClose: () => void;
  onSave: (record: any) => void;
}

export function RecordModal({ dbManager, table, record, onClose, onSave }: RecordModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (record) {
      setFormData(record);
    } else {
      // Initialize with default values
      const defaults: Record<string, any> = {};
      table.fields?.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaults[field.identifier] = field.defaultValue;
        }
      });
      setFormData(defaults);
    }
  }, [record, table.fields]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    table.fields?.forEach(field => {
      const value = formData[field.identifier];
      
      if (field.required && (!value || value === '')) {
        newErrors[field.identifier] = `${field.displayName || field.name} is required`;
      }
      
      // Type-specific validation
      if (value && value !== '') {
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              newErrors[field.identifier] = 'Invalid email format';
            }
            break;
          case 'url':
            try {
              new URL(value);
            } catch {
              newErrors[field.identifier] = 'Invalid URL format';
            }
            break;
          case 'number':
            if (isNaN(Number(value))) {
              newErrors[field.identifier] = 'Must be a valid number';
            }
            break;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      let savedRecord;
      if (record?.id) {
        savedRecord = await dbManager.updateRecord(table.identifier, record.id, formData);
      } else {
        savedRecord = await dbManager.createRecord(table.identifier, formData);
      }
      onSave(savedRecord);
    } catch (error) {
      console.error('Failed to save record:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FieldMeta) => {
    const value = formData[field.identifier] || '';
    const error = errors[field.identifier];
    
    const baseInputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
      error ? 'border-red-300' : 'border-gray-300'
    }`;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <input
            type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={(e) => handleFieldChange(field.identifier, e.target.value)}
            className={baseInputClasses}
            placeholder={field.helpText || `Enter ${field.displayName || field.name}`}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            rows={4}
            value={value}
            onChange={(e) => handleFieldChange(field.identifier, e.target.value)}
            className={baseInputClasses}
            placeholder={field.helpText || `Enter ${field.displayName || field.name}`}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.identifier, e.target.value)}
            className={baseInputClasses}
            placeholder={field.helpText || `Enter ${field.displayName || field.name}`}
          />
        );
      
      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleFieldChange(field.identifier, e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">
              {field.helpText || `Enable ${field.displayName || field.name}`}
            </span>
          </label>
        );
      
      case 'date':
        return (
          <div className="relative">
            <input
              type="date"
              value={value ? new Date(value).toISOString().split('T')[0] : ''}
              onChange={(e) => handleFieldChange(field.identifier, e.target.value)}
              className={baseInputClasses}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        );
      
      case 'datetime':
        return (
          <div className="relative">
            <input
              type="datetime-local"
              value={value ? new Date(value).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleFieldChange(field.identifier, e.target.value)}
              className={baseInputClasses}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        );
      
      case 'dropdown':
        const choices = field.options?.choices || [];
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.identifier, e.target.value)}
            className={baseInputClasses}
          >
            <option value="">Select {field.displayName || field.name}</option>
            {choices.map((choice: any, index: number) => (
              <option key={index} value={choice.value || choice}>
                {choice.label || choice}
              </option>
            ))}
          </select>
        );
      
      case 'multiselect':
        const multiChoices = field.options?.choices || [];
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {multiChoices.map((choice: any, index: number) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(choice.value || choice)}
                  onChange={(e) => {
                    const choiceValue = choice.value || choice;
                    if (e.target.checked) {
                      handleFieldChange(field.identifier, [...selectedValues, choiceValue]);
                    } else {
                      handleFieldChange(field.identifier, selectedValues.filter((v: any) => v !== choiceValue));
                    }
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{choice.label || choice}</span>
              </label>
            ))}
          </div>
        );
      
      case 'file':
      case 'image':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept={field.type === 'image' ? 'image/*' : '*/*'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFieldChange(field.identifier, file);
                  }
                }}
                className="hidden"
                id={`file-${field.identifier}`}
              />
              <label
                htmlFor={`file-${field.identifier}`}
                className="btn-secondary flex items-center space-x-2 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Choose File</span>
              </label>
              {value && (
                <span className="text-sm text-gray-600">
                  {typeof value === 'string' ? value : value.name}
                </span>
              )}
            </div>
          </div>
        );
      
      case 'geography':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={value?.lat || ''}
                onChange={(e) => handleFieldChange(field.identifier, {
                  ...value,
                  lat: parseFloat(e.target.value) || 0
                })}
                className={baseInputClasses}
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={value?.lng || ''}
                onChange={(e) => handleFieldChange(field.identifier, {
                  ...value,
                  lng: parseFloat(e.target.value) || 0
                })}
                className={baseInputClasses}
              />
            </div>
            <button
              type="button"
              className="btn-secondary flex items-center space-x-2 w-full"
            >
              <MapPin className="h-4 w-4" />
              <span>Pick Location</span>
            </button>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.identifier, e.target.value)}
            className={baseInputClasses}
            placeholder={field.helpText || `Enter ${field.displayName || field.name}`}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {record ? 'Edit Record' : 'Create Record'} - {table.name}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 overflow-y-auto flex-1">
            <div className="space-y-6">
              {table.fields?.map(field => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.displayName || field.name}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                  {errors[field.identifier] && (
                    <p className="mt-1 text-sm text-red-600">{errors[field.identifier]}</p>
                  )}
                  {field.helpText && !errors[field.identifier] && (
                    <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}