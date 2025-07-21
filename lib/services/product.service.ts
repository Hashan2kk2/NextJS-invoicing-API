import { prisma } from '@/lib/prisma'
import type {
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
  PaginationParams,
  ProductWithUsage,
} from '@/types'
import { buildSearchFilter, buildSortOrder, getPaginationSkip } from '@/lib/utils'

export class ProductService {
  static async getAll(
    filters: ProductFilters = {},
    pagination: PaginationParams = {}
  ) {
    const { page = 1, limit = 10, sortBy, sortOrder = 'desc' } = pagination
    const { search, category, minPrice, maxPrice } = filters

    const where: any = {}

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Category filter
    if (category) {
      where.category = { contains: category, mode: 'insensitive' }
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: buildSortOrder(sortBy, sortOrder),
        skip: getPaginationSkip(page, limit),
        take: limit,
        include: {
          _count: {
            select: { invoiceItems: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    return { products, total }
  }

  static async getById(id: string): Promise<ProductWithUsage | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        invoiceItems: {
          include: {
            invoice: {
              include: {
                customer: true,
              },
            },
          },
          orderBy: { invoice: { createdAt: 'desc' } },
          take: 10,
        },
        _count: {
          select: { invoiceItems: true },
        },
      },
    })
  }

  static async create(data: CreateProductRequest) {
    return prisma.product.create({
      data,
      include: {
        _count: {
          select: { invoiceItems: true },
        },
      },
    })
  }

  static async update(id: string, data: UpdateProductRequest) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { invoiceItems: true },
        },
      },
    })
  }

  static async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    })
  }

  static async checkSkuExists(sku: string, excludeId?: string) {
    if (!sku) return false

    const where: any = { sku }
    if (excludeId) {
      where.id = { not: excludeId }
    }

    const product = await prisma.product.findUnique({ where })
    return !!product
  }

  static async getPopularProducts(limit: number = 10) {
    return prisma.product.findMany({
      include: {
        _count: {
          select: { invoiceItems: true },
        },
      },
      orderBy: {
        invoiceItems: {
          _count: 'desc',
        },
      },
      take: limit,
    })
  }

  static async getLowStockProducts(threshold: number = 10) {
    // This would require a stock field in the Product model
    // For now, returning empty array
    return []
  }
}
