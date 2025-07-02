import { FieldType } from '../types';

export class FieldTypeRegistry {
  private types = new Map<string, FieldType>();

  constructor() {
    this.registerBuiltInTypes();
  }

  register(type: FieldType): void {
    this.types.set(type.name, type);
  }

  get(name: string): FieldType | undefined {
    return this.types.get(name);
  }

  getAll(): FieldType[] {
    return Array.from(this.types.values());
  }

  getByCategory(category: string): FieldType[] {
    return Array.from(this.types.values()).filter(type => type.category === category);
  }

  private registerBuiltInTypes(): void {
    // Basic Types
    this.register({
      name: 'text',
      displayName: 'Text',
      description: 'Single line text input',
      category: 'basic',
      validate: (value, options) => {
        if (typeof value !== 'string') return 'Must be a string';
        if (options?.maxLength && value.length > options.maxLength) {
          return `Must be less than ${options.maxLength} characters`;
        }
        if (options?.minLength && value.length < options.minLength) {
          return `Must be at least ${options.minLength} characters`;
        }
        if (options?.pattern && !new RegExp(options.pattern).test(value)) {
          return `Must match pattern: ${options.pattern}`;
        }
        return true;
      },
      serialize: (value) => String(value || ''),
      deserialize: (value) => String(value || ''),
      ui: { component: 'TextInput' },
      defaultOptions: { maxLength: 255 }
    });

    this.register({
      name: 'textarea',
      displayName: 'Long Text',
      description: 'Multi-line text input',
      category: 'basic',
      validate: (value, options) => {
        if (typeof value !== 'string') return 'Must be a string';
        if (options?.maxLength && value.length > options.maxLength) {
          return `Must be less than ${options.maxLength} characters`;
        }
        return true;
      },
      serialize: (value) => String(value || ''),
      deserialize: (value) => String(value || ''),
      ui: { component: 'TextArea' },
      defaultOptions: { maxLength: 5000 }
    });

    this.register({
      name: 'number',
      displayName: 'Number',
      description: 'Numeric input',
      category: 'basic',
      validate: (value, options) => {
        const num = Number(value);
        if (isNaN(num)) return 'Must be a valid number';
        if (options?.min !== undefined && num < options.min) {
          return `Must be at least ${options.min}`;
        }
        if (options?.max !== undefined && num > options.max) {
          return `Must be at most ${options.max}`;
        }
        return true;
      },
      serialize: (value) => Number(value),
      deserialize: (value) => Number(value),
      ui: { component: 'NumberInput' }
    });

    this.register({
      name: 'boolean',
      displayName: 'Boolean',
      description: 'True/false checkbox',
      category: 'basic',
      validate: (value) => typeof value === 'boolean' || 'Must be true or false',
      serialize: (value) => Boolean(value),
      deserialize: (value) => Boolean(value),
      ui: { component: 'Checkbox' }
    });

    this.register({
      name: 'date',
      displayName: 'Date',
      description: 'Date picker',
      category: 'basic',
      validate: (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) || 'Must be a valid date';
      },
      serialize: (value) => new Date(value).toISOString().split('T')[0],
      deserialize: (value) => new Date(value),
      ui: { component: 'DatePicker' }
    });

    this.register({
      name: 'datetime',
      displayName: 'Date & Time',
      description: 'Date and time picker',
      category: 'basic',
      validate: (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) || 'Must be a valid date and time';
      },
      serialize: (value) => new Date(value).toISOString(),
      deserialize: (value) => new Date(value),
      ui: { component: 'DateTimePicker' }
    });

    // Advanced Types
    this.register({
      name: 'email',
      displayName: 'Email',
      description: 'Email address input',
      category: 'advanced',
      validate: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || 'Must be a valid email address';
      },
      serialize: (value) => String(value || '').toLowerCase(),
      deserialize: (value) => String(value || ''),
      ui: { component: 'EmailInput' }
    });

    this.register({
      name: 'phone',
      displayName: 'Phone',
      description: 'Phone number input',
      category: 'advanced',
      validate: (value) => {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(value) || 'Must be a valid phone number';
      },
      serialize: (value) => String(value || ''),
      deserialize: (value) => String(value || ''),
      ui: { component: 'PhoneInput' }
    });

    this.register({
      name: 'url',
      displayName: 'URL',
      description: 'Web address input',
      category: 'advanced',
      validate: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return 'Must be a valid URL';
        }
      },
      serialize: (value) => String(value || ''),
      deserialize: (value) => String(value || ''),
      ui: { component: 'URLInput' }
    });

    this.register({
      name: 'uuid',
      displayName: 'UUID',
      description: 'Unique identifier',
      category: 'advanced',
      validate: (value) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value) || 'Must be a valid UUID';
      },
      serialize: (value) => String(value || ''),
      deserialize: (value) => String(value || ''),
      ui: { component: 'UUIDInput' }
    });

    // Selection Types
    this.register({
      name: 'dropdown',
      displayName: 'Dropdown',
      description: 'Single selection from predefined options',
      category: 'basic',
      validate: (value, options) => {
        if (!options?.choices) return true;
        const validChoices = options.choices.map((c: any) => c.value || c);
        return validChoices.includes(value) || 'Must be a valid choice';
      },
      serialize: (value) => value,
      deserialize: (value) => value,
      ui: { component: 'Dropdown' },
      defaultOptions: { choices: [] }
    });

    this.register({
      name: 'multiselect',
      displayName: 'Multi-Select',
      description: 'Multiple selections from predefined options',
      category: 'basic',
      validate: (value, options) => {
        if (!Array.isArray(value)) return 'Must be an array';
        if (!options?.choices) return true;
        const validChoices = options.choices.map((c: any) => c.value || c);
        return value.every((v: any) => validChoices.includes(v)) || 'All selections must be valid choices';
      },
      serialize: (value) => Array.isArray(value) ? value : [],
      deserialize: (value) => Array.isArray(value) ? value : [],
      ui: { component: 'MultiSelect' },
      defaultOptions: { choices: [] }
    });

    // Media Types
    this.register({
      name: 'file',
      displayName: 'File',
      description: 'File upload',
      category: 'media',
      validate: (value, options) => {
        if (!value) return true;
        if (options?.maxSize && value.size > options.maxSize) {
          return `File size must be less than ${options.maxSize} bytes`;
        }
        if (options?.allowedTypes && !options.allowedTypes.includes(value.type)) {
          return `File type must be one of: ${options.allowedTypes.join(', ')}`;
        }
        return true;
      },
      serialize: (value) => value?.id || value,
      deserialize: (value) => value,
      ui: { component: 'FileUpload' },
      defaultOptions: { maxSize: 10485760 } // 10MB
    });

    this.register({
      name: 'image',
      displayName: 'Image',
      description: 'Image upload',
      category: 'media',
      validate: (value, options) => {
        if (!value) return true;
        const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!imageTypes.includes(value.type)) {
          return 'Must be a valid image file (JPEG, PNG, GIF, WebP)';
        }
        if (options?.maxSize && value.size > options.maxSize) {
          return `Image size must be less than ${options.maxSize} bytes`;
        }
        return true;
      },
      serialize: (value) => value?.id || value,
      deserialize: (value) => value,
      ui: { component: 'ImageUpload' },
      defaultOptions: { maxSize: 5242880 } // 5MB
    });

    // Advanced Data Types
    this.register({
      name: 'json',
      displayName: 'JSON',
      description: 'JSON data',
      category: 'advanced',
      validate: (value) => {
        try {
          if (typeof value === 'string') {
            JSON.parse(value);
          }
          return true;
        } catch {
          return 'Must be valid JSON';
        }
      },
      serialize: (value) => typeof value === 'string' ? JSON.parse(value) : value,
      deserialize: (value) => value,
      ui: { component: 'JSONEditor' }
    });

    this.register({
      name: 'richtext',
      displayName: 'Rich Text',
      description: 'Formatted text editor',
      category: 'advanced',
      validate: (value) => typeof value === 'string' || 'Must be a string',
      serialize: (value) => String(value || ''),
      deserialize: (value) => String(value || ''),
      ui: { component: 'RichTextEditor' }
    });

    this.register({
      name: 'rating',
      displayName: 'Rating',
      description: 'Star rating input',
      category: 'basic',
      validate: (value, options) => {
        const num = Number(value);
        if (isNaN(num)) return 'Must be a number';
        const max = options?.max || 5;
        return num >= 0 && num <= max || `Must be between 0 and ${max}`;
      },
      serialize: (value) => Number(value),
      deserialize: (value) => Number(value),
      ui: { component: 'Rating' },
      defaultOptions: { max: 5 }
    });

    // Location and Geographic Types
    this.register({
      name: 'geography',
      displayName: 'Location',
      description: 'Geographic coordinates',
      category: 'advanced',
      validate: (value) => {
        if (!value || typeof value !== 'object') return 'Must be a location object';
        const { lat, lng } = value;
        if (typeof lat !== 'number' || typeof lng !== 'number') {
          return 'Must have valid latitude and longitude';
        }
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 || 'Invalid coordinates';
      },
      serialize: (value) => value,
      deserialize: (value) => value,
      ui: { component: 'LocationPicker' }
    });

    // Specialized Types
    this.register({
      name: 'barcode',
      displayName: 'Barcode',
      description: 'Barcode scanner input',
      category: 'advanced',
      validate: (value) => typeof value === 'string' && value.length > 0 || 'Must be a valid barcode',
      serialize: (value) => String(value || ''),
      deserialize: (value) => String(value || ''),
      ui: { component: 'BarcodeScanner' }
    });

    this.register({
      name: 'qrcode',
      displayName: 'QR Code',
      description: 'QR code scanner input',
      category: 'advanced',
      validate: (value) => typeof value === 'string' && value.length > 0 || 'Must be a valid QR code',
      serialize: (value) => String(value || ''),
      deserialize: (value) => String(value || ''),
      ui: { component: 'QRCodeScanner' }
    });

    this.register({
      name: 'color',
      displayName: 'Color',
      description: 'Color picker',
      category: 'basic',
      validate: (value) => {
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return colorRegex.test(value) || 'Must be a valid hex color';
      },
      serialize: (value) => String(value || ''),
      deserialize: (value) => String(value || ''),
      ui: { component: 'ColorPicker' }
    });

    // Calculation Types
    this.register({
      name: 'formula',
      displayName: 'Formula',
      description: 'Calculated field',
      category: 'calculation',
      validate: (value, options) => {
        // Formula validation would need a proper expression parser
        return typeof options?.formula === 'string' || 'Must have a valid formula';
      },
      serialize: (value) => value,
      deserialize: (value) => value,
      ui: { component: 'FormulaEditor' },
      defaultOptions: { formula: '' }
    });

    this.register({
      name: 'lookup',
      displayName: 'Lookup',
      description: 'Reference to another table',
      category: 'relationship',
      validate: (value, options) => {
        if (!options?.lookupTable) return 'Must specify lookup table';
        return true;
      },
      serialize: (value) => value,
      deserialize: (value) => value,
      ui: { component: 'LookupField' },
      defaultOptions: { lookupTable: '', displayField: 'name' }
    });
  }
}