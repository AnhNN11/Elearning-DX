import type { SupabaseClient, User } from "@supabase/supabase-js";
import type {
  AdminRole,
  AdminUser,
  Assessment,
  Certificate,
  Course,
  CourseAsset,
  CourseModule,
  Enrollment,
  LandingBlock,
  LandingBlockItem,
  Lesson,
  MentorBooking,
  Profile,
  Role,
} from "@/lib/types";

export type OrmClient = SupabaseClient;

export type AuthUser = User;

export type CourseAssetRow = {
  id: string;
  course_id: string;
  title: string;
  kind: CourseAsset["kind"];
  storage_bucket: string;
  storage_path: string;
  public_url: string;
  mime_type: string | null;
  file_size: number | null;
  position: number | null;
  created_at: string;
};

export type LessonRow = {
  id: string;
  slug: string;
  title: string;
  content_md: string | null;
  video_url: string | null;
  estimated_minutes: number | null;
  position: number | null;
  assessments?: AssessmentRow[];
};

export type ModuleRow = {
  id: string;
  title: string;
  position: number | null;
  lessons?: LessonRow[];
};

export type AssessmentRow = {
  id: string;
  type: "quiz" | "code";
  title: string;
  passing_score: number | null;
  position: number | null;
  questions?: {
    id: string;
    prompt: string;
    options: string[];
    correct_answer: { correctIndex?: number } | number;
    explanation: string | null;
  }[];
  code_exercises?: {
    id: string;
    function_name: string;
    prompt: string;
    starter_code: string;
    test_cases: { name: string; args: unknown[]; expected: unknown }[];
  }[];
};

export type CourseRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  level: Course["level"];
  duration_hours: number | null;
  published: boolean | null;
  accent: string | null;
  thumbnail_url: string | null;
  outcomes: string[] | null;
  course_assets?: CourseAssetRow[];
  modules?: ModuleRow[];
};

export type EnrollmentRow = {
  id: string;
  user_id: string;
  course_id: string;
  progress_percent: number | null;
  completed_at: string | null;
};

export type EnrollmentProgressRow = {
  user_id: string;
  progress_percent: number | null;
  status: "active" | "completed" | null;
};

export type CertificateRow = {
  id: string;
  certificate_no: string;
  issued_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
  courses: { title: string | null } | null;
};

export type MentorBookingRow = {
  id: string;
  full_name: string;
  email: string;
  mentor_name?: string | null;
  interview_role?: string | null;
  skills?: string[] | null;
  topic: string;
  level: string;
  preferred_time: string;
  note: string | null;
  status: string;
  created_at: string;
};

export type AdminUserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  status: "active" | "disabled" | null;
  created_at: string;
};

export type UserRoleRow = {
  user_id: string;
  role_id: string;
  roles: { slug: string; name: string } | { slug: string; name: string }[] | null;
};

export type RoleRow = {
  roles: { slug: string } | { slug: string }[] | null;
};

export type AdminRoleRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_system: boolean | null;
  created_at: string;
};

export type AppUserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string | null;
};

export type BlogPost = {
  slug: string;
  locale: "vi" | "en";
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  readTime: string;
  publishedAt: string;
  authorName: string;
  authorRole?: string;
  mentorName: string;
  sourceFileName?: string;
  coverImageUrl?: string;
  content: string[];
};

export type BlogPostRow = {
  slug: string;
  locale: "vi" | "en" | null;
  title: string;
  excerpt: string | null;
  category: string | null;
  tags: string[] | null;
  read_time: string | null;
  published_at: string | null;
  author_name: string | null;
  author_role: string | null;
  mentor_name: string | null;
  source_file_name: string | null;
  cover_image_url: string | null;
  content_md: string | null;
};

export type LandingBlockRow = {
  id: string;
  key: string;
  locale: "vi" | "en";
  eyebrow: string | null;
  title: string;
  description: string | null;
  cta_label: string | null;
  cta_href: string | null;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
  image_url: string | null;
  items: LandingBlockItem[] | null;
  published: boolean | null;
  position: number | null;
  updated_at: string;
};

export type InterviewQuestion = {
  id: string;
  category: string;
  level: string;
  question: string;
  prompt: string;
  answer: string;
  checklist: string[];
};

export type InterviewQuestionRow = {
  id: string;
  category: string | null;
  level: string | null;
  question: string;
  prompt_md?: string | null;
  prompt?: string | null;
  answer_md?: string | null;
  answer?: string | null;
  checklist_md?: string | null;
  checklist?: string[] | null;
};

export type CourseCreateInput = {
  title: string;
  slug: string;
  category: string;
  level: string;
  description: string;
  thumbnailUrl?: string;
  durationHours: number;
  outcomes: string[];
  accent: string;
};

export type CourseRecord = Pick<Course, "id" | "slug" | "title">;

export type CourseUpdateInput = CourseCreateInput;

export type LessonCreateInput = {
  courseId: string;
  moduleTitle: string;
  title: string;
  slug: string;
  content: string;
  videoUrl: string | null;
  estimatedMinutes: number;
};

export type LessonUpdateInput = {
  title: string;
  slug: string;
  content: string;
  videoUrl: string | null;
  estimatedMinutes: number;
};

export type MentorBookingCreateInput = {
  fullName: string;
  email: string;
  mentorName?: string;
  interviewRole?: string;
  skills?: string[];
  topic: string;
  level: string;
  preferredTime: string;
  note?: string;
};

export type BlogPostUpsertInput = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags?: string[];
  readTime: string;
  locale: "vi" | "en";
  authorName: string;
  authorRole?: string;
  mentorName: string;
  sourceFileName?: string;
  coverImageUrl?: string;
  content: string;
  published: boolean;
  createdBy: string;
};

export type LandingBlockUpsertInput = {
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
  updatedBy: string;
};

export type InterviewQuestionCreateInput = {
  category: string;
  level: string;
  role?: string;
  skills?: string[];
  question: string;
  prompt: string;
  answer: string;
  checklist: string;
  locale: "vi" | "en";
  published: boolean;
};

export type QuizSubmissionInput = {
  assessmentId: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
};

export type CodeSubmissionInput = {
  assessmentId: string;
  score: number;
  passed: boolean;
  code: string;
  results: unknown;
};

export type ProfileUpdateInput = {
  fullName: string;
  avatarUrl: string | null;
};

export type AdminUserAggregate = {
  users: AdminUserRow[];
  userRoles: UserRoleRow[];
  enrollments: EnrollmentProgressRow[];
};

export type MappedEntities = {
  adminRole: AdminRole;
  adminUser: AdminUser;
  assessment: Assessment;
  certificate: Certificate;
  course: Course;
  courseAsset: CourseAsset;
  courseModule: CourseModule;
  enrollment: Enrollment;
  landingBlock: LandingBlock;
  lesson: Lesson;
  mentorBooking: MentorBooking;
  profile: Profile;
  role: Role;
};

export const courseGraphSelect = `
  *,
  course_assets(*),
  modules(
    *,
    lessons(
      *,
      assessments(
        *,
        questions(*),
        code_exercises(*)
      )
    )
  )
`;

export const certificateSelect = "id,certificate_no,issued_at,profiles(full_name,email),courses(title)";
