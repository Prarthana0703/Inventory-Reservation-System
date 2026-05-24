# Multi-Warehouse Inventory Reservation System

## About the Project

This project is a simple inventory reservation system developed using Next.js and TypeScript. The purpose of this application is to solve a common problem in e-commerce platforms where multiple users may try to buy the same product at the same time.

Usually during checkout, payment verification can take a few minutes because of UPI, card authentication, redirects, and other payment processes. During this time another customer may also try to purchase the same product. If inventory is updated only after payment, the same item can accidentally be sold twice.

To avoid this issue, I implemented a reservation system where stock is temporarily held for a limited time.

The flow works like this:

- When a user clicks Reserve, stock gets reserved for 10 minutes
- If the user completes the payment, stock is permanently reduced
- If the user cancels or the timer expires, stock becomes available again

The main focus of this project was to understand reservation logic, inventory handling and preventing race conditions.

---

## Features

- Product listing page
- Multiple warehouse support
- Stock availability display
- Temporary inventory reservation
- Live countdown timer
- Confirm purchase functionality
- Cancel reservation functionality
- Automatic expiry of reservations
- Error handling for unavailable stock and expired reservations
- Responsive UI

---

## Technologies Used

Frontend:

- Next.js
- TypeScript
- Tailwind CSS
- React Query
- shadcn/ui

Backend:

- Next.js API routes
- Prisma ORM
- PostgreSQL using Supabase

Other tools:

- Redis
- Zod

---

## Database Design

The application uses four main models.

### Product

Stores product details such as:

- Name
- Description
- Image
- Creation details

### Warehouse

Stores warehouse information such as:

- Warehouse name
- Location

### Inventory

Stores stock information for products available in warehouses.

Fields include:

- Total stock
- Reserved stock

Available stock is calculated using:

```text
Available Stock = Total Units - Reserved Units
```

### Reservation

Stores reservation details such as:

- Product
- Warehouse
- Quantity
- Reservation status
- Expiry time

Reservation status can be:

- PENDING
- CONFIRMED
- RELEASED

---

## API Routes

### Get Products

```bash
GET /api/products
```

Returns all products along with available warehouse stock.

### Get Warehouses

```bash
GET /api/warehouses
```

Returns warehouse details.

### Create Reservation

```bash
POST /api/reservations
```

Creates a temporary reservation.

Example:

```json
{
   "productId":"1",
   "warehouseId":"2",
   "quantity":1
}
```

---

### Confirm Reservation

```bash
POST /api/reservations/[id]/confirm
```

Confirms reservation and updates stock permanently.

---

### Release Reservation

```bash
POST /api/reservations/[id]/release
```

Cancels reservation and returns stock.

---

## Reservation Flow

User selects a product

↓

User clicks Reserve

↓

System checks available inventory

↓

Stock is reserved for 10 minutes

↓

User can:

- Confirm purchase
- Cancel reservation

↓

If time expires automatically:

Reservation status changes to RELEASED

↓

Reserved stock becomes available again

---

## Handling Concurrent Requests

One of the important parts of this project was handling situations where multiple users try to reserve the same product at the same time.

For example:

Available stock = 1

If two users click Reserve simultaneously:

Expected result:

User A → Reservation successful

User B → Receives a stock unavailable message

To handle this issue, Prisma transactions and Redis locking are used to reduce race conditions and avoid duplicate reservations.

---

## Reservation Expiry

Reservations are valid only for 10 minutes.

A cron API endpoint is created:

```bash
/api/cron/release-expired
```

This endpoint checks pending reservations and automatically releases the expired ones.

---

## Setup Instructions

Clone the repository:

```bash
git clone <repository-link>
```

Move into the project folder:

```bash
cd inventory-reservation
```

Install dependencies:

```bash
npm install
```

Run database migration:

```bash
npx prisma migrate dev
```

Seed sample data:

```bash
npx prisma db seed
```

Run the project:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

## Environment Variables

Create a `.env` file and add:

```env
DATABASE_URL=
DIRECT_URL=
REDIS_URL=
NEXT_PUBLIC_APP_URL=
```

---

## Future Improvements

There are still several things that can be improved in the project:

- Authentication and user accounts
- Payment integration
- Real-time stock updates
- Admin dashboard
- Better analytics
- Improved locking mechanisms

---

## Final Thoughts

This project helped me understand how inventory systems work in real-world applications and how reservation systems help avoid overselling products. I mainly focused on implementing the core functionality correctly while keeping the code structure simple and easy to understand.