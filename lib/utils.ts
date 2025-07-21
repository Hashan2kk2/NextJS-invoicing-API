import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import type { ApiResponse } from '@/types'

// API Response helpers
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  )
}

export function createErrorResponse(
  error: string,
  status: number = 500
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  )
}

export function createValidationErrorResponse(
  zodError: ZodError
): NextResponse<ApiResponse<null>> {
  const errors = zodError.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }))

  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      details: errors,
    },
    { status: 400 }
  )
}

// Error handling wrapper
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ApiResponse<null>>> => {
    try {
      return await fn(...args)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof ZodError) {
        return createValidationErrorResponse(error)
      }

      if (error instanceof Error) {
        // Handle Prisma errors
        if (error.message.includes('Unique constraint')) {
          return createErrorResponse('Resource already exists', 409)
        }
        if (error.message.includes('Foreign key constraint')) {
          return createErrorResponse('Referenced resource not found', 400)
        }
        if (error.message.includes('Record to delete does not exist')) {
          return createErrorResponse('Resource not found', 404)
        }

        return createErrorResponse(error.message, 500)
      }

      return createErrorResponse('Internal server error', 500)
    }
  }
}

// Invoice number generator
export function generateInvoiceNumber(count: number): string {
  const year = new Date().getFullYear()
  const paddedCount = String(count + 1).padStart(4, '0')
  return `INV-${year}-${paddedCount}`
}

// Date utilities
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function isDateExpired(date: Date): boolean {
  return date < new Date()
}

// Currency formatting
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Pagination utilities
export function calculatePagination(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
  }
}

export function getPaginationSkip(page: number, limit: number): number {
  return (page - 1) * limit
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone)
}

// Invoice calculations
export function calculateInvoiceTotals(
  items: { quantity: number; unitPrice: number }[],
  taxRate: number = 0
) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}

// Search utilities
export function buildSearchFilter(search: string, fields: string[]) {
  if (!search) return {}

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as const,
      },
    })),
  }
}

// Date range filter
export function buildDateRangeFilter(fromDate?: string, toDate?: string) {
  const filter: any = {}

  if (fromDate) {
    filter.gte = new Date(fromDate)
  }

  if (toDate) {
    filter.lte = new Date(toDate)
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}

// Sort utilities
export function buildSortOrder(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc') {
  if (!sortBy) {
    return { createdAt: sortOrder }
  }

  return { [sortBy]: sortOrder }
}
