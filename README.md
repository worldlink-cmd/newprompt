# Tailoring Business Management System

A comprehensive web application for managing a tailoring business, built with Next.js 14+, TypeScript, PostgreSQL, Prisma ORM, NextAuth.js, Tailwind CSS, and shadcn/ui.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with role-based access control
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Supports local and cloud deployments (Vercel, AWS, etc.)

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tailoring-business-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   # Ensure PostgreSQL is running
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Configuration

Copy `.env.example` to `.env.local` and update the variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- Other placeholders for future integrations

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run prisma:generate`: Generate Prisma client
- `npm run prisma:migrate`: Run database migrations
- `npm run prisma:studio`: Open Prisma Studio
- `npm run prisma:seed`: Seed the database

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/             # React components (UI and custom)
├── lib/                    # Utilities and configurations
├── prisma/                 # Database schema and migrations
├── types/                  # TypeScript type definitions
├── public/                 # Static assets
└── ...
```

## Authentication Roles

The system supports six user roles:
- **Admin**: Full access to all features
- **Manager**: Manage orders and staff
- **Cutter**: Handle cutting tasks
- **Stitcher**: Handle stitching tasks
- **Presser**: Handle pressing tasks
- **Delivery**: Handle delivery tasks

## Phase 2: Customer Management

The customer management system provides comprehensive tools for managing customer information and relationships.

### Features

- **Customer CRUD Operations**: Create, read, update, and delete customer records
- **Advanced Search & Filtering**: Search by name, email, phone, or customer number with filters for gender, contact method, and status
- **Customer Profiles**: Detailed customer information with organized tabs for contact details, preferences, and history
- **Contact Management**: Support for multiple contact methods (Email, Phone, WhatsApp, SMS) with preferred contact tracking
- **Address Management**: Complete address information with city, state, postal code, and country
- **Customer Status**: Active/inactive status management for customer lifecycle
- **Role-based Access**: Customer management restricted to Admin and Manager roles
- **Responsive Design**: Mobile-friendly interface with proper responsive layouts

### Customer Data Fields

- **Personal Information**: First name, last name, gender, date of birth
- **Contact Information**: Email, phone, alternate phone, preferred contact method
- **Address Information**: Full address, city, state, postal code, country
- **Additional Information**: Customer notes, loyalty points, status
- **System Fields**: Customer number (auto-generated), creation date, created by user

### API Endpoints

- `GET /api/customers`: List customers with search, filtering, and pagination
- `POST /api/customers`: Create new customer
- `GET /api/customers/[id]`: Get customer details
- `PUT /api/customers/[id]`: Update customer information
- `DELETE /api/customers/[id]`: Soft delete customer (sets inactive)

### UI Pages

- **Customer List** (`/dashboard/customers`): Main customer management page with table, filters, and actions
- **Customer Profile** (`/dashboard/customers/[id]`): Detailed customer information with tabbed interface

### Database Schema

The Customer model includes comprehensive fields for tailoring business needs:
- Unique customer numbers (auto-generated format: CUST-YYYYMMDD-XXX)
- Complete contact and address information
- Gender and preferred contact method enums
- Loyalty points system (ready for future implementation)
- Soft delete functionality with active/inactive status
- Audit trail with creation date and created by user

### Usage Instructions

1. **Access Customer Management**: Navigate to `/dashboard/customers` (Admin/Manager only)
2. **Create Customer**: Click "Add Customer" button to open the customer creation form
3. **Search & Filter**: Use the search bar and filters to find specific customers
4. **View Customer Details**: Click on any customer row to view their profile
5. **Edit Customer**: Use the "Edit" button in the actions menu or profile page
6. **Delete Customer**: Use the "Delete" button (Admin/Manager only) with confirmation dialog

### Sample Data

The seed script includes 10 diverse sample customers with:
- Mix of local and international names
- Various contact methods and preferences
- Different locations across UAE emirates
- Both active and inactive customers
- Realistic business scenarios and notes

## Phase 3: Measurement Management System

The measurement management system provides flexible tools for tracking customer measurements across multiple garment types with version history and dynamic forms.

### Features

- **Flexible Measurement Tracking**: Support for multiple garment types (Shirt, Suit, Dress, Trouser) with customizable measurement fields
- **Version History**: Each measurement update creates a new version with `isLatest` flag for easy retrieval of current measurements
- **Dynamic Forms**: Forms adapt based on selected garment type, showing relevant measurement fields with validation
- **Measurement Templates**: Pre-defined templates for each garment type with field definitions, units, and validation rules
- **Unit Support**: Measurements in both centimeters (CM) and inches with conversion utilities
- **Customer Integration**: Measurements tab in customer profile page for seamless access
- **Role-based Access**: Measurement management available to all authenticated users
- **Responsive Design**: Mobile-friendly interface with proper responsive layouts

### Supported Garment Types

- **Shirt**: Neck, chest, waist, shoulder, sleeve length, shirt length, cuff
- **Suit**: Complete jacket and trouser measurements (chest, waist, hip, shoulder, sleeve length, jacket length, inseam, outseam, thigh, knee, cuff, rise)
- **Dress**: Bust, waist, hip, shoulder to waist, waist to hem, dress length, sleeve length, armhole
- **Trouser**: Waist, hip, inseam, outseam, thigh, knee, cuff, rise

### API Endpoints

- `GET /api/customers/[id]/measurements`: List measurements for a customer with filtering and sorting
- `POST /api/customers/[id]/measurements`: Create new measurement (creates version 1 or new version)
- `GET /api/customers/[id]/measurements/[measurementId]`: Get specific measurement details
- `PUT /api/customers/[id]/measurements/[measurementId]`: Update measurement (creates new version)
- `DELETE /api/customers/[id]/measurements/[measurementId]`: Soft delete measurement (sets isLatest to false)
- `GET /api/customers/[id]/measurements/latest`: Get latest measurements for a customer (with optional garment type filter)

### UI Integration

- **Measurements Tab**: New tab in customer profile page (`/dashboard/customers/[id]`) for managing measurements
- **Measurement Cards**: Display measurement details with version badges, creation info, and action buttons
- **Dynamic Forms**: Forms load appropriate fields based on selected garment type with real-time validation
- **History Dialog**: View all versions of measurements for a specific garment type
- **Responsive Layout**: Grid layout for measurement cards with proper spacing and mobile support

### Database Schema

The Measurement model includes:
- **Core Fields**: id, customerId, garmentType, unit, measurements (JSON), notes, version, isLatest, createdAt, updatedAt, createdBy
- **Enums**: GarmentType (SHIRT, SUIT, DRESS, TROUSER), MeasurementUnit (CM, INCH)
- **Indexes**: Optimized for querying latest measurements per customer and garment type
- **Relations**: Foreign keys to Customer and User models for audit trail
- **Versioning**: Simple versioning with `isLatest` flag for efficient current measurement retrieval

### Versioning Approach

- Each save creates a new measurement record with incremented version number
- Previous versions remain in database with `isLatest` set to false
- Current version has `isLatest` set to true for easy retrieval
- History dialog shows all versions sorted by version number (newest first)
- Soft delete preserves history while marking as not latest

### Usage Instructions

1. **Access Measurements**: Navigate to a customer profile and click the "Measurements" tab
2. **Add Measurement**: Click "Add Measurement" to open the creation dialog
3. **Select Garment Type**: Choose from Shirt, Suit, Dress, or Trouser
4. **Enter Measurements**: Fill in the required fields for the selected garment type
5. **Save**: Submit the form to create the measurement (version 1)
6. **Edit Measurement**: Click "Edit" on any measurement card to update (creates new version)
7. **View History**: Click "View History" to see all versions for a garment type
8. **Delete Measurement**: Click "Delete" (Admin/Manager only) to soft delete

### Sample Data

The seed script includes sample measurements for 5 customers:
- SHIRT measurements for 2 customers with realistic values
- SUIT measurements for 1 customer with complete jacket and trouser data
- DRESS measurements for 1 customer with dress-specific fields
- TROUSER measurements for 1 customer with trouser fields
- Multiple versions of SHIRT measurements for 1 customer to demonstrate version history

### Project Structure Updates

New directories and files added for Phase 3:
- `app/api/customers/[id]/measurements/`: API routes for measurement operations
- `components/measurements/`: React components for measurement UI
- `lib/constants/measurement-templates.ts`: Garment type templates and field definitions
- `lib/validations/measurement.ts`: Zod schemas for measurement validation
- `lib/api/measurements.ts`: Client-side API helpers for measurement operations
- `lib/utils.ts`: Updated with measurement utility functions (format, convert, labels)

## Phase 4: Basic Order Management System

The basic order management system provides foundational tools for creating, tracking, and managing customer orders with automatic order number generation, delivery date calculation, and comprehensive order details.

### Features

- **Order Creation & Management**: Complete CRUD operations for orders with customer and measurement linking
- **Automatic Order Numbering**: Auto-generated order numbers in format ORD-YYYYMMDD-XXX for unique identification
- **Delivery Date Calculation**: Automatic calculation based on configurable lead times by garment type
- **Customer & Measurement Integration**: Seamless linking of orders to customers and their measurements
- **Order Status Tracking**: Basic status workflow (Pending, In Progress, Completed, Cancelled)
- **Priority Management**: Order priority levels (Low, Normal, High, Urgent) with visual indicators
- **Pricing & Payment Tracking**: Total amount, deposit amount, and balance amount with payment status
- **Advanced Search & Filtering**: Search by order number, customer name, service description with filters for status, garment type, priority, and date range
- **Order Detail Pages**: Comprehensive order information with tabbed interface for details, customer info, and measurement details
- **Customer Profile Integration**: Orders tab in customer profile showing order history
- **Role-based Access**: All authenticated users can view orders; only Admin/Manager can create/edit/delete
- **Responsive Design**: Mobile-friendly interface with proper responsive layouts

### Order Data Fields

- **Order Information**: Order number (auto-generated), order date, delivery date, status, priority, urgent flag
- **Customer Link**: Customer ID with full customer details in responses
- **Measurement Link**: Optional measurement ID with measurement details and version information
- **Service Details**: Garment type, service description, special instructions
- **Pricing Information**: Total amount, deposit amount, balance amount (calculated automatically)
- **System Fields**: Created date, updated date, created by user with audit trail

### Supported Garment Types & Lead Times

- **Shirt**: 5 days lead time
- **Trouser**: 5 days lead time
- **Dress**: 7 days lead time
- **Suit**: 10 days lead time
- **Urgent Orders**: 2 days lead time (all garment types)

### API Endpoints

- `GET /api/orders`: List orders with search, filtering, sorting, and pagination
- `POST /api/orders`: Create new order with validation and automatic field calculation
- `GET /api/orders/[id]`: Get detailed order information with related customer and measurement data
- `PUT /api/orders/[id]`: Update order information with validation and balance recalculation
- `DELETE /api/orders/[id]`: Soft delete order by setting status to Cancelled

### UI Pages

- **Orders List** (`/dashboard/orders`): Main order management page with table, filters, search, and pagination
- **Order Detail** (`/dashboard/orders/[id]`): Comprehensive order information with tabbed interface
- **Customer Profile Orders Tab** (`/dashboard/customers/[id]`): Order history integrated into customer profile

### Database Schema

The Order model includes comprehensive fields for basic order management:
- **Core Fields**: id, orderNumber (unique), customerId, measurementId (optional), garmentType, serviceDescription, specialInstructions, orderDate, deliveryDate, status, priority, totalAmount, depositAmount, balanceAmount, isUrgent, createdAt, updatedAt, createdBy
- **Enums**: OrderStatus (PENDING, IN_PROGRESS, COMPLETED, CANCELLED), OrderPriority (LOW, NORMAL, HIGH, URGENT)
- **Indexes**: Optimized for customer queries, order number searches, status filtering, and date-based sorting
- **Relations**: Foreign keys to Customer, Measurement, and User models with proper cascade behavior
- **Constraints**: Unique order numbers, delivery date validation, balance amount calculation

### Business Logic

- **Order Number Generation**: Format ORD-YYYYMMDD-XXX where XXX is timestamp-based for uniqueness
- **Delivery Date Calculation**: Based on garment type lead times with urgent order support
- **Balance Amount**: Automatically calculated as totalAmount - depositAmount
- **Measurement Auto-Selection**: Automatically selects latest measurement for customer and garment type if not specified
- **Authorization**: Role-based permissions with Admin/Manager create/edit/delete, all users can view
- **Soft Delete**: Orders are cancelled (status change) rather than hard deleted to preserve history

### Usage Instructions

1. **Access Order Management**: Navigate to `/dashboard/orders` (all authenticated users)
2. **Create Order**: Click "Create Order" button to open the order creation form
3. **Select Customer**: Choose customer from dropdown (searches by name and customer number)
4. **Choose Garment Type**: Select from Shirt, Suit, Dress, or Trouser
5. **Add Service Details**: Describe the service required and any special instructions
6. **Link Measurement**: Optionally select a measurement or let system auto-select latest
7. **Set Pricing**: Enter total amount and deposit amount (balance calculated automatically)
8. **Review Delivery**: System calculates estimated delivery date based on lead times
9. **Submit Order**: Save to create order with auto-generated order number
10. **View Order Details**: Click on any order row to view comprehensive details
11. **Edit Order**: Use "Edit" button to modify order information
12. **Cancel Order**: Use "Cancel Order" button (Admin only) with confirmation dialog

### Customer Profile Integration

- **Orders Tab**: New tab in customer profile showing customer's order history
- **Quick Actions**: "View All Orders" and "Create First Order" buttons for easy navigation
- **Order Summary**: Table showing recent orders with key information and status
- **Navigation**: Direct links to order detail pages and order creation with customer pre-selected

### Sample Data

The seed script includes diverse sample orders for development and testing:
- **Pending Orders**: 2-3 recent orders with future delivery dates
- **In Progress Orders**: 2-3 orders from 3-5 days ago
- **Completed Orders**: 1-2 orders from 2-3 weeks ago with past delivery dates
- **Cancelled Orders**: 1 order to demonstrate cancellation workflow
- **Mixed Garment Types**: Orders for shirts, suits, dresses, and trousers
- **Various Priorities**: Mix of normal, high, and urgent orders
- **Pricing Scenarios**: Orders with and without deposits, full and partial payments
- **Measurement Links**: Orders linked to corresponding customer measurements

### Project Structure Updates

New directories and files added for Phase 4:
- `app/api/orders/`: API routes for order operations (list, create, detail, update, delete)
- `app/(dashboard)/orders/`: Order management pages (list and detail)
- `components/orders/`: React components for order UI (form, table, filters, dialog, skeleton)
- `lib/api/orders.ts`: Client-side API helpers for order operations
- `lib/constants/order-config.ts`: Order configuration constants (lead times, business rules)
- `lib/validations/order.ts`: Zod schemas for order validation with custom refinements
- `types/index.ts`: Updated with order-related TypeScript types and enums
- `lib/utils.ts`: Updated with order utility functions (formatting, status/priority labels, date formatting)

### Configuration

Order configuration is centralized in `lib/constants/order-config.ts`:
- **Lead Times**: Configurable by garment type with urgent order support
- **Business Rules**: Minimum and maximum lead times, default lead time
- **Extensibility**: Easy to modify for business requirements or move to database for dynamic configuration

### Future Enhancements

Phase 4 provides the foundation for advanced order management features planned for future phases:
- **Phase 5**: Advanced workflow states, status history, and automated status transitions
- **Phase 6**: Specialized order types (alterations, repairs, custom designs)
- **Phase 7**: Design catalogs, fabric selection, and visual order customization

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for local and cloud environments.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

[MIT](LICENSE)
