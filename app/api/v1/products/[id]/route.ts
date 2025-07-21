import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product.service'
import { productSchema } from '@/lib/validators'
import type { UpdateProductRequest } from '@/types'
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await ProductService.getById(params.id)
    
    if (!product) {
      return NextResponse.json(
        createApiResponse(false, null, undefined, 'Product not found'),
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      createApiResponse(true, product, 'Product retrieved successfully')
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateProductRequest = await request.json()
    
    // Validate the data using partial schema for updates
    const validatedData = productSchema.partial().parse(body)
    
    // Check if SKU already exists (excluding current product)
    if (validatedData.sku) {
      const skuExists = await ProductService.checkSkuExists(validatedData.sku, params.id)
      if (skuExists) {
        return NextResponse.json(
          createApiResponse(false, null, undefined, 'SKU already exists'),
          { status: 400 }
        )
      }
    }
    
    const product = await ProductService.update(params.id, validatedData)
    
    return NextResponse.json(
      createApiResponse(true, product, 'Product updated successfully')
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ProductService.delete(params.id)
    
    return NextResponse.json(
      createApiResponse(true, null, 'Product deleted successfully')
    )
  } catch (error) {
    return handleApiError(error)
  }
}
