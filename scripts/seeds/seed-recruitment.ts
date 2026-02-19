import { db } from "./db";
import { candidates, candidateCalls, hrTemplates } from "@shared/schema";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

// HR Templates for recruitment
const hrTemplatesData = [
  {
    name: "Interview Invitation - WhatsApp",
    category: "interview_invite",
    type: "whatsapp" as const,
    content: `Hi {{name}},

Hope you're doing well! This is {{hr_name}} from Suprans.

We reviewed your profile and would love to invite you for an interview for the {{position}} position.

Date: {{date}}
Time: {{time}}
Location: {{location}}

Please confirm your availability.

Looking forward to meeting you!

Best regards,
Suprans HR Team`,
    placeholders: ["name", "hr_name", "position", "date", "time", "location"],
    isActive: true,
  },
  {
    name: "Interview Invitation - Email",
    category: "interview_invite",
    type: "email" as const,
    subject: "Interview Invitation for {{position}} Position at Suprans",
    content: `Dear {{name}},

Thank you for your interest in joining our team at Suprans.

We are pleased to invite you for an interview for the {{position}} position.

Interview Details:
- Date: {{date}}
- Time: {{time}}
- Location: {{location}}
- Duration: Approximately 45 minutes

Please bring the following documents:
1. Updated resume
2. Government-issued ID proof
3. Recent passport-sized photograph

Kindly confirm your attendance by replying to this email.

We look forward to meeting you!

Best regards,
{{hr_name}}
HR Team, Suprans`,
    placeholders: ["name", "hr_name", "position", "date", "time", "location"],
    isActive: true,
  },
  {
    name: "Screening Call - WhatsApp",
    category: "screening",
    type: "whatsapp" as const,
    content: `Hi {{name}},

This is {{hr_name}} from Suprans HR Team.

We found your profile on {{source}} and we have an opening for {{position}}.

Are you currently looking for a job change?

If interested, please share:
1. Current CTC
2. Expected CTC
3. Notice period

Looking forward to your response!`,
    placeholders: ["name", "hr_name", "source", "position"],
    isActive: true,
  },
  {
    name: "Follow-up After No Response - WhatsApp",
    category: "follow_up",
    type: "whatsapp" as const,
    content: `Hi {{name}},

Hope you're doing well!

This is a gentle reminder about our previous conversation regarding the {{position}} opportunity at Suprans.

Would you still be interested in exploring this opportunity?

Please let me know your availability for a quick call.

Thank you!
{{hr_name}}`,
    placeholders: ["name", "hr_name", "position"],
    isActive: true,
  },
  {
    name: "Interview Reminder - WhatsApp",
    category: "follow_up",
    type: "whatsapp" as const,
    content: `Hi {{name}},

This is a friendly reminder about your interview scheduled for tomorrow:

Date: {{date}}
Time: {{time}}
Location: {{location}}

Please carry your original documents and arrive 15 minutes early.

If you have any questions, feel free to call us.

See you tomorrow!
Suprans HR Team`,
    placeholders: ["name", "date", "time", "location"],
    isActive: true,
  },
  {
    name: "Rejection - Polite",
    category: "rejection",
    type: "email" as const,
    subject: "Thank You for Your Interest in Suprans",
    content: `Dear {{name}},

Thank you for taking the time to interview with us for the {{position}} position at Suprans.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current requirements.

We were impressed with your background and encourage you to apply for future openings that match your skills and experience.

We wish you all the best in your career endeavors.

Best regards,
Suprans HR Team`,
    placeholders: ["name", "position"],
    isActive: true,
  },
  {
    name: "Offer Letter Introduction - WhatsApp",
    category: "offer_letter",
    type: "whatsapp" as const,
    content: `Hi {{name}},

Congratulations!

We're pleased to inform you that you have been selected for the {{position}} position at Suprans!

Your offer letter will be sent to your email shortly. Please review and respond within 3 working days.

Looking forward to having you on our team!

Best regards,
Suprans HR Team`,
    placeholders: ["name", "position"],
    isActive: true,
  },
  {
    name: "Document Request - WhatsApp",
    category: "document_request",
    type: "whatsapp" as const,
    content: `Hi {{name}},

As discussed, please share the following documents for your onboarding process:

1. Aadhar Card (front & back)
2. PAN Card
3. Educational certificates
4. Previous experience letters
5. Last 3 months salary slips
6. Bank passbook first page
7. Passport size photo

Please send scanned copies of all documents.

Thank you!
Suprans HR Team`,
    placeholders: ["name"],
    isActive: true,
  },
  {
    name: "Joining Reminder - WhatsApp",
    category: "joining_reminder",
    type: "whatsapp" as const,
    content: `Hi {{name}},

Welcome to Suprans!

Just a reminder about your joining date:

Date: {{date}}
Reporting Time: {{time}}
Location: {{location}}

Please bring all original documents for verification.

Looking forward to seeing you!

Best regards,
Suprans HR Team`,
    placeholders: ["name", "date", "time", "location"],
    isActive: true,
  },
  {
    name: "Onboarding Welcome - Email",
    category: "onboarding",
    type: "email" as const,
    subject: "Welcome to Suprans - Onboarding Information",
    content: `Dear {{name}},

Welcome to the Suprans family! We are excited to have you join us as {{position}}.

Your first day is scheduled for {{date}}. Please report at {{time}} to our office at {{location}}.

What to bring:
- All original documents for verification
- Bank account details for salary credit
- Emergency contact information

First week agenda:
- Day 1: Induction and team introduction
- Day 2-3: Department orientation
- Day 4-5: Process training

If you have any questions, please don't hesitate to reach out.

Looking forward to your successful journey with us!

Best regards,
Suprans HR Team`,
    placeholders: ["name", "position", "date", "time", "location"],
    isActive: true,
  },
];

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;
  
  // Handle DD-MMM-YYYY format like "26-Dec-2025"
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const months: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return null;
}

function normalizeCallStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'Connected': 'connected',
    'Not Connected': 'not_connected',
    'Busy': 'busy',
    'Switched Off': 'switched_off',
    'Wrong Number': 'wrong_number',
    'Not Answering': 'not_connected',
    'Out of Network': 'switched_off',
  };
  return statusMap[status] || 'not_connected';
}

function normalizeCallResponse(response: string): string | null {
  if (!response || response.trim() === "") return null;
  
  const responseMap: Record<string, string> = {
    'Interested': 'interested',
    'Not Interested': 'not_interested',
    'Maybe': 'maybe',
    'Interview Scheduled': 'interview_scheduled',
    'Rejected': 'rejected',
  };
  return responseMap[response] || null;
}

function determineStatus(callResponse: string | null): string {
  if (!callResponse) return 'new';
  
  switch (callResponse) {
    case 'interested':
      return 'interested';
    case 'interview_scheduled':
      return 'interview_scheduled';
    case 'not_interested':
    case 'rejected':
      return 'rejected';
    default:
      return 'contacted';
  }
}

// Simple CSV parser that handles quoted fields
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  fields.push(current.trim());
  return fields;
}

export async function seedRecruitmentData() {
  console.log("Seeding HR templates...");
  
  // Seed HR templates
  for (const template of hrTemplatesData) {
    await db.insert(hrTemplates).values({
      id: randomUUID(),
      ...template,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoNothing();
  }
  console.log(`Seeded ${hrTemplatesData.length} HR templates`);

  // Read and parse the CSV file
  const csvPath = path.join(process.cwd(), "attached_assets", "Recrutiment_From_Dec_-_Candidates_1769158451697.csv");
  
  if (!fs.existsSync(csvPath)) {
    console.log("CSV file not found, skipping candidate seeding");
    return;
  }

  console.log("Parsing candidates CSV...");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n").filter(line => line.trim());
  
  // Skip header
  const dataLines = lines.slice(1);
  
  let candidateCount = 0;
  let callCount = 0;

  for (const line of dataLines) {
    // Parse CSV line handling commas in quoted fields
    const fields = parseCSVLine(line);
    
    if (fields.length < 5) continue;
    
    const [sno, name, phone, source, appliedFor, profileUrl, cvUrl, callDate, callStatus, callResponse, callNotes, interviewDate] = fields;
    
    if (!name || !phone) continue;
    
    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) continue;
    
    const candidateId = randomUUID();
    const parsedCallDate = parseDate(callDate);
    const parsedInterviewDate = parseDate(interviewDate);
    const normalizedCallResponse = normalizeCallResponse(callResponse);
    const status = determineStatus(normalizedCallResponse);
    
    try {
      // Insert candidate
      await db.insert(candidates).values({
        id: candidateId,
        name: name,
        phone: cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10),
        email: null,
        source: source || 'Unknown',
        appliedFor: appliedFor || 'General',
        status: status,
        profileUrl: profileUrl || null,
        cvUrl: cvUrl || null,
        experience: null,
        currentSalary: null,
        expectedSalary: null,
        noticePeriod: null,
        skills: null,
        location: null,
        rating: null,
        notes: null,
        interviewDate: parsedInterviewDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();
      
      candidateCount++;
      
      // If there was a call, add it
      if (parsedCallDate && callStatus) {
        await db.insert(candidateCalls).values({
          id: randomUUID(),
          candidateId: candidateId,
          callType: 'invitation',
          callDate: parsedCallDate,
          callStatus: normalizeCallStatus(callStatus),
          callResponse: normalizedCallResponse,
          callNotes: callNotes || null,
          duration: null,
          calledBy: null,
          createdAt: new Date(),
        }).onConflictDoNothing();
        
        callCount++;
      }
    } catch (error) {
      console.error(`Error inserting candidate ${name}:`, error);
    }
  }
  
  console.log(`Seeded ${candidateCount} candidates with ${callCount} calls`);
}

// Run if called directly
if (import.meta.url.endsWith(process.argv[1])) {
  seedRecruitmentData()
    .then(() => {
      console.log("Seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding error:", error);
      process.exit(1);
    });
}
