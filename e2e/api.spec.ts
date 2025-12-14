import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  test.describe("Templates API", () => {
    test("GET /api/templates should return templates list", async ({ request }) => {
      const response = await request.get("/api/templates");
      expect(response.ok()).toBe(true);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Verify template structure
      const template = data[0];
      expect(template).toHaveProperty("id");
      expect(template).toHaveProperty("name");
      expect(template).toHaveProperty("category");
    });

    test("GET /api/templates/:id should return a specific template", async ({ request }) => {
      const response = await request.get("/api/templates/mens-tops");
      expect(response.ok()).toBe(true);

      const template = await response.json();
      expect(template.id).toBe("mens-tops");
      expect(template.name).toBeDefined();
      expect(template.columns).toBeDefined();
      expect(template.rows).toBeDefined();
    });

    test("GET /api/templates/:id should return 404 for non-existent template", async ({ request }) => {
      const response = await request.get("/api/templates/non-existent-template");
      expect(response.status()).toBe(404);
    });
  });

  test.describe("Health API", () => {
    test("GET /api/health should return health status", async ({ request }) => {
      const response = await request.get("/api/health");
      expect(response.ok()).toBe(true);

      const data = await response.json();
      expect(data).toHaveProperty("status");
    });
  });

  test.describe("Size Charts API", () => {
    test("GET /api/size-charts should return size charts", async ({ request }) => {
      const response = await request.get("/api/size-charts");
      expect(response.ok()).toBe(true);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test("GET /api/size-charts/public should return public charts", async ({ request }) => {
      const response = await request.get("/api/size-charts/public");
      expect(response.ok()).toBe(true);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  test.describe("Categories API", () => {
    test("GET /api/categories should return categories", async ({ request }) => {
      const response = await request.get("/api/categories");
      expect(response.ok()).toBe(true);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  test.describe("Labels API", () => {
    test("GET /api/labels should return labels", async ({ request }) => {
      const response = await request.get("/api/labels");
      expect(response.ok()).toBe(true);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test("GET /api/label-types should return label types", async ({ request }) => {
      const response = await request.get("/api/label-types");
      expect(response.ok()).toBe(true);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
