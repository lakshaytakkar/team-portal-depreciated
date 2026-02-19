import { db } from "./db";
import { hrEmployees, users } from "@shared/schema";
import { eq } from "drizzle-orm";

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

async function seedHrEmployees() {
  console.log("Seeding HR employees from GitHub data...");

  // Get user IDs for linking
  const allUsers = await db.select().from(users);
  const userMap = new Map(allUsers.map(u => [u.email, u.id]));

  const employeesData = [
    { name: "Love Kumar", fatherName: "Raj Kumar", relation: "Son", dob: "18/08/2003", phone: "9643906583", type: "Internship", status: "active", joining: "09/07/2025", email: "love@suprans.in", department: "Events" },
    { name: "Sahil", fatherName: "Hariom", relation: "Son", dob: "26/01/2004", phone: "9812852757", type: "Internship", status: "active", joining: "09/07/2025", email: "sahil@suprans.in", department: "Sales" },
    { name: "Rudraksh Sharma", fatherName: "Jai Prakash Sharma", relation: "Son", dob: "24/01/2003", phone: "8585977525", type: "FTE", status: "active", joining: "07/07/2025", email: "rudraksh@suprans.in", department: "Sales" },
    { name: "Aditya Bairagi", fatherName: "Shiv Kumar", relation: "Son", dob: "01/06/2001", phone: "8800991161", type: "FTE", status: "active", joining: "23/07/2025", email: "aditya@suprans.in", department: "Media" },
    { name: "Simran", fatherName: "Ram Saran", relation: "Daughter", dob: "21/03/2004", phone: "7393973404", type: "Internship", status: "active", joining: "04/08/2025", email: "simran@suprans.in", department: "Sales" },
    { name: "Neetu Kumari", fatherName: "Gyan Chand", relation: "Daughter", dob: "29/01/2000", phone: "7413997101", type: "FTE", status: "active", joining: "18/08/2025", email: "neetu@suprans.in", department: "HR" },
    { name: "Akansha Panday", fatherName: "Sanjay Panday", relation: "Daughter", dob: "25/11/2001", phone: "6284846470", type: "FTE", status: "active", joining: "11/08/2025", email: "akansha@suprans.in", department: "Operations" },
    { name: "Shivam Singh", fatherName: "Babu Lal Singh", relation: "Son", dob: "13/08/2002", phone: "8791409458", type: "FTE", status: "active", joining: "23/08/2025", email: "shivam@suprans.in", department: "LLC Operations" },
    { name: "Himanshu Panday", fatherName: "Naval Kishor Panday", relation: "Son", dob: "18/07/1997", phone: "9956609923", type: "FTE", status: "active", joining: "25/08/2025", email: "himanshu@suprans.in", department: "Sales" },
    { name: "Prem", fatherName: "Deepak Sharma", relation: "Son", dob: "04/01/2002", phone: "7404985868", type: "FTE", status: "active", joining: "01/09/2025", email: null, department: "Operations" },
    { name: "Rajesh Bhatt", fatherName: "Tara Dutt Bhatt", relation: "Son", dob: "01/08/2001", phone: "7900547390", type: "FTE", status: "active", joining: "11/09/2025", email: null, department: "Operations" },
    { name: "Prachi Kumari", fatherName: "Puran Singh", relation: "Daughter", dob: "03/07/2006", phone: "9899287209", type: "FTE", status: "active", joining: "18/09/2025", email: null, department: "Sales" },
    { name: "Abhijeet Sharma", fatherName: "Inderjeet", relation: "Son", dob: "09/10/2001", phone: "8860346704", type: "FTE", status: "active", joining: "03/10/2025", email: null, department: "Sales" },
    { name: "Abhinandan", fatherName: "Suresh Kumar", relation: "Son", dob: "25/10/1999", phone: "8130249937", type: "FTE", status: "active", joining: "03/10/2025", email: "abhinandan@suprans.in", department: "Sales" },
    { name: "Ayush Mishra", fatherName: "Rajeep Kumar", relation: "Son", dob: "08/10/2002", phone: "8803771260", type: "Intern", status: "active", joining: "01/10/2025", email: null, department: "Marketing" },
    { name: "Babita Mehta", fatherName: "Bijender Mehta", relation: "Daughter", dob: "23/05/2003", phone: "9625546735", type: "Intern", status: "active", joining: "10/10/2025", email: null, department: "Marketing" },
    { name: "Yash Kumar", fatherName: "Kanwar Singh Yadav", relation: "Son", dob: "10/12/2001", phone: "9783366576", type: "FTE", status: "active", joining: "29/10/2025", email: "yash@suprans.in", department: "Sales" },
    { name: "Ayaan Khastagir", fatherName: "Tapas Khastagir", relation: "Son", dob: "14/01/2005", phone: "9810609469", type: "Intern", status: "active", joining: "23/10/2025", email: null, department: "Operations" },
    { name: "Sumit Thakur", fatherName: "Sushil Kumar", relation: "Son", dob: "26/08/2002", phone: "9877978889", type: "FTE", status: "active", joining: "19/11/2025", email: "sumit@suprans.in", department: "Sales" },
    { name: "Naveen Singh", fatherName: "Gopal Singh Rawat", relation: "Son", dob: "17/05/2003", phone: "9891367044", type: "FTE", status: "active", joining: "01/12/2025", email: "naveen@suprans.in", department: "Operations" },
    { name: "Punit", fatherName: "Yeshvir", relation: "Son", dob: "25/12/2004", phone: "9728087600", type: "FTE", status: "active", joining: "17/12/2025", email: "punit@suprans.in", department: "Sales" },
    { name: "Bharti", fatherName: "Yadav", relation: "Daughter", dob: "07/03/2002", phone: "8287366961", type: "FTE", status: "active", joining: "10/01/2026", email: "bharti@suprans.in", department: "Events" },
    { name: "Gaurav", fatherName: "Gupta", relation: "Son", dob: "09/08/1998", phone: "8447000466", type: "FTE", status: "active", joining: "17/01/2026", email: null, department: "Finance" },
    { name: "Sunny", fatherName: "Yadav", relation: "Son", dob: "22/07/1998", phone: "7983074951", type: "FTE", status: "active", joining: "12/01/2026", email: "sunny@suprans.in", department: "Sales" },
    { name: "Akshay", fatherName: "Kumar", relation: "Son", dob: "15/12/1991", phone: "8252149197", type: "FTE", status: "active", joining: "12/01/2026", email: "akshay@suprans.in", department: "Sales" },
    { name: "Garima", fatherName: "Singh", relation: "Daughter", dob: "15/03/1999", phone: "9876543100", type: "FTE", status: "active", joining: "15/01/2026", email: "garima@suprans.in", department: "Sales" },
    { name: "Payal", fatherName: "Kumar", relation: "Daughter", dob: "20/06/2000", phone: "9876543101", type: "FTE", status: "active", joining: "16/01/2026", email: "payal@suprans.in", department: "Sales" },
    { name: "Parthiv", fatherName: "Sharma", relation: "Son", dob: "05/09/1998", phone: "9876543102", type: "FTE", status: "active", joining: "18/01/2026", email: "parthiv@suprans.in", department: "Sales" },
    { name: "Sahil Solanki", fatherName: "Solanki", relation: "Son", dob: "12/04/1999", phone: "9876543103", type: "FTE", status: "active", joining: "19/01/2026", email: "sahil.solanki@suprans.in", department: "Sales" },
    { name: "Tina", fatherName: "Kumar", relation: "Daughter", dob: "28/11/1995", phone: "9876543104", type: "FTE", status: "active", joining: "01/01/2026", email: "tina@suprans.in", department: "HR" },
    { name: "Amit", fatherName: "Verma", relation: "Son", dob: "14/07/1996", phone: "9876543105", type: "FTE", status: "active", joining: "05/01/2026", email: "amit@suprans.in", department: "Media" },
    { name: "Sanjay", fatherName: "Singh", relation: "Son", dob: "22/02/1997", phone: "9876543106", type: "FTE", status: "active", joining: "08/01/2026", email: "sanjay@suprans.in", department: "Events" },
    { name: "Lakshay Takkar", fatherName: "Takkar", relation: "Son", dob: "30/08/1998", phone: "9876543107", type: "FTE", status: "active", joining: "10/01/2026", email: "lakshay@suprans.in", department: "Events" },
    { name: "Priya", fatherName: "Sharma", relation: "Daughter", dob: "18/05/1997", phone: "9876543108", type: "FTE", status: "active", joining: "12/01/2026", email: "priya@suprans.in", department: "LLC Sales" },
    { name: "Rahul", fatherName: "Kumar", relation: "Son", dob: "25/09/1996", phone: "9876543109", type: "FTE", status: "active", joining: "14/01/2026", email: "rahul@suprans.in", department: "Faire" },
    { name: "Vikram", fatherName: "Reddy", relation: "Son", dob: "03/11/1995", phone: "9876543110", type: "FTE", status: "active", joining: "15/01/2026", email: "vikram@suprans.in", department: "Faire" },
  ];

  for (const emp of employeesData) {
    try {
      const linkedUserId = emp.email ? userMap.get(emp.email) : null;
      
      await db.insert(hrEmployees).values({
        name: emp.name,
        fatherName: emp.fatherName,
        relation: emp.relation,
        dateOfBirth: parseDate(emp.dob),
        phone: emp.phone,
        email: emp.email,
        employmentType: emp.type,
        department: emp.department,
        status: emp.status,
        dateOfJoining: parseDate(emp.joining),
        officeUnit: "Gurugram Office",
        role: emp.type === "FTE" ? "Executive" : "Intern",
        linkedUserId: linkedUserId || null,
        isSalesTeam: emp.department === "Sales",
      }).onConflictDoNothing();
      
      console.log(`Added: ${emp.name} (${emp.department})`);
    } catch (error) {
      console.error(`Error with ${emp.name}:`, error);
    }
  }

  console.log("\n✅ HR employees seeded successfully!");
}

seedHrEmployees()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
