import { db } from "./db";
import { users, teamMembers, employees } from "@shared/schema";
import { hashPassword } from "./auth";
import { eq } from "drizzle-orm";

async function seedAllUsers() {
  console.log("Seeding all users with password 'Suprans@123'...");

  const hashedPassword = await hashPassword("Suprans@123");

  // All users from teams-config.ts - all with password "Suprans@123"
  const allUsers = [
    // Admin
    { name: "Suprans Admin", email: "admin@suprans.in", role: "superadmin", phone: "+911234567890" },
    { name: "Admin User", email: "admin@suprans.com", role: "admin", phone: "+911234567891" },
    { name: "John Sales", email: "sales@suprans.com", role: "sales_executive", phone: "+911234567892" },
    
    // Events Team
    { name: "Bharti", email: "bharti@suprans.in", role: "employee", phone: "+919876543001" },
    { name: "Love Kumar", email: "love@suprans.in", role: "employee", phone: "+919876543002" },
    { name: "Sanjay", email: "sanjay@suprans.in", role: "employee", phone: "+919876543003" },
    { name: "Lakshay Takkar", email: "lakshay@suprans.in", role: "employee", phone: "+919876543004" },
    
    // HR Team
    { name: "Tina", email: "tina@suprans.in", role: "employee", phone: "+919876543005" },
    
    // Media Team
    { name: "Amit", email: "amit@suprans.in", role: "employee", phone: "+919876543006" },
    
    // Sales Team
    { name: "Himanshu Panday", email: "himanshu@suprans.in", role: "sales_executive", phone: "+919876543007" },
    { name: "Abhinandan", email: "abhinandan@suprans.in", role: "sales_executive", phone: "+919876543008" },
    { name: "Simran", email: "simran@suprans.in", role: "sales_executive", phone: "+919876543009" },
    { name: "Sumit", email: "sumit@suprans.in", role: "sales_executive", phone: "+919876543010" },
    { name: "Punit", email: "punit@suprans.in", role: "sales_executive", phone: "+919876543011" },
    { name: "Sunny", email: "sunny@suprans.in", role: "sales_executive", phone: "+919876543012" },
    { name: "Akshay", email: "akshay@suprans.in", role: "sales_executive", phone: "+919876543013" },
    { name: "Garima", email: "garima@suprans.in", role: "sales_executive", phone: "+919876543014" },
    { name: "Sahil Solanki", email: "sahil.solanki@suprans.in", role: "sales_executive", phone: "+919876543015" },
    { name: "Yash", email: "yash@suprans.in", role: "sales_executive", phone: "+919876543016" },
    { name: "Payal", email: "payal@suprans.in", role: "sales_executive", phone: "+919876543017" },
    { name: "Parthiv", email: "parthiv@suprans.in", role: "sales_executive", phone: "+919876543018" },
    
    // Additional employees from HR data
    { name: "Sahil", email: "sahil@suprans.in", role: "employee", phone: "+919812852757" },
    { name: "Rudraksh Sharma", email: "rudraksh@suprans.in", role: "employee", phone: "+918585977525" },
    { name: "Aditya Bairagi", email: "aditya@suprans.in", role: "employee", phone: "+918800991161" },
    { name: "Neetu Kumari", email: "neetu@suprans.in", role: "employee", phone: "+917413997101" },
    { name: "Akansha Panday", email: "akansha@suprans.in", role: "employee", phone: "+916284846470" },
    { name: "Shivam Singh", email: "shivam@suprans.in", role: "employee", phone: "+918791409458" },
    { name: "Priya", email: "priya@suprans.in", role: "employee", phone: "+919876543019" },
    { name: "Rahul", email: "rahul@suprans.in", role: "employee", phone: "+919876543020" },
    { name: "Vikram", email: "vikram@suprans.in", role: "employee", phone: "+919876543021" },
    { name: "Ankit", email: "ankit@suprans.in", role: "employee", phone: "+919876543022" },
    { name: "Deepak", email: "deepak@suprans.in", role: "employee", phone: "+919876543023" },
    { name: "Naveen", email: "naveen@suprans.in", role: "employee", phone: "+919876543024" },
  ];

  // Create all users
  const createdUsers: Record<string, string> = {};
  for (const userData of allUsers) {
    try {
      const existing = await db.select().from(users).where(eq(users.email, userData.email));
      
      if (existing.length > 0) {
        // Update password to "suprans"
        await db.update(users)
          .set({ password: hashedPassword, role: userData.role, name: userData.name })
          .where(eq(users.email, userData.email));
        createdUsers[userData.email] = existing[0].id;
        console.log(`Updated: ${userData.email}`);
      } else {
        const [user] = await db.insert(users).values({
          ...userData,
          password: hashedPassword,
        }).returning();
        createdUsers[userData.email] = user.id;
        console.log(`Created: ${userData.email}`);
      }
    } catch (error) {
      console.error(`Error with ${userData.email}:`, error);
    }
  }

  // Team memberships based on teams-config.ts
  const teamMemberships = [
    // Admin - all teams
    { email: "admin@suprans.in", teams: [
      "travel-sales", "travel-operations", "travel-accounts",
      "china-import-sales", "china-import-operations",
      "dropshipping-sales", "dropshipping-operations",
      "llc-sales", "llc-operations",
      "events", "hr-recruitment", "finance", "marketing", "media", "admin-it", "sales",
      "faire-order-fulfilment", "faire-products"
    ], role: "admin" },
    
    // Events team
    { email: "bharti@suprans.in", teams: ["events"], role: "member" },
    { email: "love@suprans.in", teams: ["events"], role: "member" },
    { email: "sanjay@suprans.in", teams: ["events"], role: "member" },
    { email: "lakshay@suprans.in", teams: ["events"], role: "member" },
    
    // HR team
    { email: "tina@suprans.in", teams: ["hr-recruitment"], role: "admin" },
    
    // Media team
    { email: "amit@suprans.in", teams: ["media"], role: "member" },
    
    // Sales team
    { email: "himanshu@suprans.in", teams: ["sales", "travel-sales"], role: "member" },
    { email: "abhinandan@suprans.in", teams: ["sales"], role: "member" },
    { email: "simran@suprans.in", teams: ["sales"], role: "member" },
    { email: "sumit@suprans.in", teams: ["sales"], role: "member" },
    { email: "punit@suprans.in", teams: ["sales"], role: "member" },
    { email: "sunny@suprans.in", teams: ["sales"], role: "member" },
    { email: "akshay@suprans.in", teams: ["sales"], role: "member" },
    { email: "garima@suprans.in", teams: ["sales"], role: "member" },
    { email: "sahil.solanki@suprans.in", teams: ["sales"], role: "member" },
    { email: "yash@suprans.in", teams: ["sales"], role: "member" },
    { email: "payal@suprans.in", teams: ["sales"], role: "member" },
    { email: "parthiv@suprans.in", teams: ["sales"], role: "member" },
    
    // Additional employees in various teams
    { email: "rudraksh@suprans.in", teams: ["sales"], role: "member" },
    { email: "aditya@suprans.in", teams: ["media"], role: "member" },
    { email: "neetu@suprans.in", teams: ["hr-recruitment"], role: "member" },
    { email: "shivam@suprans.in", teams: ["llc-operations"], role: "member" },
    { email: "priya@suprans.in", teams: ["llc-sales"], role: "member" },
    { email: "rahul@suprans.in", teams: ["faire-order-fulfilment"], role: "member" },
    { email: "vikram@suprans.in", teams: ["faire-products"], role: "member" },
  ];

  // Clear existing team memberships and re-add
  console.log("\n--- Setting up team memberships ---");
  for (const membership of teamMemberships) {
    const userId = createdUsers[membership.email];
    if (!userId) {
      console.log(`Skipping ${membership.email} - user not found`);
      continue;
    }
    
    for (const teamId of membership.teams) {
      try {
        await db.insert(teamMembers).values({
          userId,
          teamId,
          role: membership.role,
        }).onConflictDoNothing();
      } catch (error) {
        // Ignore conflicts
      }
    }
    console.log(`Assigned ${membership.email} to teams: ${membership.teams.join(", ")}`);
  }

  console.log("\n✅ All users seeded successfully!");
  console.log(`Total users: ${Object.keys(createdUsers).length}`);
  console.log("\nAll users can login with password: Suprans@123");
}

seedAllUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
