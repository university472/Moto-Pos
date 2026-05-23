// frontend/src/types/user.ts
// TypeScript interfaces for the User collection — mirrors Section 8 schema exactly.

export type UserRole = 'admin' | 'cashier'

export interface User {
  _id: string
  name: string
  username: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// What gets stored in Zustand auth store after login
export interface AuthUser {
  _id: string
  name: string
  username: string
  role: UserRole
}

// Login form fields
export interface LoginFormData {
  username: string
  password: string
}

// JWT access token payload (decoded from the token)
export interface JwtPayload {
  userId: string
  role: UserRole
  name: string
  iat: number
  exp: number
}

// Login API response data shape
export interface LoginResponseData {
  accessToken: string
  user: AuthUser
}

// Create user form (admin only)
export interface CreateUserFormData {
  name: string
  username: string
  password: string
  role: UserRole
}
