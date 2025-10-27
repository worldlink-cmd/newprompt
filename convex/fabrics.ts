import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new fabric
export const createFabric = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("COTTON"),
      v.literal("WOOL"),
      v.literal("SILK"),
      v.literal("LINEN"),
      v.literal("SYNTHETIC"),
      v.literal("BLEND")
    ),
    color: v.optional(v.string()),
    pattern: v.optional(v.string()),
    material: v.optional(v.string()),
    pricePerMeter: v.optional(v.number()),
    stockQuantity: v.number(),
    lowStockThreshold: v.number(),
    minOrderQuantity: v.number(),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("fabrics", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all fabrics
export const getFabrics = query({
  handler: async (ctx) => {
    return await ctx.db.query("fabrics").collect();
  },
});

// Get fabric by ID
export const getFabricById = query({
  args: { id: v.id("fabrics") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update fabric
export const updateFabric = mutation({
  args: {
    id: v.id("fabrics"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("COTTON"),
      v.literal("WOOL"),
      v.literal("SILK"),
      v.literal("LINEN"),
      v.literal("SYNTHETIC"),
      v.literal("BLEND")
    )),
    color: v.optional(v.string()),
    pattern: v.optional(v.string()),
    material: v.optional(v.string()),
    pricePerMeter: v.optional(v.number()),
    stockQuantity: v.optional(v.number()),
    lowStockThreshold: v.optional(v.number()),
    minOrderQuantity: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete fabric
export const deleteFabric = mutation({
  args: { id: v.id("fabrics") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});
