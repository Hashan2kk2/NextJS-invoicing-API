import { NextRequest, NextResponse } from 'next/server'
import { CustomerService } from '@/lib/services/customer.service'
import { customerSchema } from '@/lib/validators'
import type { CreateCustomerRequest } from '@/types'
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
    const body: CreateCustomerRequest = await request.json()
    
    // Validate the data
    const validatedData = customerSchema.parse(body)
    
    // Check if email already exists
    const emailExists = await CustomerService.checkEmailExists(validatedData.email)
    if (emailExists) {
      return NextResponse.json(
        createApiResponse(false, null, undefined, 'Email already exists'),
        { status: 400 }
      )
    }
    
    // Create the customer
    const customer = await CustomerService.create(validatedData)
    
    return NextResponse.json(
      createApiResponse(true, customer, 'Customer created successfully'),
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
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      country: searchParams.get('country') || undefined,
    }
    
    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
    }
    
    const result = await CustomerService.getAll(filters, pagination)
    
    return NextResponse.json(
      createApiResponse(true, result, 'Customers retrieved successfully')
    )
  } catch (error) {
    return handleApiError(error)
  }
}