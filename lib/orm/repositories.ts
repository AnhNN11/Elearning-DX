import type {
  AdminDashboardMetrics,
  AdminRole,
  AdminUser,
  Certificate,
  Course,
  Enrollment,
  MentorBooking,
  Profile,
} from "@/lib/types";
import {
  certificateSelect,
  courseGraphSelect,
  type AdminRoleRow,
  type AdminUserRow,
  type AppUserRow,
  type AuthUser,
  type BlogPost,
  type BlogPostRow,
  type BlogPostUpsertInput,
  type CertificateRow,
  type CodeSubmissionInput,
  type CourseCreateInput,
  type CourseRecord,
  type CourseRow,
  type CourseUpdateInput,
  type EnrollmentProgressRow,
  type EnrollmentRow,
  type InterviewQuestion,
  type InterviewQuestionCreateInput,
  type InterviewQuestionRow,
  type LandingBlockRow,
  type LandingBlockUpsertInput,
  type LessonCreateInput,
  type LessonUpdateInput,
  type MentorBookingCreateInput,
  type MentorBookingRow,
  type OrmClient,
  type ProfileRow,
  type ProfileUpdateInput,
  type QuizSubmissionInput,
  type RoleRow,
  type UserRoleRow,
} from "./shared";
import {
  extractRoleSlugs,
  mapAdminRole,
  mapAdminUsers,
  mapBlogPost,
  mapCertificate,
  mapCourse,
  mapEnrollment,
  mapInterviewQuestion,
  mapLandingBlock,
  mapMentorBooking,
  mapProfileFromAppUser,
  mapProfileFromProfileRow,
} from "./mappers";

function assertData<T>(data: T | null, error: unknown): T {
  if (error) {
    throw error;
  }

  if (data === null) {
    throw new Error("Supabase không trả về dữ liệu.");
  }

  return data;
}

export class CoursesRepository {
  constructor(private readonly supabase: OrmClient) {}

  async list(includeDrafts = false): Promise<Course[]> {
    let query = this.supabase
      .from("courses")
      .select(courseGraphSelect)
      .order("created_at", { ascending: false });

    if (!includeDrafts) {
      query = query.eq("published", true);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return (data as CourseRow[]).map(mapCourse);
  }

  async findBySlug(slug: string, includeDrafts = false): Promise<Course | null> {
    let query = this.supabase
      .from("courses")
      .select(courseGraphSelect)
      .eq("slug", slug);

    if (!includeDrafts) {
      query = query.eq("published", true);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapCourse(data as CourseRow);
  }

  async create(input: CourseCreateInput, createdBy: string): Promise<CourseRecord> {
    const { data, error } = await this.supabase
      .from("courses")
      .insert({
        title: input.title,
        slug: input.slug,
        category: input.category,
        level: input.level,
        description: input.description,
        duration_hours: input.durationHours,
        accent: input.accent,
        published: false,
        created_by: createdBy,
        outcomes: input.outcomes,
      })
      .select("id,slug,title")
      .single();

    return assertData(data as CourseRecord | null, error);
  }

  async update(courseId: string, input: CourseUpdateInput) {
    const { error } = await this.supabase
      .from("courses")
      .update({
        title: input.title,
        slug: input.slug,
        category: input.category,
        level: input.level,
        description: input.description,
        duration_hours: input.durationHours,
        outcomes: input.outcomes,
        accent: input.accent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);

    if (error) {
      throw error;
    }
  }

  async setPublished(courseId: string, published: boolean) {
    const { error } = await this.supabase
      .from("courses")
      .update({ published, updated_at: new Date().toISOString() })
      .eq("id", courseId);

    if (error) {
      throw error;
    }
  }

  async updateThumbnail(courseId: string, thumbnailUrl: string) {
    const { error } = await this.supabase
      .from("courses")
      .update({ thumbnail_url: thumbnailUrl, updated_at: new Date().toISOString() })
      .eq("id", courseId);

    if (error) {
      throw error;
    }
  }

  async createAsset(input: {
    courseId: string;
    title: string;
    kind: string;
    storageBucket: string;
    storagePath: string;
    publicUrl: string;
    mimeType: string;
    fileSize: number;
    createdBy: string;
  }) {
    const { error } = await this.supabase.from("course_assets").insert({
      course_id: input.courseId,
      title: input.title,
      kind: input.kind,
      storage_bucket: input.storageBucket,
      storage_path: input.storagePath,
      public_url: input.publicUrl,
      mime_type: input.mimeType,
      file_size: input.fileSize,
      created_by: input.createdBy,
    });

    if (error) {
      throw error;
    }
  }

  async createLesson(input: LessonCreateInput) {
    const { data: moduleRow, error: moduleError } = await this.supabase
      .from("modules")
      .insert({
        course_id: input.courseId,
        title: input.moduleTitle,
        position: 99,
      })
      .select("id")
      .single();

    if (moduleError) {
      throw moduleError;
    }

    const { data: lesson, error: lessonError } = await this.supabase
      .from("lessons")
      .insert({
        module_id: moduleRow.id,
        title: input.title,
        slug: input.slug,
        content_md: input.content,
        video_url: input.videoUrl,
        estimated_minutes: input.estimatedMinutes,
        position: 0,
      })
      .select("id,slug")
      .single();

    return assertData(lesson, lessonError);
  }

  async updateLesson(lessonId: string, input: LessonUpdateInput) {
    const { error } = await this.supabase
      .from("lessons")
      .update({
        title: input.title,
        slug: input.slug,
        content_md: input.content,
        video_url: input.videoUrl,
        estimated_minutes: input.estimatedMinutes,
      })
      .eq("id", lessonId);

    if (error) {
      throw error;
    }
  }

  async updateLessonVideo(lessonId: string, videoUrl: string | null) {
    const { error } = await this.supabase
      .from("lessons")
      .update({ video_url: videoUrl })
      .eq("id", lessonId);

    if (error) {
      throw error;
    }
  }
}

export class LearningRepository {
  constructor(private readonly supabase: OrmClient) {}

  async enroll(userId: string, courseId: string) {
    const { error } = await this.supabase.from("enrollments").upsert(
      {
        user_id: userId,
        course_id: courseId,
        status: "active",
      },
      { onConflict: "user_id,course_id" },
    );

    if (error) {
      throw error;
    }
  }

  async listEnrollmentsByUser(userId: string): Promise<Enrollment[]> {
    const { data, error } = await this.supabase
      .from("enrollments")
      .select("id,user_id,course_id,progress_percent,completed_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return (data as EnrollmentRow[]).map(mapEnrollment);
  }

  async completeLesson(userId: string, course: Course, lessonId: string) {
    const { error: progressError } = await this.supabase.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );

    if (progressError) {
      throw progressError;
    }

    const lessonIds = course.modules.flatMap((item) => item.lessons.map((courseLesson) => courseLesson.id));
    const { data: completedRows, error: completedError } =
      lessonIds.length > 0
        ? await this.supabase
            .from("lesson_progress")
            .select("lesson_id")
            .eq("user_id", userId)
            .eq("completed", true)
            .in("lesson_id", lessonIds)
        : { data: [], error: null };

    if (completedError) {
      throw completedError;
    }

    const progressPercent =
      lessonIds.length === 0 ? 0 : Math.round(((completedRows?.length ?? 0) / lessonIds.length) * 100);

    const { error: enrollmentError } = await this.supabase.from("enrollments").upsert(
      {
        user_id: userId,
        course_id: course.id,
        status: progressPercent >= 100 ? "completed" : "active",
        progress_percent: progressPercent,
        completed_at: progressPercent >= 100 ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,course_id" },
    );

    if (enrollmentError) {
      throw enrollmentError;
    }

    if (progressPercent >= 100) {
      await new CertificatesRepository(this.supabase).issueOnce(userId, course.id);
    }

    return progressPercent;
  }

  async submitQuiz(userId: string, input: QuizSubmissionInput) {
    const { data, error } = await this.supabase
      .from("submissions")
      .insert({
        user_id: userId,
        assessment_id: input.assessmentId,
        score: input.score,
        passed: input.passed,
        answers: input.answers,
      })
      .select("id")
      .single();

    return assertData(data, error);
  }

  async submitCode(userId: string, input: CodeSubmissionInput) {
    const { data, error } = await this.supabase
      .from("submissions")
      .insert({
        user_id: userId,
        assessment_id: input.assessmentId,
        score: input.score,
        passed: input.passed,
        code: input.code,
        test_results: input.results,
      })
      .select("id")
      .single();

    return assertData(data, error);
  }
}

export class CertificatesRepository {
  constructor(private readonly supabase: OrmClient) {}

  async list(): Promise<Certificate[]> {
    const { data, error } = await this.supabase
      .from("certificates")
      .select(certificateSelect)
      .order("issued_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return (data as unknown as CertificateRow[]).map(mapCertificate);
  }

  async listByUser(userId: string): Promise<Certificate[]> {
    const { data, error } = await this.supabase
      .from("certificates")
      .select(certificateSelect)
      .eq("user_id", userId)
      .order("issued_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return (data as unknown as CertificateRow[]).map(mapCertificate);
  }

  async find(id: string): Promise<Certificate | null> {
    const { data, error } = await this.supabase
      .from("certificates")
      .select(certificateSelect)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapCertificate(data as unknown as CertificateRow);
  }

  async issueOnce(userId: string, courseId: string) {
    const certificateNo = `TECH-${new Date().getFullYear()}-${crypto
      .randomUUID()
      .slice(0, 8)
      .toUpperCase()}`;

    const { error } = await this.supabase.from("certificates").upsert(
      {
        user_id: userId,
        course_id: courseId,
        certificate_no: certificateNo,
        issued_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_id" },
    );

    if (error) {
      throw error;
    }
  }
}

export class UsersRepository {
  constructor(private readonly supabase: OrmClient) {}

  async profileForAuthUser(user: AuthUser): Promise<Profile> {
    const { data: appUser, error: userError } = await this.supabase
      .from("users")
      .select("id, full_name, email, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    const { data: roleRows } = await this.supabase
      .from("user_roles")
      .select("roles(slug)")
      .eq("user_id", user.id);

    const roles = extractRoleSlugs(roleRows as RoleRow[] | null);

    if (!userError && appUser) {
      return mapProfileFromAppUser(user.id, user.email, appUser as AppUserRow, roles);
    }

    const { data } = await this.supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role")
      .eq("id", user.id)
      .maybeSingle();

    return mapProfileFromProfileRow(user.id, user.email, data as ProfileRow | null);
  }

  async listAdminUsers(): Promise<AdminUser[]> {
    const { data: users, error } = await this.supabase
      .from("users")
      .select("id,full_name,email,status,created_at")
      .order("created_at", { ascending: false });

    if (error || !users) {
      return [];
    }

    const userIds = users.map((user) => user.id);
    const [{ data: userRoles }, { data: enrollments }] = await Promise.all([
      userIds.length
        ? this.supabase.from("user_roles").select("user_id,role_id,roles(slug,name)").in("user_id", userIds)
        : Promise.resolve({ data: [] }),
      userIds.length
        ? this.supabase.from("enrollments").select("user_id,progress_percent,status").in("user_id", userIds)
        : Promise.resolve({ data: [] }),
    ]);

    return mapAdminUsers({
      users: users as AdminUserRow[],
      userRoles: (userRoles ?? []) as UserRoleRow[],
      enrollments: (enrollments ?? []) as EnrollmentProgressRow[],
    });
  }

  async listRoles(): Promise<AdminRole[]> {
    const [{ data: roles, error }, { data: userRoles }] = await Promise.all([
      this.supabase.from("roles").select("id,slug,name,description,is_system,created_at").order("slug"),
      this.supabase.from("user_roles").select("role_id"),
    ]);

    if (error || !roles) {
      return [];
    }

    const counts = new Map<string, number>();
    for (const item of (userRoles ?? []) as { role_id: string }[]) {
      counts.set(item.role_id, (counts.get(item.role_id) ?? 0) + 1);
    }

    return (roles as AdminRoleRow[])
      .map((row) => mapAdminRole(row, counts.get(row.id) ?? 0))
      .filter((role): role is AdminRole => Boolean(role));
  }

  async upsertRole(input: { slug: string; name: string; description?: string | null }) {
    const { data, error } = await this.supabase
      .from("roles")
      .upsert(
        {
          slug: input.slug,
          name: input.name,
          description: input.description || null,
          is_system: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" },
      )
      .select("id,slug,name")
      .single();

    return assertData(data, error);
  }

  async assignSingleRole(userId: string, roleSlug: string, assignedBy: string) {
    const { data: role, error: roleError } = await this.supabase
      .from("roles")
      .select("id,slug")
      .eq("slug", roleSlug)
      .single();

    if (roleError || !role) {
      throw roleError ?? new Error("Role không tồn tại.");
    }

    const { error: deleteError } = await this.supabase.from("user_roles").delete().eq("user_id", userId);

    if (deleteError) {
      throw deleteError;
    }

    const { error: insertError } = await this.supabase.from("user_roles").insert({
      user_id: userId,
      role_id: role.id,
      assigned_by: assignedBy,
    });

    if (insertError) {
      throw insertError;
    }

    const profileRole = roleSlug === "admin" ? "admin" : "student";
    const { error: profileError } = await this.supabase
      .from("profiles")
      .update({ role: profileRole })
      .eq("id", userId);

    if (profileError) {
      throw profileError;
    }
  }

  async updateProfile(userId: string, email: string | null, input: ProfileUpdateInput) {
    const { error: authError } = await this.supabase.auth.updateUser({
      data: {
        avatar_url: input.avatarUrl,
        full_name: input.fullName,
      },
    });

    if (authError) {
      throw authError;
    }

    const { error: profileError } = await this.supabase
      .from("profiles")
      .update({
        avatar_url: input.avatarUrl,
        email,
        full_name: input.fullName,
      })
      .eq("id", userId);

    if (profileError) {
      throw profileError;
    }

    const { error: appUserError } = await this.supabase
      .from("users")
      .update({
        avatar_url: input.avatarUrl,
        email,
        full_name: input.fullName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (appUserError) {
      throw appUserError;
    }
  }
}

export class BookingsRepository {
  constructor(private readonly supabase: OrmClient) {}

  async listMentorBookings(): Promise<MentorBooking[]> {
    const { data, error } = await this.supabase
      .from("mock_interview_bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return (data as MentorBookingRow[]).map(mapMentorBooking);
  }

  async createMentorBooking(input: MentorBookingCreateInput) {
    const { data, error } = await this.supabase
      .from("mock_interview_bookings")
      .insert({
        full_name: input.fullName,
        email: input.email,
        mentor_name: input.mentorName ?? null,
        interview_role: input.interviewRole ?? null,
        skills: input.skills ?? [],
        topic: input.topic,
        level: input.level,
        preferred_time: input.preferredTime,
        note: input.note ?? null,
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      const { data: fallbackBooking, error: fallbackError } = await this.supabase
        .from("mentor_bookings")
        .insert({
          full_name: input.fullName,
          email: input.email,
          topic: input.topic,
          level: input.level,
          preferred_time: input.preferredTime,
          note: input.note ?? null,
          status: "new",
        })
        .select("id")
        .single();

      return assertData(fallbackBooking, fallbackError);
    }

    return assertData(data, error);
  }

  async updateStatus(bookingId: string, status: string) {
    const { error } = await this.supabase
      .from("mock_interview_bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      throw error;
    }
  }
}

export class ContentRepository {
  constructor(private readonly supabase: OrmClient) {}

  async listLandingBlocks(locale: "vi" | "en", includeDrafts = false) {
    let query = this.supabase
      .from("landing_blocks")
      .select("*")
      .eq("locale", locale)
      .order("position", { ascending: true });

    if (!includeDrafts) {
      query = query.eq("published", true);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return (data as LandingBlockRow[]).map(mapLandingBlock);
  }

  async upsertLandingBlock(input: LandingBlockUpsertInput) {
    const { data, error } = await this.supabase
      .from("landing_blocks")
      .upsert(
        {
          key: input.key,
          locale: input.locale,
          eyebrow: input.eyebrow || null,
          title: input.title,
          description: input.description || null,
          cta_label: input.ctaLabel || null,
          cta_href: input.ctaHref || null,
          secondary_cta_label: input.secondaryCtaLabel || null,
          secondary_cta_href: input.secondaryCtaHref || null,
          image_url: input.imageUrl || null,
          items: input.items,
          published: input.published,
          position: input.position,
          updated_by: input.updatedBy,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key,locale" },
      )
      .select("id,key,locale")
      .single();

    return assertData(data, error);
  }

  async listBlogPosts(locale: "vi" | "en", includeDrafts = false): Promise<BlogPost[]> {
    let query = this.supabase
      .from("blog_posts")
      .select("slug,title,excerpt,category,tags,read_time,published_at,author_name,author_role,mentor_name,source_file_name,content_md")
      .eq("locale", locale)
      .order("published_at", { ascending: false });

    if (!includeDrafts) {
      query = query.eq("published", true);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return (data as BlogPostRow[]).map(mapBlogPost);
  }

  async upsertBlogPost(input: BlogPostUpsertInput) {
    const { data, error } = await this.supabase
      .from("blog_posts")
      .upsert(
        {
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt,
          category: input.category,
          tags: input.tags ?? [],
          read_time: input.readTime,
          locale: input.locale,
          author_name: input.authorName,
          author_role: input.authorRole || null,
          mentor_name: input.mentorName,
          source_file_name: input.sourceFileName || null,
          content_md: input.content,
          published: input.published,
          published_at: new Date().toISOString(),
          created_by: input.createdBy,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug,locale" },
      )
      .select("slug,locale")
      .single();

    return assertData(data, error);
  }

  async listInterviewQuestions(locale: "vi" | "en", includeDrafts = false): Promise<InterviewQuestion[]> {
    let query = this.supabase
      .from("interview_questions")
      .select("id,category,level,question,prompt_md,answer_md,checklist_md")
      .eq("locale", locale)
      .order("position", { ascending: true });

    if (!includeDrafts) {
      query = query.eq("published", true);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return (data as InterviewQuestionRow[]).map(mapInterviewQuestion);
  }

  async createInterviewQuestion(input: InterviewQuestionCreateInput) {
    const { data, error } = await this.supabase
      .from("interview_questions")
      .insert({
        category: input.category,
        level: input.level,
        role: input.role || null,
        skills: input.skills ?? [],
        question: input.question,
        prompt_md: input.prompt,
        answer_md: input.answer,
        checklist_md: input.checklist,
        locale: input.locale,
        published: input.published,
      })
      .select("id")
      .single();

    return assertData(data, error);
  }
}

export class AdminRepository {
  constructor(private readonly supabase: OrmClient) {}

  async countRows(table: string, equality?: Record<string, string | boolean>) {
    let query = this.supabase.from(table).select("id", { count: "exact", head: true });
    for (const [key, value] of Object.entries(equality ?? {})) {
      query = query.eq(key, value);
    }

    const { count, error } = await query;

    if (error) {
      return 0;
    }

    return count ?? 0;
  }

  async dashboardMetrics(): Promise<AdminDashboardMetrics> {
    const [
      courses,
      publishedCourses,
      lessons,
      users,
      activeEnrollments,
      certificates,
      bookings,
      blogPosts,
      interviewQuestions,
      submissions,
    ] = await Promise.all([
      this.countRows("courses"),
      this.countRows("courses", { published: true }),
      this.countRows("lessons"),
      this.countRows("users"),
      this.countRows("enrollments", { status: "active" }),
      this.countRows("certificates"),
      this.countRows("mock_interview_bookings"),
      this.countRows("blog_posts"),
      this.countRows("interview_questions"),
      this.countRows("submissions"),
    ]);

    return {
      courses,
      publishedCourses,
      lessons,
      users,
      activeEnrollments,
      certificates,
      bookings,
      blogPosts,
      interviewQuestions,
      submissions,
    };
  }
}
