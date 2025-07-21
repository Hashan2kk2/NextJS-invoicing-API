import type { Customer, Product, Invoice, InvoiceItem, Payment, InvoiceStatus, PaymentMethod } from '@prisma/client'

// API Request Types
export interface CreateCustomerRequest {
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

export interface CreateProductRequest {
  name: string
  description?: string
  price: number
  category?: string
  sku?: string
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface CreateInvoiceItemRequest {
  productId: string
  quantity: number
  unitPrice: number
}

export interface CreateInvoiceRequest {
  customerId: string
  dueDate: string
  items: CreateInvoiceItemRequest[]
  taxRate?: number
  notes?: string
}

export interface UpdateInvoiceRequest {
  customerId?: string
  dueDate?: string
  status?: InvoiceStatus
  items?: CreateInvoiceItemRequest[]
  taxRate?: number
  notes?: string
}

export interface CreatePaymentRequest {
  invoiceId: string
  amount: number
  method: PaymentMethod
  date?: string
  reference?: string
  notes?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Extended Types with Relations
export interface CustomerWithInvoices extends Customer {
  invoices: Invoice[]
  _count?: {
    invoices: number
  }
}

export interface ProductWithUsage extends Product {
  invoiceItems: InvoiceItem[]
  _count?: {
    invoiceItems: number
  }
}

export interface InvoiceWithDetails extends Invoice {
  customer: Customer
  items: (InvoiceItem & {
    product: Product
  })[]
  payments: Payment[]
  _count?: {
    items: number
    payments: number
  }
}

export interface InvoiceItemWithDetails extends InvoiceItem {
  product: Product
  invoice: Invoice
}

export interface PaymentWithInvoice extends Payment {
  invoice: Invoice & {
    customer: Customer
  }
}

// Dashboard/Statistics Types
export interface DashboardStats {
  totalCustomers: number
  totalProducts: number
  totalInvoices: number
  totalRevenue: number
  pendingInvoices: number
  overDueInvoices: number
  recentInvoices: Invoice[]
  revenueByMonth: {
    month: string
    revenue: number
  }[]
}

export interface InvoiceStats {
  draft: number
  sent: number
  paid: number
  overdue: number
  cancelled: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
}

// Utility Types
export type InvoiceStatusType = InvoiceStatus
export type PaymentMethodType = PaymentMethod

export interface ErrorResponse {
  success: false
  error: string
  details?: any
}

export interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
}

// Filter Types
export interface CustomerFilters {
  search?: string
  city?: string
  state?: string
  country?: string
}

export interface ProductFilters {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
}

export interface InvoiceFilters {
  status?: InvoiceStatus
  customerId?: string
  fromDate?: string
  toDate?: string
  minAmount?: number
  maxAmount?: number
}
