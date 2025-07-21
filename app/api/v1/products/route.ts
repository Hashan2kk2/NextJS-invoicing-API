import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product.service'
import { productSchema } from '@/lib/validators'
import type { CreateProductRequest } from '@/types'
import { ZodError } from 'zod'

// Create API response helper function inline
function createApiResponse<T>(success: boolean, data: T | null, message?: string, error?: string) {
  return {
    success,
    data,
    message,
    error
  }
}

// Handle API error function inline
function handleApiError(error: unknown) {
  console.error('API Error:', error)
  
  if (error instanceof ZodError) {
    return NextResponse.json(
      createApiResponse(false, null, undefined, `Validation error: ${error.issues.map(e => e.message).join(', ')}`),
      { status: 400 }
    )
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      createApiResponse(false, null, undefined, error.message),
      { status: 500 }
    )
  }
  
  return NextResponse.json(
    createApiResponse(false, null, undefined, 'Internal server error'),
    { status: 500 }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateProductRequest = await request.json()
    
    // Validate the data
    const validatedData = productSchema.parse(body)
    
    // Check if SKU already exists
    if (validatedData.sku) {
      const skuExists = await ProductService.checkSkuExists(validatedData.sku)
      if (skuExists) {
        return NextResponse.json(
          createApiResponse(false, null, undefined, 'SKU already exists'),
          { status: 400 }
        )
      }
    }
    
    // Create the product
    const product = await ProductService.create(validatedData)
    
    return NextResponse.json(
      createApiResponse(true, product, 'Product created successfully'),
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    }
    
    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
    }
    
    const result = await ProductService.getAll(filters, pagination)
    
    return NextResponse.json(
      createApiResponse(true, result, 'Products retrieved successfully')
    )
  } catch (error) {
    return handleApiError(error)
  }
}
