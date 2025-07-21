# 🧾 Invoicing API - Complete Guide

A comprehensive multi-use invoicing system API built with Next.js, Prisma ORM, PostgreSQL, and TypeScript. This API provides complete CRUD operations for customers, products, invoices, and payments with advanced filtering, pagination, and statistics.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Hashan2kk2/invoicing-API.git
   cd invoicing-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/invoicing_db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Test the API:**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

---

## 📋 Complete API Reference

### Base URL
```
http://localhost:3000/api/v1
```

---

## 🏥 Health Check

### Check API Status
**GET** `/health`

**Example:**
```bash
curl http://localhost:3000/api/v1/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-07-21T10:30:00.000Z",
    "version": "1.0.0",
    "database": "connected",
    "uptime": 3600
  },
  "message": "API is healthy"
}
```

---

## 👥 Customers API

### 1. Get All Customers
**GET** `/customers`

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10, max: 100)
- `search` (string) - Search by name or email
- `city` (string) - Filter by city
- `state` (string) - Filter by state  
- `country` (string) - Filter by country
- `sortBy` (string) - Sort field (default: createdAt)
- `sortOrder` (asc|desc) - Sort order (default: desc)

**Examples:**

```bash
# Get all customers (first page)
curl "http://localhost:3000/api/v1/customers"

# Search customers by name
curl "http://localhost:3000/api/v1/customers?search=john"

# Get customers from specific city with pagination
curl "http://localhost:3000/api/v1/customers?city=New%20York&page=2&limit=5"

# Sort customers by name ascending
curl "http://localhost:3000/api/v1/customers?sortBy=name&sortOrder=asc"

# Multiple filters
curl "http://localhost:3000/api/v1/customers?search=doe&state=CA&limit=20"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "cm123456789",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA",
        "createdAt": "2025-07-21T10:00:00.000Z",
        "updatedAt": "2025-07-21T10:00:00.000Z",
        "_count": {
          "invoices": 5
        }
      }
    ],
    "total": 1
  },
  "message": "Customers retrieved successfully"
}
```

### 2. Create New Customer
**POST** `/customers`

**Required Fields:**
- `name` (string) - Customer name
- `email` (string) - Unique email address

**Optional Fields:**
- `phone` (string) - Phone number
- `address` (string) - Street address
- `city` (string) - City name
- `state` (string) - State/Province
- `zipCode` (string) - ZIP/Postal code
- `country` (string) - Country name

**Examples:**

```bash
# Minimal customer creation
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'

# Complete customer creation
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1555123456",
    "address": "789 Pine Road, Suite 100",
    "city": "San Francisco",
    "state": "California",
    "zipCode": "94102",
    "country": "United States"
  }'

# Business customer
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "email": "billing@acme.com",
    "phone": "+1800555ACME",
    "address": "100 Business Plaza",
    "city": "Austin",
    "state": "TX",
    "zipCode": "73301",
    "country": "USA"
  }'
```

### 3. Get Customer by ID
**GET** `/customers/{id}`

**Example:**
```bash
curl http://localhost:3000/api/v1/customers/cm123456789
```

**Response includes recent invoices:**
```json
{
  "success": true,
  "data": {
    "id": "cm123456789",
    "name": "John Doe",
    "email": "john@example.com",
    "invoices": [
      {
        "id": "inv123",
        "number": "INV-2025-0001",
        "total": 299.99,
        "status": "PAID",
        "createdAt": "2025-07-21T09:00:00.000Z"
      }
    ],
    "_count": {
      "invoices": 5
    }
  }
}
```

### 4. Update Customer
**PUT** `/customers/{id}`

**Example:**
```bash
# Update customer information
curl -X PUT http://localhost:3000/api/v1/customers/cm123456789 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "phone": "+1987654321",
    "city": "Los Angeles"
  }'

# Update just email
curl -X PUT http://localhost:3000/api/v1/customers/cm123456789 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "johnsmith@newemail.com"
  }'
```

### 5. Delete Customer
**DELETE** `/customers/{id}`

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/customers/cm123456789
```

---

## 📦 Products API

### 1. Get All Products
**GET** `/products`

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `search` (string) - Search by name, description, or SKU
- `category` (string) - Filter by category
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter
- `sortBy` (string) - Sort field
- `sortOrder` (asc|desc) - Sort order

**Examples:**

```bash
# Get all products
curl "http://localhost:3000/api/v1/products"

# Search products
curl "http://localhost:3000/api/v1/products?search=web"

# Filter by category and price range
curl "http://localhost:3000/api/v1/products?category=Services&minPrice=50&maxPrice=200"

# Sort by price (lowest first)
curl "http://localhost:3000/api/v1/products?sortBy=price&sortOrder=asc"

# Get premium products (price > 500)
curl "http://localhost:3000/api/v1/products?minPrice=500&sortBy=price&sortOrder=desc"
```

### 2. Create New Product
**POST** `/products`

**Required Fields:**
- `name` (string) - Product name
- `price` (number) - Product price

**Optional Fields:**
- `description` (string) - Product description
- `category` (string) - Product category
- `sku` (string) - Unique SKU code

**Examples:**

```bash
# Simple product
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Basic Consultation",
    "price": 100.00
  }'

# Complete product
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Development Package",
    "description": "Complete website development with responsive design",
    "price": 2500.00,
    "category": "Web Development",
    "sku": "WEB-PKG-001"
  }'

# Service product
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Logo Design",
    "description": "Professional logo design with 3 revisions",
    "price": 299.99,
    "category": "Design Services",
    "sku": "LOGO-STD"
  }'
```

### 3. Get Product by ID
**GET** `/products/{id}`

**Example:**
```bash
curl http://localhost:3000/api/v1/products/prod123456789
```

### 4. Update Product
**PUT** `/products/{id}`

**Example:**
```bash
# Update price and description
curl -X PUT http://localhost:3000/api/v1/products/prod123456789 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 150.00,
    "description": "Updated service description"
  }'
```

### 5. Delete Product
**DELETE** `/products/{id}`

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/products/prod123456789
```

---

## 🧾 Invoices API

### 1. Get All Invoices
**GET** `/invoices`

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `status` (string) - Filter by status (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
- `customerId` (string) - Filter by customer ID
- `fromDate` (ISO date) - Start date filter
- `toDate` (ISO date) - End date filter
- `minAmount` (number) - Minimum amount filter
- `maxAmount` (number) - Maximum amount filter
- `sortBy` (string) - Sort field
- `sortOrder` (asc|desc) - Sort order

**Examples:**

```bash
# Get all invoices
curl "http://localhost:3000/api/v1/invoices"

# Get paid invoices only
curl "http://localhost:3000/api/v1/invoices?status=PAID"

# Get invoices for specific customer
curl "http://localhost:3000/api/v1/invoices?customerId=cm123456789"

# Get invoices in date range
curl "http://localhost:3000/api/v1/invoices?fromDate=2025-01-01T00:00:00.000Z&toDate=2025-12-31T23:59:59.999Z"

# Get high-value invoices (> $1000)
curl "http://localhost:3000/api/v1/invoices?minAmount=1000&sortBy=total&sortOrder=desc"

# Get overdue invoices
curl "http://localhost:3000/api/v1/invoices?status=OVERDUE&sortBy=dueDate&sortOrder=asc"

# Complex filter: Paid invoices in Q1 2025, sorted by amount
curl "http://localhost:3000/api/v1/invoices?status=PAID&fromDate=2025-01-01T00:00:00.000Z&toDate=2025-03-31T23:59:59.999Z&sortBy=total&sortOrder=desc"
```

### 2. Create New Invoice
**POST** `/invoices`

**Required Fields:**
- `customerId` (string) - Customer ID
- `dueDate` (ISO date string) - Payment due date
- `items` (array) - Invoice line items
  - `productId` (string) - Product ID
  - `quantity` (number) - Quantity
  - `unitPrice` (number) - Unit price

**Optional Fields:**
- `taxRate` (number) - Tax rate (0-1, e.g., 0.08 for 8%)
- `notes` (string) - Invoice notes

**Examples:**

```bash
# Simple invoice with one item
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cm123456789",
    "dueDate": "2025-08-20T23:59:59.999Z",
    "items": [
      {
        "productId": "prod123456789",
        "quantity": 1,
        "unitPrice": 100.00
      }
    ]
  }'

# Complex invoice with multiple items and tax
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cm123456789",
    "dueDate": "2025-08-20T23:59:59.999Z",
    "items": [
      {
        "productId": "prod123456789",
        "quantity": 10,
        "unitPrice": 150.00
      },
      {
        "productId": "prod987654321",
        "quantity": 2,
        "unitPrice": 75.00
      }
    ],
    "taxRate": 0.08,
    "notes": "Thank you for your business! Payment terms: Net 30."
  }'

# Service invoice
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cm123456789",
    "dueDate": "2025-08-15T23:59:59.999Z",
    "items": [
      {
        "productId": "prod111111111",
        "quantity": 40,
        "unitPrice": 125.00
      }
    ],
    "taxRate": 0.0825,
    "notes": "Website development project - Phase 1\n40 hours @ $125/hour"
  }'
```

### 3. Get Invoice by ID
**GET** `/invoices/{id}`

**Example:**
```bash
curl http://localhost:3000/api/v1/invoices/inv123456789
```

**Response includes full details:**
```json
{
  "success": true,
  "data": {
    "id": "inv123456789",
    "number": "INV-2025-0001",
    "customerId": "cm123456789",
    "issueDate": "2025-07-21T10:00:00.000Z",
    "dueDate": "2025-08-20T23:59:59.999Z",
    "status": "SENT",
    "subtotal": 1650.00,
    "taxRate": 0.08,
    "taxAmount": 132.00,
    "total": 1782.00,
    "notes": "Thank you for your business!",
    "customer": {
      "id": "cm123456789",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [
      {
        "id": "item123",
        "quantity": 10,
        "unitPrice": 150.00,
        "total": 1500.00,
        "product": {
          "id": "prod123456789",
          "name": "Web Development Service",
          "sku": "WEB-001"
        }
      }
    ],
    "payments": [
      {
        "id": "pay123",
        "amount": 500.00,
        "method": "CREDIT_CARD",
        "date": "2025-07-21T11:00:00.000Z"
      }
    ]
  }
}
```

### 4. Update Invoice
**PUT** `/invoices/{id}`

**Example:**
```bash
# Update due date and notes
curl -X PUT http://localhost:3000/api/v1/invoices/inv123456789 \
  -H "Content-Type: application/json" \
  -d '{
    "dueDate": "2025-09-01T23:59:59.999Z",
    "notes": "Extended payment terms - Net 45 days"
  }'

# Update invoice items (replaces all items)
curl -X PUT http://localhost:3000/api/v1/invoices/inv123456789 \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "prod123456789",
        "quantity": 15,
        "unitPrice": 150.00
      }
    ],
    "taxRate": 0.10
  }'
```

### 5. Update Invoice Status
**PATCH** `/invoices/{id}/status`

**Valid Statuses:**
- `DRAFT` - Invoice is being prepared
- `SENT` - Invoice has been sent to customer
- `PAID` - Invoice has been fully paid
- `OVERDUE` - Invoice payment is past due date
- `CANCELLED` - Invoice has been cancelled

**Examples:**

```bash
# Mark invoice as sent
curl -X PATCH http://localhost:3000/api/v1/invoices/inv123456789/status \
  -H "Content-Type: application/json" \
  -d '{"status": "SENT"}'

# Mark invoice as paid
curl -X PATCH http://localhost:3000/api/v1/invoices/inv123456789/status \
  -H "Content-Type: application/json" \
  -d '{"status": "PAID"}'

# Cancel invoice
curl -X PATCH http://localhost:3000/api/v1/invoices/inv123456789/status \
  -H "Content-Type: application/json" \
  -d '{"status": "CANCELLED"}'
```

### 6. Add Payment to Invoice
**POST** `/invoices/{id}/payments`

**Required Fields:**
- `amount` (number) - Payment amount
- `method` (string) - Payment method

**Payment Methods:**
- `CASH`
- `CREDIT_CARD`
- `BANK_TRANSFER`
- `CHECK`
- `PAYPAL`
- `OTHER`

**Optional Fields:**
- `date` (ISO date string) - Payment date (defaults to now)
- `reference` (string) - Payment reference/transaction ID
- `notes` (string) - Payment notes

**Examples:**

```bash
# Simple payment
curl -X POST http://localhost:3000/api/v1/invoices/inv123456789/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500.00,
    "method": "CREDIT_CARD"
  }'

# Detailed payment
curl -X POST http://localhost:3000/api/v1/invoices/inv123456789/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1782.00,
    "method": "BANK_TRANSFER",
    "date": "2025-07-21T14:30:00.000Z",
    "reference": "TXN-ABC123456",
    "notes": "Wire transfer received from customer"
  }'

# Partial payment
curl -X POST http://localhost:3000/api/v1/invoices/inv123456789/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 891.00,
    "method": "CHECK",
    "reference": "CHK-7890",
    "notes": "Partial payment - 50% of total amount"
  }'

# Cash payment
curl -X POST http://localhost:3000/api/v1/invoices/inv123456789/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "method": "CASH",
    "notes": "Cash payment at office"
  }'
```

### 7. Delete Invoice
**DELETE** `/invoices/{id}`

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/invoices/inv123456789
```

---

## 📊 Statistics & Analytics

### 1. Dashboard Statistics
**GET** `/dashboard/stats`

**Example:**
```bash
curl http://localhost:3000/api/v1/dashboard/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 25,
    "totalProducts": 15,
    "totalInvoices": 150,
    "totalRevenue": 125000.50,
    "pendingRevenue": 15750.25,
    "invoiceBreakdown": {
      "draft": 5,
      "sent": 25,
      "paid": 110,
      "overdue": 8,
      "cancelled": 2
    }
  },
  "message": "Dashboard statistics retrieved successfully"
}
```

### 2. Invoice Statistics
**GET** `/invoices/stats`

**Example:**
```bash
curl http://localhost:3000/api/v1/invoices/stats
```

---

## 🧪 Complete Testing Examples

### Test Complete Invoice Workflow

```bash
#!/bin/bash

# Set base URL
BASE_URL="http://localhost:3000/api/v1"

echo "🚀 Testing Complete Invoice Workflow"

# 1. Create a customer
echo "1. Creating customer..."
CUSTOMER_RESPONSE=$(curl -s -X POST ${BASE_URL}/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Solutions Inc",
    "email": "billing@techsolutions.com",
    "phone": "+1555987654",
    "address": "100 Innovation Drive",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78701",
    "country": "USA"
  }')

CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | jq -r '.data.id')
echo "✅ Customer created: $CUSTOMER_ID"

# 2. Create products
echo "2. Creating products..."
PRODUCT1_RESPONSE=$(curl -s -X POST ${BASE_URL}/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Development",
    "description": "Custom website development",
    "price": 150.00,
    "category": "Development",
    "sku": "WEB-DEV-001"
  }')

PRODUCT1_ID=$(echo $PRODUCT1_RESPONSE | jq -r '.data.id')

PRODUCT2_RESPONSE=$(curl -s -X POST ${BASE_URL}/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SEO Optimization",
    "description": "Search engine optimization",
    "price": 75.00,
    "category": "Marketing",
    "sku": "SEO-OPT-001"
  }')

PRODUCT2_ID=$(echo $PRODUCT2_RESPONSE | jq -r '.data.id')
echo "✅ Products created: $PRODUCT1_ID, $PRODUCT2_ID"

# 3. Create invoice
echo "3. Creating invoice..."
INVOICE_RESPONSE=$(curl -s -X POST ${BASE_URL}/invoices \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"dueDate\": \"2025-08-20T23:59:59.999Z\",
    \"items\": [
      {
        \"productId\": \"$PRODUCT1_ID\",
        \"quantity\": 20,
        \"unitPrice\": 150.00
      },
      {
        \"productId\": \"$PRODUCT2_ID\",
        \"quantity\": 4,
        \"unitPrice\": 75.00
      }
    ],
    \"taxRate\": 0.0825,
    \"notes\": \"Website development project with SEO optimization\"
  }")

INVOICE_ID=$(echo $INVOICE_RESPONSE | jq -r '.data.id')
INVOICE_NUMBER=$(echo $INVOICE_RESPONSE | jq -r '.data.number')
INVOICE_TOTAL=$(echo $INVOICE_RESPONSE | jq -r '.data.total')
echo "✅ Invoice created: $INVOICE_NUMBER ($INVOICE_TOTAL)"

# 4. Send invoice
echo "4. Sending invoice..."
curl -s -X PATCH ${BASE_URL}/invoices/${INVOICE_ID}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "SENT"}' > /dev/null
echo "✅ Invoice status updated to SENT"

# 5. Add partial payment
echo "5. Adding partial payment..."
curl -s -X POST ${BASE_URL}/invoices/${INVOICE_ID}/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500.00,
    "method": "BANK_TRANSFER",
    "reference": "TXN-TEST-001",
    "notes": "Partial payment - 50% of total"
  }' > /dev/null
echo "✅ Partial payment added: $1500.00"

# 6. Add final payment
echo "6. Adding final payment..."
REMAINING_AMOUNT=$(echo "$INVOICE_TOTAL - 1500.00" | bc)
curl -s -X POST ${BASE_URL}/invoices/${INVOICE_ID}/payments \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": $REMAINING_AMOUNT,
    \"method\": \"CREDIT_CARD\",
    \"reference\": \"CC-TEST-002\",
    \"notes\": \"Final payment\"
  }" > /dev/null
echo "✅ Final payment added: $REMAINING_AMOUNT"

# 7. Get invoice details
echo "7. Getting final invoice details..."
FINAL_INVOICE=$(curl -s ${BASE_URL}/invoices/${INVOICE_ID})
echo "✅ Invoice details retrieved"

# 8. Get statistics
echo "8. Getting dashboard statistics..."
STATS=$(curl -s ${BASE_URL}/dashboard/stats)
echo "✅ Dashboard statistics retrieved"

echo ""
echo "🎉 Workflow completed successfully!"
echo "📋 Invoice: $INVOICE_NUMBER"
echo "💰 Total: $INVOICE_TOTAL"
echo "📊 Check dashboard at: ${BASE_URL}/dashboard/stats"
```

### Advanced Query Examples

```bash
# Get all overdue invoices with customer details
curl "http://localhost:3000/api/v1/invoices?status=OVERDUE&sortBy=dueDate&sortOrder=asc"

# Find high-value customers (customers with invoices > $5000)
curl "http://localhost:3000/api/v1/invoices?minAmount=5000&sortBy=total&sortOrder=desc&limit=50"

# Get all products in specific category, sorted by popularity
curl "http://localhost:3000/api/v1/products?category=Development&sortBy=invoiceItems&sortOrder=desc"

# Monthly revenue report (invoices from last month)
curl "http://localhost:3000/api/v1/invoices?fromDate=2025-06-01T00:00:00.000Z&toDate=2025-06-30T23:59:59.999Z&status=PAID&sortBy=total&sortOrder=desc"

# Customer search with location filtering
curl "http://localhost:3000/api/v1/customers?search=tech&state=CA&sortBy=name&sortOrder=asc"

# Product inventory report (products sorted by usage)
curl "http://localhost:3000/api/v1/products?sortBy=invoiceItems&sortOrder=desc&limit=100"
```

---

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check if PostgreSQL is running
   pg_isready -h localhost -p 5432
   
   # Test database connection
   curl http://localhost:3000/api/v1/health
   ```

2. **Validation Errors**
   ```bash
   # Check request format
   curl -X POST http://localhost:3000/api/v1/customers \
     -H "Content-Type: application/json" \
     -d '{"name": "Test", "email": "invalid-email"}'
   ```

3. **404 Not Found**
   ```bash
   # Verify the endpoint URL
   curl -v http://localhost:3000/api/v1/customers
   ```

### Testing Tools

**Using HTTPie (alternative to curl):**
```bash
# Install HTTPie
pip install httpie

# Create customer
http POST localhost:3000/api/v1/customers name="John Doe" email="john@example.com"

# Get customers with filters
http GET localhost:3000/api/v1/customers search==john limit==5
```

**Using Postman:**
1. Import the API endpoints
2. Set base URL: `http://localhost:3000/api/v1`
3. Add Content-Type header: `application/json`
4. Test each endpoint systematically

---

## 📚 Additional Resources

- **Database Schema**: Check `prisma/schema.prisma`
- **API Documentation**: See `API_ENDPOINTS.md`
- **Type Definitions**: See `types/index.ts`
- **Validation Schemas**: See `lib/validators.ts`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test all endpoints
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

For issues and questions:
1. Check this README
2. Review the API documentation
3. Test with the provided examples
4. Create an issue in the repository

---

**Happy Coding! 🚀**
