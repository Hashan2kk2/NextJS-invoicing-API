import { prisma } from '@/lib/prisma'
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerFilters,
  PaginationParams,
  CustomerWithInvoices,
} from '@/types'
import { buildSearchFilter, buildSortOrder, getPaginationSkip } from '@/lib/utils'

export class CustomerService {
  static async getAll(
    filters: CustomerFilters = {},
    pagination: PaginationParams = {}
  ) {
    const { page = 1, limit = 10, sortBy, sortOrder = 'desc' } = pagination
    const { search, city, state, country } = filters

    const where: any = {}

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Location filters
    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (state) where.state = { contains: state, mode: 'insensitive' }
    if (country) where.country = { contains: country, mode: 'insensitive' }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: buildSortOrder(sortBy, sortOrder),
        skip: getPaginationSkip(page, limit),
        take: limit,
        include: {
          _count: {
            select: { invoices: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ])

    return { customers, total }
  }

  static async getById(id: string): Promise<CustomerWithInvoices | null> {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { invoices: true },
        },
      },
    })
  }

  static async create(data: CreateCustomerRequest) {
    return prisma.customer.create({
      data,
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    })
  }

  static async update(id: string, data: UpdateCustomerRequest) {
    return prisma.customer.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    })
  }

  static async delete(id: string) {
    return prisma.customer.delete({
      where: { id },
    })
  }

  static async checkEmailExists(email: string, excludeId?: string) {
    const where: any = { email }
    if (excludeId) {
      where.id = { not: excludeId }
    }

    const customer = await prisma.customer.findUnique({ where })
    return !!customer
  }
}
