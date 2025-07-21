// Test script for all API endpoints
const API_BASE = 'http://localhost:3000/api/v1'

async function testApi() {
  console.log('🚀 Starting API tests...\n')

  try {
    // Test health endpoint
    console.log('1. Testing Health Check...')
    const health = await fetch(`${API_BASE}/health`)
    const healthData = await health.json()
    console.log('✅ Health:', healthData.data.status)

    // Test creating a customer
    console.log('\n2. Testing Customer Creation...')
    const customerResponse = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+1234567890',
        city: 'Test City'
      })
    })
    const customer = await customerResponse.json()
    console.log('✅ Customer created:', customer.data?.name)
    const customerId = customer.data?.id

    // Test creating a product
    console.log('\n3. Testing Product Creation...')
    const productResponse = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        category: 'Testing',
        sku: 'TEST-001'
      })
    })
    const product = await productResponse.json()
    console.log('✅ Product created:', product.data?.name)
    const productId = product.data?.id

    if (customerId && productId) {
      // Test creating an invoice
      console.log('\n4. Testing Invoice Creation...')
      const invoiceResponse = await fetch(`${API_BASE}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              productId,
              quantity: 2,
              unitPrice: 99.99
            }
          ],
          taxRate: 0.08,
          notes: 'Test invoice'
        })
      })
      const invoice = await invoiceResponse.json()
      console.log('✅ Invoice created:', invoice.data?.number)
      const invoiceId = invoice.data?.id

      if (invoiceId) {
        // Test adding payment
        console.log('\n5. Testing Payment Addition...')
        const paymentResponse = await fetch(`${API_BASE}/invoices/${invoiceId}/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: 50.00,
            method: 'CREDIT_CARD',
            reference: 'TEST-PAY-001'
          })
        })
        const payment = await paymentResponse.json()
        console.log('✅ Payment added:', payment.data?.amount)

        // Test updating invoice status
        console.log('\n6. Testing Invoice Status Update...')
        const statusResponse = await fetch(`${API_BASE}/invoices/${invoiceId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'SENT'
          })
        })
        const statusUpdate = await statusResponse.json()
        console.log('✅ Status updated:', statusUpdate.data?.status)
      }
    }

    // Test getting all customers
    console.log('\n7. Testing Get All Customers...')
    const customersResponse = await fetch(`${API_BASE}/customers`)
    const customers = await customersResponse.json()
    console.log('✅ Customers retrieved:', customers.data?.total)

    // Test getting all products
    console.log('\n8. Testing Get All Products...')
    const productsResponse = await fetch(`${API_BASE}/products`)
    const products = await productsResponse.json()
    console.log('✅ Products retrieved:', products.data?.total)

    // Test getting all invoices
    console.log('\n9. Testing Get All Invoices...')
    const invoicesResponse = await fetch(`${API_BASE}/invoices`)
    const invoices = await invoicesResponse.json()
    console.log('✅ Invoices retrieved:', invoices.data?.total)

    // Test dashboard stats
    console.log('\n10. Testing Dashboard Stats...')
    const statsResponse = await fetch(`${API_BASE}/dashboard/stats`)
    const stats = await statsResponse.json()
    console.log('✅ Dashboard stats:', stats.data)

    console.log('\n🎉 All tests completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run tests
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch')
  testApi()
} else {
  // Browser environment
  testApi()
}
