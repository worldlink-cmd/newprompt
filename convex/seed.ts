import { action } from "./_generated/server";
import { api } from "./_generated/api";
import bcrypt from "bcryptjs";

// Seed the database with initial data
export const seedDatabase = action({
  handler: async (ctx) => {
    // Check if admin user already exists
    const existingAdmin = await ctx.runQuery(api.users.getUserByEmail, {
      email: "admin@tailoring.local"
    });

    if (existingAdmin) {
      return { message: "Database already seeded" };
    }

    // Hash password for admin
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const now = Date.now();

    // Create admin user
    const adminId = await ctx.runMutation(api.users.createUser, {
      name: "Admin User",
      email: "admin@tailoring.local",
      password: hashedPassword,
      role: "ADMIN",
    });

    // Create sample users for each role
    const sampleUsers = [
      { name: "Manager One", email: "manager@tailoring.local", role: "MANAGER" as const },
      { name: "Cutter One", email: "cutter@tailoring.local", role: "CUTTER" as const },
      { name: "Stitcher One", email: "stitcher@tailoring.local", role: "STITCHER" as const },
      { name: "Presser One", email: "presser@tailoring.local", role: "PRESSER" as const },
      { name: "Delivery One", email: "delivery@tailoring.local", role: "DELIVERY" as const },
    ];

    const userIds: string[] = [];
    for (const userData of sampleUsers) {
      const hashedPass = await bcrypt.hash("password123", 10);
      const userId = await ctx.runMutation(api.users.createUser, {
        name: userData.name,
        email: userData.email,
        password: hashedPass,
        role: userData.role,
      });
      userIds.push(userId);
    }

    // Create sample customers
    const sampleCustomers = [
      {
        firstName: "Ahmed",
        lastName: "Al-Rashid",
        email: "ahmed.alrashid@email.com",
        phone: "+971501234567",
        address: "123 Al Wasl Road",
        city: "Dubai",
        country: "UAE",
        gender: "MALE" as const,
        preferredContactMethod: "WHATSAPP" as const,
        loyaltyPoints: 0,
        isActive: true,
        createdBy: adminId,
      },
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@email.com",
        phone: "+971503456789",
        address: "456 Jumeirah Beach Road",
        city: "Dubai",
        country: "UAE",
        gender: "FEMALE" as const,
        preferredContactMethod: "EMAIL" as const,
        loyaltyPoints: 0,
        isActive: true,
        createdBy: adminId,
      },
    ];

    const customerIds: string[] = [];
    for (const customerData of sampleCustomers) {
      const customerId = await ctx.runMutation(api.customers.createCustomer, {
        customerNumber: `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
        ...customerData,
      });
      customerIds.push(customerId);
    }

    // Create sample fabrics
    const fabrics = [
      { name: "Premium Cotton", category: "COTTON" as const, stockQuantity: 100, lowStockThreshold: 10, minOrderQuantity: 5 },
      { name: "Wool Blend", category: "WOOL" as const, stockQuantity: 50, lowStockThreshold: 5, minOrderQuantity: 3 },
      { name: "Silk Fabric", category: "SILK" as const, stockQuantity: 25, lowStockThreshold: 3, minOrderQuantity: 2 },
    ];

    const fabricIds: string[] = [];
    for (const fabricData of fabrics) {
      const fabricId = await ctx.runMutation(api.fabrics.createFabric, {
        ...fabricData,
        description: `${fabricData.name} for high-quality tailoring`,
        isActive: true,
        createdBy: adminId,
      });
      fabricIds.push(fabricId);
    }

    // Create sample orders
    if (customerIds.length > 0 && fabricIds.length > 0) {
      await ctx.runMutation(api.orders.createOrder, {
        orderNumber: `ORD-${Date.now()}-001`,
        customerId: customerIds[0],
        fabricId: fabricIds[0],
        garmentType: "SHIRT",
        orderType: "BESPOKE_SUIT",
        serviceDescription: "Custom tailored business shirt",
        orderDate: now,
        deliveryDate: now + (7 * 24 * 60 * 60 * 1000), // 7 days later
        status: "RECEIVED",
        priority: "NORMAL",
        totalAmount: 450,
        depositAmount: 225,
        balanceAmount: 225,
        isUrgent: false,
        createdBy: adminId,
      });
    }

    return {
      message: "Database seeded successfully",
      adminUser: "admin@tailoring.local / admin123",
      sampleUsers: sampleUsers.map(u => `${u.email} / password123`),
      customersCreated: customerIds.length,
      fabricsCreated: fabricIds.length,
    };
  },
});
