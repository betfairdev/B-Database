import { IFieldType, IFieldValidator, IFieldFormatter, ValidationResult } from './field-type.interface.js';

/**
 * Base field validator
 */
abstract class BaseValidator implements IFieldValidator {
  abstract validate(value: any, constraints?: Record<string, any>): Promise<ValidationResult>;
  abstract getSchema(): Record<string, any>;

  protected createResult(isValid: boolean, errors: string[] = [], warnings: string[] = []): ValidationResult {
    return { isValid, errors, warnings };
  }
}

/**
 * Base field formatter
 */
abstract class BaseFormatter implements IFieldFormatter {
  abstract format(value: any, options?: Record<string, any>): string;
  abstract parse(formatted: string, options?: Record<string, any>): any;
}

/**
 * String field type
 */
class StringValidator extends BaseValidator {
  async validate(value: any, constraints: Record<string, any> = {}): Promise<ValidationResult> {
    const errors: string[] = [];

    if (value == null && constraints.required) {
      errors.push('Value is required');
      return this.createResult(false, errors);
    }

    if (value != null && typeof value !== 'string') {
      errors.push('Value must be a string');
      return this.createResult(false, errors);
    }

    if (typeof value === 'string') {
      if (constraints.minLength && value.length < constraints.minLength) {
        errors.push(`Value must be at least ${constraints.minLength} characters long`);
      }
      if (constraints.maxLength && value.length > constraints.maxLength) {
        errors.push(`Value must be at most ${constraints.maxLength} characters long`);
      }
      if (constraints.pattern && !new RegExp(constraints.pattern).test(value)) {
        errors.push('Value does not match required pattern');
      }
    }

    return this.createResult(errors.length === 0, errors);
  }

  getSchema(): Record<string, any> {
    return {
      type: 'string',
      properties: {
        minLength: { type: 'number', minimum: 0 },
        maxLength: { type: 'number', minimum: 1 },
        pattern: { type: 'string' },
        required: { type: 'boolean' },
      },
    };
  }
}

class StringFormatter extends BaseFormatter {
  format(value: any, options: Record<string, any> = {}): string {
    if (value == null) return '';
    return String(value);
  }

  parse(formatted: string, options: Record<string, any> = {}): any {
    return formatted;
  }
}

/**
 * Number field type
 */
class NumberValidator extends BaseValidator {
  async validate(value: any, constraints: Record<string, any> = {}): Promise<ValidationResult> {
    const errors: string[] = [];

    if (value == null && constraints.required) {
      errors.push('Value is required');
      return this.createResult(false, errors);
    }

    if (value != null && typeof value !== 'number') {
      errors.push('Value must be a number');
      return this.createResult(false, errors);
    }

    if (typeof value === 'number') {
      if (constraints.min != null && value < constraints.min) {
        errors.push(`Value must be at least ${constraints.min}`);
      }
      if (constraints.max != null && value > constraints.max) {
        errors.push(`Value must be at most ${constraints.max}`);
      }
      if (constraints.integer && !Number.isInteger(value)) {
        errors.push('Value must be an integer');
      }
    }

    return this.createResult(errors.length === 0, errors);
  }

  getSchema(): Record<string, any> {
    return {
      type: 'number',
      properties: {
        min: { type: 'number' },
        max: { type: 'number' },
        integer: { type: 'boolean' },
        required: { type: 'boolean' },
      },
    };
  }
}

class NumberFormatter extends BaseFormatter {
  format(value: any, options: Record<string, any> = {}): string {
    if (value == null) return '';
    const num = Number(value);
    if (options.decimals != null) {
      return num.toFixed(options.decimals);
    }
    return num.toString();
  }

  parse(formatted: string, options: Record<string, any> = {}): any {
    const num = Number(formatted);
    return isNaN(num) ? null : num;
  }
}

/**
 * Boolean field type
 */
class BooleanValidator extends BaseValidator {
  async validate(value: any, constraints: Record<string, any> = {}): Promise<ValidationResult> {
    const errors: string[] = [];

    if (value == null && constraints.required) {
      errors.push('Value is required');
      return this.createResult(false, errors);
    }

    if (value != null && typeof value !== 'boolean') {
      errors.push('Value must be a boolean');
      return this.createResult(false, errors);
    }

    return this.createResult(errors.length === 0, errors);
  }

  getSchema(): Record<string, any> {
    return {
      type: 'boolean',
      properties: {
        required: { type: 'boolean' },
      },
    };
  }
}

class BooleanFormatter extends BaseFormatter {
  format(value: any, options: Record<string, any> = {}): string {
    if (value == null) return '';
    return Boolean(value) ? 'true' : 'false';
  }

  parse(formatted: string, options: Record<string, any> = {}): any {
    if (!formatted) return null;
    return formatted.toLowerCase() === 'true';
  }
}

/**
 * Date field type
 */
class DateValidator extends BaseValidator {
  async validate(value: any, constraints: Record<string, any> = {}): Promise<ValidationResult> {
    const errors: string[] = [];

    if (value == null && constraints.required) {
      errors.push('Value is required');
      return this.createResult(false, errors);
    }

    if (value != null) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push('Value must be a valid date');
        return this.createResult(false, errors);
      }

      if (constraints.minDate) {
        const minDate = new Date(constraints.minDate);
        if (date < minDate) {
          errors.push(`Date must be after ${minDate.toISOString().split('T')[0]}`);
        }
      }

      if (constraints.maxDate) {
        const maxDate = new Date(constraints.maxDate);
        if (date > maxDate) {
          errors.push(`Date must be before ${maxDate.toISOString().split('T')[0]}`);
        }
      }
    }

    return this.createResult(errors.length === 0, errors);
  }

  getSchema(): Record<string, any> {
    return {
      type: 'string',
      format: 'date',
      properties: {
        minDate: { type: 'string', format: 'date' },
        maxDate: { type: 'string', format: 'date' },
        required: { type: 'boolean' },
      },
    };
  }
}

class DateFormatter extends BaseFormatter {
  format(value: any, options: Record<string, any> = {}): string {
    if (value == null) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    
    const format = options.format || 'iso';
    switch (format) {
      case 'iso':
        return date.toISOString().split('T')[0];
      case 'us':
        return date.toLocaleDateString('en-US');
      case 'eu':
        return date.toLocaleDateString('en-GB');
      default:
        return date.toLocaleDateString();
    }
  }

  parse(formatted: string, options: Record<string, any> = {}): any {
    if (!formatted) return null;
    const date = new Date(formatted);
    return isNaN(date.getTime()) ? null : date;
  }
}

/**
 * DateTime field type
 */
class DateTimeValidator extends BaseValidator {
  async validate(value: any, constraints: Record<string, any> = {}): Promise<ValidationResult> {
    const errors: string[] = [];

    if (value == null && constraints.required) {
      errors.push('Value is required');
      return this.createResult(false, errors);
    }

    if (value != null) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push('Value must be a valid datetime');
        return this.createResult(false, errors);
      }
    }

    return this.createResult(errors.length === 0, errors);
  }

  getSchema(): Record<string, any> {
    return {
      type: 'string',
      format: 'date-time',
      properties: {
        required: { type: 'boolean' },
      },
    };
  }
}

class DateTimeFormatter extends BaseFormatter {
  format(value: any, options: Record<string, any> = {}): string {
    if (value == null) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toISOString();
  }

  parse(formatted: string, options: Record<string, any> = {}): any {
    if (!formatted) return null;
    const date = new Date(formatted);
    return isNaN(date.getTime()) ? null : date;
  }
}

/**
 * JSON field type
 */
class JsonValidator extends BaseValidator {
  async validate(value: any, constraints: Record<string, any> = {}): Promise<ValidationResult> {
    const errors: string[] = [];

    if (value == null && constraints.required) {
      errors.push('Value is required');
      return this.createResult(false, errors);
    }

    if (value != null) {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
      } catch {
        errors.push('Value must be valid JSON');
      }
    }

    return this.createResult(errors.length === 0, errors);
  }

  getSchema(): Record<string, any> {
    return {
      type: 'object',
      properties: {
        required: { type: 'boolean' },
      },
    };
  }
}

class JsonFormatter extends BaseFormatter {
  format(value: any, options: Record<string, any> = {}): string {
    if (value == null) return '';
    try {
      return JSON.stringify(value, null, options.indent || 0);
    } catch {
      return '';
    }
  }

  parse(formatted: string, options: Record<string, any> = {}): any {
    if (!formatted) return null;
    try {
      return JSON.parse(formatted);
    } catch {
      return null;
    }
  }
}

/**
 * UUID field type
 */
class UuidValidator extends BaseValidator {
  private readonly uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  async validate(value: any, constraints: Record<string, any> = {}): Promise<ValidationResult> {
    const errors: string[] = [];

    if (value == null && constraints.required) {
      errors.push('Value is required');
      return this.createResult(false, errors);
    }

    if (value != null && (typeof value !== 'string' || !this.uuidRegex.test(value))) {
      errors.push('Value must be a valid UUID');
      return this.createResult(false, errors);
    }

    return this.createResult(errors.length === 0, errors);
  }

  getSchema(): Record<string, any> {
    return {
      type: 'string',
      format: 'uuid',
      properties: {
        required: { type: 'boolean' },
      },
    };
  }
}

class UuidFormatter extends BaseFormatter {
  format(value: any, options: Record<string, any> = {}): string {
    if (value == null) return '';
    return String(value);
  }

  parse(formatted: string, options: Record<string, any> = {}): any {
    return formatted || null;
  }
}

/**
 * Email field type
 */
class EmailValidator extends BaseValidator {
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async validate(value: any, constraints: Record<string, any> = {}): Promise<ValidationResult> {
    const errors: string[] = [];

    if (value == null && constraints.required) {
      errors.push('Value is required');
      return this.createResult(false, errors);
    }

    if (value != null && (typeof value !== 'string' || !this.emailRegex.test(value))) {
      errors.push('Value must be a valid email address');
      return this.createResult(false, errors);
    }

    return this.createResult(errors.length === 0, errors);
  }

  getSchema(): Record<string, any> {
    return {
      type: 'string',
      format: 'email',
      properties: {
        required: { type: 'boolean' },
      },
    };
  }
}

class EmailFormatter extends BaseFormatter {
  format(value: any, options: Record<string, any> = {}): string {
    if (value == null) return '';
    return String(value).toLowerCase();
  }

  parse(formatted: string, options: Record<string, any> = {}): any {
    return formatted?.toLowerCase() || null;
  }
}

/**
 * URL field type
 */
class UrlValidator extends BaseValidator {
  async validate(value: any, constraints: Record<string, any> = {}): Promise<ValidationResult> {
    const errors: string[] = [];

    if (value == null && constraints.required) {
      errors.push('Value is required');
      return this.createResult(false, errors);
    }

    if (value != null) {
      try {
        new URL(value);
      } catch {
        errors.push('Value must be a valid URL');
      }
    }

    return this.createResult(errors.length === 0, errors);
  }

  getSchema(): Record<string, any> {
    return {
      type: 'string',
      format: 'uri',
      properties: {
        required: { type: 'boolean' },
      },
    };
  }
}

class UrlFormatter extends BaseFormatter {
  format(value: any, options: Record<string, any> = {}): string {
    if (value == null) return '';
    return String(value);
  }

  parse(formatted: string, options: Record<string, any> = {}): any {
    return formatted || null;
  }
}

/**
 * Built-in field types registry
 */
export const builtInFieldTypes: Record<string, IFieldType> = {
  string: {
    name: 'string',
    category: 'text',
    description: 'Text string field',
    defaultConstraints: { maxLength: 255 },
    validator: new StringValidator(),
    formatter: new StringFormatter(),
    supportsIndexing: true,
    supportsSorting: true,
    supportsFiltering: true,
    getSqlDefinition: (constraints = {}) => `VARCHAR(${constraints.maxLength || 255})`,
    toStorage: (value) => value,
    fromStorage: (value) => value,
  },

  number: {
    name: 'number',
    category: 'numeric',
    description: 'Numeric field',
    defaultConstraints: {},
    validator: new NumberValidator(),
    formatter: new NumberFormatter(),
    supportsIndexing: true,
    supportsSorting: true,
    supportsFiltering: true,
    getSqlDefinition: (constraints = {}) => constraints.integer ? 'INTEGER' : 'DECIMAL',
    toStorage: (value) => value,
    fromStorage: (value) => value,
  },

  boolean: {
    name: 'boolean',
    category: 'logical',
    description: 'Boolean true/false field',
    defaultConstraints: {},
    validator: new BooleanValidator(),
    formatter: new BooleanFormatter(),
    supportsIndexing: true,
    supportsSorting: true,
    supportsFiltering: true,
    getSqlDefinition: () => 'BOOLEAN',
    toStorage: (value) => value,
    fromStorage: (value) => value,
  },

  date: {
    name: 'date',
    category: 'temporal',
    description: 'Date field',
    defaultConstraints: {},
    validator: new DateValidator(),
    formatter: new DateFormatter(),
    supportsIndexing: true,
    supportsSorting: true,
    supportsFiltering: true,
    getSqlDefinition: () => 'DATE',
    toStorage: (value) => value instanceof Date ? value : new Date(value),
    fromStorage: (value) => value,
  },

  datetime: {
    name: 'datetime',
    category: 'temporal',
    description: 'Date and time field',
    defaultConstraints: {},
    validator: new DateTimeValidator(),
    formatter: new DateTimeFormatter(),
    supportsIndexing: true,
    supportsSorting: true,
    supportsFiltering: true,
    getSqlDefinition: () => 'TIMESTAMP',
    toStorage: (value) => value instanceof Date ? value : new Date(value),
    fromStorage: (value) => value,
  },

  json: {
    name: 'json',
    category: 'structured',
    description: 'JSON object field',
    defaultConstraints: {},
    validator: new JsonValidator(),
    formatter: new JsonFormatter(),
    supportsIndexing: false,
    supportsSorting: false,
    supportsFiltering: true,
    getSqlDefinition: () => 'JSONB',
    toStorage: (value) => typeof value === 'string' ? JSON.parse(value) : value,
    fromStorage: (value) => value,
  },

  uuid: {
    name: 'uuid',
    category: 'identifier',
    description: 'UUID field',
    defaultConstraints: {},
    validator: new UuidValidator(),
    formatter: new UuidFormatter(),
    supportsIndexing: true,
    supportsSorting: true,
    supportsFiltering: true,
    getSqlDefinition: () => 'UUID',
    toStorage: (value) => value,
    fromStorage: (value) => value,
  },

  email: {
    name: 'email',
    category: 'text',
    description: 'Email address field',
    defaultConstraints: {},
    validator: new EmailValidator(),
    formatter: new EmailFormatter(),
    supportsIndexing: true,
    supportsSorting: true,
    supportsFiltering: true,
    getSqlDefinition: () => 'VARCHAR(255)',
    toStorage: (value) => value?.toLowerCase(),
    fromStorage: (value) => value,
  },

  url: {
    name: 'url',
    category: 'text',
    description: 'URL field',
    defaultConstraints: {},
    validator: new UrlValidator(),
    formatter: new UrlFormatter(),
    supportsIndexing: true,
    supportsSorting: true,
    supportsFiltering: true,
    getSqlDefinition: () => 'TEXT',
    toStorage: (value) => value,
    fromStorage: (value) => value,
  },
};