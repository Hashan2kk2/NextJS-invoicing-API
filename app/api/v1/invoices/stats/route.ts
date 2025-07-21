import { NextRequest, NextResponse } from 'next/server'
import { InvoiceService } from '@/lib/services/invoice.service'
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

export async function GET(request: NextRequest) {
  try {
    const stats = await InvoiceService.getStatistics()
    
    return NextResponse.json(
      createApiResponse(true, stats, 'Invoice statistics retrieved successfully')
    )
  } catch (error) {
    return handleApiError(error)
  }
}
