export class Validators {
  static isValidIdentifier(identifier: string): boolean {
    const identifierRegex = /^[a-z][a-z0-9_]*$/;
    return identifierRegex.test(identifier);
  }

  static isValidTableName(name: string): boolean {
    return name.length > 0 && name.length <= 255;
  }

  static isValidFieldName(name: string): boolean {
    return name.length > 0 && name.length <= 255;
  }

  static isValidFieldType(type: string, availableTypes: string[]): boolean {
    return availableTypes.includes(type);
  }

  static validateFieldValue(value: any, fieldType: string, options?: Record<string, any>): string | null {
    // This would integrate with the FieldTypeRegistry for validation
    return null; // Return null if valid, error message if invalid
  }

  static sanitizeIdentifier(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/^[0-9]/, 'field_$&')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}