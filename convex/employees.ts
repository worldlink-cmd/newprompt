import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new employee
export const createEmployee = mutation({
  args: {
    employeeNumber: v.string(),
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
    hireDate: v.number(),
    role: v.union(
      v.literal("ADMIN"),
      v.literal("MANAGER"),
      v.literal("CUTTER"),
      v.literal("STITCHER"),
      v.literal("PRESSER"),
      v.literal("DELIVERY")
    ),
    salary: v.optional(v.number()),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("employees", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all employees
export const getEmployees = query({
  handler: async (ctx) => {
    return await ctx.db.query("employees").collect();
  },
});

// Get employee by ID
export const getEmployeeById = query({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update employee
export const updateEmployee = mutation({
  args: {
    id: v.id("employees"),
    employeeNumber: v.optional(v.string()),
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
    hireDate: v.optional(v.number()),
    role: v.optional(v.union(
      v.literal("ADMIN"),
      v.literal("MANAGER"),
      v.literal("CUTTER"),
      v.literal("STITCHER"),
      v.literal("PRESSER"),
      v.literal("DELIVERY")
    )),
    salary: v.optional(v.number()),
    notes: v.optional(v.string()),
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

// Delete employee
export const deleteEmployee = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});
