export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "contract" | "internship";
  status: "active" | "paused" | "closed" | "draft";
  priority: "high" | "medium" | "low";
  openings: number;
  filled: number;
  postedDate: string;
  targetDate: string;
  description: string;
  requirements: string[];
  hiringManager: string;
  salaryMin: number;
  salaryMax: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  currentRole: string;
  currentCompany: string;
  experience: number;
  skills: string[];
  source: "linkedin" | "referral" | "website" | "job-board" | "direct";
  stage: "applied" | "screening" | "interview" | "evaluation" | "offer" | "hired" | "rejected";
  appliedJobId: string;
  appliedJobTitle: string;
  resumeUrl: string;
  addedDate: string;
  rating: number;
  notes: string;
}

export interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  appliedDate: string;
  stage: "applied" | "phone-screen" | "technical" | "cultural" | "final" | "offer" | "rejected";
  currentInterviewer: string;
  lastActivity: string;
}

export interface InterviewSchedule {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  interviewers: string[];
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  type: "phone" | "video" | "onsite" | "technical" | "panel";
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  meetLink: string;
  feedback: string;
}

export interface EvaluationCriteria {
  name: string;
  rating: number;
  comment: string;
}

export interface Evaluation {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  interviewerId: string;
  interviewerName: string;
  jobTitle?: string;
  criteria: EvaluationCriteria[];
  overallRating: number;
  recommendation: "strong-yes" | "yes" | "maybe" | "no" | "strong-no";
  submittedDate: string;
  notes: string;
}

export interface Offer {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  offeredSalary: number;
  joiningDate: string;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  expiryDate: string;
  sentDate: string;
}
