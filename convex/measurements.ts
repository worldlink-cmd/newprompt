import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new measurement
export const createMeasurement = mutation({
  args: {
    customerId: v.id("customers"),
    garmentType: v.union(
      v.literal("SHIRT"),
      v.literal("SUIT"),
      v.literal("DRESS"),
      v.literal("TROUSER")
    ),
    unit: v.union(v.literal("CM"), v.literal("INCH")),
    measurements: v.any(),
    notes: v.optional(v.string()),
    version: v.number(),
    isLatest: v.boolean(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("measurements", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all measurements
export const getMeasurements = query({
  handler: async (ctx) => {
    return await ctx.db.query("measurements").collect();
  },
});

// Get measurement by ID
export const getMeasurementById = query({
  args: { id: v.id("measurements") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get measurements by customer
export const getMeasurementsByCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("measurements")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();
  },
});

// Update measurement
export const updateMeasurement = mutation({
  args: {
    id: v.id("measurements"),
    customerId: v.optional(v.id("customers")),
    garmentType: v.optional(v.union(
      v.literal("SHIRT"),
      v.literal("SUIT"),
      v.literal("DRESS"),
      v.literal("TROUSER")
    )),
    unit: v.optional(v.union(v.literal("CM"), v.literal("INCH"))),
    measurements: v.optional(v.any()),
    notes: v.optional(v.string()),
    version: v.optional(v.number()),
    isLatest: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete measurement
export const deleteMeasurement = mutation({
  args: { id: v.id("measurements") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      isLatest: false,
      updatedAt: Date.now(),
    });
  },
});
