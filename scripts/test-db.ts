import { prisma } from '@/lib/prisma'

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Get some basic stats
    const customerCount = await prisma.customer.count()
    const productCount = await prisma.product.count()
    const invoiceCount = await prisma.invoice.count()
    
    console.log(`📊 Database Stats:`)
    console.log(`   - Customers: ${customerCount}`)
    console.log(`   - Products: ${productCount}`)
    console.log(`   - Invoices: ${invoiceCount}`)
    
    console.log('✅ Database test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
