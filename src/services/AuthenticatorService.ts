export interface AuthenticatorCode {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface VerificationResult {
  success: boolean
  error?: string
}

export class AuthenticatorService {
  private static readonly AUTHENTICATOR_KEY = 'authenticator_secret'
  private static readonly BACKUP_CODES_KEY = 'backup_codes'

  static generateSecret(): string {
    // Generate a base32 secret for TOTP
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return secret
  }

  static generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)
    }
    return codes
  }

  static async setupAuthenticator(appName: string = 'Database Manager'): Promise<AuthenticatorCode> {
    const secret = this.generateSecret()
    const backupCodes = this.generateBackupCodes()
    
    // Generate QR code URL for authenticator apps
    const issuer = encodeURIComponent(appName)
    const accountName = encodeURIComponent('User Account')
    const qrCode = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`
    
    // Store secret and backup codes
    localStorage.setItem(this.AUTHENTICATOR_KEY, secret)
    localStorage.setItem(this.BACKUP_CODES_KEY, JSON.stringify(backupCodes))
    
    return {
      secret,
      qrCode,
      backupCodes
    }
  }

  static async verifyCode(code: string): Promise<VerificationResult> {
    const secret = localStorage.getItem(this.AUTHENTICATOR_KEY)
    if (!secret) {
      return { success: false, error: 'Authenticator not set up' }
    }

    // Check if it's a backup code
    const backupCodes = JSON.parse(localStorage.getItem(this.BACKUP_CODES_KEY) || '[]')
    if (backupCodes.includes(code.toUpperCase())) {
      // Remove used backup code
      const updatedCodes = backupCodes.filter((c: string) => c !== code.toUpperCase())
      localStorage.setItem(this.BACKUP_CODES_KEY, JSON.stringify(updatedCodes))
      return { success: true }
    }

    // Verify TOTP code (simplified implementation for demo)
    const isValid = this.verifyTOTP(secret, code)
    
    return {
      success: isValid,
      error: isValid ? undefined : 'Invalid code'
    }
  }

  static isSetup(): boolean {
    return !!localStorage.getItem(this.AUTHENTICATOR_KEY)
  }

  static removeAuthenticator(): void {
    localStorage.removeItem(this.AUTHENTICATOR_KEY)
    localStorage.removeItem(this.BACKUP_CODES_KEY)
  }

  static getBackupCodes(): string[] {
    return JSON.parse(localStorage.getItem(this.BACKUP_CODES_KEY) || '[]')
  }

  private static verifyTOTP(secret: string, token: string): boolean {
    // DEMO IMPLEMENTATION: Simplified TOTP verification for demonstration purposes
    // In production, use a proper TOTP library like 'otpauth' or 'speakeasy'
    const timeStep = Math.floor(Date.now() / 1000 / 30)
    
    // Check current time window and adjacent windows for clock drift
    for (let i = -1; i <= 1; i++) {
      const expectedToken = this.generateTOTP(secret, timeStep + i)
      if (expectedToken === token) {
        return true
      }
    }
    
    return false
  }

  private static generateTOTP(secret: string, timeStep: number): string {
    // DEMO IMPLEMENTATION: Simplified TOTP generation for demonstration purposes
    // In production, use proper HMAC-SHA1 implementation with a library
    const hash = this.simpleHash(secret + timeStep.toString())
    const code = (hash % 1000000).toString().padStart(6, '0')
    return code
  }

  private static simpleHash(str: string): number {
    // DEMO IMPLEMENTATION: Simple hash function for demonstration purposes
    // In production, use a cryptographically secure hash function
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}