import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new order
export const createOrder = mutation({
  args: {
    orderNumber: v.string(),
    customerId: v.id("customers"),
    measurementId: v.optional(v.id("measurements")),
    fabricId: v.optional(v.id("fabrics")),
    garmentType: v.union(
      v.literal("SHIRT"),
      v.literal("SUIT"),
      v.literal("DRESS"),
      v.literal("TROUSER")
    ),
    orderType: v.union(
      v.literal("BESPOKE_SUIT"),
      v.literal("DRESS_ALTERATION"),
      v.literal("ONE_PIECE"),
      v.literal("SUIT_ALTERATION"),
      v.literal("CUSTOM_DESIGN"),
      v.literal("REPAIR")
    ),
    serviceDescription: v.string(),
    specialInstructions: v.optional(v.string()),
    orderDate: v.number(),
    deliveryDate: v.number(),
    status: v.union(
      v.literal("RECEIVED"),
      v.literal("CUTTING"),
      v.literal("STITCHING"),
      v.literal("QUALITY_CHECK"),
      v.literal("PRESSING"),
      v.literal("READY"),
      v.literal("DELIVERED"),
      v.literal("CANCELLED")
    ),
    priority: v.union(
      v.literal("LOW"),
      v.literal("NORMAL"),
      v.literal("HIGH"),
      v.literal("URGENT")
    ),
    totalAmount: v.optional(v.number()),
    depositAmount: v.optional(v.number()),
    balanceAmount: v.optional(v.number()),
    isUrgent: v.boolean(),
    pieces: v.optional(v.any()),
    originalMeasurements: v.optional(v.any()),
    modifiedMeasurements: v.optional(v.any()),
    alterationNotes: v.optional(v.string()),
    alterationHistory: v.optional(v.any()),
    createdBy: v.optional(v.string()),
    createdByEmployeeId: v.optional(v.id("employees")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("orders", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all orders
export const getOrders = query({
  handler: async (ctx) => {
    return await ctx.db.query("orders").collect();
  },
});

// Get order by ID
export const getOrderById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update order
export const updateOrder = mutation({
  args: {
    id: v.id("orders"),
    orderNumber: v.optional(v.string()),
    customerId: v.optional(v.id("customers")),
    measurementId: v.optional(v.id("measurements")),
    fabricId: v.optional(v.id("fabrics")),
    garmentType: v.optional(v.union(
      v.literal("SHIRT"),
      v.literal("SUIT"),
      v.literal("DRESS"),
      v.literal("TROUSER")
    )),
    orderType: v.optional(v.union(
      v.literal("BESPOKE_SUIT"),
      v.literal("DRESS_ALTERATION"),
      v.literal("ONE_PIECE"),
      v.literal("SUIT_ALTERATION"),
      v.literal("CUSTOM_DESIGN"),
      v.literal("REPAIR")
    )),
    serviceDescription: v.optional(v.string()),
    specialInstructions: v.optional(v.string()),
    orderDate: v.optional(v.number()),
    deliveryDate: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("RECEIVED"),
      v.literal("CUTTING"),
      v.literal("STITCHING"),
      v.literal("QUALITY_CHECK"),
      v.literal("PRESSING"),
      v.literal("READY"),
      v.literal("DELIVERED"),
      v.literal("CANCELLED")
    )),
    priority: v.optional(v.union(
      v.literal("LOW"),
      v.literal("NORMAL"),
      v.literal("HIGH"),
      v.literal("URGENT")
    )),
    totalAmount: v.optional(v.number()),
    depositAmount: v.optional(v.number()),
    balanceAmount: v.optional(v.number()),
    isUrgent: v.optional(v.boolean()),
    pieces: v.optional(v.any()),
    originalMeasurements: v.optional(v.any()),
    modifiedMeasurements: v.optional(v.any()),
    alterationNotes: v.optional(v.string()),
    alterationHistory: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete order
export const deleteOrder = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: "CANCELLED",
      updatedAt: Date.now(),
    });
  },
});
