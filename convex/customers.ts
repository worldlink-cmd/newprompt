import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import bcrypt from "bcryptjs";

// Create a new customer
export const createCustomer = mutation({
  args: {
    customerNumber: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    alternatePhone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    gender: v.optional(v.union(
      v.literal("MALE"),
      v.literal("FEMALE"),
      v.literal("OTHER")
    )),
    notes: v.optional(v.string()),
    preferredContactMethod: v.optional(v.union(
      v.literal("EMAIL"),
      v.literal("PHONE"),
      v.literal("WHATSAPP"),
      v.literal("SMS")
    )),
    loyaltyPoints: v.number(),
    isActive: v.boolean(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("customers", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all customers with filtering
export const getCustomers = query({
  args: {
    search: v.optional(v.string()),
    gender: v.optional(v.union(
      v.literal("MALE"),
      v.literal("FEMALE"),
      v.literal("OTHER")
    )),
    preferredContactMethod: v.optional(v.union(
      v.literal("EMAIL"),
      v.literal("PHONE"),
      v.literal("WHATSAPP"),
      v.literal("SMS")
    )),
    isActive: v.optional(v.boolean()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const {
      search,
      gender,
      preferredContactMethod,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = args;

    let query = ctx.db.query("customers");

    if (search) {
      query = query.filter((q) =>
        q.or(
          q.eq(q.field("firstName"), search),
          q.eq(q.field("lastName"), search),
          q.eq(q.field("email"), search),
          q.eq(q.field("phone"), search),
          q.eq(q.field("customerNumber"), search)
        )
      );
    }

    if (gender) {
      query = query.filter((q) => q.eq(q.field("gender"), gender));
    }

    if (preferredContactMethod) {
      query = query.filter((q) => q.eq(q.field("preferredContactMethod"), preferredContactMethod));
    }

    if (isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), isActive));
    }

    const customers = await query
      .order(sortOrder as "asc" | "desc")
      .collect();

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedCustomers = customers.slice(start, end);

    return {
      customers: paginatedCustomers,
      total: customers.length,
      page,
      limit,
      totalPages: Math.ceil(customers.length / limit),
    };
  },
});

// Get customer by ID
export const getCustomerById = query({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update customer
export const updateCustomer = mutation({
  args: {
    id: v.id("customers"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    alternatePhone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    gender: v.optional(v.union(
      v.literal("MALE"),
      v.literal("FEMALE"),
      v.literal("OTHER")
    )),
    notes: v.optional(v.string()),
    preferredContactMethod: v.optional(v.union(
      v.literal("EMAIL"),
      v.literal("PHONE"),
      v.literal("WHATSAPP"),
      v.literal("SMS")
    )),
    loyaltyPoints: v.optional(v.number()),
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

// Delete customer (soft delete)
export const deleteCustomer = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});
