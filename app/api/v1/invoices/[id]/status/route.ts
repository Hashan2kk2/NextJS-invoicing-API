import { NextRequest, NextResponse } from 'next/server'
import { InvoiceService } from '@/lib/services/invoice.service'
import { InvoiceStatus } from '@prisma/client'
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body
    
    if (!status || !Object.values(InvoiceStatus).includes(status)) {
      return NextResponse.json(
        createApiResponse(false, null, undefined, 'Valid status is required'),
        { status: 400 }
      )
    }
    
    const invoice = await InvoiceService.updateStatus(params.id, status)
    
    return NextResponse.json(
      createApiResponse(true, invoice, 'Invoice status updated successfully')
    )
  } catch (error) {
    return handleApiError(error)
  }
}
