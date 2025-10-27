import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (replaces Prisma User model)
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    emailVerified: v.optional(v.number()),
    image: v.optional(v.string()),
    password: v.string(),
    role: v.union(
      v.literal("ADMIN"),
      v.literal("MANAGER"),
      v.literal("CUTTER"),
      v.literal("STITCHER"),
      v.literal("PRESSER"),
      v.literal("DELIVERY")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Customers table
  customers: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_customerNumber", ["customerNumber"])
    .index("by_lastName", ["lastName"]),

  // Orders table
  orders: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()),
    createdByEmployeeId: v.optional(v.id("employees")),
  })
    .index("by_customer", ["customerId"])
    .index("by_orderNumber", ["orderNumber"])
    .index("by_status", ["status"])
    .index("by_deliveryDate", ["deliveryDate"])
    .index("by_orderDate", ["orderDate"])
    .index("by_orderType", ["orderType"]),

  // Measurements table
  measurements: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_customer", ["customerId"])
    .index("by_garmentType", ["garmentType"])
    .index("by_customer_garment_latest", ["customerId", "garmentType", "isLatest"]),

  // Fabrics table
  fabrics: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_isActive", ["isActive"]),

  // Employees table
  employees: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_employeeNumber", ["employeeNumber"])
    .index("by_lastName", ["lastName"])
    .index("by_role", ["role"])
    .index("by_isActive", ["isActive"]),

  // Tasks table
  tasks: defineTable({
    orderId: v.id("orders"),
    stage: v.union(
      v.literal("RECEIVED"),
      v.literal("CUTTING"),
      v.literal("STITCHING"),
      v.literal("QUALITY_CHECK"),
      v.literal("PRESSING"),
      v.literal("READY"),
      v.literal("DELIVERED"),
      v.literal("CANCELLED")
    ),
    assignedEmployeeId: v.optional(v.id("employees")),
    deadline: v.optional(v.number()),
    priority: v.union(
      v.literal("LOW"),
      v.literal("NORMAL"),
      v.literal("HIGH"),
      v.literal("URGENT")
    ),
    status: v.union(
      v.literal("PENDING"),
      v.literal("IN_PROGRESS"),
      v.literal("COMPLETED"),
      v.literal("OVERDUE")
    ),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    assignedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_order", ["orderId"])
    .index("by_assignedEmployee", ["assignedEmployeeId"])
    .index("by_stage", ["stage"])
    .index("by_status", ["status"])
    .index("by_deadline", ["deadline"])
    .index("by_priority", ["priority"]),

  // Events table for real-time updates
  events: defineTable({
    type: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    data: v.any(),
    timestamp: v.number(),
    userId: v.optional(v.id("users")),
  })
    .index("by_type", ["type"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_timestamp", ["timestamp"]),

  // System health monitoring
  systemHealth: defineTable({
    component: v.string(),
    status: v.union(v.literal("healthy"), v.literal("warning"), v.literal("error")),
    lastCheck: v.number(),
    responseTime: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_component", ["component"])
    .index("by_status", ["status"])
    .index("by_lastCheck", ["lastCheck"]),
});
