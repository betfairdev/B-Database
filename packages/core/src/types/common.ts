import { BaseEntity } from 'typeorm';

/**
 * Base interface for all platform entities
 */
export interface IPlatformEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tenantId: string;
}

/**
 * Audit information for tracking changes
 */
export interface IAuditInfo {
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
}

/**
 * Pagination parameters
 */
export interface IPaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Paginated response wrapper
 */
export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Filter criteria for queries
 */
export interface IFilterCriteria {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike';
  value: any;
}

/**
 * Query parameters for advanced filtering
 */
export interface IQueryParams extends IPaginationParams {
  filters?: IFilterCriteria[];
  search?: string;
  includes?: string[];
}

/**
 * Generic response wrapper
 */
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

/**
 * Bulk operation result
 */
export interface IBulkOperationResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    index: number;
    error: string;
  }>;
}