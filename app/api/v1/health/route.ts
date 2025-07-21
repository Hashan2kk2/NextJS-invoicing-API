import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Create API response helper function inline
function createApiResponse<T>(success: boolean, data: T | null, message?: string, error?: string) {
  return {
    success,
    data,
    message,
    error
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect()
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
      uptime: process.uptime()
    }
    
    return NextResponse.json(
      createApiResponse(true, healthStatus, 'API is healthy')
    )
  } catch (error) {
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'disconnected',
      uptime: process.uptime(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    
    return NextResponse.json(
      createApiResponse(false, healthStatus, 'API is unhealthy'),
      { status: 503 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
