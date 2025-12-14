# Create New API Endpoint

Create a new REST API endpoint following the project patterns.

## Arguments
- $ARGUMENTS - Resource name (e.g., "products", "orders")

## Instructions

1. Analyze existing endpoints in `app/api/v1/` for patterns
2. Create the new route handler at `app/api/v1/$ARGUMENTS/route.ts`
3. Add Zod validation schemas in `lib/validations.ts`
4. Add TypeScript types in `types/index.ts` if needed
5. Include proper error handling and CORS headers
6. Add a basic test in `e2e/api.spec.ts`
7. Document the endpoint

Follow the existing patterns for:
- Response format (JSON with proper status codes)
- Error handling (try/catch with appropriate HTTP errors)
- Query parameter parsing
- Authentication checks (if API_AUTH_REQUIRED)
