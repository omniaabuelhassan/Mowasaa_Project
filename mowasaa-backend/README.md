# Mowasaa Pharmacy Finder - Backend API

GIS-based pharmacy finder with medicine search, price comparison, and location services.

## Features

- 🔍 Smart medicine search with alternatives
- 📍 Location-based pharmacy finder (PostGIS)
- 💰 Price comparison across pharmacies
- 🎁 Best deals and offers
- 📊 Admin panel for pharmacies

## Installation

```bash
npm install
```

## Configuration

Create `.env` file:

```env
DATABASE_URL=your_supabase_connection_string
PORT=3000
NODE_ENV=development
```

## Run

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Search
- `GET /api/search/smart?medicine=Panadol&latitude=27.2579&longitude=33.8116`
- `GET /api/search/deals?medicine=Panadol&latitude=27.2579&longitude=33.8116`
- `GET /api/search/compare?medicine=Panadol`

### Pharmacies
- `GET /api/pharmacies`
- `GET /api/pharmacies/nearest?latitude=27.2579&longitude=33.8116&limit=5`
- `GET /api/pharmacies/:id`
- `GET /api/pharmacies/:id/inventory`

### Medicines
- `GET /api/medicines`
- `GET /api/medicines/search?name=Panadol`
- `GET /api/medicines/:id`

### Admin
- `POST /api/admin/inventory`
- `PUT /api/admin/inventory/:id`
- `DELETE /api/admin/inventory/:id`

## Tech Stack

- Node.js + Express
- PostgreSQL + PostGIS (Supabase)
- CORS enabled