// backend/src/middleware/rate-limiter.middleware.ts
import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit'

// General API rate limiter — 200 requests per minute per IP
export const generalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again in a minute.',
    data: null,
    error: 'RATE_LIMIT_EXCEEDED'
  }
})

// Login limiter — max 10 login attempts per 15 minutes per IP
export const loginLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many login attempts. Please wait 15 minutes before trying again.',
    data: null,
    error: 'LOGIN_RATE_LIMIT_EXCEEDED'
  },
  skipSuccessfulRequests: true
})

// Sale creation limiter — max 30 sales per minute
export const saleLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Sale submission rate limit reached. Please wait a moment.',
    data: null,
    error: 'SALE_RATE_LIMIT_EXCEEDED'
  }
})
