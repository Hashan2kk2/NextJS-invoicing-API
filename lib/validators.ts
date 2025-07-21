import { z } from 'zod'

// Customer validation schemas
export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email format').max(255, 'Email is too long'),
  phone: z.string().max(20, 'Phone number is too long').optional(),
  address: z.string().max(255, 'Address is too long').optional(),
  city: z.string().max(100, 'City name is too long').optional(),
  state: z.string().max(100, 'State name is too long').optional(),
  zipCode: z.string().max(20, 'ZIP code is too long').optional(),
  country: z.string().max(100, 'Country name is too long').optional(),
})

export const updateCustomerSchema = customerSchema.partial()

// Product validation schemas
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Product name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  price: z.number().positive('Price must be positive').max(999999.99, 'Price is too high'),
  category: z.string().max(50, 'Category name is too long').optional(),
  sku: z.string().max(50, 'SKU is too long').optional(),
})

export const updateProductSchema = productSchema.partial()

// Invoice item validation schema
export const invoiceItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer').max(10000, 'Quantity is too high'),
  unitPrice: z.number().positive('Unit price must be positive').max(999999.99, 'Unit price is too high'),
})

// Invoice validation schemas
export const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  dueDate: z.string().datetime('Invalid due date format'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required').max(100, 'Too many items'),
  taxRate: z.number().min(0, 'Tax rate cannot be negative').max(1, 'Tax rate cannot exceed 100%').optional(),
  notes: z.string().max(1000, 'Notes are too long').optional(),
})

export const updateInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required').optional(),
  dueDate: z.string().datetime('Invalid due date format').optional(),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required').max(100, 'Too many items').optional(),
  taxRate: z.number().min(0, 'Tax rate cannot be negative').max(1, 'Tax rate cannot exceed 100%').optional(),
  notes: z.string().max(1000, 'Notes are too long').optional(),
})

// Payment validation schema
export const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: z.number().positive('Payment amount must be positive').max(999999.99, 'Payment amount is too high'),
  method: z.enum(['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'CHECK', 'PAYPAL', 'OTHER']),
  date: z.string().datetime('Invalid payment date format').optional(),
  reference: z.string().max(100, 'Reference is too long').optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
})

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.number().int().positive('Page must be a positive integer').default(1),
  limit: z.number().int().positive('Limit must be a positive integer').max(100, 'Limit cannot exceed 100').default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Filter validation schemas
export const customerFiltersSchema = z.object({
  search: z.string().max(100, 'Search term is too long').optional(),
  city: z.string().max(100, 'City name is too long').optional(),
  state: z.string().max(100, 'State name is too long').optional(),
  country: z.string().max(100, 'Country name is too long').optional(),
})

export const productFiltersSchema = z.object({
  search: z.string().max(100, 'Search term is too long').optional(),
  category: z.string().max(50, 'Category name is too long').optional(),
  minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
  maxPrice: z.number().positive('Maximum price must be positive').optional(),
})

export const invoiceFiltersSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  customerId: z.string().optional(),
  fromDate: z.string().datetime('Invalid from date format').optional(),
  toDate: z.string().datetime('Invalid to date format').optional(),
  minAmount: z.number().min(0, 'Minimum amount cannot be negative').optional(),
  maxAmount: z.number().positive('Maximum amount must be positive').optional(),
})

// ID validation schema
export const idSchema = z.string().min(1, 'ID is required')
