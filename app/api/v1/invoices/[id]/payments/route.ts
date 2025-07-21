import { NextRequest, NextResponse } from 'next/server'
import { InvoiceService } from '@/lib/services/invoice.service'
import { paymentSchema } from '@/lib/validators'
import type { CreatePaymentRequest } from '@/types'
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Add the invoice ID to the payment data
    const paymentData: CreatePaymentRequest = {
      ...body,
      invoiceId: params.id
    }
    
    // Validate the data
    const validatedData = paymentSchema.parse(paymentData)
    
    // Add payment to invoice
    const payment = await InvoiceService.addPayment(validatedData)
    
    return NextResponse.json(
      createApiResponse(true, payment, 'Payment added successfully'),
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
