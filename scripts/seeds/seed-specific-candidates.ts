import { db } from "./db";
import { candidates } from "@shared/schema";

interface CandidateData {
  name: string;
  phone: string;
  position: string;
  status: string;
  notes: string;
  location?: string;
  joiningDate?: string;
}

const hiredCandidates: CandidateData[] = [
  {
    name: "Harsh",
    phone: "8360788763",
    position: "Executive",
    status: "hired",
    location: "Gurugram Office",
    joiningDate: "2026-02-01",
    notes: "Accepted offer. Joining on 1 Feb 2026 at Gurugram Office."
  },
  {
    name: "Ishaan",
    phone: "8010369727",
    position: "Executive",
    status: "hired",
    location: "Gurugram Office",
    joiningDate: "2026-01-27",
    notes: "Accepted offer. Joining on 27 Jan 2026 at Gurugram Office."
  },
  {
    name: "Satish",
    phone: "7027745612",
    position: "Executive",
    status: "hired",
    location: "Rewari Office",
    joiningDate: "2026-01-23",
    notes: "Accepted offer. Joining on 23 Jan 2026 at Rewari Office."
  }
];

const offeredCandidates: CandidateData[] = [
  {
    name: "Vijay",
    phone: "9717869610",
    position: "Operation Manager",
    status: "rejected",
    notes: "Not interested. Joined another company."
  },
  {
    name: "Mahima Noor",
    phone: "9718149039",
    position: "Senior Sales Executive",
    status: "rejected",
    notes: "Got selected but not able to join."
  },
  {
    name: "Arsha",
    phone: "9315595350",
    position: "Senior Sales Executive",
    status: "on_hold",
    notes: "Offered 20-25k with work from home option. Not satisfied with salary."
  },
  {
    name: "Dhruv",
    phone: "9810770697",
    position: "Sales Executive",
    status: "on_hold",
    notes: "Having salary issue."
  },
  {
    name: "Vivan Gupta",
    phone: "8410708530",
    position: "Digital Marketing Executive",
    status: "on_hold",
    notes: "Not joining due to salary issue and location issue."
  },
  {
    name: "Amir Khan",
    phone: "9729884379",
    position: "E Commerce Executive",
    status: "offered",
    notes: "Will confirm trial date."
  },
  {
    name: "Chhavi",
    phone: "8077618446",
    position: "Sales Executive",
    status: "interview_scheduled",
    notes: "Coming for final round on 13 Jan."
  },
  {
    name: "Vipin",
    phone: "9589682509",
    position: "Operation Executive",
    status: "on_hold",
    notes: "Having salary issue."
  },
  {
    name: "Nishant",
    phone: "8512052731",
    position: "Accounts Executive",
    status: "offered",
    notes: "Good candidate."
  },
  {
    name: "Shalok",
    phone: "6387623381",
    position: "E Commerce Executive",
    status: "on_hold",
    notes: "Got selected but having location issue."
  },
  {
    name: "Ayush",
    phone: "7505601446",
    position: "Video Editor",
    status: "interview_scheduled",
    notes: "Coming for final round."
  }
];

export async function seedSpecificCandidates() {
  const allCandidates = [...hiredCandidates, ...offeredCandidates];
  let inserted = 0;
  let skipped = 0;

  for (const candidate of allCandidates) {
    try {
      await db.insert(candidates).values({
        name: candidate.name,
        phone: candidate.phone,
        appliedFor: candidate.position,
        source: "Manual Entry",
        status: candidate.status,
        location: candidate.location || null,
        notes: candidate.notes,
        rating: candidate.status === "hired" ? 5 : (candidate.status === "offered" ? 4 : 3),
        interviewDate: candidate.joiningDate ? new Date(candidate.joiningDate) : null,
      });
      inserted++;
      console.log(`Inserted: ${candidate.name} - ${candidate.position} (${candidate.status})`);
    } catch (error: any) {
      if (error.code === "23505") {
        skipped++;
        console.log(`Skipped (duplicate): ${candidate.name} - ${candidate.phone}`);
      } else {
        console.error(`Error inserting ${candidate.name}:`, error.message);
      }
    }
  }

  return { inserted, skipped, total: allCandidates.length };
}
