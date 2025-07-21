# Invoicing API Documentation

## Overview
A comprehensive invoicing system API built with Next.js, Prisma ORM, PostgreSQL, and TypeScript. This API provides complete CRUD operations for customers, products, invoices, and payments.

## Tech Stack
- **Framework**: Next.js 15.4.2
- **Database**: PostgreSQL with Prisma ORM 6.12.0
- **Language**: TypeScript 5.x
- **Validation**: Zod 4.0.5
- **Runtime**: Node.js

## Project Structure
```
invoicing-api/
├── app/                     # Next.js app directory
├── lib/                     # Core utilities and services
│   ├── services/           # Database service classes
│   │   ├── customer.service.ts
│   │   ├── product.service.ts
│   │   └── invoice.service.ts
│   ├── prisma.ts          # Prisma client configuration
│   ├── utils.ts           # Utility functions
│   ├── validators.ts      # Zod validation schemas
│   └── index.ts           # Main exports
├── prisma/
│   └── schema.prisma      # Database schema
├── scripts/
│   └── test-db.ts        # Database connection test
├── types/
│   └── index.ts          # TypeScript type definitions
└── package.json
```

## Database Schema

### Customer
- **id**: String (Primary Key, CUID)
- **name**: String (Required)
- **email**: String (Required, Unique)
- **phone**: String (Optional)
- **address**: String (Optional)
- **city**: String (Optional)
- **state**: String (Optional)
- **zipCode**: String (Optional)
- **country**: String (Optional)
- **createdAt**: DateTime
- **updatedAt**: DateTime

### Product
- **id**: String (Primary Key, CUID)
- **name**: String (Required)
- **description**: String (Optional)
- **price**: Float (Required)
- **category**: String (Optional)
- **sku**: String (Optional, Unique)
- **createdAt**: DateTime
- **updatedAt**: DateTime

### Invoice
- **id**: String (Primary Key, CUID)
- **number**: String (Required, Unique)
- **customerId**: String (Foreign Key)
- **issueDate**: DateTime (Default: now)
- **dueDate**: DateTime (Required)
- **status**: InvoiceStatus (Default: DRAFT)
- **subtotal**: Float (Calculated)
- **taxRate**: Float (Default: 0)
- **taxAmount**: Float (Calculated)
- **total**: Float (Calculated)
- **notes**: String (Optional)
- **createdAt**: DateTime
- **updatedAt**: DateTime

### InvoiceItem
- **id**: String (Primary Key, CUID)
- **invoiceId**: String (Foreign Key)
- **productId**: String (Foreign Key)
- **quantity**: Integer (Required)
- **unitPrice**: Float (Required)
- **total**: Float (Calculated)

### Payment
- **id**: String (Primary Key, CUID)
- **invoiceId**: String (Foreign Key)
- **amount**: Float (Required)
- **method**: PaymentMethod (Required)
- **date**: DateTime (Default: now)
- **reference**: String (Optional)
- **notes**: String (Optional)
- **createdAt**: DateTime

### Enums
- **InvoiceStatus**: DRAFT, SENT, PAID, OVERDUE, CANCELLED
- **PaymentMethod**: CASH, CREDIT_CARD, BANK_TRANSFER, CHECK, PAYPAL, OTHER

## API Endpoints (To be implemented)

### Customers
- `GET /api/customers` - List all customers with filtering and pagination
- `POST /api/customers` - Create a new customer
- `GET /api/customers/[id]` - Get customer by ID with invoices
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Products
- `GET /api/products` - List all products with filtering and pagination
- `POST /api/products` - Create a new product
- `GET /api/products/[id]` - Get product by ID with usage stats
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Invoices
- `GET /api/invoices` - List all invoices with filtering and pagination
- `POST /api/invoices` - Create a new invoice
- `GET /api/invoices/[id]` - Get invoice by ID with details
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `PATCH /api/invoices/[id]/status` - Update invoice status
- `POST /api/invoices/[id]/payments` - Add payment to invoice

### Statistics
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/invoices/stats` - Get invoice statistics

## Available Services

### CustomerService
- `getAll(filters, pagination)` - Get paginated customers
- `getById(id)` - Get customer with invoices
- `create(data)` - Create new customer
- `update(id, data)` - Update customer
- `delete(id)` - Delete customer
- `checkEmailExists(email, excludeId?)` - Check email uniqueness

### ProductService
- `getAll(filters, pagination)` - Get paginated products
- `getById(id)` - Get product with usage stats
- `create(data)` - Create new product
- `update(id, data)` - Update product
- `delete(id)` - Delete product
- `checkSkuExists(sku, excludeId?)` - Check SKU uniqueness
- `getPopularProducts(limit)` - Get most used products

### InvoiceService
- `getAll(filters, pagination)` - Get paginated invoices
- `getById(id)` - Get invoice with full details
- `create(data)` - Create new invoice with items
- `update(id, data)` - Update invoice
- `delete(id)` - Delete invoice
- `updateStatus(id, status)` - Update invoice status
- `addPayment(data)` - Add payment to invoice
- `getStatistics()` - Get invoice statistics
- `checkOverdueInvoices()` - Update overdue invoices

## Validation

All input data is validated using Zod schemas:
- **customerSchema** - Customer creation/update validation
- **productSchema** - Product creation/update validation
- **invoiceSchema** - Invoice creation validation
- **paymentSchema** - Payment creation validation
- **paginationSchema** - Pagination parameters validation
- Filter schemas for each entity

## Utility Functions

### API Helpers
- `createSuccessResponse(data, message, status)` - Standard success response
- `createErrorResponse(error, status)` - Standard error response
- `createValidationErrorResponse(zodError)` - Validation error response
- `withErrorHandling(fn)` - Error handling wrapper

### Business Logic
- `generateInvoiceNumber(count)` - Generate unique invoice numbers
- `calculateInvoiceTotals(items, taxRate)` - Calculate invoice totals
- `formatCurrency(amount, currency)` - Format currency values
- `calculatePagination(page, limit, total)` - Pagination calculations

### Database Helpers
- `buildSearchFilter(search, fields)` - Build search queries
- `buildDateRangeFilter(fromDate, toDate)` - Build date range filters
- `buildSortOrder(sortBy, sortOrder)` - Build sort parameters

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/invoicing_db"

# NextAuth.js (optional)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up database**:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Or run migrations
   npx prisma migrate dev
   ```

3. **Test database connection**:
   ```bash
   npx tsx scripts/test-db.ts
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open Prisma Studio** (optional):
   ```bash
   npm run db:studio
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Run database seeds (when implemented)

## Error Handling

The API includes comprehensive error handling:
- **Validation Errors** (400) - Invalid input data
- **Not Found Errors** (404) - Resource not found
- **Conflict Errors** (409) - Duplicate resources
- **Server Errors** (500) - Internal server errors

All errors return a consistent format:
```json
{
  "success": false,
  "error": "Error message",
  "details": [] // For validation errors
}
```

## Type Safety

The project uses TypeScript with strict mode enabled and includes:
- Complete type definitions for all entities
- Request/response type interfaces
- Prisma-generated types
- Zod schema validation
- Utility type helpers

## Next Steps

1. Implement API route handlers in `app/api/`
2. Add authentication and authorization
3. Implement email notifications
4. Add PDF invoice generation
5. Create a frontend dashboard
6. Add more comprehensive testing
7. Implement caching strategies
8. Add audit logging

## Contributing

1. Follow TypeScript best practices
2. Use the provided validation schemas
3. Handle errors consistently
4. Add proper type definitions
5. Update documentation when adding features
