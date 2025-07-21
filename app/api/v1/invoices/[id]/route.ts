import { NextRequest, NextResponse } from 'next/server'
import { InvoiceService } from '@/lib/services/invoice.service'
import { updateInvoiceSchema } from '@/lib/validators'
import type { UpdateInvoiceRequest } from '@/types'
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
    const invoice = await InvoiceService.getById(params.id)
    
    if (!invoice) {
      return NextResponse.json(
        createApiResponse(false, null, undefined, 'Invoice not found'),
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      createApiResponse(true, invoice, 'Invoice retrieved successfully')
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
    const body: UpdateInvoiceRequest = await request.json()
    
    // Validate the data
    const validatedData = updateInvoiceSchema.parse(body)
    
    const invoice = await InvoiceService.update(params.id, validatedData)
    
    return NextResponse.json(
      createApiResponse(true, invoice, 'Invoice updated successfully')
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
    await InvoiceService.delete(params.id)
    
    return NextResponse.json(
      createApiResponse(true, null, 'Invoice deleted successfully')
    )
  } catch (error) {
    return handleApiError(error)
  }
}
