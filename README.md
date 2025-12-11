# Size Charts

> Open-source size chart management system for e-commerce platforms

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)](https://www.prisma.io/)
[![GitHub](https://img.shields.io/github/stars/mattdecrevel/size-charts?style=social)](https://github.com/mattdecrevel/size-charts)

**[Documentation](https://github.com/mattdecrevel/size-charts#readme)** | **[Issues](https://github.com/mattdecrevel/size-charts/issues)** | **[Discussions](https://github.com/mattdecrevel/size-charts/discussions)**

A production-ready size chart CRUD system with an admin interface and REST API. Built for e-commerce platforms that need to manage clothing, footwear, and accessory sizing across multiple regions and categories.

## Features

- **Dynamic Size Charts** - Create charts with custom columns (measurements, size labels, regional sizes)
- **Multi-Category Support** - Assign one chart to multiple categories to avoid duplication
- **Dual Unit Storage** - Store both inches and centimeters for all measurements
- **Translatable Labels** - Standardized size keys (e.g., `SIZE_SM`) for i18n integration
- **Spreadsheet-like Editor** - Inline editing with keyboard navigation
- **REST API** - Clean, versioned v1 API for headless integration
- **OpenAPI/Swagger** - Interactive API documentation at `/api/docs`
- **Dark Mode** - Full dark mode support with system preference detection

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Prisma 7 ORM
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State**: React Query (TanStack Query)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or use Docker)
- npm, yarn, or pnpm

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/mattdecrevel/size-charts.git
cd size-charts

# Start PostgreSQL and the app
docker-compose up -d

# Open the app
open http://localhost:3000
```

### Option 2: Manual Setup

```bash
# Clone the repository
git clone https://github.com/mattdecrevel/size-charts.git
cd size-charts

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL="postgresql://username@localhost:5432/size_charts?schema=public"

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
size-charts/
├── app/
│   ├── admin/           # Admin interface pages
│   │   ├── categories/  # Category management
│   │   ├── labels/      # Size label management
│   │   ├── size-charts/ # Chart editor
│   │   └── docs/        # Documentation pages
│   ├── api/
│   │   ├── v1/          # Public API (versioned)
│   │   ├── categories/  # Admin API
│   │   ├── labels/      # Labels API
│   │   └── size-charts/ # Charts API
│   └── size-guide/      # Public size guide pages
├── components/
│   ├── admin/           # Admin-specific components
│   │   └── size-chart-editor/  # Spreadsheet editor
│   └── ui/              # shadcn/ui components
├── hooks/               # React hooks
├── lib/                 # Utilities and helpers
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
└── types/               # TypeScript types
```

## API Reference

### Public API (v1)

All public endpoints are prefixed with `/api/v1`.

#### Get Size Charts

```bash
# Get all published charts
GET /api/v1/size-charts

# Get chart by slug
GET /api/v1/size-charts?slug=mens-tops

# Filter by category
GET /api/v1/size-charts?category=mens&subcategory=tops
```

#### Get Categories

```bash
# Get category tree with chart counts
GET /api/v1/categories
```

#### Get Labels

```bash
# Get all labels grouped by type
GET /api/v1/labels

# Filter by type
GET /api/v1/labels?type=ALPHA_SIZE
```

### Response Format

```json
{
  "id": "clx...",
  "name": "Men's Tops",
  "slug": "mens-tops",
  "columns": [
    { "id": "...", "name": "Size", "type": "SIZE_LABEL" },
    { "id": "...", "name": "Chest", "type": "MEASUREMENT" }
  ],
  "rows": [
    {
      "cells": [
        { "type": "label", "key": "SIZE_SM", "value": "SM" },
        { "type": "range", "inches": { "min": 34, "max": 37 }, "cm": { "min": 86, "max": 94 } }
      ]
    }
  ]
}
```

See the [API Documentation](http://localhost:3000/admin/docs/api) for detailed endpoint information.

## Database Schema

The system uses the following main models:

- **Category** - Top-level grouping (Men's, Women's, Kids)
- **Subcategory** - Second-level grouping (Tops, Bottoms, Footwear)
- **SizeChart** - The chart itself with name, slug, description
- **SizeChartColumn** - Dynamic columns with type (MEASUREMENT, SIZE_LABEL, etc.)
- **SizeChartRow** - Rows representing sizes
- **SizeChartCell** - Cell values with dual unit storage
- **SizeLabel** - Reusable size labels with standardized keys

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL for API docs | No |

### Label Types

The system supports these label types:

| Type | Description | Examples |
|------|-------------|----------|
| `ALPHA_SIZE` | Letter sizes | XS, S, M, L, XL |
| `NUMERIC_SIZE` | Number sizes | 0, 2, 4, 6, 8 |
| `YOUTH_SIZE` | Youth sizes | YS, YM, YL |
| `BAND_SIZE` | Bra band sizes | 30, 32, 34 |
| `CUP_SIZE` | Bra cup sizes | A, B, C, D |
| `SHOE_SIZE_US` | US shoe sizes | 7, 8, 9, 10 |
| `REGIONAL` | Regional codes | EU, UK, Asia |

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mattdecrevel/size-charts)

1. Click the button above
2. Connect a PostgreSQL database (Neon, Supabase, or Railway)
3. Set `DATABASE_URL` in environment variables
4. Deploy!

### Docker

```bash
# Build the image
docker build -t size-charts .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  size-charts
```

### Self-Hosted

See [deployment documentation](docs/deployment.md) for detailed self-hosting instructions.

## Development

### Commands

```bash
# Development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Database operations
npm run db:push      # Push schema changes
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Run migrations (production)
```

### Adding New Seed Data

Edit `prisma/seed.ts` to add new categories, charts, or labels:

```typescript
// Add a new category
const newCategory = await prisma.category.create({
  data: { name: "Kids", slug: "kids", displayOrder: 3 }
});

// Add a new label
await prisma.sizeLabel.create({
  data: {
    key: "SIZE_XXXL",
    displayValue: "3XL",
    labelType: "ALPHA_SIZE",
    sortOrder: 10
  }
});
```

## Internationalization

Size labels use standardized keys for translation integration:

```typescript
// Your translation file (e.g., fr-CA.json)
{
  "SIZE_XXS": "TTP",
  "SIZE_XS": "TP",
  "SIZE_SM": "P",
  "SIZE_MD": "M",
  "SIZE_LG": "G",
  "SIZE_XL": "TG"
}

// Usage in your app
const translated = t(cell.key) || cell.value;
```

See [API docs](http://localhost:3000/admin/docs/api) for complete translation examples with unit preferences.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Roadmap

See the [Changelog & Roadmap](http://localhost:3000/admin/docs/changelog) page for:

- Completed features
- Planned features
- Known issues

Key planned features:
- [ ] API authentication (API keys)
- [x] OpenAPI/Swagger documentation - Available at `/api/docs`
- [ ] Webhooks for chart changes
- [ ] Bulk import/export (CSV)
- [ ] Version history

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Icons from [Lucide](https://lucide.dev/)
