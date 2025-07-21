import { prisma } from '@/lib/prisma'
import type {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceFilters,
  PaginationParams,
  InvoiceWithDetails,
  CreatePaymentRequest,
} from '@/types'
import { 
  buildSortOrder, 
  getPaginationSkip, 
  calculateInvoiceTotals, 
  generateInvoiceNumber,
  buildDateRangeFilter 
} from '@/lib/utils'
import { InvoiceStatus } from '@prisma/client'

export class InvoiceService {
  static async getAll(
    filters: InvoiceFilters = {},
    pagination: PaginationParams = {}
  ) {
    const { page = 1, limit = 10, sortBy, sortOrder = 'desc' } = pagination
    const { status, customerId, fromDate, toDate, minAmount, maxAmount } = filters

    const where: any = {}

    // Status filter
    if (status) where.status = status

    // Customer filter
    if (customerId) where.customerId = customerId

    // Date range filter
    const dateFilter = buildDateRangeFilter(fromDate, toDate)
    if (dateFilter) where.issueDate = dateFilter

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.total = {}
      if (minAmount !== undefined) where.total.gte = minAmount
      if (maxAmount !== undefined) where.total.lte = maxAmount
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: buildSortOrder(sortBy, sortOrder),
        skip: getPaginationSkip(page, limit),
        take: limit,
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
          payments: true,
          _count: {
            select: { 
              items: true,
              payments: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ])

    return { invoices, total }
  }

  static async getById(id: string): Promise<InvoiceWithDetails | null> {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: {
          orderBy: { date: 'desc' },
        },
        _count: {
          select: { 
            items: true,
            payments: true,
          },
        },
      },
    })
  }

  static async create(data: CreateInvoiceRequest) {
    // Validate customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    })
    if (!customer) {
      throw new Error('Customer not found')
    }

    // Validate products exist
    const productIds = data.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })
    if (products.length !== productIds.length) {
      throw new Error('One or more products not found')
    }

    // Calculate totals
    const { subtotal, taxAmount, total } = calculateInvoiceTotals(
      data.items,
      data.taxRate || 0
    )

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count()
    const invoiceNumber = generateInvoiceNumber(invoiceCount)

    // Create invoice with items
    return prisma.invoice.create({
      data: {
        number: invoiceNumber,
        customerId: data.customerId,
        dueDate: new Date(data.dueDate),
        subtotal,
        taxRate: data.taxRate || 0,
        taxAmount,
        total,
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    })
  }

  static async update(id: string, data: UpdateInvoiceRequest) {
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!existingInvoice) {
      throw new Error('Invoice not found')
    }

    const updateData: any = {}

    // Update basic fields
    if (data.customerId) updateData.customerId = data.customerId
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate)
    if (data.status) updateData.status = data.status
    if (data.notes !== undefined) updateData.notes = data.notes

    // Update items if provided
    if (data.items) {
      // Validate products exist
      const productIds = data.items.map(item => item.productId)
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      })
      if (products.length !== productIds.length) {
        throw new Error('One or more products not found')
      }

      // Calculate new totals
      const { subtotal, taxAmount, total } = calculateInvoiceTotals(
        data.items,
        data.taxRate !== undefined ? data.taxRate : existingInvoice.taxRate
      )

      updateData.subtotal = subtotal
      updateData.taxAmount = taxAmount
      updateData.total = total

      if (data.taxRate !== undefined) {
        updateData.taxRate = data.taxRate
      }

      // Delete existing items and create new ones
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      })

      updateData.items = {
        create: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      }
    }

    return prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    })
  }

  static async delete(id: string) {
    return prisma.invoice.delete({
      where: { id },
    })
  }

  static async updateStatus(id: string, status: InvoiceStatus) {
    return prisma.invoice.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
      },
    })
  }

  static async addPayment(data: CreatePaymentRequest) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: { payments: true },
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)
    const remainingAmount = invoice.total - totalPaid

    if (data.amount > remainingAmount) {
      throw new Error('Payment amount exceeds remaining balance')
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId: data.invoiceId,
        amount: data.amount,
        method: data.method,
        date: data.date ? new Date(data.date) : new Date(),
        reference: data.reference,
        notes: data.notes,
      },
    })

    // Update invoice status if fully paid
    const newTotalPaid = totalPaid + data.amount
    if (newTotalPaid >= invoice.total) {
      await prisma.invoice.update({
        where: { id: data.invoiceId },
        data: { status: 'PAID' },
      })
    }

    return payment
  }

  static async getStatistics() {
    const [
      totalInvoices,
      draftInvoices,
      sentInvoices,
      paidInvoices,
      overdueInvoices,
      cancelledInvoices,
      totalRevenue,
      pendingRevenue,
    ] = await Promise.all([
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: 'DRAFT' } }),
      prisma.invoice.count({ where: { status: 'SENT' } }),
      prisma.invoice.count({ where: { status: 'PAID' } }),
      prisma.invoice.count({ where: { status: 'OVERDUE' } }),
      prisma.invoice.count({ where: { status: 'CANCELLED' } }),
      prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { status: { in: ['DRAFT', 'SENT', 'OVERDUE'] } },
        _sum: { total: true },
      }),
    ])

    return {
      totalInvoices,
      draft: draftInvoices,
      sent: sentInvoices,
      paid: paidInvoices,
      overdue: overdueInvoices,
      cancelled: cancelledInvoices,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingRevenue: pendingRevenue._sum.total || 0,
    }
  }

  static async checkOverdueInvoices() {
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['SENT'] },
        dueDate: { lt: new Date() },
      },
    })

    // Update status to OVERDUE
    if (overdueInvoices.length > 0) {
      await prisma.invoice.updateMany({
        where: {
          id: { in: overdueInvoices.map(inv => inv.id) },
        },
        data: { status: 'OVERDUE' },
      })
    }

    return overdueInvoices.length
  }
}
