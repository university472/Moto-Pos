// backend/src/controllers/users.controller.ts
// Admin-only user management — list, create, update, deactivate, change password.
// Cashier CANNOT access any of these endpoints (requireAdmin on all routes).

import { Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import User from '../models/User.model'
import { AppError } from '../middleware/error.middleware'
import { AuthenticatedRequest } from '../types/auth.types'
import {
  CreateUserInput,
  UpdateUserInput,
  ChangePasswordInput
} from '../validators/auth.validator'

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/users
// Role: Admin only — list all users (active + inactive)
// ─────────────────────────────────────────────────────────────────────────
export async function listUsers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const includeInactive = req.query.includeInactive === 'true'
    const filter = includeInactive ? {} : { isActive: true }

    const users = await User.find(filter)
      .select('-password')
      .sort({ role: 1, name: 1 })
      .lean()

    res.status(200).json({
      success: true,
      message: `${users.length} user(s) retrieved.`,
      data: { users, total: users.length },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/users/:id
// Role: Admin only
// ─────────────────────────────────────────────────────────────────────────
export async function getUserById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user ID format.', 400)
    }

    const user = await User.findById(id).select('-password').lean()

    if (!user) throw new AppError('User not found.', 404)

    res.status(200).json({
      success: true,
      message: 'User retrieved.',
      data: { user },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// POST /api/v1/users
// Role: Admin only — create a new cashier or admin account
// ─────────────────────────────────────────────────────────────────────────
export async function createUser(
  req: AuthenticatedRequest & { body: CreateUserInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, username, password, role } = req.body

    // Check duplicate username
    const existing = await User.findOne({ username: username.toLowerCase() })
    if (existing) {
      throw new AppError(
        `Username "${username}" is already taken. Please choose a different one.`,
        409
      )
    }

    // Pre-save hook hashes the password automatically
    const user = await User.create({ name, username, password, role })

    res.status(201).json({
      success: true,
      message: `User "${user.name}" created successfully with role: ${user.role}.`,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/v1/users/:id
// Role: Admin only — update name, role, or isActive
// ─────────────────────────────────────────────────────────────────────────
export async function updateUser(
  req: AuthenticatedRequest & { body: UpdateUserInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user ID format.', 400)
    }

    // Prevent admin from deactivating their own account
    if (id === req.user.userId && req.body.isActive === false) {
      throw new AppError(
        'You cannot deactivate your own account while logged in.',
        400
      )
    }

    const updated = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).select('-password')

    if (!updated) throw new AppError('User not found.', 404)

    res.status(200).json({
      success: true,
      message: `User "${updated.name}" updated successfully.`,
      data: { user: updated },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/users/:id
// Role: Admin only — soft deactivate (isActive: false)
// Cannot deactivate self
// ─────────────────────────────────────────────────────────────────────────
export async function deactivateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user ID format.', 400)
    }

    // Cannot deactivate yourself
    if (id === req.user.userId) {
      throw new AppError('You cannot deactivate your own account.', 400)
    }

    const user = await User.findById(id)
    if (!user) throw new AppError('User not found.', 404)
    if (!user.isActive) {
      throw new AppError('This user account is already deactivated.', 400)
    }

    user.isActive = false
    await user.save()

    res.status(200).json({
      success: true,
      message: `User "${user.name}" has been deactivated. They can no longer log in.`,
      data: null,
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/users/:id/password
// Role: Admin only (reset anyone's password) OR own account (change own)
// ─────────────────────────────────────────────────────────────────────────
export async function changePassword(
  req: AuthenticatedRequest & { body: ChangePasswordInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string }
    const { currentPassword, newPassword } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user ID format.', 400)
    }

    // Only admin can change other users' passwords
    // Anyone can change their own
    const isSelf = id === req.user.userId
    const isAdmin = req.user.role === 'admin'

    if (!isSelf && !isAdmin) {
      throw new AppError('You can only change your own password.', 403)
    }

    // Fetch user with password included
    const user = await User.findById(id).select('+password')
    if (!user || !user.isActive) {
      throw new AppError('User not found or is deactivated.', 404)
    }

    // Verify current password (required for self-change, optional for admin reset)
    if (isSelf) {
      const isCurrentCorrect = await user.comparePassword(currentPassword)
      if (!isCurrentCorrect) {
        throw new AppError(
          'Current password is incorrect. Please try again.',
          401
        )
      }
    }

    // Update password — pre-save hook auto-hashes it
    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
      data: null,
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/users/:id/reactivate
// Role: Admin only — re-enable a deactivated account
// ─────────────────────────────────────────────────────────────────────────
export async function reactivateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user ID format.', 400)
    }

    const user = await User.findById(id)
    if (!user) throw new AppError('User not found.', 404)

    if (user.isActive) {
      throw new AppError('This user account is already active.', 400)
    }

    user.isActive = true
    await user.save()

    res.status(200).json({
      success: true,
      message: `User "${user.name}" has been reactivated. They can now log in.`,
      data: null,
      error: null
    })
  } catch (error) {
    next(error)
  }
}
