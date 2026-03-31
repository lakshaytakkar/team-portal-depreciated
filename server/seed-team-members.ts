import { storage } from "./storage";
import { genId } from "./db";

const ADMIN_ID = "cef223ad-1909-4c9b-bdee-239aa5e99387";

const USER_IDS: Record<string, string> = {
  "admin@suprans.in": "cef223ad-1909-4c9b-bdee-239aa5e99387",
  "abhinandan@suprans.in": "10849777-2824-4594-a753-a4e4cf584d2d",
  "aditya@suprans.in": "16a9a476-ef43-45f8-9461-a4ebc19299c7",
  "akansha@suprans.in": "122fac6c-c09d-4116-a97f-84c7799f5bce",
  "akshay@suprans.in": "67fc8860-99cf-41d2-8dc0-78e534f468bc",
  "babita@suprans.in": "198af834-c248-4a50-8d59-e846e6230b72",
  "garima@suprans.in": "aa117630-78b3-44fe-bb56-05faf93d0db2",
  "gaurav@suprans.in": "7e2142fa-2ecd-449c-bf6e-5c99836602b2",
  "himanshu@suprans.in": "81ddd550-8924-4199-a3f7-4110d4fd8e03",
  "jyoti@suprans.in": "09ae056a-8729-4f04-b94d-3f825fc4116e",
  "kartik@suprans.in": "63b604ca-8d29-4f51-93ee-88dda0874d01",
  "krish@suprans.in": "137a7f6b-5265-4d03-8d9a-157db8fd0264",
  "naveen@suprans.in": "86ea1c4e-6be5-49c0-9848-f9b5f3368123",
  "neetu@suprans.in": "b9bfce80-bbe1-47a7-a769-9bbde8cb71f9",
  "nitin@suprans.in": "cb0e13bf-1b8d-4b5f-b9e3-6c6f4c85d1a4",
};

const TEAMS = [
  { id: "team-sales", name: "Sales Team", description: "Main sales division" },
  { id: "team-ops", name: "Operations", description: "Operations and delivery" },
  { id: "team-hr", name: "HR Team", description: "Human resources" },
];

export async function seedTeamMembers() {
  const existingMembers = await storage.getTeamMembers(TEAMS[0].id);
  if (existingMembers.length > 0) {
    console.log("Team members already seeded, skipping...");
    return;
  }

  const users = await storage.getAllUsers();
  if (users.length === 0) {
    console.log("No users found, skipping team member seed...");
    return;
  }

  for (const team of TEAMS) {
    const allMembers = await storage.getTeamMembers(team.id);
    if (allMembers.length > 0) continue;

    for (const user of users) {
      try {
        await storage.createTeamMember({
          userId: user.id,
          teamId: team.id,
          role: user.role === "superadmin" ? "manager" : "executive",
        });
      } catch {
        // Skip duplicates
      }
    }
  }

  console.log("Team members seeded successfully.");
}
