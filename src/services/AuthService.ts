import type { User, AuthCredentials } from '@/types/auth'
import { SubscriptionPlan } from '@/types/auth'

export class AuthService {
  static async login(credentials: AuthCredentials): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (credentials.email === 'demo@example.com' && credentials.password === 'demo') {
      const user: User = {
        id: 'demo-user',
        email: credentials.email,
        name: 'Demo User',
        plan: SubscriptionPlan.FREE,
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date()
      }
      
      localStorage.setItem('user', JSON.stringify(user))
      return user
    }
    
    throw new Error('Invalid credentials')
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('user')
  }

  static async getCurrentUser(): Promise<User | null> {
    const userData = localStorage.getItem('user')
    if (userData) {
      return JSON.parse(userData)
    }
    return null
  }

  static async register(email: string, password: string, name: string): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user: User = {
      id: Date.now().toString(),
      email,
      name,
      plan: SubscriptionPlan.FREE,
      createdAt: new Date(),
      lastLogin: new Date()
    }
    
    localStorage.setItem('user', JSON.stringify(user))
    return user
  }

  static async resetPassword(email: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Password reset email sent to:', email)
  }

  static async updateProfile(updates: Partial<User>): Promise<User> {
    const userData = localStorage.getItem('user')
    if (!userData) throw new Error('User not found')
    
    const user = JSON.parse(userData)
    const updatedUser = { ...user, ...updates }
    
    localStorage.setItem('user', JSON.stringify(updatedUser))
    return updatedUser
  }
}