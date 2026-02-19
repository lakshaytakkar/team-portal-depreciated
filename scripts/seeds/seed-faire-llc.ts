import { db } from "./db";
import { 
  faireStores, faireSuppliers, faireProducts, faireProductVariants, faireOrders, faireOrderItems, 
  llcBanks, llcDocumentTypes
} from "@shared/schema";

async function seedFaireAndLLC() {
  console.log("Seeding Faire and LLC data...");

  // Seed LLC Banks
  const banks = [
    { name: "Mercury", code: "MERCURY", displayOrder: 1, website: "https://mercury.com" },
    { name: "Chase Business", code: "CHASE", displayOrder: 2, website: "https://chase.com/business" },
    { name: "Bank of America", code: "BOA", displayOrder: 3, website: "https://bankofamerica.com" },
    { name: "Wells Fargo", code: "WF", displayOrder: 4, website: "https://wellsfargo.com" },
    { name: "Relay", code: "RELAY", displayOrder: 5, website: "https://relayfi.com" },
    { name: "BlueVine", code: "BLUEVINE", displayOrder: 6, website: "https://bluevine.com" },
  ];
  await db.insert(llcBanks).values(banks).onConflictDoNothing();
  console.log("Seeded LLC banks");

  // Seed LLC Document Types
  const docTypes = [
    { name: "Articles of Organization", code: "AOO", category: "llc_documents", displayOrder: 1, isRequired: true },
    { name: "EIN Letter", code: "EIN", category: "llc_documents", displayOrder: 2, isRequired: true },
    { name: "Operating Agreement", code: "OA", category: "llc_documents", displayOrder: 3, isRequired: true },
    { name: "Bank Statement", code: "BS", category: "bank_documents", displayOrder: 4 },
    { name: "Business License", code: "BL", category: "llc_documents", displayOrder: 5 },
    { name: "Registered Agent Document", code: "RAD", category: "llc_documents", displayOrder: 6 },
    { name: "Passport/ID", code: "PID", category: "client_submitted", displayOrder: 7, isRequired: true },
    { name: "Proof of Address", code: "POA", category: "client_submitted", displayOrder: 8 },
    { name: "Website Agreement", code: "WA", category: "website_documents", displayOrder: 9, forEliteOnly: true },
  ];
  await db.insert(llcDocumentTypes).values(docTypes).onConflictDoNothing();
  console.log("Seeded LLC document types");

  // Seed Faire Stores
  const stores = [
    { 
      name: "Artisan Home Goods", 
      code: "AHG",
      contactEmail: "contact@artisanhome.com",
      contactPhone: "+1 555-0101",
    },
    { 
      name: "Coastal Living Co", 
      code: "CLC",
      contactEmail: "info@coastalliving.com",
      contactPhone: "+1 555-0102",
    },
    { 
      name: "Urban Craft Studio", 
      code: "UCS",
      contactEmail: "hello@urbancrafts.com",
      contactPhone: "+1 555-0103",
    },
  ];
  const insertedStores = await db.insert(faireStores).values(stores).returning();
  console.log("Seeded Faire stores");

  // Seed Faire Suppliers
  const suppliers = [
    { 
      storeId: insertedStores[0].id,
      name: "EcoWare Solutions", 
      code: "ECOWARE",
      email: "orders@ecoware.com",
      phone: "+1 555-0201",
      addressLine1: "123 Green Street",
      city: "Portland",
      state: "OR",
      postalCode: "97201",
      contactName: "Sarah Johnson",
      status: "active"
    },
    { 
      storeId: insertedStores[0].id,
      name: "Mountain Ceramics", 
      code: "MTNCERAMIC",
      email: "sales@mountainceramics.com",
      phone: "+1 555-0202",
      addressLine1: "456 Pottery Lane",
      city: "Asheville",
      state: "NC",
      postalCode: "28801",
      contactName: "Michael Chen",
      status: "active"
    },
    { 
      storeId: insertedStores[1].id,
      name: "Bamboo Basics", 
      code: "BAMBOO",
      email: "info@bamboobasics.com",
      phone: "+1 555-0203",
      addressLine1: "789 Sustainable Ave",
      city: "Seattle",
      state: "WA",
      postalCode: "98101",
      contactName: "Emma Williams",
      status: "active"
    },
  ];
  const insertedSuppliers = await db.insert(faireSuppliers).values(suppliers).returning();
  console.log("Seeded Faire suppliers");

  // Seed Faire Products
  const products = [
    { 
      storeId: insertedStores[0].id,
      supplierId: insertedSuppliers[0].id,
      name: "Organic Cotton Napkin Set", 
      sku: "ECO-NAP-001",
      description: "Set of 4 organic cotton napkins",
      minimumOrderQuantity: 6,
      saleState: "FOR_SALE",
      lifecycleState: "PUBLISHED"
    },
    { 
      storeId: insertedStores[0].id,
      supplierId: insertedSuppliers[1].id,
      name: "Handmade Ceramic Mug", 
      sku: "MC-MUG-001",
      description: "Hand-thrown ceramic mug, 12oz",
      minimumOrderQuantity: 12,
      saleState: "FOR_SALE",
      lifecycleState: "PUBLISHED"
    },
    { 
      storeId: insertedStores[1].id,
      supplierId: insertedSuppliers[2].id,
      name: "Bamboo Serving Board", 
      sku: "BB-SRV-001",
      description: "Large bamboo serving board with handle",
      minimumOrderQuantity: 4,
      saleState: "FOR_SALE",
      lifecycleState: "PUBLISHED"
    },
    { 
      storeId: insertedStores[1].id,
      supplierId: insertedSuppliers[0].id,
      name: "Linen Table Runner", 
      sku: "ECO-TBR-001",
      description: "Natural linen table runner, 72 inch",
      minimumOrderQuantity: 3,
      saleState: "FOR_SALE",
      lifecycleState: "PUBLISHED"
    },
    { 
      storeId: insertedStores[2].id,
      supplierId: insertedSuppliers[1].id,
      name: "Ceramic Planter Set", 
      sku: "MC-PLT-001",
      description: "Set of 3 ceramic planters",
      minimumOrderQuantity: 2,
      saleState: "FOR_SALE",
      lifecycleState: "PUBLISHED"
    },
  ];
  const insertedProducts = await db.insert(faireProducts).values(products).returning();
  console.log("Seeded Faire products");

  // Seed Faire Orders
  const orders = [
    { 
      storeId: insertedStores[0].id,
      faireOrderId: "FO-2024-001",
      displayId: "ORD-001",
      retailerName: "The Local Shop",
      address: { street: "100 Main St", city: "Brooklyn", state: "NY", zip: "11201" },
      subtotalCents: 48000,
      shippingCents: 2500,
      totalCents: 50500,
      state: "PROCESSING"
    },
    { 
      storeId: insertedStores[0].id,
      faireOrderId: "FO-2024-002",
      displayId: "ORD-002",
      retailerName: "Home & Garden Boutique",
      address: { street: "250 Oak Ave", city: "Austin", state: "TX", zip: "78701" },
      subtotalCents: 72000,
      shippingCents: 3500,
      totalCents: 75500,
      state: "NEW"
    },
    { 
      storeId: insertedStores[1].id,
      faireOrderId: "FO-2024-003",
      displayId: "ORD-003",
      retailerName: "Coastal Decor Store",
      address: { street: "500 Beach Blvd", city: "Miami", state: "FL", zip: "33139" },
      subtotalCents: 125000,
      shippingCents: 4500,
      totalCents: 129500,
      state: "IN_TRANSIT"
    },
    { 
      storeId: insertedStores[2].id,
      faireOrderId: "FO-2024-004",
      displayId: "ORD-004",
      retailerName: "Urban Living Co",
      address: { street: "789 Downtown St", city: "Chicago", state: "IL", zip: "60601" },
      subtotalCents: 89000,
      shippingCents: 3000,
      totalCents: 92000,
      state: "DELIVERED"
    },
  ];
  const insertedOrders = await db.insert(faireOrders).values(orders).returning();
  console.log("Seeded Faire orders");

  // Seed Faire Order Items
  const orderItems = [
    { 
      orderId: insertedOrders[0].id,
      storeId: insertedStores[0].id,
      productId: insertedProducts[0].id,
      productName: insertedProducts[0].name,
      quantity: 12,
      priceCents: 2400
    },
    { 
      orderId: insertedOrders[0].id,
      storeId: insertedStores[0].id,
      productId: insertedProducts[1].id,
      productName: insertedProducts[1].name,
      quantity: 12,
      priceCents: 1500
    },
    { 
      orderId: insertedOrders[1].id,
      storeId: insertedStores[0].id,
      productId: insertedProducts[2].id,
      productName: insertedProducts[2].name,
      quantity: 8,
      priceCents: 2800
    },
    { 
      orderId: insertedOrders[2].id,
      storeId: insertedStores[1].id,
      productId: insertedProducts[3].id,
      productName: insertedProducts[3].name,
      quantity: 15,
      priceCents: 3200
    },
    { 
      orderId: insertedOrders[3].id,
      storeId: insertedStores[2].id,
      productId: insertedProducts[4].id,
      productName: insertedProducts[4].name,
      quantity: 10,
      priceCents: 4500
    },
  ];
  await db.insert(faireOrderItems).values(orderItems);
  console.log("Seeded Faire order items");

  console.log("Faire and LLC seeding complete!");
}

seedFaireAndLLC()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  });
