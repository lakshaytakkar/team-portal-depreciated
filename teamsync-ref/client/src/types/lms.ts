export interface LmsCourseDetail {
  id: string;
  title: string;
  category: string;
  status: "published" | "draft";
  instructor: string;
  instructorAvatar?: string;
  description: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  language: string;
  enrolled: number;
  completionRate: number;
  rating: number;
  reviewCount: number;
  lessonsCount: number;
  lastUpdated: string;
  price: number;
  modules: LmsModule[];
  students: LmsStudent[];
  reviews: LmsReview[];
}

export interface LmsModule {
  id: string;
  title: string;
  description: string;
  lessonsCount: number;
  duration: string;
  lessons: LmsLesson[];
}

export interface LmsLesson {
  id: string;
  title: string;
  type: "video" | "quiz" | "article" | "exercise";
  duration: string;
  isPreview: boolean;
}

export interface LmsStudent {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  enrolledDate: string;
  progress: number;
  lastActive: string;
  lessonsCompleted: number;
  totalLessons: number;
}

export interface LmsReview {
  id: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}
