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
  Lesson,
  MentorBooking,
  Profile,
  Role,
} from "@/lib/types";
import type {
  AdminRoleRow,
  AdminUserAggregate,
  AdminUserRow,
  AppUserRow,
  AssessmentRow,
  BlogPost,
  BlogPostRow,
  CertificateRow,
  CourseAssetRow,
  CourseRow,
  EnrollmentProgressRow,
  EnrollmentRow,
  InterviewQuestion,
  InterviewQuestionRow,
  LandingBlockRow,
  MentorBookingRow,
  ProfileRow,
  RoleRow,
} from "./shared";

export function byPosition<T extends { position?: number | null }>(a: T, b: T) {
  return (a.position ?? 0) - (b.position ?? 0);
}

export function normalizeRole(value?: string | null): Role | null {
  return value?.trim() || null;
}

export function extractRoleSlugs(rows?: RoleRow[] | null): Role[] {
  const roles =
    rows
      ?.flatMap((row) => (Array.isArray(row.roles) ? row.roles : row.roles ? [row.roles] : []))
      .map((role) => normalizeRole(role.slug))
      .filter((role): role is Role => Boolean(role)) ?? [];

  return Array.from(new Set(roles));
}

export function mapAssessment(row: AssessmentRow): Assessment {
  const assessment: Assessment = {
    id: row.id,
    type: row.type,
    title: row.title,
    passingScore: row.passing_score ?? 70,
  };

  if (row.type === "quiz") {
    assessment.questions =
      row.questions?.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        options: question.options,
        correctIndex:
          typeof question.correct_answer === "number"
            ? question.correct_answer
            : question.correct_answer.correctIndex ?? 0,
        explanation: question.explanation ?? "",
      })) ?? [];
  }

  if (row.type === "code" && row.code_exercises?.[0]) {
    const exercise = row.code_exercises[0];
    assessment.exercise = {
      id: exercise.id,
      functionName: exercise.function_name,
      prompt: exercise.prompt,
      starterCode: exercise.starter_code,
      testCases: exercise.test_cases ?? [],
    };
  }

  return assessment;
}

export function mapCourseAsset(row: CourseAssetRow): CourseAsset {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    kind: row.kind,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    mimeType: row.mime_type ?? undefined,
    fileSize: row.file_size ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapCourse(row: CourseRow): Course {
  const assets = (row.course_assets ?? []).sort(byPosition).map(mapCourseAsset);
  const bannerAsset = assets.find((asset) => asset.kind === "banner");

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    category: row.category,
    level: row.level,
    durationHours: row.duration_hours ?? 0,
    published: row.published ?? false,
    accent: row.accent ?? "#075bbb",
    thumbnailUrl: row.thumbnail_url ?? bannerAsset?.publicUrl,
    outcomes: row.outcomes ?? [],
    assets,
    modules:
      row.modules?.sort(byPosition).map((item): CourseModule => ({
        id: item.id,
        title: item.title,
        lessons:
          item.lessons?.sort(byPosition).map((lesson): Lesson => ({
            id: lesson.id,
            slug: lesson.slug,
            title: lesson.title,
            content: lesson.content_md ?? "",
            videoUrl: lesson.video_url ?? undefined,
            estimatedMinutes: lesson.estimated_minutes ?? 0,
            assessment: lesson.assessments?.sort(byPosition)[0]
              ? mapAssessment(lesson.assessments.sort(byPosition)[0])
              : undefined,
          })) ?? [],
      })) ?? [],
  };
}

export function mapEnrollment(row: EnrollmentRow): Enrollment {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    progressPercent: row.progress_percent ?? 0,
    completedAt: row.completed_at ?? undefined,
  };
}

export function mapCertificate(row: CertificateRow): Certificate {
  return {
    id: row.id,
    certificateNo: row.certificate_no,
    userName: row.profiles?.full_name ?? row.profiles?.email ?? "Learner",
    courseTitle: row.courses?.title ?? "Course",
    issuedAt: row.issued_at,
  };
}

export function mapMentorBooking(row: MentorBookingRow): MentorBooking {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    topic: row.interview_role ? `${row.topic} · ${row.interview_role}` : row.topic,
    level: row.level,
    preferredTime: row.mentor_name ? `${row.preferred_time} · ${row.mentor_name}` : row.preferred_time,
    note: row.note ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapAdminRole(row: AdminRoleRow, userCount: number): AdminRole | null {
  const role = normalizeRole(row.slug);

  if (!role) {
    return null;
  }

  return {
    id: row.id,
    slug: role,
    name: row.name,
    description: row.description ?? undefined,
    isSystem: row.is_system ?? false,
    userCount,
    createdAt: row.created_at,
  };
}

export function mapAdminUsers({ users, userRoles, enrollments }: AdminUserAggregate): AdminUser[] {
  const rolesByUser = new Map<string, Role[]>();
  for (const row of userRoles) {
    const roleItems = Array.isArray(row.roles) ? row.roles : row.roles ? [row.roles] : [];
    const normalizedRoles = roleItems
      .map((role) => normalizeRole(role.slug))
      .filter((role): role is Role => Boolean(role));
    const current = rolesByUser.get(row.user_id) ?? [];
    rolesByUser.set(row.user_id, Array.from(new Set([...current, ...normalizedRoles])));
  }

  const enrollmentsByUser = new Map<string, EnrollmentProgressRow[]>();
  for (const enrollment of enrollments) {
    const current = enrollmentsByUser.get(enrollment.user_id) ?? [];
    current.push(enrollment);
    enrollmentsByUser.set(enrollment.user_id, current);
  }

  return users.map((row: AdminUserRow) => {
    const userEnrollments = enrollmentsByUser.get(row.id) ?? [];
    const roles = rolesByUser.get(row.id) ?? ["student"];
    const primaryRole = roles.includes("admin") ? "admin" : roles[0] ?? "student";
    const progressTotal = userEnrollments.reduce((total, item) => total + (item.progress_percent ?? 0), 0);

    return {
      id: row.id,
      fullName: row.full_name ?? row.email ?? "Learner",
      email: row.email ?? "",
      role: primaryRole,
      roles,
      status: row.status ?? "active",
      createdAt: row.created_at,
      enrollmentCount: userEnrollments.length,
      completedCourses: userEnrollments.filter((item) => item.status === "completed").length,
      averageProgress: userEnrollments.length ? Math.round(progressTotal / userEnrollments.length) : 0,
    };
  });
}

export function mapProfileFromAppUser(userId: string, authEmail: string | undefined, row: AppUserRow, roles: Role[]): Profile {
  return {
    id: userId,
    fullName: row.full_name ?? authEmail ?? "Learner",
    email: row.email ?? authEmail,
    avatarUrl: row.avatar_url ?? undefined,
    role: roles.includes("admin") ? "admin" : roles[0] ?? "student",
    roles: roles.length ? roles : ["student"],
  };
}

export function mapProfileFromProfileRow(userId: string, authEmail: string | undefined, row?: ProfileRow | null): Profile {
  const fallbackRole = normalizeRole(row?.role) ?? "student";

  return {
    id: userId,
    fullName: row?.full_name ?? authEmail ?? "Learner",
    email: row?.email ?? authEmail,
    avatarUrl: row?.avatar_url ?? undefined,
    role: fallbackRole,
    roles: [fallbackRole],
  };
}

export function mapBlogPost(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    category: row.category ?? "Engineering",
    tags: row.tags ?? [],
    readTime: row.read_time ?? "5 phút",
    publishedAt: row.published_at ?? new Date().toISOString(),
    authorName: row.author_name ?? row.mentor_name ?? "DolphinX Mentor",
    authorRole: row.author_role ?? undefined,
    mentorName: row.mentor_name ?? row.author_name ?? "DolphinX Mentor",
    sourceFileName: row.source_file_name ?? undefined,
    content: (row.content_md ?? "").split(/\n{2,}/).filter(Boolean),
  };
}

export function mapLandingBlock(row: LandingBlockRow): LandingBlock {
  return {
    id: row.id,
    key: row.key,
    locale: row.locale,
    eyebrow: row.eyebrow ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    ctaLabel: row.cta_label ?? undefined,
    ctaHref: row.cta_href ?? undefined,
    secondaryCtaLabel: row.secondary_cta_label ?? undefined,
    secondaryCtaHref: row.secondary_cta_href ?? undefined,
    imageUrl: row.image_url ?? undefined,
    items: row.items ?? [],
    published: row.published ?? false,
    position: row.position ?? 0,
    updatedAt: row.updated_at,
  };
}

export function mapInterviewQuestion(row: InterviewQuestionRow): InterviewQuestion {
  return {
    id: row.id,
    category: row.category ?? "General",
    level: row.level ?? "Cơ bản",
    question: row.question,
    prompt: row.prompt_md ?? row.prompt ?? "",
    answer: row.answer_md ?? row.answer ?? "",
    checklist: row.checklist_md
      ? row.checklist_md
          .split("\n")
          .map((item) => item.replace(/^[-*]\s*/, "").trim())
          .filter(Boolean)
      : row.checklist ?? [],
  };
}
