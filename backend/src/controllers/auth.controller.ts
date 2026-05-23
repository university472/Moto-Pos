// backend/src/controllers/auth.controller.ts
// Handles: login, logout, token refresh, get current user (me).
// Every function is wrapped in try/catch — errors forwarded to globalErrorHandler.
// JWT strategy: access token (15m, in response body) + refresh token (7d, httpOnly cookie).

import { Request, Response, NextFunction } from 'express'
import jwt, { SignOptions } from 'jsonwebtoken'
import { env } from '../config/env'
import User from '../models/User.model'
import { AppError } from '../middleware/error.middleware'
import {
  AuthenticatedRequest,
  JwtAccessPayload,
  JwtRefreshPayload
} from '../types/auth.types'
import { LoginInput } from '../validators/auth.validator'

// ── Helper: generate access token ────────────────────────────────────────
function generateAccessToken(payload: JwtAccessPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn']
  }

  return jwt.sign(payload, env.JWT_SECRET, options)
}

// ── Helper: generate refresh token ───────────────────────────────────────
function generateRefreshToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']
  }

  return jwt.sign(
    { userId } as JwtRefreshPayload,
    env.JWT_REFRESH_SECRET,
    options
  )
}

// ── Helper: set refresh token as httpOnly cookie ──────────────────────────
function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/' // ← FIXED: was "/api/v1/auth" which caused cross-port issues
  })
}
// ─────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// Body: { username, password }
// Public route — no JWT required
// ─────────────────────────────────────────────────────────────────────────
export async function login(
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, password } = req.body

    // ── 1. Find user by username (includes password for comparison) ────
    const user = await User.findByUsername(username)

    if (!user) {
      // Use same message for non-existent user AND wrong password
      // (prevents username enumeration attacks)
      throw new AppError(
        'Invalid username or password. Please check your credentials.',
        401
      )
    }

    // ── 2. Check account is active ────────────────────────────────────
    if (!user.isActive) {
      throw new AppError(
        'Your account has been disabled. Please contact the administrator.',
        403
      )
    }

    // ── 3. Compare password against bcrypt hash ───────────────────────
    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
      throw new AppError(
        'Invalid username or password. Please check your credentials.',
        401
      )
    }

    // ── 4. Generate tokens ─────────────────────────────────────────────
    const accessTokenPayload: JwtAccessPayload = {
      userId: user._id.toString(),
      role: user.role,
      name: user.name
    }

    const accessToken = generateAccessToken(accessTokenPayload)
    const refreshToken = generateRefreshToken(user._id.toString())

    // ── 5. Set refresh token as httpOnly cookie ────────────────────────
    setRefreshTokenCookie(res, refreshToken)

    // ── 6. Return access token + user info in response body ───────────
    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        accessToken,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          role: user.role
        }
      },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/logout
// Clears the refresh token cookie — access token expires on its own (15m)
// Protected route — requires valid access token
// ─────────────────────────────────────────────────────────────────────────
export async function logout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Clear the httpOnly refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: 'strict',
      path: '/' // ← FIXED: must match the path used in setRefreshTokenCookie
    })

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
      data: null,
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/refresh
// Uses the httpOnly refresh token cookie to issue a new access token.
// Call this when the frontend gets a 401 (access token expired).
// ─────────────────────────────────────────────────────────────────────────
export async function refreshAccessToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // ── 1. Extract refresh token from httpOnly cookie ─────────────────
    const refreshToken = req.cookies?.refreshToken as string | undefined

    if (!refreshToken) {
      throw new AppError('No refresh token found. Please log in again.', 401)
    }

    // ── 2. Verify refresh token ────────────────────────────────────────
    let decoded: JwtRefreshPayload
    try {
      decoded = jwt.verify(
        refreshToken,
        env.JWT_REFRESH_SECRET
      ) as JwtRefreshPayload
    } catch {
      throw new AppError(
        'Refresh token is invalid or expired. Please log in again.',
        401
      )
    }

    // ── 3. Fetch fresh user data from DB ──────────────────────────────
    // (In case role or name changed since last login)
    const user = await User.findById(decoded.userId).select(
      '_id name username role isActive'
    )

    if (!user || !user.isActive) {
      throw new AppError(
        'User account not found or has been disabled. Please log in again.',
        401
      )
    }

    // ── 4. Issue new access token ──────────────────────────────────────
    const accessTokenPayload: JwtAccessPayload = {
      userId: user._id.toString(),
      role: user.role,
      name: user.name
    }

    const newAccessToken = generateAccessToken(accessTokenPayload)

    // ── 5. Rotate refresh token (issue new one for extended sessions) ──
    const newRefreshToken = generateRefreshToken(user._id.toString())
    setRefreshTokenCookie(res, newRefreshToken)

    res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully.',
      data: {
        accessToken: newAccessToken,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          role: user.role
        }
      },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/me
// Returns the currently logged-in user's profile.
// Protected route — requires valid access token.
// ─────────────────────────────────────────────────────────────────────────
export async function getMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // req.user is set by verifyToken middleware
    const user = await User.findById(req.user.userId).select(
      '_id name username role isActive createdAt'
    )

    if (!user || !user.isActive) {
      throw new AppError('User account not found or has been deactivated.', 404)
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully.',
      data: { user },
      error: null
    })
  } catch (error) {
    next(error)
  }
}
