export type Role = string;

export type Level = "Cơ bản" | "Trung cấp" | "Nâng cao";

export type AssessmentType = "quiz" | "code";

export type Profile = {
  id: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
  role: Role;
  roles: Role[];
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
  priceVnd: number;
  currency: string;
  published: boolean;
  accent: string;
  thumbnailUrl?: string;
  outcomes: string[];
  modules: CourseModule[];
  assets: CourseAsset[];
};

export type CourseAsset = {
  id: string;
  courseId: string;
  title: string;
  kind: "banner" | "document" | "source" | "slide" | "resource";
  storageBucket: string;
  storagePath: string;
  publicUrl: string;
  mimeType?: string;
  fileSize?: number;
  createdAt: string;
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  progressPercent: number;
  completedAt?: string;
};

export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "cancelled";

export type CoursePayment = {
  id: string;
  orderId: string;
  userId: string;
  courseId: string;
  courseSlug?: string;
  courseTitle?: string;
  amountVnd: number;
  currency: string;
  status: PaymentStatus;
  paymentContent: string;
  provider: string;
  providerPaymentId?: string;
  providerRaw?: unknown;
  bankCode?: string;
  bankAccount?: string;
  bankAccountName?: string;
  qrCode?: string;
  checkoutUrl?: string;
  qrImageUrl?: string;
  providerTransactionId?: string;
  referenceNumber?: string;
  paidAt?: string;
  expiresAt: string;
  createdAt: string;
};

export type Certificate = {
  id: string;
  certificateNo: string;
  userName: string;
  courseTitle: string;
  issuedAt: string;
};

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  roles: Role[];
  status: "active" | "disabled";
  createdAt: string;
  enrollmentCount: number;
  completedCourses: number;
  averageProgress: number;
};

export type AdminRole = {
  id: string;
  slug: Role;
  name: string;
  description?: string;
  isSystem: boolean;
  userCount: number;
  createdAt: string;
};

export type AdminDashboardMetrics = {
  courses: number;
  publishedCourses: number;
  lessons: number;
  users: number;
  activeEnrollments: number;
  certificates: number;
  bookings: number;
  blogPosts: number;
  interviewQuestions: number;
  submissions: number;
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

export type LandingBlockItem = {
  title: string;
  description?: string;
};

export type LandingBlock = {
  id: string;
  key: string;
  locale: "vi" | "en";
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageUrl?: string;
  items: LandingBlockItem[];
  published: boolean;
  position: number;
  updatedAt: string;
};
