/**
 * Field type validator interface
 */
export interface IFieldValidator {
  /**
   * Validate field value
   */
  validate(value: any, constraints?: Record<string, any>): Promise<ValidationResult>;

  /**
   * Get validation schema
   */
  getSchema(): Record<string, any>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Field type formatter interface
 */
export interface IFieldFormatter {
  /**
   * Format value for display
   */
  format(value: any, options?: Record<string, any>): string;

  /**
   * Parse formatted value back to raw value
   */
  parse(formatted: string, options?: Record<string, any>): any;
}

/**
 * Field type definition interface
 */
export interface IFieldType {
  /**
   * Field type name
   */
  name: string;

  /**
   * Field type category
   */
  category: string;

  /**
   * Field type description
   */
  description: string;

  /**
   * Default constraints
   */
  defaultConstraints: Record<string, any>;

  /**
   * Validator instance
   */
  validator: IFieldValidator;

  /**
   * Formatter instance
   */
  formatter: IFieldFormatter;

  /**
   * Whether the field type supports indexing
   */
  supportsIndexing: boolean;

  /**
   * Whether the field type supports sorting
   */
  supportsSorting: boolean;

  /**
   * Whether the field type supports filtering
   */
  supportsFiltering: boolean;

  /**
   * Get SQL column definition
   */
  getSqlDefinition(constraints?: Record<string, any>): string;

  /**
   * Convert raw value to storage format
   */
  toStorage(value: any): any;

  /**
   * Convert storage value to application format
   */
  fromStorage(value: any): any;
}