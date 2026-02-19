import { db } from "./db";
import { employees, candidates } from "@shared/schema";
import { eq } from "drizzle-orm";

interface EmployeeData {
  name: string;
  fatherName: string;
  relation: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  employeeType: string;
  salary: string;
  hasPF: boolean;
  hasESIC: boolean;
  panCard: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  status: string;
  joiningDate: string;
  lastWorkingDay?: string;
}

const employeesData: EmployeeData[] = [
  {
    name: "Love Kumar",
    fatherName: "Raj Kumar",
    relation: "Son",
    dateOfBirth: "18/08/2003",
    phone: "9643906583",
    address: "",
    employeeType: "Internship",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "MQVPK7770G",
    bankName: "Punjab & Sind Bank",
    accountNumber: "05361000074938",
    ifscCode: "PSIB0000536",
    status: "active",
    joiningDate: "09/07/2025"
  },
  {
    name: "Sahil",
    fatherName: "Hariom",
    relation: "Son",
    dateOfBirth: "26/01/2004",
    phone: "9812852757",
    address: "",
    employeeType: "Internship",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "PSVPS8938B",
    bankName: "The Panipat Urban Co-Operative Bank Ltd.",
    accountNumber: "4001020656",
    ifscCode: "YESB0PUCB04",
    status: "active",
    joiningDate: "09/07/2025"
  },
  {
    name: "Mudassir Imam",
    fatherName: "Zafar Imam",
    relation: "Son",
    dateOfBirth: "25/11/2003",
    phone: "9742362489",
    address: "",
    employeeType: "Internship",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "ANZP10269B",
    bankName: "HDFC Bank",
    accountNumber: "4331000086060",
    ifscCode: "HDFC0000433",
    status: "resigned",
    joiningDate: "09/07/2025"
  },
  {
    name: "Karishma Karayat",
    fatherName: "Ram Singh",
    relation: "Daughter",
    dateOfBirth: "21/03/2007",
    phone: "9897155116",
    address: "",
    employeeType: "Internship",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "Airtel Payment Bank",
    accountNumber: "9897155116",
    ifscCode: "AIRP0000001",
    status: "active",
    joiningDate: "21/07/2025"
  },
  {
    name: "Disha Malhotra",
    fatherName: "Prem Malhotra",
    relation: "Daughter",
    dateOfBirth: "22/05/2005",
    phone: "7042303051",
    address: "",
    employeeType: "Internship",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "State Bank Of India",
    accountNumber: "43494907312",
    ifscCode: "SBIN0011551",
    status: "resigned",
    joiningDate: "01/08/2025"
  },
  {
    name: "Kushagr Singh Bais",
    fatherName: "Prawal Pratap Singh",
    relation: "Son",
    dateOfBirth: "15/08/2001",
    phone: "9599745147",
    address: "",
    employeeType: "Internship",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "ESFPB5034N",
    bankName: "Kotak Mahindra Bank",
    accountNumber: "6313404207",
    ifscCode: "KKBK0005028",
    status: "active",
    joiningDate: "04/08/2025",
    lastWorkingDay: "06/09/2025"
  },
  {
    name: "Rudraksh Sharma",
    fatherName: "Jai Prakash Sharma",
    relation: "Son",
    dateOfBirth: "24/01/2003",
    phone: "8585977525",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "PBHPS9006K",
    bankName: "Kotak Mahindra Bank",
    accountNumber: "6446597456",
    ifscCode: "KKBK0004622",
    status: "active",
    joiningDate: "07/07/2025"
  },
  {
    name: "Aditya Bairagi",
    fatherName: "Shiv Kumar",
    relation: "Son",
    dateOfBirth: "01/06/2001",
    phone: "8800991161",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "GLPPB7317R",
    bankName: "Kotak Mahindra Bank",
    accountNumber: "2546445932",
    ifscCode: "KKBK0000193",
    status: "active",
    joiningDate: "23/07/2025"
  },
  {
    name: "Parveen Bhardwaj",
    fatherName: "",
    relation: "",
    dateOfBirth: "",
    phone: "8742049468",
    address: "",
    employeeType: "",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "GNIPB8228J",
    bankName: "State Bank Of India",
    accountNumber: "35147173818",
    ifscCode: "SBIN0021274",
    status: "resigned",
    joiningDate: ""
  },
  {
    name: "Simran",
    fatherName: "Ram Saran",
    relation: "Daughter",
    dateOfBirth: "21/03/2004",
    phone: "7393973404",
    address: "",
    employeeType: "Internship",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "OJXPS3823M",
    bankName: "Union Bank Of India",
    accountNumber: "533902050001019",
    ifscCode: "UBIN0553395",
    status: "active",
    joiningDate: "04/08/2025"
  },
  {
    name: "Isha Raj",
    fatherName: "",
    relation: "",
    dateOfBirth: "",
    phone: "9354806036",
    address: "",
    employeeType: "",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "BSBPR0128Q",
    bankName: "Bank Of Baroda",
    accountNumber: "98750100000933",
    ifscCode: "BARB0DBSHER",
    status: "resigned",
    joiningDate: "04/08/2025"
  },
  {
    name: "Neetu Kumari",
    fatherName: "Gyan Chand",
    relation: "Daughter",
    dateOfBirth: "29/01/2000",
    phone: "7413997101",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "KBMPK6695A",
    bankName: "State Bank Of India",
    accountNumber: "61165820986",
    ifscCode: "SBIN0031386",
    status: "active",
    joiningDate: "18/08/2025"
  },
  {
    name: "Akansha Panday",
    fatherName: "Sanjay Panday",
    relation: "Daughter",
    dateOfBirth: "25/11/2001",
    phone: "6284846470",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "GHYPP4348P",
    bankName: "Punjab National Bank",
    accountNumber: "7295000100007128",
    ifscCode: "PUNB0729500",
    status: "active",
    joiningDate: "11/08/2025"
  },
  {
    name: "Jasmina Bibi",
    fatherName: "Azizul Biswa",
    relation: "Daughter",
    dateOfBirth: "03/02/1995",
    phone: "7797373489",
    address: "",
    employeeType: "Maid",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "CGKPB2095L",
    bankName: "State Bank Of India",
    accountNumber: "35719012503",
    ifscCode: "SBIN0006853",
    status: "active",
    joiningDate: "01/08/2025"
  },
  {
    name: "Shivam Singh",
    fatherName: "Babu Lal Singh",
    relation: "Son",
    dateOfBirth: "13/08/2002",
    phone: "8791409458",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "NNLPS1578A",
    bankName: "State Bank Of India",
    accountNumber: "43679934803",
    ifscCode: "SBIN0000717",
    status: "active",
    joiningDate: "23/08/2025"
  },
  {
    name: "Himanshu Panday",
    fatherName: "Naval Kishor Panday",
    relation: "Son",
    dateOfBirth: "18/07/1997",
    phone: "9956609923",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "CYGPP1029L",
    bankName: "HDFC Bank",
    accountNumber: "50100262973756",
    ifscCode: "HDFC0000280",
    status: "active",
    joiningDate: "25/08/2025"
  },
  {
    name: "Prem",
    fatherName: "Deepak Sharma",
    relation: "Son",
    dateOfBirth: "04/01/2002",
    phone: "7404985868",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "Axis Bank",
    accountNumber: "922010031529077",
    ifscCode: "UTIB0003537",
    status: "active",
    joiningDate: "01/09/2025"
  },
  {
    name: "Rajesh Bhatt",
    fatherName: "Tara Dutt Bhatt",
    relation: "Son",
    dateOfBirth: "01/08/2001",
    phone: "7900547390",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "IDFC First Bank",
    accountNumber: "10065425481",
    ifscCode: "IDFB0020131",
    status: "active",
    joiningDate: "11/09/2025"
  },
  {
    name: "Prachi Kumari",
    fatherName: "Puran Singh",
    relation: "Daughter",
    dateOfBirth: "03/07/2006",
    phone: "9899287209",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "State Bank Of India",
    accountNumber: "43155192208",
    ifscCode: "SBIN0016446",
    status: "active",
    joiningDate: "18/09/2025"
  },
  {
    name: "Abhijeet Sharma",
    fatherName: "Inderjeet",
    relation: "Son",
    dateOfBirth: "09/10/2001",
    phone: "8860346704",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "HDFC Bank",
    accountNumber: "50100463391311",
    ifscCode: "HDFC0003667",
    status: "active",
    joiningDate: "03/10/2025"
  },
  {
    name: "Abhinandan",
    fatherName: "Suresh Kumar",
    relation: "Son",
    dateOfBirth: "25/10/1999",
    phone: "8130249937",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "State Bank Of India",
    accountNumber: "39220910862",
    ifscCode: "SBIN0061203",
    status: "active",
    joiningDate: "03/10/2025"
  },
  {
    name: "Ayush Mishra",
    fatherName: "Rajeep Kumar",
    relation: "Son",
    dateOfBirth: "08/10/2002",
    phone: "8803771260",
    address: "",
    employeeType: "Intern",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "Bank Of Baroda",
    accountNumber: "45310100002327",
    ifscCode: "BARB0KATHUA",
    status: "active",
    joiningDate: "01/10/2025"
  },
  {
    name: "Babita Mehta",
    fatherName: "Bijender Mehta",
    relation: "Daughter",
    dateOfBirth: "23/05/2003",
    phone: "9625546735",
    address: "",
    employeeType: "Intern",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "Kotak Mahindra Bank",
    accountNumber: "1846767638",
    ifscCode: "KKBK0000216",
    status: "active",
    joiningDate: "10/10/2025"
  },
  {
    name: "Yash Kumar",
    fatherName: "Kanwar Singh Yadav",
    relation: "Son",
    dateOfBirth: "10/12/2001",
    phone: "9783366576",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "Bank Of Baroda",
    accountNumber: "45428100002400",
    ifscCode: "BARB0BHIWAD",
    status: "active",
    joiningDate: "29/10/2025"
  },
  {
    name: "Ayaan Khastagir",
    fatherName: "Tapas Khastagir",
    relation: "Son",
    dateOfBirth: "14/01/2005",
    phone: "9810609469",
    address: "",
    employeeType: "Intern",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "HDFC Bank",
    accountNumber: "50100769448468",
    ifscCode: "HDFC0004437",
    status: "active",
    joiningDate: "23/10/2025"
  },
  {
    name: "Sumit Thakur",
    fatherName: "Sushil Kumar",
    relation: "Son",
    dateOfBirth: "26/08/2002",
    phone: "9877978889",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "State Bank Of India",
    accountNumber: "37802435824",
    ifscCode: "SBIN0017984",
    status: "active",
    joiningDate: "19/11/2025"
  },
  {
    name: "Naveen Singh",
    fatherName: "Gopal Singh Rawat",
    relation: "Son",
    dateOfBirth: "17/05/2003",
    phone: "9891367044",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "HDFC Bank",
    accountNumber: "50100779682480",
    ifscCode: "HDFC0001067",
    status: "active",
    joiningDate: "01/12/2025"
  },
  {
    name: "Punit",
    fatherName: "Yeshvir",
    relation: "Son",
    dateOfBirth: "25/12/2004",
    phone: "9728087600",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "Punjab National Bank",
    accountNumber: "2240001700107770",
    ifscCode: "PUNB0224000",
    status: "active",
    joiningDate: "17/12/2025"
  },
  {
    name: "Bharti",
    fatherName: "Yadav",
    relation: "Daughter",
    dateOfBirth: "07/03/2002",
    phone: "8287366961",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "Union Bank Of India",
    accountNumber: "598902130000882",
    ifscCode: "UBIN0559890",
    status: "active",
    joiningDate: "10/01/2026"
  },
  {
    name: "Gaurav",
    fatherName: "Gupta",
    relation: "Son",
    dateOfBirth: "09/08/1998",
    phone: "8447000466",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "HDFC Bank",
    accountNumber: "50100334008131",
    ifscCode: "HDFC0000485",
    status: "active",
    joiningDate: "17/01/2026"
  },
  {
    name: "Sunny",
    fatherName: "Yadav",
    relation: "Son",
    dateOfBirth: "22/07/1998",
    phone: "7983074951",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "Canara Bank",
    accountNumber: "3287101008708",
    ifscCode: "CNRB0003287",
    status: "active",
    joiningDate: "12/01/2026"
  },
  {
    name: "Akshay",
    fatherName: "Kumar",
    relation: "Son",
    dateOfBirth: "15/12/1991",
    phone: "8252149197",
    address: "",
    employeeType: "FTE",
    salary: "",
    hasPF: false,
    hasESIC: false,
    panCard: "",
    bankName: "State Bank Of India",
    accountNumber: "86028103880",
    ifscCode: "SBIN0001389",
    status: "active",
    joiningDate: "13/01/2026"
  }
];

function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');
}

function getRoleFromType(employeeType: string): string {
  const type = employeeType.toLowerCase();
  if (type.includes('intern')) return 'Intern';
  if (type === 'maid') return 'Support Staff';
  if (type === 'fte') return 'Full-Time Employee';
  return 'Employee';
}

export async function seedEmployeesHR() {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let candidatesLinked = 0;

  for (const emp of employeesData) {
    const phone = normalizePhone(emp.phone);
    
    try {
      // Check if employee with this phone already exists
      const existing = await db.select().from(employees).where(eq(employees.phone, phone)).limit(1);
      
      if (existing.length > 0) {
        // Update existing employee with bank details
        await db.update(employees)
          .set({
            fatherName: emp.fatherName || null,
            relation: emp.relation || null,
            dateOfBirth: emp.dateOfBirth || null,
            employeeType: emp.employeeType || null,
            hasPF: emp.hasPF,
            hasESIC: emp.hasESIC,
            panCard: emp.panCard || null,
            bankName: emp.bankName || null,
            accountNumber: emp.accountNumber || null,
            ifscCode: emp.ifscCode || null,
            employmentStatus: emp.status,
            joiningDate: emp.joiningDate || null,
            lastWorkingDay: emp.lastWorkingDay || null,
            isActive: emp.status === 'active',
          })
          .where(eq(employees.phone, phone));
        updated++;
        console.log(`Updated: ${emp.name} (${phone})`);
      } else {
        // Insert new employee
        await db.insert(employees).values({
          name: emp.name,
          role: getRoleFromType(emp.employeeType),
          phone: phone,
          whatsapp: `91${phone}`,
          isActive: emp.status === 'active',
          displayOrder: 0,
          fatherName: emp.fatherName || null,
          relation: emp.relation || null,
          dateOfBirth: emp.dateOfBirth || null,
          employeeType: emp.employeeType || null,
          hasPF: emp.hasPF,
          hasESIC: emp.hasESIC,
          panCard: emp.panCard || null,
          bankName: emp.bankName || null,
          accountNumber: emp.accountNumber || null,
          ifscCode: emp.ifscCode || null,
          employmentStatus: emp.status,
          joiningDate: emp.joiningDate || null,
          lastWorkingDay: emp.lastWorkingDay || null,
        });
        inserted++;
        console.log(`Inserted: ${emp.name} (${phone})`);
      }

      // Try to link to a hired candidate by matching phone number
      const matchingCandidate = await db.select()
        .from(candidates)
        .where(eq(candidates.phone, phone))
        .limit(1);
      
      if (matchingCandidate.length > 0) {
        // Get the employee ID
        const employeeRecord = await db.select()
          .from(employees)
          .where(eq(employees.phone, phone))
          .limit(1);
        
        if (employeeRecord.length > 0) {
          // Update employee with candidate link
          await db.update(employees)
            .set({ candidateId: matchingCandidate[0].id })
            .where(eq(employees.id, employeeRecord[0].id));
          
          // Update candidate status to hired
          await db.update(candidates)
            .set({ status: 'hired' })
            .where(eq(candidates.id, matchingCandidate[0].id));
          
          candidatesLinked++;
          console.log(`Linked candidate: ${matchingCandidate[0].name} -> Employee: ${emp.name}`);
        }
      }
    } catch (error: any) {
      console.error(`Error processing ${emp.name}:`, error.message);
      skipped++;
    }
  }

  return { inserted, updated, skipped, candidatesLinked, total: employeesData.length };
}
