# Size Charts

Open-source size chart management system for e-commerce platforms. Create, manage, and embed size charts with a spreadsheet-like editor and REST API.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Language**: TypeScript 5 (strict mode)
- **Database**: PostgreSQL 14+ with Prisma 7 ORM
- **UI**: Tailwind CSS 4, shadcn/ui (Radix), Lucide Icons
- **Data Fetching**: TanStack React Query v5
- **Validation**: Zod schemas
- **Testing**: Vitest (unit), Playwright (E2E)

## Project Structure

```
app/
├── (marketing)/          # Landing page, docs, demos (optional, removable)
├── (app)/
│   ├── admin/            # Admin panel - chart CRUD, categories, labels
│   └── size-guide/       # Public customer-facing size guide
└── api/
    ├── v1/               # Public REST API (versioned)
    └── admin/            # Admin-only endpoints

components/
├── admin/                # Admin UI (sidebar, editor, template picker)
├── public/               # Public-facing (size-chart-display, unit-switcher)
├── ui/                   # shadcn/ui components
└── docs/                 # Documentation components

hooks/                    # React Query hooks (use-size-charts, use-categories, etc.)
lib/                      # Utilities (db, auth, validation, conversions)
prisma/
├── schema.prisma         # Data models
├── migrations/           # Migration history
├── seed.ts               # Sample data seeder
└── templates/            # Pre-built size chart templates (JSON)
types/                    # TypeScript type definitions
__tests__/                # Vitest unit tests
e2e/                      # Playwright E2E tests
```

## Development Commands

```bash
# Setup
npm install               # Install dependencies
cp .env.example .env      # Create environment file
npm run dev               # Start dev server at http://localhost:3000

# Database
npm run db:push           # Push schema to database (dev)
npm run db:migrate        # Run migrations (production)
npm run db:seed           # Seed with sample data
npm run db:studio         # Open Prisma Studio GUI
npm run db:reset          # Reset database (dev only)

# Testing
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:coverage     # With coverage report
npm run test:e2e          # Playwright E2E tests
npm run test:e2e:ui       # Playwright with UI

# Build
npm run build             # Production build
npm run lint              # ESLint check
```

## Key Patterns

### Database
- Dual-unit storage: `valueInches` + `valueCm` for all measurements
- Range support: `valueMinInches`, `valueMinCm` for ranges like "34-37"
- Charts link to categories via `SizeChartSubcategory` join table

### API Structure
- Public API at `/api/v1/` (size-charts, categories, labels)
- Admin endpoints at `/api/admin/` (CRUD operations)
- API key auth optional via `API_AUTH_REQUIRED` env var

### Components
- Spreadsheet editor at `components/admin/size-chart-editor/`
- Uses cell-by-cell navigation with keyboard support
- Unit switching stored in localStorage via `use-unit-preference` hook

## Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string

**Optional:**
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` - Admin panel credentials
- `API_AUTH_REQUIRED` - Enable API key authentication (default: false)
- `CORS_ALLOWED_ORIGINS` - Comma-separated allowed origins
- `RATE_LIMIT_PER_MINUTE` - API rate limit (default: 100)

## Conventions

- Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Run `npm run lint` before committing
- Add unit tests for utilities in `__tests__/`
- Add E2E tests for user flows in `e2e/`
- Follow existing patterns in similar files

## Common Tasks

**Add a new API endpoint:**
1. Create route handler in `app/api/v1/[resource]/route.ts`
2. Add Zod validation schema in `lib/validations.ts`
3. Update OpenAPI spec if needed

**Add a new admin page:**
1. Create page at `app/(app)/admin/[feature]/page.tsx`
2. Add sidebar link in `components/admin/app-sidebar.tsx`
3. Create React Query hook in `hooks/use-[feature].ts`

**Add a new size chart template:**
1. Create JSON file in `prisma/templates/[category]/`
2. Register in `prisma/templates/index.ts`
3. Run seed to verify: `npm run db:seed`

## Testing Notes

- Unit tests use jsdom with Next.js mocks in `vitest.setup.tsx`
- E2E tests auto-start dev server, test against localhost:3000
- Run `npm run test:e2e:install` first to install browsers
