import { describe, it, expect, beforeEach } from "vitest";
import {
  getAllTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByTags,
  searchTemplates,
  getTemplateCategoryCounts,
  getAllTemplateTags,
  clearTemplateCache,
} from "@/prisma/templates";

describe("Template Registry", () => {
  beforeEach(() => {
    clearTemplateCache();
  });

  describe("getAllTemplates", () => {
    it("should return all templates", () => {
      const templates = getAllTemplates();
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it("should cache templates on subsequent calls", () => {
      const templates1 = getAllTemplates();
      const templates2 = getAllTemplates();
      expect(templates1).toBe(templates2);
    });

    it("should return templates with required properties", () => {
      const templates = getAllTemplates();
      for (const template of templates) {
        expect(template).toHaveProperty("id");
        expect(template).toHaveProperty("name");
        expect(template).toHaveProperty("description");
        expect(template).toHaveProperty("category");
        expect(template).toHaveProperty("tags");
        expect(template).toHaveProperty("columns");
        expect(template).toHaveProperty("rows");
      }
    });
  });

  describe("getTemplateById", () => {
    it("should return a template when found", () => {
      const template = getTemplateById("mens-tops");
      expect(template).not.toBeNull();
      expect(template?.id).toBe("mens-tops");
    });

    it("should return null for non-existent template", () => {
      const template = getTemplateById("non-existent-template");
      expect(template).toBeNull();
    });
  });

  describe("getTemplatesByCategory", () => {
    it("should return templates for apparel category", () => {
      const templates = getTemplatesByCategory("apparel");
      expect(templates.length).toBeGreaterThan(0);
      for (const template of templates) {
        expect(template.category).toBe("apparel");
      }
    });

    it("should return templates for youth category", () => {
      const templates = getTemplatesByCategory("youth");
      expect(templates.length).toBeGreaterThan(0);
      for (const template of templates) {
        expect(template.category).toBe("youth");
      }
    });

    it("should return templates for footwear category", () => {
      const templates = getTemplatesByCategory("footwear");
      expect(templates.length).toBeGreaterThan(0);
      for (const template of templates) {
        expect(template.category).toBe("footwear");
      }
    });

    it("should return templates for accessories category", () => {
      const templates = getTemplatesByCategory("accessories");
      expect(templates.length).toBeGreaterThan(0);
      for (const template of templates) {
        expect(template.category).toBe("accessories");
      }
    });
  });

  describe("getTemplatesByTags", () => {
    it("should return templates matching a tag", () => {
      const templates = getTemplatesByTags(["mens"]);
      expect(templates.length).toBeGreaterThan(0);
      for (const template of templates) {
        expect(template.tags).toContain("mens");
      }
    });

    it("should return templates matching multiple tags", () => {
      const templates = getTemplatesByTags(["womens", "tops"]);
      expect(templates.length).toBeGreaterThan(0);
      for (const template of templates) {
        const hasMatchingTag = template.tags.some((tag) =>
          ["womens", "tops"].includes(tag)
        );
        expect(hasMatchingTag).toBe(true);
      }
    });

    it("should return empty array for non-existent tags", () => {
      const templates = getTemplatesByTags(["nonexistent-tag-xyz"]);
      expect(templates).toHaveLength(0);
    });
  });

  describe("searchTemplates", () => {
    it("should find templates by name", () => {
      const templates = searchTemplates("Men's Tops");
      expect(templates.length).toBeGreaterThan(0);
    });

    it("should be case-insensitive", () => {
      const templates1 = searchTemplates("MENS");
      const templates2 = searchTemplates("mens");
      expect(templates1.length).toBe(templates2.length);
    });

    it("should search in description", () => {
      const templates = searchTemplates("shirt");
      expect(templates.length).toBeGreaterThan(0);
    });

    it("should return empty array for no matches", () => {
      const templates = searchTemplates("xyznonexistentquery123");
      expect(templates).toHaveLength(0);
    });
  });

  describe("getTemplateCategoryCounts", () => {
    it("should return counts for all categories", () => {
      const counts = getTemplateCategoryCounts();
      expect(counts).toHaveProperty("apparel");
      expect(counts).toHaveProperty("youth");
      expect(counts).toHaveProperty("footwear");
      expect(counts).toHaveProperty("accessories");
    });

    it("should have positive counts for populated categories", () => {
      const counts = getTemplateCategoryCounts();
      expect(counts.apparel).toBeGreaterThan(0);
      expect(counts.youth).toBeGreaterThan(0);
      expect(counts.footwear).toBeGreaterThan(0);
      expect(counts.accessories).toBeGreaterThan(0);
    });

    it("should match total template count", () => {
      const counts = getTemplateCategoryCounts();
      const total =
        counts.apparel + counts.youth + counts.footwear + counts.accessories;
      const templates = getAllTemplates();
      expect(total).toBe(templates.length);
    });
  });

  describe("getAllTemplateTags", () => {
    it("should return an array of tags", () => {
      const tags = getAllTemplateTags();
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
    });

    it("should return sorted tags", () => {
      const tags = getAllTemplateTags();
      const sortedTags = [...tags].sort();
      expect(tags).toEqual(sortedTags);
    });

    it("should not contain duplicates", () => {
      const tags = getAllTemplateTags();
      const uniqueTags = [...new Set(tags)];
      expect(tags.length).toBe(uniqueTags.length);
    });
  });

  describe("clearTemplateCache", () => {
    it("should clear the cache and reload templates", () => {
      const templates1 = getAllTemplates();
      clearTemplateCache();
      const templates2 = getAllTemplates();
      // After clearing cache, should get a new array (not same reference)
      expect(templates1).not.toBe(templates2);
      // But content should be the same
      expect(templates1.length).toBe(templates2.length);
    });
  });
});
