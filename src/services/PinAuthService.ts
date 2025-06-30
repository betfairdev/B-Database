export class PinAuthService {
  private static readonly PIN_KEY = 'user_pin_hash';
  private static readonly SALT = 'dbms_salt_2024';

  static hashPin(pin: string): string {
    // Simple hash implementation without crypto-js
    let hash = 0;
    const str = pin + this.SALT;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  static async setPin(pin: string): Promise<boolean> {
    try {
      if (pin.length < 4 || pin.length > 8) {
        throw new Error('PIN must be between 4 and 8 digits');
      }

      if (!/^\d+$/.test(pin)) {
        throw new Error('PIN must contain only numbers');
      }

      const hashedPin = this.hashPin(pin);
      localStorage.setItem(this.PIN_KEY, hashedPin);
      return true;
    } catch (error) {
      console.error('Failed to set PIN:', error);
      return false;
    }
  }

  static async verifyPin(pin: string): Promise<boolean> {
    try {
      const storedHash = localStorage.getItem(this.PIN_KEY);
      if (!storedHash) {
        return false;
      }

      const hashedPin = this.hashPin(pin);
      return hashedPin === storedHash;
    } catch (error) {
      console.error('Failed to verify PIN:', error);
      return false;
    }
  }

  static hasPinSet(): boolean {
    return !!localStorage.getItem(this.PIN_KEY);
  }

  static removePin(): void {
    localStorage.removeItem(this.PIN_KEY);
  }
}