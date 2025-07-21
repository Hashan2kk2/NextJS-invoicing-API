import { NextRequest, NextResponse } from 'next/server'
import { CustomerService } from '@/lib/services/customer.service'
import { customerSchema } from '@/lib/validators'
import type { UpdateCustomerRequest } from '@/types'
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
    const customer = await CustomerService.getById(params.id)
    
    if (!customer) {
      return NextResponse.json(
        createApiResponse(false, null, undefined, 'Customer not found'),
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      createApiResponse(true, customer, 'Customer retrieved successfully')
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
    const body: UpdateCustomerRequest = await request.json()
    
    // Validate the data using partial schema for updates
    const validatedData = customerSchema.partial().parse(body)
    
    // Check if email already exists (excluding current customer)
    if (validatedData.email) {
      const emailExists = await CustomerService.checkEmailExists(validatedData.email, params.id)
      if (emailExists) {
        return NextResponse.json(
          createApiResponse(false, null, undefined, 'Email already exists'),
          { status: 400 }
        )
      }
    }
    
    const customer = await CustomerService.update(params.id, validatedData)
    
    return NextResponse.json(
      createApiResponse(true, customer, 'Customer updated successfully')
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
    await CustomerService.delete(params.id)
    
    return NextResponse.json(
      createApiResponse(true, null, 'Customer deleted successfully')
    )
  } catch (error) {
    return handleApiError(error)
  }
}
