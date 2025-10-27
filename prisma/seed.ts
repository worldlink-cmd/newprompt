import { PrismaClient, GarmentType, MeasurementUnit } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@tailoring.local' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists. Skipping seed.');
    return;
  }

  // Hash password for admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@tailoring.local',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create sample users for each role
  const sampleUsers = [
    { name: 'Manager One', email: 'manager@tailoring.local', role: 'MANAGER' },
    { name: 'Cutter One', email: 'cutter@tailoring.local', role: 'CUTTER' },
    { name: 'Stitcher One', email: 'stitcher@tailoring.local', role: 'STITCHER' },
    { name: 'Presser One', email: 'presser@tailoring.local', role: 'PRESSER' },
    { name: 'Delivery One', email: 'delivery@tailoring.local', role: 'DELIVERY' },
  ];

  for (const userData of sampleUsers) {
    const hashedPass = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPass,
      },
    });
    console.log(`Created ${userData.role} user:`, user.email);
  }

  // Create sample customers
  const sampleCustomers = [
    {
      firstName: 'Ahmed',
      lastName: 'Al-Rashid',
      email: 'ahmed.alrashid@email.com',
      phone: '+971501234567',
      alternatePhone: '+971502345678',
      address: '123 Al Wasl Road',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '12345',
      country: 'UAE',
      gender: 'MALE',
      preferredContactMethod: 'WHATSAPP',
      notes: 'Prefers traditional Arabic designs. Regular customer for business suits.',
      isActive: true,
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+971503456789',
      address: '456 Jumeirah Beach Road',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '23456',
      country: 'UAE',
      gender: 'FEMALE',
      preferredContactMethod: 'EMAIL',
      notes: 'Western style preferences. Needs alterations for formal wear.',
      isActive: true,
    },
    {
      firstName: 'Mohammed',
      lastName: 'Al-Zahra',
      phone: '+971504567890',
      address: '789 Sheikh Zayed Road',
      city: 'Abu Dhabi',
      state: 'Abu Dhabi',
      postalCode: '34567',
      country: 'UAE',
      gender: 'MALE',
      preferredContactMethod: 'PHONE',
      notes: 'Prefers modern cuts. Bulk orders for family events.',
      isActive: true,
    },
    {
      firstName: 'Fatima',
      lastName: 'Al-Mansouri',
      email: 'fatima.mansouri@email.com',
      phone: '+971505678901',
      alternatePhone: '+971506789012',
      address: '321 Marina Walk',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '45678',
      country: 'UAE',
      gender: 'FEMALE',
      preferredContactMethod: 'SMS',
      notes: 'High-end fashion client. Requires premium materials.',
      isActive: true,
    },
    {
      firstName: 'David',
      lastName: 'Smith',
      email: 'david.smith@email.com',
      phone: '+971507890123',
      address: '654 Business Bay',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '56789',
      country: 'UAE',
      gender: 'MALE',
      preferredContactMethod: 'EMAIL',
      notes: 'Expat client. Needs measurements updated regularly.',
      isActive: false, // Inactive customer
    },
    {
      firstName: 'Aisha',
      lastName: 'Al-Fahad',
      phone: '+971508901234',
      address: '987 Al Ain Road',
      city: 'Al Ain',
      state: 'Abu Dhabi',
      postalCode: '67890',
      country: 'UAE',
      gender: 'FEMALE',
      preferredContactMethod: 'WHATSAPP',
      notes: 'Traditional dress specialist. Family discount requests.',
      isActive: true,
    },
    {
      firstName: 'Robert',
      lastName: 'Wilson',
      email: 'robert.wilson@email.com',
      phone: '+971509012345',
      address: '147 Ras Al Khaimah Highway',
      city: 'Ras Al Khaimah',
      state: 'Ras Al Khaimah',
      postalCode: '78901',
      country: 'UAE',
      gender: 'MALE',
      preferredContactMethod: 'PHONE',
      notes: 'Construction worker uniforms. Bulk orders monthly.',
      isActive: true,
    },
    {
      firstName: 'Noor',
      lastName: 'Al-Hassan',
      phone: '+971501098765',
      address: '258 Sharjah Corniche',
      city: 'Sharjah',
      state: 'Sharjah',
      postalCode: '89012',
      country: 'UAE',
      gender: 'FEMALE',
      preferredContactMethod: 'SMS',
      notes: 'Wedding dress specialist. Very detail-oriented.',
      isActive: true,
    },
    {
      firstName: 'James',
      lastName: 'Brown',
      email: 'james.brown@email.com',
      phone: '+971502109876',
      address: '369 Ajman Beach',
      city: 'Ajman',
      state: 'Ajman',
      postalCode: '90123',
      country: 'UAE',
      gender: 'MALE',
      preferredContactMethod: 'EMAIL',
      notes: 'Hotel staff uniforms. Seasonal orders.',
      isActive: true,
    },
    {
      firstName: 'Maryam',
      lastName: 'Al-Khaldi',
      phone: '+971503210987',
      address: '741 Umm Al Quwain Marina',
      city: 'Umm Al Quwain',
      state: 'Umm Al Quwain',
      postalCode: '01234',
      country: 'UAE',
      gender: 'FEMALE',
      preferredContactMethod: 'WHATSAPP',
      notes: 'Prefers sustainable materials. Eco-friendly fashion advocate.',
      isActive: true,
    },
  ];

  // Generate customer numbers and create customers
  const createdCustomers = [];
  for (let i = 0; i < sampleCustomers.length; i++) {
    const customerData = sampleCustomers[i];
    const customerNumber = `CUST-20250123-${String(i + 1).padStart(3, '0')}`;

    const customer = await prisma.customer.create({
      data: {
        ...customerData,
        customerNumber,
        createdBy: admin.id,
        dateOfBirth: customerData.gender === 'MALE'
          ? new Date(1985 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
          : new Date(1990 + Math.floor(Math.random() * 25), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      },
    });
    createdCustomers.push(customer);
    console.log(`Created customer: ${customer.firstName} ${customer.lastName} (${customer.customerNumber})`);
  }

  // Create sample measurements for development and testing
  console.log('Creating sample measurements...');

  // SHIRT measurements for 2 customers
  const shirtCustomers = createdCustomers.slice(0, 2); // Ahmed and Sarah
  for (const customer of shirtCustomers) {
    await prisma.measurement.create({
      data: {
        customerId: customer.id,
        garmentType: GarmentType.SHIRT,
        unit: MeasurementUnit.CM,
        measurements: {
          neck: 38 + Math.floor(Math.random() * 4), // 38-41 cm
          chest: 95 + Math.floor(Math.random() * 10), // 95-104 cm
          waist: 85 + Math.floor(Math.random() * 10), // 85-94 cm
          shoulder: 42 + Math.floor(Math.random() * 4), // 42-45 cm
          sleeveLength: 60 + Math.floor(Math.random() * 5), // 60-64 cm
          shirtLength: 75 + Math.floor(Math.random() * 5), // 75-79 cm
          cuff: 22 + Math.floor(Math.random() * 3), // 22-24 cm
        },
        notes: 'Standard shirt measurements',
        version: 1,
        isLatest: true,
        createdBy: admin.id,
      },
    });
    console.log(`Created SHIRT measurement for ${customer.firstName} ${customer.lastName}`);
  }

  // SUIT measurements for 1 customer (Mohammed)
  const suitCustomer = createdCustomers[2];
  await prisma.measurement.create({
    data: {
      customerId: suitCustomer.id,
      garmentType: GarmentType.SUIT,
      unit: MeasurementUnit.CM,
      measurements: {
        chest: 100 + Math.floor(Math.random() * 10), // 100-109 cm
        waist: 90 + Math.floor(Math.random() * 10), // 90-99 cm
        hip: 95 + Math.floor(Math.random() * 10), // 95-104 cm
        shoulder: 45 + Math.floor(Math.random() * 5), // 45-49 cm
        sleeveLength: 62 + Math.floor(Math.random() * 5), // 62-66 cm
        jacketLength: 75 + Math.floor(Math.random() * 5), // 75-79 cm
        waistTrouser: 88 + Math.floor(Math.random() * 8), // 88-95 cm
        hipTrouser: 93 + Math.floor(Math.random() * 8), // 93-100 cm
        inseam: 78 + Math.floor(Math.random() * 5), // 78-82 cm
        outseam: 105 + Math.floor(Math.random() * 5), // 105-109 cm
        thigh: 55 + Math.floor(Math.random() * 5), // 55-59 cm
        knee: 38 + Math.floor(Math.random() * 4), // 38-41 cm
        cuffTrouser: 35 + Math.floor(Math.random() * 5), // 35-39 cm
        rise: 28 + Math.floor(Math.random() * 4), // 28-31 cm
      },
      notes: 'Complete suit measurements for jacket and trouser',
      version: 1,
      isLatest: true,
      createdBy: admin.id,
    },
  });
  console.log(`Created SUIT measurement for ${suitCustomer.firstName} ${suitCustomer.lastName}`);

  // DRESS measurements for 1 customer (Fatima)
  const dressCustomer = createdCustomers[3];
  await prisma.measurement.create({
    data: {
      customerId: dressCustomer.id,
      garmentType: GarmentType.DRESS,
      unit: MeasurementUnit.CM,
      measurements: {
        bust: 88 + Math.floor(Math.random() * 8), // 88-95 cm
        waist: 70 + Math.floor(Math.random() * 8), // 70-77 cm
        hip: 95 + Math.floor(Math.random() * 8), // 95-102 cm
        shoulderToWaist: 38 + Math.floor(Math.random() * 4), // 38-41 cm
        waistToHem: 65 + Math.floor(Math.random() * 5), // 65-69 cm
        dressLength: 105 + Math.floor(Math.random() * 5), // 105-109 cm
        armhole: 40 + Math.floor(Math.random() * 5), // 40-44 cm
      },
      notes: 'Dress measurements',
      version: 1,
      isLatest: true,
      createdBy: admin.id,
    },
  });
  console.log(`Created DRESS measurement for ${dressCustomer.firstName} ${dressCustomer.lastName}`);

  // TROUSER measurements for 1 customer (David)
  const trouserCustomer = createdCustomers[4];
  await prisma.measurement.create({
    data: {
      customerId: trouserCustomer.id,
      garmentType: GarmentType.TROUSER,
      unit: MeasurementUnit.CM,
      measurements: {
        waist: 85 + Math.floor(Math.random() * 8), // 85-92 cm
        hip: 90 + Math.floor(Math.random() * 8), // 90-97 cm
        inseam: 75 + Math.floor(Math.random() * 5), // 75-79 cm
        outseam: 100 + Math.floor(Math.random() * 5), // 100-104 cm
        thigh: 52 + Math.floor(Math.random() * 5), // 52-56 cm
        knee: 36 + Math.floor(Math.random() * 4), // 36-39 cm
        cuff: 32 + Math.floor(Math.random() * 4), // 32-35 cm
        rise: 26 + Math.floor(Math.random() * 4), // 26-29 cm
      },
      notes: 'Trouser measurements',
      version: 1,
      isLatest: true,
      createdBy: admin.id,
    },
  });
  console.log(`Created TROUSER measurement for ${trouserCustomer.firstName} ${trouserCustomer.lastName}`);

  // Create multiple versions for one customer to demonstrate version history (Ahmed's SHIRT)
  const ahmed = createdCustomers[0];
  const latestShirt = await prisma.measurement.findFirst({
    where: { customerId: ahmed.id, garmentType: GarmentType.SHIRT },
    orderBy: { version: 'desc' },
  });

  if (latestShirt) {
    // Set current as not latest
    await prisma.measurement.update({
      where: { id: latestShirt.id },
      data: { isLatest: false },
    });

    // Create version 2
    const version2 = await prisma.measurement.create({
      data: {
        customerId: ahmed.id,
        garmentType: GarmentType.SHIRT,
        unit: MeasurementUnit.CM,
        measurements: {
          neck: 39 + Math.floor(Math.random() * 2), // Slightly different
          chest: 96 + Math.floor(Math.random() * 4),
          waist: 86 + Math.floor(Math.random() * 4),
          shoulder: 43 + Math.floor(Math.random() * 2),
          sleeveLength: 61 + Math.floor(Math.random() * 2),
          shirtLength: 76 + Math.floor(Math.random() * 2),
          cuff: 23 + Math.floor(Math.random() * 1),
        },
        notes: 'Updated shirt measurements - version 2',
        version: 2,
        isLatest: true,
        createdBy: admin.id,
      },
    });

    // Update version 2 to isLatest: false before creating version 3
    await prisma.measurement.update({
      where: { id: version2.id },
      data: { isLatest: false },
    });

    // Create version 3
    await prisma.measurement.create({
      data: {
        customerId: ahmed.id,
        garmentType: GarmentType.SHIRT,
        unit: MeasurementUnit.CM,
        measurements: {
          neck: 40,
          chest: 98,
          waist: 88,
          shoulder: 44,
          sleeveLength: 62,
          shirtLength: 77,
          cuff: 23,
        },
        notes: 'Final shirt measurements - version 3 (current)',
        version: 3,
        isLatest: true,
        createdBy: admin.id,
      },
    });

    console.log(`Created multiple SHIRT versions for ${ahmed.firstName} ${ahmed.lastName} to demonstrate version history`);
  }

  // Create sample orders for development and testing
  console.log('Creating sample orders...');

  // Get measurements for linking to orders
  const ahmedShirtMeasurement = await prisma.measurement.findFirst({
    where: { customerId: ahmed.id, garmentType: GarmentType.SHIRT, isLatest: true },
  });

  const sarahShirtMeasurement = await prisma.measurement.findFirst({
    where: { customerId: createdCustomers[1].id, garmentType: GarmentType.SHIRT, isLatest: true },
  });

  const mohammedSuitMeasurement = await prisma.measurement.findFirst({
    where: { customerId: suitCustomer.id, garmentType: GarmentType.SUIT, isLatest: true },
  });

  const fatimaDressMeasurement = await prisma.measurement.findFirst({
    where: { customerId: dressCustomer.id, garmentType: GarmentType.DRESS, isLatest: true },
  });

  const davidTrouserMeasurement = await prisma.measurement.findFirst({
    where: { customerId: trouserCustomer.id, garmentType: GarmentType.TROUSER, isLatest: true },
  });

  // Create PENDING orders (recent orders with future delivery dates)
  if (ahmedShirtMeasurement) {
    await prisma.order.create({
      data: {
        orderNumber: 'ORD-20250123-001',
        customerId: ahmed.id,
        measurementId: ahmedShirtMeasurement.id,
        garmentType: GarmentType.SHIRT,
        serviceDescription: 'Custom tailored business shirt with French cuffs',
        specialInstructions: 'Premium Egyptian cotton, light blue color, monogram on cuff',
        orderDate: new Date('2025-01-20'),
        deliveryDate: new Date('2025-01-27'), // 7 days later
        status: 'PENDING',
        priority: 'NORMAL',
        totalAmount: 450.00,
        depositAmount: 225.00,
        balanceAmount: 225.00,
        isUrgent: false,
        createdBy: admin.id,
      },
    });
    console.log('Created PENDING SHIRT order for Ahmed');
  }

  if (sarahShirtMeasurement) {
    await prisma.order.create({
      data: {
        orderNumber: 'ORD-20250123-002',
        customerId: createdCustomers[1].id,
        measurementId: sarahShirtMeasurement.id,
        garmentType: GarmentType.SHIRT,
        serviceDescription: 'Women\'s formal blouse alteration',
        specialInstructions: 'Shorten sleeves by 2 inches, adjust waist darts',
        orderDate: new Date('2025-01-21'),
        deliveryDate: new Date('2025-01-26'), // 5 days later
        status: 'PENDING',
        priority: 'HIGH',
        totalAmount: 120.00,
        depositAmount: 60.00,
        balanceAmount: 60.00,
        isUrgent: false,
        createdBy: admin.id,
      },
    });
    console.log('Created PENDING SHIRT alteration order for Sarah');
  }

  // Create IN_PROGRESS orders (orders from 3-5 days ago)
  if (mohammedSuitMeasurement) {
    await prisma.order.create({
      data: {
        orderNumber: 'ORD-20250123-003',
        customerId: mohammedSuitMeasurement.customerId,
        measurementId: mohammedSuitMeasurement.id,
        garmentType: GarmentType.SUIT,
        serviceDescription: 'Three-piece business suit with vest',
        specialInstructions: 'Navy blue wool blend, peak lapels, double-breasted vest',
        orderDate: new Date('2025-01-18'),
        deliveryDate: new Date('2025-01-28'), // 10 days later
        status: 'IN_PROGRESS',
        priority: 'NORMAL',
        totalAmount: 2500.00,
        depositAmount: 1250.00,
        balanceAmount: 1250.00,
        isUrgent: false,
        createdBy: admin.id,
      },
    });
    console.log('Created IN_PROGRESS SUIT order for Mohammed');
  }

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-20250123-004',
      customerId: createdCustomers[5].id, // Aisha
      garmentType: GarmentType.DRESS,
      serviceDescription: 'Traditional Arabic dress for wedding',
      specialInstructions: 'Gold embroidery, floor length, matching hijab',
      orderDate: new Date('2025-01-16'),
      deliveryDate: new Date('2025-01-23'), // 7 days later
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      totalAmount: 800.00,
      depositAmount: 400.00,
      balanceAmount: 400.00,
      isUrgent: false,
      createdBy: admin.id,
    });
    console.log('Created IN_PROGRESS DRESS order for Aisha');
  }

  // Create COMPLETED orders (orders from 2-3 weeks ago with past delivery dates)
  if (fatimaDressMeasurement) {
    await prisma.order.create({
      data: {
        orderNumber: 'ORD-20250123-005',
        customerId: fatimaDressMeasurement.customerId,
        measurementId: fatimaDressMeasurement.id,
        garmentType: GarmentType.DRESS,
        serviceDescription: 'Evening gown for gala event',
        specialInstructions: 'Black silk, mermaid style, crystal embellishments',
        orderDate: new Date('2025-01-05'),
        deliveryDate: new Date('2025-01-12'), // Past date
        status: 'COMPLETED',
        priority: 'HIGH',
        totalAmount: 1500.00,
        depositAmount: 1500.00, // Fully paid
        balanceAmount: 0.00,
        isUrgent: false,
        createdBy: admin.id,
      },
    });
    console.log('Created COMPLETED DRESS order for Fatima');
  }

  if (davidTrouserMeasurement) {
    await prisma.order.create({
      data: {
        orderNumber: 'ORD-20250123-006',
        customerId: davidTrouserMeasurement.customerId,
        measurementId: davidTrouserMeasurement.id,
        garmentType: GarmentType.TROUSER,
        serviceDescription: 'Chino pants alteration and repair',
        specialInstructions: 'Hem to ankle length, repair pocket, add belt loops',
        orderDate: new Date('2025-01-03'),
        deliveryDate: new Date('2025-01-08'), // Past date
        status: 'COMPLETED',
        priority: 'LOW',
        totalAmount: 75.00,
        depositAmount: 75.00, // Fully paid
        balanceAmount: 0.00,
        isUrgent: false,
        createdBy: admin.id,
      },
    });
    console.log('Created COMPLETED TROUSER alteration order for David');
  }

  // Create URGENT order (high priority, short lead time)
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-20250123-007',
      customerId: createdCustomers[6].id, // Robert
      garmentType: GarmentType.SHIRT,
      serviceDescription: 'Urgent shirt repair for business meeting',
      specialInstructions: 'Replace missing button, reinforce seams, same-day service',
      orderDate: new Date('2025-01-23'), // Today
      deliveryDate: new Date('2025-01-25'), // 2 days later (urgent)
      status: 'PENDING',
      priority: 'URGENT',
      totalAmount: 50.00,
      depositAmount: 50.00, // Fully paid upfront for urgent
      balanceAmount: 0.00,
      isUrgent: true,
      createdBy: admin.id,
    },
  });
  console.log('Created URGENT SHIRT repair order for Robert');

  // Create CANCELLED order (demonstrates cancellation workflow)
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-20250123-008',
      customerId: createdCustomers[7].id, // Noor
      garmentType: GarmentType.DRESS,
      serviceDescription: 'Wedding dress fitting and alterations',
      specialInstructions: 'Multiple fittings required, lace overlay, train adjustment',
      orderDate: new Date('2025-01-10'),
      deliveryDate: new Date('2025-01-20'),
      status: 'CANCELLED', // Soft deleted by setting status to cancelled
      priority: 'HIGH',
      totalAmount: 1200.00,
      depositAmount: 600.00,
      balanceAmount: 600.00,
      isUrgent: false,
      createdBy: admin.id,
    },
  });
  console.log('Created CANCELLED DRESS order for Noor (demonstrates cancellation workflow)');

  // Create order without measurement (customer creates order without existing measurements)
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-20250123-009',
      customerId: createdCustomers[8].id, // James
      garmentType: GarmentType.SUIT,
      serviceDescription: 'Hotel staff uniform suit',
      specialInstructions: 'Navy blue, standard fit, bulk order for 10 staff members',
      orderDate: new Date('2025-01-15'),
      deliveryDate: new Date('2025-01-25'), // 10 days later
      status: 'IN_PROGRESS',
      priority: 'NORMAL',
      totalAmount: 3500.00, // Bulk order
      depositAmount: 1750.00,
      balanceAmount: 1750.00,
      isUrgent: false,
      createdBy: admin.id,
    },
  });
  console.log('Created SUIT order without measurement for James (bulk hotel staff uniforms)');

  // Create order with partial payment (demonstrates payment tracking)
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-20250123-010',
      customerId: createdCustomers[9].id, // Maryam
      garmentType: GarmentType.DRESS,
      serviceDescription: 'Sustainable fashion dress with organic materials',
      specialInstructions: 'Organic cotton, natural dyes, eco-friendly packaging',
      orderDate: new Date('2025-01-19'),
      deliveryDate: new Date('2025-01-26'), // 7 days later
      status: 'PENDING',
      priority: 'NORMAL',
      totalAmount: 600.00,
      depositAmount: 200.00, // Partial payment
      balanceAmount: 400.00,
      isUrgent: false,
      createdBy: admin.id,
    },
  });
  console.log('Created DRESS order with partial payment for Maryam (sustainable fashion)');

  console.log('Created 10 diverse sample orders for development and testing:');
  console.log('- 3 PENDING orders with future delivery dates');
  console.log('- 2 IN_PROGRESS orders from recent dates');
  console.log('- 2 COMPLETED orders with past delivery dates');
  console.log('- 1 URGENT order with short lead time');
  console.log('- 1 CANCELLED order demonstrating cancellation workflow');
  console.log('- 1 order without measurement (bulk order scenario)');
  console.log('- Mix of garment types: SHIRT, SUIT, DRESS, TROUSER');
  console.log('- Various priorities: LOW, NORMAL, HIGH, URGENT');
  console.log('- Different payment scenarios: full payment, partial payment, no payment');
  console.log('- Realistic business scenarios and special instructions');

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
