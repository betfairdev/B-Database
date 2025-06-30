import { Capacitor } from '@capacitor/core'

export interface BiometricAuthResult {
  success: boolean
  error?: string
  biometryType?: 'fingerprint' | 'face' | 'iris' | 'voice'
}

export class BiometricAuthService {
  static async isAvailable(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        // Use @aparajita/capacitor-biometric-auth for native platforms
        const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth')
        const result = await BiometricAuth.checkBiometry()
        return result.isAvailable
      } catch (error) {
        console.error('Biometric auth check failed:', error)
        return false
      }
    } else {
      // Check for WebAuthn support in browsers
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          return available
        } catch {
          return false
        }
      }
      return false
    }
  }

  static async authenticate(reason: string = 'Authenticate to access your data'): Promise<BiometricAuthResult> {
    if (Capacitor.isNativePlatform()) {
      try {
        const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth')
        await BiometricAuth.authenticate({
          reason,
          cancelTitle: 'Cancel',
          allowDeviceCredential: true,
          iosFallbackTitle: 'Use passcode',
          androidTitle: 'Biometric Authentication',
          androidSubtitle: reason,
          androidConfirmationRequired: false
        })
        
        return {
          success: true,
          biometryType: 'fingerprint' // This would be determined by the actual biometry type
        }
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Biometric authentication failed'
        }
      }
    } else {
      // WEB PLATFORM DEMO: Simulated authentication for demonstration purposes
      // In production, implement WebAuthn or similar browser-based biometric authentication
      try {
        if (!await this.isAvailable()) {
          return {
            success: false,
            error: 'Biometric authentication not available'
          }
        }

        // Simulate successful authentication for demo with timeout
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              success: true,
              biometryType: 'fingerprint'
            })
          }, 1000)
        })
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Authentication failed'
        }
      }
    }
  }

  static async enrollBiometric(): Promise<BiometricAuthResult> {
    return this.authenticate('Set up biometric authentication')
  }
}