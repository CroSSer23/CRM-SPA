import { PrismaClient, Role, Unit } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Create categories
  console.log("Creating categories...")
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Skincare" } }),
    prisma.category.create({ data: { name: "Massage Oils" } }),
    prisma.category.create({ data: { name: "Towels & Linens" } }),
    prisma.category.create({ data: { name: "Cleaning Supplies" } }),
    prisma.category.create({ data: { name: "Aromatherapy" } }),
  ])

  // Create products
  console.log("Creating products...")
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Facial Cleanser",
        sku: "SKN-001",
        unit: Unit.ML,
        categoryId: categories[0].id,
        description: "Gentle facial cleanser for all skin types",
      },
    }),
    prisma.product.create({
      data: {
        name: "Moisturizing Cream",
        sku: "SKN-002",
        unit: Unit.ML,
        categoryId: categories[0].id,
        description: "Hydrating facial moisturizer",
      },
    }),
    prisma.product.create({
      data: {
        name: "Body Lotion",
        sku: "SKN-003",
        unit: Unit.ML,
        categoryId: categories[0].id,
        description: "Rich body moisturizer",
      },
    }),
    prisma.product.create({
      data: {
        name: "Swedish Massage Oil",
        sku: "MSG-001",
        unit: Unit.L,
        categoryId: categories[1].id,
        description: "Premium massage oil with lavender",
      },
    }),
    prisma.product.create({
      data: {
        name: "Deep Tissue Massage Oil",
        sku: "MSG-002",
        unit: Unit.L,
        categoryId: categories[1].id,
        description: "Warming massage oil for deep tissue work",
      },
    }),
    prisma.product.create({
      data: {
        name: "Bath Towels",
        sku: "LIN-001",
        unit: Unit.PCS,
        categoryId: categories[2].id,
        description: "100% cotton bath towels",
      },
    }),
    prisma.product.create({
      data: {
        name: "Face Towels",
        sku: "LIN-002",
        unit: Unit.PCS,
        categoryId: categories[2].id,
        description: "Soft face towels",
      },
    }),
    prisma.product.create({
      data: {
        name: "Bed Sheets",
        sku: "LIN-003",
        unit: Unit.PCS,
        categoryId: categories[2].id,
        description: "High-quality bed sheets",
      },
    }),
    prisma.product.create({
      data: {
        name: "Multi-Surface Cleaner",
        sku: "CLN-001",
        unit: Unit.L,
        categoryId: categories[3].id,
        description: "Eco-friendly multi-surface cleaner",
      },
    }),
    prisma.product.create({
      data: {
        name: "Disinfectant Spray",
        sku: "CLN-002",
        unit: Unit.ML,
        categoryId: categories[3].id,
        description: "Hospital-grade disinfectant",
      },
    }),
    prisma.product.create({
      data: {
        name: "Lavender Essential Oil",
        sku: "ARO-001",
        unit: Unit.ML,
        categoryId: categories[4].id,
        description: "Pure lavender essential oil",
      },
    }),
    prisma.product.create({
      data: {
        name: "Eucalyptus Essential Oil",
        sku: "ARO-002",
        unit: Unit.ML,
        categoryId: categories[4].id,
        description: "Pure eucalyptus essential oil",
      },
    }),
  ])

  // Create locations
  console.log("Creating locations...")
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: "Mayfair Spa",
        address: "123 Berkeley Square, Mayfair, London W1J 6BR",
      },
    }),
    prisma.location.create({
      data: {
        name: "Knightsbridge Wellness Center",
        address: "45 Brompton Road, Knightsbridge, London SW3 1DE",
      },
    }),
    prisma.location.create({
      data: {
        name: "Notting Hill Retreat",
        address: "78 Portobello Road, Notting Hill, London W11 2QD",
      },
    }),
  ])

  // Note: Users will be created automatically by Clerk when they sign up
  // For seeding, we'll create placeholder users
  console.log("Creating test users...")

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      clerkId: "seed_admin",
      email: "admin@procurement.spa",
      name: "Admin User",
      role: Role.ADMIN,
    },
  })

  // Create procurement user
  const procurementUser = await prisma.user.create({
    data: {
      clerkId: "seed_procurement",
      email: "procurement@procurement.spa",
      name: "Procurement Officer",
      role: Role.PROCUREMENT,
    },
  })

  // Create requester users for each location
  const requesterUsers = await Promise.all(
    locations.map((location, index) =>
      prisma.user.create({
        data: {
          clerkId: `seed_requester_${index + 1}`,
          email: `manager${index + 1}@procurement.spa`,
          name: `${location.name} Manager`,
          role: Role.REQUESTER,
          locations: {
            create: {
              locationId: location.id,
            },
          },
        },
      })
    )
  )

  // Assign products to locations
  console.log("Assigning products to locations...")
  for (const location of locations) {
    // Assign some products to each location
    const productsToAssign = products.slice(0, 8)
    await Promise.all(
      productsToAssign.map((product) =>
        prisma.locationProduct.create({
          data: {
            locationId: location.id,
            productId: product.id,
            minStock: 10,
            preferredQty: 20,
          },
        })
      )
    )
  }

  // Create sample requisitions
  console.log("Creating sample requisitions...")
  for (let i = 0; i < requesterUsers.length; i++) {
    const requester = requesterUsers[i]
    const location = locations[i]

    // Create a submitted requisition
    await prisma.requisition.create({
      data: {
        locationId: location.id,
        createdById: requester.id,
        status: "SUBMITTED",
        note: "Monthly supply order",
        items: {
          create: [
            {
              productId: products[0].id,
              requestedQty: 5,
            },
            {
              productId: products[1].id,
              requestedQty: 3,
            },
            {
              productId: products[3].id,
              requestedQty: 2,
            },
          ],
        },
        history: {
          create: {
            actorId: requester.id,
            action: "SUBMIT",
            toStatus: "SUBMITTED",
            message: "Requisition submitted for approval",
          },
        },
      },
    })

    // Create an ordered requisition
    await prisma.requisition.create({
      data: {
        locationId: location.id,
        createdById: requester.id,
        status: "ORDERED",
        poNumber: `PO-2025-${String(i + 1).padStart(4, "0")}`,
        items: {
          create: [
            {
              productId: products[5].id,
              requestedQty: 10,
              approvedQty: 10,
            },
            {
              productId: products[6].id,
              requestedQty: 15,
              approvedQty: 12,
            },
          ],
        },
        history: {
          create: [
            {
              actorId: requester.id,
              action: "SUBMIT",
              toStatus: "SUBMITTED",
              message: "Requisition submitted",
            },
            {
              actorId: procurementUser.id,
              action: "ORDER",
              fromStatus: "SUBMITTED",
              toStatus: "ORDERED",
              message: "Order placed with supplier",
            },
          ],
        },
      },
    })
  }

  console.log("✅ Seed completed successfully!")
  console.log(`
  Created:
  - ${categories.length} categories
  - ${products.length} products
  - ${locations.length} locations
  - ${requesterUsers.length + 2} users (${requesterUsers.length} requesters, 1 procurement, 1 admin)
  - Sample requisitions for each location
  `)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

