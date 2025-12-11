export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Size Charts API",
    description: `
Open-source size chart management API for e-commerce platforms.

## Overview
This API provides access to size chart data including categories, subcategories, labels, and the charts themselves.

## Base URL
All v1 API endpoints are prefixed with \`/api/v1\`.

## Authentication
Currently, the API is open and does not require authentication. API key authentication is planned for a future release.

## Units
- All measurements are stored in both inches and centimeters
- Use the \`unit\` query parameter to request a specific unit (defaults to both)

## Labels
Size labels use standardized keys (e.g., \`SIZE_SM\`, \`SIZE_LG\`) for internationalization.
Your application should translate these keys to locale-specific values.
    `,
    version: "1.0.0",
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
    contact: {
      name: "GitHub Issues",
      url: "https://github.com/mattdecrevel/size-charts/issues",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "v1 API",
    },
  ],
  tags: [
    {
      name: "Size Charts",
      description: "Operations related to size charts",
    },
    {
      name: "Categories",
      description: "Category and subcategory hierarchy",
    },
    {
      name: "Labels",
      description: "Size labels for standardized sizing",
    },
    {
      name: "Health",
      description: "System health monitoring",
    },
  ],
  paths: {
    "/size-charts": {
      get: {
        tags: ["Size Charts"],
        summary: "List size charts",
        description: "Get all published size charts. Filter by category, subcategory, or slug.",
        parameters: [
          {
            name: "slug",
            in: "query",
            description: "Filter by chart slug",
            schema: { type: "string" },
            example: "mens-tops",
          },
          {
            name: "category",
            in: "query",
            description: "Filter by category slug",
            schema: { type: "string" },
            example: "mens",
          },
          {
            name: "subcategory",
            in: "query",
            description: "Filter by subcategory slug",
            schema: { type: "string" },
            example: "tops",
          },
        ],
        responses: {
          "200": {
            description: "List of size charts",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/SizeChart" },
                },
              },
            },
          },
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List categories",
        description: "Get all categories with their subcategories and chart counts.",
        responses: {
          "200": {
            description: "Category tree",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Category" },
                },
              },
            },
          },
        },
      },
    },
    "/labels": {
      get: {
        tags: ["Labels"],
        summary: "List labels",
        description: "Get all size labels, optionally filtered by type.",
        parameters: [
          {
            name: "type",
            in: "query",
            description: "Filter by label type",
            schema: {
              type: "string",
              enum: [
                "ALPHA_SIZE",
                "NUMERIC_SIZE",
                "YOUTH_SIZE",
                "TODDLER_SIZE",
                "INFANT_SIZE",
                "BAND_SIZE",
                "CUP_SIZE",
                "SHOE_SIZE_US",
                "SHOE_SIZE_EU",
                "SHOE_SIZE_UK",
                "REGIONAL",
                "CUSTOM",
              ],
            },
          },
        ],
        responses: {
          "200": {
            description: "Labels grouped by type",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LabelsResponse" },
              },
            },
          },
        },
      },
    },
    "/../health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Check API and database health status.",
        responses: {
          "200": {
            description: "System is healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
          "503": {
            description: "System is unhealthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      SizeChart: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx1234567890" },
          name: { type: "string", example: "Men's Tops" },
          slug: { type: "string", example: "mens-tops" },
          description: { type: "string", nullable: true },
          columns: {
            type: "array",
            items: { $ref: "#/components/schemas/Column" },
          },
          rows: {
            type: "array",
            items: { $ref: "#/components/schemas/Row" },
          },
          subcategory: { $ref: "#/components/schemas/SubcategoryBrief" },
        },
      },
      Column: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", example: "Chest" },
          type: {
            type: "string",
            enum: ["MEASUREMENT", "SIZE_LABEL", "REGIONAL_SIZE", "BAND_SIZE", "CUP_SIZE", "SHOE_SIZE", "TEXT"],
          },
          labelType: {
            type: "string",
            nullable: true,
            enum: ["ALPHA_SIZE", "NUMERIC_SIZE", "YOUTH_SIZE", "BAND_SIZE", "CUP_SIZE"],
          },
        },
      },
      Row: {
        type: "object",
        properties: {
          id: { type: "string" },
          cells: {
            type: "array",
            items: { $ref: "#/components/schemas/Cell" },
          },
        },
      },
      Cell: {
        type: "object",
        description: "Cell value varies by column type",
        properties: {
          type: {
            type: "string",
            enum: ["label", "measurement", "range", "text"],
          },
          key: { type: "string", description: "Label key for translation", example: "SIZE_SM" },
          value: { type: "string", description: "Display value", example: "SM" },
          inches: {
            oneOf: [
              { type: "number" },
              {
                type: "object",
                properties: {
                  min: { type: "number" },
                  max: { type: "number" },
                },
              },
            ],
          },
          cm: {
            oneOf: [
              { type: "number" },
              {
                type: "object",
                properties: {
                  min: { type: "number" },
                  max: { type: "number" },
                },
              },
            ],
          },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", example: "Men's" },
          slug: { type: "string", example: "mens" },
          subcategories: {
            type: "array",
            items: { $ref: "#/components/schemas/Subcategory" },
          },
        },
      },
      Subcategory: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", example: "Tops" },
          slug: { type: "string", example: "tops" },
          _count: {
            type: "object",
            properties: {
              sizeCharts: { type: "integer", example: 3 },
            },
          },
        },
      },
      SubcategoryBrief: {
        type: "object",
        properties: {
          name: { type: "string", example: "Tops" },
          slug: { type: "string", example: "tops" },
          category: {
            type: "object",
            properties: {
              name: { type: "string", example: "Men's" },
              slug: { type: "string", example: "mens" },
            },
          },
        },
      },
      LabelsResponse: {
        type: "object",
        properties: {
          labels: {
            type: "array",
            items: { $ref: "#/components/schemas/Label" },
          },
          byType: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { $ref: "#/components/schemas/Label" },
            },
          },
        },
      },
      Label: {
        type: "object",
        properties: {
          id: { type: "string" },
          key: { type: "string", example: "SIZE_SM" },
          displayValue: { type: "string", example: "SM" },
          labelType: { type: "string", example: "ALPHA_SIZE" },
          sortOrder: { type: "integer", example: 2 },
          description: { type: "string", nullable: true },
        },
      },
      HealthResponse: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["healthy", "unhealthy", "degraded"],
          },
          timestamp: { type: "string", format: "date-time" },
          version: { type: "string", example: "0.4.0" },
          uptime: { type: "integer", description: "Uptime in seconds" },
          checks: {
            type: "object",
            properties: {
              database: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["healthy", "unhealthy"] },
                  latency: { type: "integer", description: "Latency in ms" },
                  error: { type: "string", nullable: true },
                },
              },
            },
          },
        },
      },
    },
  },
};
