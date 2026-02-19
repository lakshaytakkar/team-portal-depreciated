import { db } from "./db";
import { 
  users, leads, services, templates, events, venueComparisons, 
  jobOpenings, jobPortals, travelPackages, employees, teamMembers
} from "@shared/schema";
import { hashPassword } from "./auth";
import { eq } from "drizzle-orm";

async function seedFromGitHub() {
  console.log("Seeding database with GitHub data...");

  try {
    // 1. Create admin@suprans.in superadmin user
    console.log("\n--- Creating admin@suprans.in superadmin user ---");
    const hashedPassword = await hashPassword("Suprans@123");
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, "admin@suprans.in"));
    
    let adminUser;
    if (existingUser.length > 0) {
      console.log("User admin@suprans.in already exists, updating...");
      [adminUser] = await db.update(users)
        .set({ 
          password: hashedPassword,
          role: "superadmin",
          name: "Suprans Admin"
        })
        .where(eq(users.email, "admin@suprans.in"))
        .returning();
    } else {
      [adminUser] = await db.insert(users).values({
        name: "Suprans Admin",
        email: "admin@suprans.in",
        password: hashedPassword,
        role: "superadmin",
        phone: "+911234567890",
      }).returning();
      console.log("Created admin@suprans.in user");
    }

    // Add admin to all teams - using correct team IDs from teams-config.ts
    const teamIds = [
      "travel-sales", "travel-operations", "travel-accounts",
      "china-import-sales", "china-import-operations",
      "dropshipping-sales", "dropshipping-operations",
      "llc-sales", "llc-operations",
      "events", "marketing", "hr", "media", "faire-orders", "faire-products", "llc-services"
    ];
    
    for (const teamId of teamIds) {
      await db.insert(teamMembers).values({
        userId: adminUser.id,
        teamId: teamId,
        role: "admin",
      }).onConflictDoNothing();
    }
    console.log("Added admin@suprans.in to all teams");

    // 2. Create/update services
    console.log("\n--- Seeding services ---");
    const servicesData = [
      { name: "Web Development", category: "Development", description: "Custom website development", pricing: 5000, isActive: true },
      { name: "Mobile App Development", category: "Development", description: "iOS and Android app development", pricing: 10000, isActive: true },
      { name: "Digital Marketing", category: "Marketing", description: "SEO, SEM, and social media marketing", pricing: 2000, isActive: true },
      { name: "Consulting", category: "Consulting", description: "Business and technical consulting", pricing: 1500, isActive: true },
      { name: "LLC Formation", category: "Business Services", description: "Complete LLC formation services for US business setup", pricing: 25000, isActive: true },
      { name: "Trademark Registration", category: "IP Services", description: "Trademark registration and protection", pricing: 15000, isActive: true },
      { name: "GST Registration", category: "Tax & Compliance", description: "GST registration and compliance", pricing: 5000, isActive: true },
      { name: "Import Export License", category: "Licenses", description: "IEC and other import-export licenses", pricing: 8000, isActive: true },
      { name: "Accounting Services", category: "Ongoing Services", description: "Monthly accounting and bookkeeping", pricing: 10000, isActive: true },
      { name: "China Sourcing", category: "Sourcing", description: "Product sourcing from China factories", pricing: 0, isActive: true },
    ];
    
    for (const service of servicesData) {
      await db.insert(services).values(service).onConflictDoNothing();
    }
    console.log("Seeded services");

    // 3. Seed templates
    console.log("\n--- Seeding templates ---");
    const templatesData = [
      { title: "Welcome Call Script", type: "script", content: "Hello [Name], this is [Your Name] from Suprans. I wanted to reach out about your inquiry regarding [Service]...", category: "Introduction" },
      { title: "Follow-up Email", type: "email", subject: "Following up on your inquiry", content: "Hi [Name],\n\nI wanted to follow up on our conversation about [Service]...", category: "Follow-up" },
      { title: "Price Objection", type: "objection", content: "I understand budget is a concern. Let me explain the value you'll receive...", category: "Pricing" },
      { title: "Canton Fair Invitation", type: "email", subject: "Join Suprans at Canton Fair 2026", content: "Dear [Name],\n\nWe are excited to invite you to join our exclusive Canton Fair business delegation...", category: "Events" },
      { title: "LLC Consultation", type: "script", content: "Hello [Name], I understand you're interested in forming a US LLC. Let me explain the process and benefits...", category: "LLC Services" },
    ];
    
    for (const template of templatesData) {
      await db.insert(templates).values(template).onConflictDoNothing();
    }
    console.log("Seeded templates");

    // 4. Seed events
    console.log("\n--- Seeding events ---");
    const eventsData = [
      {
        id: "40342823-d377-4ba4-9715-587b4d903dea",
        name: "Delhi IBS Day 1",
        description: "International Business Seminar - Day 1: Introduction to China Sourcing & Import-Export Business",
        type: "ibs",
        city: "Delhi",
        venue: "India Habitat Centre",
        venueAddress: "Lodhi Road, New Delhi",
        date: new Date("2026-01-30"),
        endDate: new Date("2026-01-30"),
        capacity: 500,
        status: "upcoming",
      },
      {
        id: "50342823-d377-4ba4-9715-587b4d903deb",
        name: "Delhi IBS Day 2",
        description: "International Business Seminar - Day 2: Advanced Strategies & Hands-on Workshop",
        type: "ibs",
        city: "Delhi",
        venue: "India Habitat Centre",
        venueAddress: "Lodhi Road, New Delhi",
        date: new Date("2026-01-31"),
        endDate: new Date("2026-01-31"),
        capacity: 500,
        status: "upcoming",
      },
      {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        name: "Mumbai Canton Fair Preview",
        description: "Pre-Canton Fair networking event",
        type: "seminar",
        city: "Mumbai",
        venue: "Radisson Hotel Mumbai",
        venueAddress: "Andheri East, Mumbai",
        date: new Date("2026-02-15"),
        endDate: new Date("2026-02-15"),
        capacity: 200,
        status: "upcoming",
      },
      {
        id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        name: "Bangalore Sourcing Workshop",
        description: "Hands-on workshop for China sourcing",
        type: "ibs",
        city: "Bangalore",
        venue: "ITC Gardenia",
        venueAddress: "Residency Road, Bangalore",
        date: new Date("2026-03-10"),
        endDate: new Date("2026-03-11"),
        capacity: 150,
        status: "upcoming",
      },
      {
        id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        name: "Hyderabad Import Export Summit",
        description: "Annual summit for import-export businesses",
        type: "seminar",
        city: "Hyderabad",
        venue: "HICC",
        venueAddress: "Madhapur, Hyderabad",
        date: new Date("2026-04-05"),
        endDate: new Date("2026-04-06"),
        capacity: 400,
        status: "upcoming",
      },
      {
        id: "d4e5f6a7-b8c9-0123-defa-234567890123",
        name: "Pune Entrepreneur Meetup",
        description: "Networking event for Pune entrepreneurs",
        type: "ibs",
        city: "Pune",
        venue: "JW Marriott Pune",
        venueAddress: "Senapati Bapat Road, Pune",
        date: new Date("2026-05-20"),
        endDate: new Date("2026-05-20"),
        capacity: 100,
        status: "upcoming",
      },
    ];
    
    for (const event of eventsData) {
      await db.insert(events).values(event).onConflictDoNothing();
    }
    console.log("Seeded events");

    // 5. Seed venue comparisons
    console.log("\n--- Seeding venue comparisons ---");
    const venueData = [
      { city: "Delhi", category: "5 Star", name: "The Leela Palace", airportDistance: "15 km", location: "Chanakyapuri, New Delhi", hallCapacity: 600, contactPhone: "+91 11 3933 1234", contactEmail: "events.delhi@theleela.com", contactPerson: "Mr. Sharma", status: "available", pricePerDay: 800000 },
      { city: "Delhi", category: "5 Star", name: "India Habitat Centre", airportDistance: "18 km", location: "Lodhi Road, New Delhi", hallCapacity: 500, contactPhone: "+91 11 2468 2222", contactEmail: "events@indiahabitat.org", contactPerson: "Ms. Gupta", status: "available", pricePerDay: 400000 },
      { city: "Mumbai", category: "5 Star", name: "Radisson Hotel Mumbai", airportDistance: "6-8 km", location: "Andheri East, Mumbai", hallCapacity: 400, contactPhone: "+91 9152035824", contactEmail: "events.mumbai@radisson.com", contactPerson: "Mr. Prem", status: "available", pricePerDay: 350000 },
      { city: "Mumbai", category: "5 Star", name: "Taj Lands End", airportDistance: "12 km", location: "Bandra West, Mumbai", hallCapacity: 500, contactPhone: "+91 22 6668 1234", contactEmail: "events.landsend@tajhotels.com", contactPerson: "Mr. Desai", status: "available", pricePerDay: 700000 },
      { city: "Bangalore", category: "5 Star", name: "ITC Gardenia", airportDistance: "35 km", location: "Residency Road, Bangalore", hallCapacity: 400, contactPhone: "+91 80 2211 9898", contactEmail: "events.gardenia@itchotels.in", contactPerson: "Ms. Rao", status: "available", pricePerDay: 500000 },
      { city: "Hyderabad", category: "5 Star", name: "HICC", airportDistance: "30 km", location: "Madhapur, Hyderabad", hallCapacity: 1000, contactPhone: "+91 40 6682 3456", contactEmail: "events@hicc.com", contactPerson: "Mr. Reddy", status: "available", pricePerDay: 600000 },
      { city: "Chennai", category: "5 Star", name: "ITC Grand Chola", airportDistance: "10 km", location: "Guindy, Chennai", hallCapacity: 700, contactPhone: "+91 44 2220 0000", contactEmail: "events.grandchola@itchotels.in", contactPerson: "Mr. Krishnan", status: "available", pricePerDay: 550000 },
      { city: "Kolkata", category: "5 Star", name: "JW Marriott Kolkata", airportDistance: "8 km", location: "EM Bypass, Kolkata", hallCapacity: 350, contactPhone: "+91 33 6633 0000", contactEmail: "events.kolkata@marriott.com", contactPerson: "Ms. Banerjee", status: "available", pricePerDay: 400000 },
      { city: "Pune", category: "5 Star", name: "JW Marriott Hotel Pune", airportDistance: "12 km", location: "Senapati Bapat Road, Pune", hallCapacity: 300, contactPhone: "+91 20 6683 3333", contactEmail: "events.pune@marriott.com", contactPerson: "Mr. Kulkarni", status: "available", pricePerDay: 380000 },
      { city: "Ahmedabad", category: "5 Star", name: "Hyatt Regency Ahmedabad", airportDistance: "8 km", location: "Ashram Road, Ahmedabad", hallCapacity: 250, contactPhone: "+91 79 6619 1234", contactEmail: "events.ahmedabad@hyatt.com", contactPerson: "Mr. Patel", status: "available", pricePerDay: 320000 },
    ];
    
    for (const venue of venueData) {
      await db.insert(venueComparisons).values(venue).onConflictDoNothing();
    }
    console.log("Seeded venue comparisons");

    // 6. Seed job openings
    console.log("\n--- Seeding job openings ---");
    const jobOpeningsData = [
      { title: "Sales Executive", department: "Sales", location: "Delhi", type: "full-time", experience: "1-3 years", salary: "25000-35000", description: "Looking for enthusiastic sales executives to join our team", requirements: ["Excellent communication skills", "Sales experience preferred", "Fluent in English and Hindi"], status: "active", openings: 5 },
      { title: "Business Development Manager", department: "Sales", location: "Mumbai", type: "full-time", experience: "5-8 years", salary: "60000-80000", description: "Senior role for driving business growth", requirements: ["MBA preferred", "B2B sales experience", "Team management"], status: "active", openings: 2 },
      { title: "HR Executive", department: "HR", location: "Delhi", type: "full-time", experience: "2-4 years", salary: "30000-40000", description: "HR professional for recruitment", requirements: ["HR certification", "Recruitment experience"], status: "active", openings: 1 },
      { title: "Digital Marketing Specialist", department: "Marketing", location: "Remote", type: "full-time", experience: "2-5 years", salary: "35000-50000", description: "Digital marketing expert", requirements: ["Google Ads certified", "Social media expertise"], status: "active", openings: 1 },
      { title: "Customer Support Executive", department: "Operations", location: "Delhi", type: "full-time", experience: "0-2 years", salary: "18000-25000", description: "Customer support", requirements: ["Good communication", "Problem-solving"], status: "active", openings: 3 },
      { title: "Accounts Executive", department: "Finance", location: "Delhi", type: "full-time", experience: "2-4 years", salary: "28000-38000", description: "Accounting professional", requirements: ["B.Com/M.Com", "Tally proficiency"], status: "active", openings: 1 },
      { title: "Content Writer", department: "Marketing", location: "Remote", type: "contract", experience: "1-3 years", salary: "20000-30000", description: "Content writer", requirements: ["Excellent writing", "SEO knowledge"], status: "active", openings: 2 },
      { title: "China Sourcing Specialist", department: "Operations", location: "Delhi", type: "full-time", experience: "3-5 years", salary: "45000-60000", description: "China sourcing specialist", requirements: ["Mandarin proficiency", "China experience"], status: "active", openings: 1 },
      { title: "Event Coordinator", department: "Events", location: "Delhi", type: "full-time", experience: "2-4 years", salary: "30000-40000", description: "Event coordinator", requirements: ["Event management", "Vendor coordination"], status: "active", openings: 2 },
      { title: "Graphic Designer", department: "Marketing", location: "Remote", type: "contract", experience: "2-4 years", salary: "25000-35000", description: "Graphic designer", requirements: ["Adobe Creative Suite", "Portfolio required"], status: "active", openings: 1 },
    ];
    
    for (const job of jobOpeningsData) {
      await db.insert(jobOpenings).values(job).onConflictDoNothing();
    }
    console.log("Seeded job openings");

    // 7. Seed job portals
    console.log("\n--- Seeding job portals ---");
    const jobPortalsData = [
      { name: "Naukri.com", url: "https://www.naukri.com", isActive: true, credentials: { username: "suprans_hr", lastLogin: "2026-01-20" } },
      { name: "LinkedIn", url: "https://www.linkedin.com", isActive: true, credentials: { username: "suprans_careers", lastLogin: "2026-01-22" } },
      { name: "WorkIndia", url: "https://www.workindia.in", isActive: true, credentials: { username: "suprans", lastLogin: "2026-01-21" } },
      { name: "Indeed", url: "https://www.indeed.co.in", isActive: true, credentials: { username: "suprans_jobs", lastLogin: "2026-01-19" } },
      { name: "Shine", url: "https://www.shine.com", isActive: false, credentials: { username: "suprans_hr", lastLogin: "2026-01-10" } },
    ];
    
    for (const portal of jobPortalsData) {
      await db.insert(jobPortals).values(portal).onConflictDoNothing();
    }
    console.log("Seeded job portals");

    // 8. Seed sample leads
    console.log("\n--- Seeding sample leads ---");
    const salesUser = await db.select().from(users).where(eq(users.email, "sales@suprans.com"));
    const assignedTo = salesUser.length > 0 ? salesUser[0].id : adminUser.id;

    const leadsData = [
      { name: "Alice Johnson", company: "TechCorp Inc", phone: "+1234567892", email: "alice@techcorp.com", service: "Web Development", value: 15000, stage: "qualified", assignedTo, source: "Referral", rating: 4, temperature: "hot", tags: ["enterprise", "urgent"] },
      { name: "Bob Smith", company: "StartupXYZ", phone: "+1234567893", email: "bob@startupxyz.com", service: "Mobile App Development", value: 25000, stage: "proposal", assignedTo, source: "Website", rating: 5, temperature: "hot", tags: ["startup", "mobile"] },
      { name: "Carol Williams", company: "Marketing Plus", phone: "+1234567894", email: "carol@marketingplus.com", service: "Digital Marketing", value: 5000, stage: "contacted", assignedTo: null, source: "Cold Call", rating: 3, temperature: "warm", tags: ["marketing"] },
      { name: "Rajesh Kumar", company: "Export India Ltd", phone: "+919876543210", email: "rajesh@exportindia.com", service: "China Sourcing", value: 50000, stage: "qualified", assignedTo, source: "Canton Fair", rating: 5, temperature: "hot", tags: ["sourcing", "china"] },
      { name: "Priya Sharma", company: "US Dreams LLC", phone: "+919876543211", email: "priya@usdreams.com", service: "LLC Formation", value: 75000, stage: "proposal", assignedTo, source: "Website", rating: 4, temperature: "hot", tags: ["llc", "usa"] },
    ];
    
    for (const lead of leadsData) {
      await db.insert(leads).values(lead).onConflictDoNothing();
    }
    console.log("Seeded sample leads");

    console.log("\n✅ GitHub data seeding completed successfully!");
    console.log("\nLogin credentials:");
    console.log("Superadmin: admin@suprans.in / suprans");
    console.log("Admin: admin@suprans.com / admin123");
    console.log("Sales: sales@suprans.com / sales123");

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seedFromGitHub()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
