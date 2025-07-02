import { FieldTypeRegistry } from '../services/FieldTypeRegistry';

describe('FieldTypeRegistry', () => {
  let registry: FieldTypeRegistry;

  beforeEach(() => {
    registry = new FieldTypeRegistry();
  });

  test('should have built-in field types', () => {
    const textType = registry.get('text');
    expect(textType).toBeDefined();
    expect(textType?.name).toBe('text');
    expect(textType?.displayName).toBe('Text');
  });

  test('should validate text fields', () => {
    const textType = registry.get('text');
    expect(textType?.validate('hello')).toBe(true);
    expect(textType?.validate(123)).toBe('Must be a string');
  });

  test('should validate email fields', () => {
    const emailType = registry.get('email');
    expect(emailType?.validate('test@example.com')).toBe(true);
    expect(emailType?.validate('invalid-email')).toBe('Must be a valid email address');
  });

  test('should validate number fields', () => {
    const numberType = registry.get('number');
    expect(numberType?.validate(42)).toBe(true);
    expect(numberType?.validate('not-a-number')).toBe('Must be a valid number');
  });

  test('should validate with options', () => {
    const textType = registry.get('text');
    expect(textType?.validate('hello', { maxLength: 10 })).toBe(true);
    expect(textType?.validate('this is too long', { maxLength: 10 })).toBe('Must be less than 10 characters');
  });

  test('should register custom field types', () => {
    registry.register({
      name: 'custom',
      displayName: 'Custom Field',
      description: 'A custom field type',
      category: 'advanced',
      validate: (value) => value === 'valid' || 'Must be "valid"',
      serialize: (value) => value,
      deserialize: (value) => value,
      ui: { component: 'CustomInput' }
    });

    const customType = registry.get('custom');
    expect(customType).toBeDefined();
    expect(customType?.validate('valid')).toBe(true);
    expect(customType?.validate('invalid')).toBe('Must be "valid"');
  });

  test('should get field types by category', () => {
    const basicTypes = registry.getByCategory('basic');
    expect(basicTypes.length).toBeGreaterThan(0);
    expect(basicTypes.every(type => type.category === 'basic')).toBe(true);
  });
});