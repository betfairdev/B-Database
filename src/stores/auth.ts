import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BiometricAuthService } from '../services/BiometricAuthService'
import { PinAuthService } from '../services/PinAuthService'
import { AuthenticatorService } from '../services/AuthenticatorService'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const authMethod = ref<'biometric' | 'pin' | null>(null)
  const deviceId = ref('')
  const subscriptionPlan = ref('free')
  const requiresAuthenticator = ref(false)
  const authenticatorVerified = ref(false)

  const hasAuthSetup = computed(() => {
    return PinAuthService.hasPinSet() || authMethod.value === 'biometric'
  })

  const hasAuthenticatorSetup = computed(() => {
    return AuthenticatorService.isSetup()
  })

  const isFullyAuthenticated = computed(() => {
    if (!isAuthenticated.value) return false
    if (hasAuthenticatorSetup.value && !authenticatorVerified.value) return false
    return true
  })

  const initializeAuth = async () => {
    isLoading.value = true
    try {
      // Generate or get device ID
      let storedDeviceId = localStorage.getItem('deviceId')
      if (!storedDeviceId) {
        storedDeviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('deviceId', storedDeviceId)
      }
      deviceId.value = storedDeviceId

      // Check if biometric is available and preferred
      const biometricAvailable = await BiometricAuthService.isAvailable()
      const hasPinSet = PinAuthService.hasPinSet()
      
      if (biometricAvailable && localStorage.getItem('preferBiometric') === 'true') {
        authMethod.value = 'biometric'
      } else if (hasPinSet) {
        authMethod.value = 'pin'
      }

      // Load subscription plan
      const savedPlan = localStorage.getItem('subscriptionPlan')
      if (savedPlan) {
        subscriptionPlan.value = savedPlan
      }

      // Check if authenticator is required for auth reset
      requiresAuthenticator.value = hasAuthenticatorSetup.value
    } catch (error) {
      console.error('Failed to initialize auth:', error)
    } finally {
      isLoading.value = false
    }
  }

  const setupAuth = async (method: 'biometric' | 'pin') => {
    authMethod.value = method
    if (method === 'biometric') {
      localStorage.setItem('preferBiometric', 'true')
    }
    isAuthenticated.value = true
  }

  const authenticate = async (): Promise<boolean> => {
    isLoading.value = true
    try {
      if (authMethod.value === 'biometric') {
        const result = await BiometricAuthService.authenticate()
        if (result.success) {
          isAuthenticated.value = true
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Authentication failed:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const authenticateWithPin = async (pin: string): Promise<boolean> => {
    const isValid = await PinAuthService.verifyPin(pin)
    if (isValid) {
      isAuthenticated.value = true
      return true
    }
    return false
  }

  const verifyAuthenticator = async (code: string): Promise<boolean> => {
    const result = await AuthenticatorService.verifyCode(code)
    if (result.success) {
      authenticatorVerified.value = true
      return true
    }
    return false
  }

  const logout = () => {
    isAuthenticated.value = false
    authenticatorVerified.value = false
  }

  const resetAuth = async (authenticatorCode?: string): Promise<boolean> => {
    // If authenticator is set up, require verification
    if (hasAuthenticatorSetup.value) {
      if (!authenticatorCode) {
        throw new Error('Authenticator verification required')
      }
      
      const result = await AuthenticatorService.verifyCode(authenticatorCode)
      if (!result.success) {
        throw new Error('Invalid authenticator code')
      }
    }

    // Reset authentication methods
    PinAuthService.removePin()
    localStorage.removeItem('preferBiometric')
    authMethod.value = null
    isAuthenticated.value = false
    authenticatorVerified.value = false
    
    return true
  }

  const updateSubscription = (plan: string) => {
    subscriptionPlan.value = plan
    localStorage.setItem('subscriptionPlan', plan)
  }

  const setupAuthenticator = async () => {
    return await AuthenticatorService.setupAuthenticator()
  }

  const removeAuthenticator = async (authenticatorCode: string): Promise<boolean> => {
    const result = await AuthenticatorService.verifyCode(authenticatorCode)
    if (result.success) {
      AuthenticatorService.removeAuthenticator()
      requiresAuthenticator.value = false
      return true
    }
    return false
  }

  return {
    isAuthenticated,
    isLoading,
    authMethod,
    deviceId,
    subscriptionPlan,
    requiresAuthenticator,
    authenticatorVerified,
    hasAuthSetup,
    hasAuthenticatorSetup,
    isFullyAuthenticated,
    initializeAuth,
    setupAuth,
    authenticate,
    authenticateWithPin,
    verifyAuthenticator,
    logout,
    resetAuth,
    updateSubscription,
    setupAuthenticator,
    removeAuthenticator
  }
})