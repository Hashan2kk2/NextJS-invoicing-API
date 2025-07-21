# 📋 Invoicing API Documentation

## 🔗 Base URL
```
http://localhost:3000/api/v1
```

## 📚 API Endpoints

### 🏥 Health Check
- **GET** `/health` - Check API health status

---

### 👥 Customers

#### Get All Customers
- **GET** `/customers`
- **Query Parameters:**
  - `page` (number) - Page number (default: 1)
  - `limit` (number) - Items per page (default: 10)
  - `search` (string) - Search by name or email
  - `city` (string) - Filter by city
  - `state` (string) - Filter by state
  - `country` (string) - Filter by country
  - `sortBy` (string) - Sort field (default: createdAt)
  - `sortOrder` (asc|desc) - Sort order (default: desc)

#### Create Customer
- **POST** `/customers`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA"
}
```

#### Get Customer by ID
- **GET** `/customers/{id}`

#### Update Customer
- **PUT** `/customers/{id}`
- **Body:** Same as create (all fields optional)

#### Delete Customer
- **DELETE** `/customers/{id}`

---

### 📦 Products

#### Get All Products
- **GET** `/products`
- **Query Parameters:**
  - `page` (number) - Page number
  - `limit` (number) - Items per page
  - `search` (string) - Search by name, description, or SKU
  - `category` (string) - Filter by category
  - `minPrice` (number) - Minimum price filter
  - `maxPrice` (number) - Maximum price filter
  - `sortBy` (string) - Sort field
  - `sortOrder` (asc|desc) - Sort order

#### Create Product
- **POST** `/products`
- **Body:**
```json
{
  "name": "Web Development Service",
  "description": "Professional web development",
  "price": 150.00,
  "category": "Services",
  "sku": "WEB-001"
}
```

#### Get Product by ID
- **GET** `/products/{id}`

#### Update Product
- **PUT** `/products/{id}`
- **Body:** Same as create (all fields optional)

#### Delete Product
- **DELETE** `/products/{id}`

---

### 🧾 Invoices

#### Get All Invoices
- **GET** `/invoices`
- **Query Parameters:**
  - `page` (number) - Page number
  - `limit` (number) - Items per page
  - `status` (DRAFT|SENT|PAID|OVERDUE|CANCELLED) - Filter by status
  - `customerId` (string) - Filter by customer
  - `fromDate` (ISO date) - Start date filter
  - `toDate` (ISO date) - End date filter
  - `minAmount` (number) - Minimum amount filter
  - `maxAmount` (number) - Maximum amount filter
  - `sortBy` (string) - Sort field
  - `sortOrder` (asc|desc) - Sort order

#### Create Invoice
- **POST** `/invoices`
- **Body:**
```json
{
  "customerId": "customer_id_here",
  "dueDate": "2025-08-20T00:00:00.000Z",
  "items": [
    {
      "productId": "product_id_here",
      "quantity": 2,
      "unitPrice": 150.00
    }
  ],
  "taxRate": 0.08,
  "notes": "Thank you for your business!"
}
```

#### Get Invoice by ID
- **GET** `/invoices/{id}`

#### Update Invoice
- **PUT** `/invoices/{id}`
- **Body:** Same as create (all fields optional)

#### Delete Invoice
- **DELETE** `/invoices/{id}`

#### Update Invoice Status
- **PATCH** `/invoices/{id}/status`
- **Body:**
```json
{
  "status": "SENT"
}
```

#### Add Payment to Invoice
- **POST** `/invoices/{id}/payments`
- **Body:**
```json
{
  "amount": 100.00,
  "method": "CREDIT_CARD",
  "date": "2025-07-21T12:00:00.000Z",
  "reference": "TXN-12345",
  "notes": "Payment received"
}
```

---

### 📊 Statistics

#### Dashboard Statistics
- **GET** `/dashboard/stats`
- **Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 10,
    "totalProducts": 25,
    "totalInvoices": 50,
    "totalRevenue": 15000.00,
    "pendingRevenue": 3000.00,
    "invoiceBreakdown": {
      "draft": 5,
      "sent": 10,
      "paid": 30,
      "overdue": 3,
      "cancelled": 2
    }
  }
}
```

#### Invoice Statistics
- **GET** `/invoices/stats`

---

## 🔍 Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [...] // For validation errors
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "customers": [...],
    "total": 100
  },
  "message": "Customers retrieved successfully"
}
```

---

## 🧪 Testing Examples

### Create and Test Complete Flow

```bash
# 1. Create a customer
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1555123456"
  }'

# 2. Create a product
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Consulting Service",
    "price": 200.00,
    "sku": "CONS-001"
  }'

# 3. Create an invoice
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUSTOMER_ID_FROM_STEP_1",
    "dueDate": "2025-08-20T00:00:00.000Z",
    "items": [
      {
        "productId": "PRODUCT_ID_FROM_STEP_2",
        "quantity": 5,
        "unitPrice": 200.00
      }
    ],
    "taxRate": 0.08
  }'

# 4. Add payment
curl -X POST http://localhost:3000/api/v1/invoices/INVOICE_ID/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500.00,
    "method": "BANK_TRANSFER"
  }'

# 5. Update invoice status
curl -X PATCH http://localhost:3000/api/v1/invoices/INVOICE_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "PAID"}'
```

### Query Examples

```bash
# Get customers with search and pagination
curl "http://localhost:3000/api/v1/customers?search=john&page=1&limit=5"

# Get products by category
curl "http://localhost:3000/api/v1/products?category=Services&sortBy=price&sortOrder=asc"

# Get invoices by status and date range
curl "http://localhost:3000/api/v1/invoices?status=PAID&fromDate=2025-01-01T00:00:00.000Z&toDate=2025-12-31T23:59:59.999Z"

# Get dashboard statistics
curl "http://localhost:3000/api/v1/dashboard/stats"
```

---

## 🚀 Getting Started

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the API health:**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

3. **Run the automated test script:**
   ```bash
   node scripts/test-api.js
   ```

---

## 🔒 Error Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **404** - Not Found
- **409** - Conflict (duplicate data)
- **500** - Internal Server Error
- **503** - Service Unavailable

---

## 📝 Notes

- All dates should be in ISO 8601 format
- Currency amounts are in decimal format (e.g., 99.99)
- Invoice numbers are auto-generated
- Email addresses must be unique across customers
- SKUs must be unique across products (if provided)
- Invoice totals are automatically calculated
- Payment amounts cannot exceed remaining invoice balance
