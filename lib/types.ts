export type Role = "student" | "admin";

export type Level = "Cơ bản" | "Trung cấp" | "Nâng cao";

export type AssessmentType = "quiz" | "code";

export type Profile = {
  id: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
  role: Role;
};

export type AccountIdentity = {
  id: string;
  provider: string;
  email?: string;
  createdAt?: string;
  lastSignInAt?: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type CodeTestCase = {
  name: string;
  args: unknown[];
  expected: unknown;
};

export type CodeExercise = {
  id: string;
  functionName: string;
  prompt: string;
  starterCode: string;
  testCases: CodeTestCase[];
};

export type Assessment = {
  id: string;
  type: AssessmentType;
  title: string;
  passingScore: number;
  questions?: QuizQuestion[];
  exercise?: CodeExercise;
};

export type Lesson = {
  id: string;
  slug: string;
  title: string;
  content: string;
  videoUrl?: string;
  estimatedMinutes: number;
  assessment?: Assessment;
};

export type CourseModule = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: Level;
  durationHours: number;
  published: boolean;
  accent: string;
  outcomes: string[];
  modules: CourseModule[];
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  progressPercent: number;
  completedAt?: string;
};

export type Certificate = {
  id: string;
  certificateNo: string;
  userName: string;
  courseTitle: string;
  issuedAt: string;
};

export type MentorBooking = {
  id: string;
  fullName: string;
  email: string;
  topic: string;
  level: string;
  preferredTime: string;
  note?: string;
  status: string;
  createdAt: string;
};

export type SubmissionResult = {
  score: number;
  passed: boolean;
  message: string;
};
