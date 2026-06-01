"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireUser } from "./auth";
import { getLesson } from "./data";
import { createClient } from "./supabase/server";
import { hasSupabaseEnv } from "./supabase/config";
import { getYouTubeVideoId } from "./youtube";

const completeLessonSchema = z.object({
  courseSlug: z.string().min(1),
  lessonSlug: z.string().min(1),
});

const enrollSchema = z.object({
  courseId: z.string().min(1),
  courseSlug: z.string().min(1),
});

const courseSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  category: z.string().min(2),
  level: z.string().min(2),
  description: z.string().min(10),
});

const optionalYouTubeUrlSchema = z
  .string()
  .trim()
  .transform((value) => (value ? value : null))
  .refine((value) => !value || Boolean(getYouTubeVideoId(value)), {
    message: "Link YouTube không hợp lệ",
  });

const lessonSchema = z.object({
  courseId: z.string().min(1),
  moduleTitle: z.string().min(2),
  title: z.string().min(2),
  slug: z.string().min(2),
  content: z.string().min(10),
  videoUrl: optionalYouTubeUrlSchema,
});

const lessonVideoSchema = z.object({
  courseId: z.string().min(1),
  courseSlug: z.string().min(1),
  lessonId: z.string().min(1),
  videoUrl: optionalYouTubeUrlSchema,
});

const mentorBookingSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  mentorName: z.string().min(2).optional(),
  interviewRole: z.string().min(2).optional(),
  skills: z.string().optional(),
  topic: z.string().min(2),
  level: z.string().min(2),
  preferredTime: z.string().min(2),
  note: z.string().max(500).optional(),
});

const blogPostSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  excerpt: z.string().min(10),
  category: z.string().min(2),
  tags: z.string().optional(),
  readTime: z.string().min(2),
  locale: z.enum(["vi", "en"]),
  content: z.string().min(10),
  published: z.union([z.string(), z.boolean()]).optional().transform(Boolean),
});

const interviewQuestionSchema = z.object({
  category: z.string().min(2),
  level: z.string().min(2),
  role: z.string().optional(),
  skills: z.string().optional(),
  question: z.string().min(5),
  prompt: z.string().min(5),
  answer: z.string().min(5),
  checklist: z.string().min(2),
  locale: z.enum(["vi", "en"]),
  published: z.union([z.string(), z.boolean()]).optional().transform(Boolean),
});

const quizSchema = z.object({
  assessmentId: z.string().min(1),
  score: z.coerce.number().min(0).max(100),
  passed: z.union([z.boolean(), z.string()]).transform((value) => value === true || value === "true"),
});

const codeSchema = quizSchema.extend({
  code: z.string().min(1),
  results: z.string().min(2),
});

const profileSchema = z.object({
  fullName: z.string().trim().min(2),
  avatarUrl: z
    .string()
    .trim()
    .transform((value) => (value ? value : null))
    .refine((value) => !value || z.string().url().safeParse(value).success, {
      message: "Avatar URL không hợp lệ",
    }),
});

export async function enrollCourseAction(formData: FormData) {
  const parsed = enrollSchema.parse({
    courseId: formData.get("courseId"),
    courseSlug: formData.get("courseSlug"),
  });

  if (hasSupabaseEnv) {
    const supabase = await createClient();
    if (!supabase) {
      redirect("/login");
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    await supabase.from("enrollments").upsert(
      {
        user_id: user.id,
        course_id: parsed.courseId,
        status: "active",
      },
      { onConflict: "user_id,course_id" },
    );
  }

  revalidatePath("/learn");
  redirect(`/learn/${parsed.courseSlug}`);
}

export async function createCourseAction(formData: FormData) {
  await requireAdmin();

  const parsed = courseSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    level: formData.get("level"),
    description: formData.get("description"),
  });

  if (hasSupabaseEnv) {
    const supabase = await createClient();
    if (!supabase) {
      redirect("/login");
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    await supabase.from("courses").insert({
      ...parsed,
      duration_hours: 1,
      published: false,
      created_by: user.id,
      outcomes: ["Hoàn thành nội dung khóa học", "Làm bài kiểm tra", "Nhận chứng chỉ"],
    });
  }

  revalidatePath("/admin/courses");
}

export async function createLessonAction(formData: FormData) {
  await requireAdmin();

  const parsed = lessonSchema.parse({
    courseId: formData.get("courseId"),
    moduleTitle: formData.get("moduleTitle"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    videoUrl: formData.get("videoUrl") ?? "",
  });

  if (hasSupabaseEnv) {
    const supabase = await createClient();
    if (!supabase) {
      redirect("/login");
    }

    const { data: moduleRow } = await supabase
      .from("modules")
      .insert({
        course_id: parsed.courseId,
        title: parsed.moduleTitle,
        position: 99,
      })
      .select("id")
      .single();

    if (moduleRow) {
      await supabase.from("lessons").insert({
        module_id: moduleRow.id,
        title: parsed.title,
        slug: parsed.slug,
        content_md: parsed.content,
        video_url: parsed.videoUrl,
        estimated_minutes: 15,
        position: 0,
      });
    }
  }

  revalidatePath(`/admin/courses/${parsed.courseId}`);
}

export async function updateLessonVideoAction(formData: FormData) {
  await requireAdmin();

  const parsed = lessonVideoSchema.parse({
    courseId: formData.get("courseId"),
    courseSlug: formData.get("courseSlug"),
    lessonId: formData.get("lessonId"),
    videoUrl: formData.get("videoUrl") ?? "",
  });

  if (hasSupabaseEnv) {
    const supabase = await createClient();
    if (!supabase) {
      redirect("/login");
    }

    await supabase
      .from("lessons")
      .update({ video_url: parsed.videoUrl })
      .eq("id", parsed.lessonId);
  }

  revalidatePath(`/admin/courses/${parsed.courseId}`);
  revalidatePath(`/learn/${parsed.courseSlug}`);
}

export async function bookMentorAction(formData: FormData) {
  const parsed = mentorBookingSchema.parse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    topic: formData.get("topic"),
    mentorName: formData.get("mentorName")?.toString() || undefined,
    interviewRole: formData.get("interviewRole")?.toString() || undefined,
    skills: formData.get("skills")?.toString() || undefined,
    level: formData.get("level"),
    preferredTime: formData.get("preferredTime"),
    note: formData.get("note")?.toString() || undefined,
  });

  if (hasSupabaseEnv) {
    const supabase = await createClient();

    if (supabase) {
      const { error } = await supabase.from("mock_interview_bookings").insert({
        full_name: parsed.fullName,
        email: parsed.email,
        mentor_name: parsed.mentorName ?? null,
        interview_role: parsed.interviewRole ?? null,
        skills: parsed.skills?.split(",").map((item) => item.trim()).filter(Boolean) ?? [],
        topic: parsed.topic,
        level: parsed.level,
        preferred_time: parsed.preferredTime,
        note: parsed.note ?? null,
        status: "new",
      });

      if (error) {
        await supabase.from("mentor_bookings").insert({
          full_name: parsed.fullName,
          email: parsed.email,
          topic: parsed.topic,
          level: parsed.level,
          preferred_time: parsed.preferredTime,
          note: parsed.note ?? null,
          status: "new",
        });
      }
    }
  }

  revalidatePath("/mentor-booking");
  redirect("/mentor-booking?booking=sent");
}

export async function createBlogPostAction(formData: FormData) {
  await requireAdmin();

  const parsed = blogPostSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    category: formData.get("category"),
    tags: formData.get("tags")?.toString() || "",
    readTime: formData.get("readTime"),
    locale: formData.get("locale"),
    content: formData.get("content"),
    published: formData.get("published") === "on",
  });

  if (hasSupabaseEnv) {
    const supabase = await createClient();
    if (!supabase) {
      redirect("/login");
    }

    await supabase.from("blog_posts").upsert(
      {
        title: parsed.title,
        slug: parsed.slug,
        excerpt: parsed.excerpt,
        category: parsed.category,
        tags: parsed.tags?.split(",").map((item) => item.trim()).filter(Boolean) ?? [],
        read_time: parsed.readTime,
        locale: parsed.locale,
        content_md: parsed.content,
        published: parsed.published,
        published_at: new Date().toISOString(),
      },
      { onConflict: "slug,locale" },
    );
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.slug}`);
  revalidatePath("/admin/blog");
}

export async function createInterviewQuestionAction(formData: FormData) {
  await requireAdmin();

  const parsed = interviewQuestionSchema.parse({
    category: formData.get("category"),
    level: formData.get("level"),
    role: formData.get("role")?.toString() || "",
    skills: formData.get("skills")?.toString() || "",
    question: formData.get("question"),
    prompt: formData.get("prompt"),
    answer: formData.get("answer"),
    checklist: formData.get("checklist"),
    locale: formData.get("locale"),
    published: formData.get("published") === "on",
  });

  if (hasSupabaseEnv) {
    const supabase = await createClient();
    if (!supabase) {
      redirect("/login");
    }

    await supabase.from("interview_questions").insert({
      category: parsed.category,
      level: parsed.level,
      role: parsed.role || null,
      skills: parsed.skills?.split(",").map((item) => item.trim()).filter(Boolean) ?? [],
      question: parsed.question,
      prompt_md: parsed.prompt,
      answer_md: parsed.answer,
      checklist_md: parsed.checklist,
      locale: parsed.locale,
      published: parsed.published,
    });
  }

  revalidatePath("/interview-practice");
  revalidatePath("/admin/interviews");
}

export async function completeLessonAction(formData: FormData) {
  const parsed = completeLessonSchema.parse({
    courseSlug: formData.get("courseSlug"),
    lessonSlug: formData.get("lessonSlug"),
  });

  const { course, lesson } = await getLesson(parsed.courseSlug, parsed.lessonSlug);

  if (hasSupabaseEnv && course && lesson) {
    const supabase = await createClient();
    if (!supabase) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    await supabase.from("lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );

    const lessonIds = course.modules.flatMap((item) => item.lessons.map((courseLesson) => courseLesson.id));
    const { data: completedRows } =
      lessonIds.length > 0
        ? await supabase
            .from("lesson_progress")
            .select("lesson_id")
            .eq("user_id", user.id)
            .eq("completed", true)
            .in("lesson_id", lessonIds)
        : { data: [] };
    const progressPercent =
      lessonIds.length === 0
        ? 0
        : Math.round(((completedRows?.length ?? 0) / lessonIds.length) * 100);

    await supabase.from("enrollments").upsert(
      {
        user_id: user.id,
        course_id: course.id,
        status: progressPercent >= 100 ? "completed" : "active",
        progress_percent: progressPercent,
        completed_at: progressPercent >= 100 ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,course_id" },
    );

    if (progressPercent >= 100) {
      await maybeIssueCertificate(user.id, course.id);
    }
  }

  revalidatePath(`/learn/${parsed.courseSlug}`);
}

export async function submitQuizAction(formData: FormData) {
  const parsed = quizSchema.parse({
    assessmentId: formData.get("assessmentId"),
    score: formData.get("score"),
    passed: formData.get("passed"),
  });

  if (hasSupabaseEnv) {
    const supabase = await createClient();
    if (!supabase) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("submissions").insert({
        user_id: user.id,
        assessment_id: parsed.assessmentId,
        score: parsed.score,
        passed: parsed.passed,
        answers: Object.fromEntries(formData.entries()),
      });
    }
  }

  revalidatePath("/learn");
}

export async function submitCodeAction(formData: FormData) {
  const parsed = codeSchema.parse({
    assessmentId: formData.get("assessmentId"),
    score: formData.get("score"),
    passed: formData.get("passed"),
    code: formData.get("code"),
    results: formData.get("results"),
  });

  if (hasSupabaseEnv) {
    const supabase = await createClient();
    if (!supabase) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("submissions").insert({
        user_id: user.id,
        assessment_id: parsed.assessmentId,
        score: parsed.score,
        passed: parsed.passed,
        code: parsed.code,
        test_results: JSON.parse(parsed.results) as unknown,
      });
    }
  }

  revalidatePath("/learn");
}

export async function updateProfileAction(formData: FormData) {
  const profile = await requireUser();
  const parsed = profileSchema.parse({
    fullName: formData.get("fullName"),
    avatarUrl: formData.get("avatarUrl") ?? "",
  });

  if (hasSupabaseEnv) {
    const supabase = await createClient();
    if (!supabase) {
      redirect("/login");
    }

    await supabase.auth.updateUser({
      data: {
        avatar_url: parsed.avatarUrl,
        full_name: parsed.fullName,
      },
    });

    await supabase
      .from("profiles")
      .update({
        avatar_url: parsed.avatarUrl,
        full_name: parsed.fullName,
      })
      .eq("id", profile.id);
  }

  revalidatePath("/profile");
  revalidatePath("/login");
  redirect("/profile?saved=1");
}

export async function linkGoogleAccountAction() {
  await requireUser();

  if (!hasSupabaseEnv) {
    redirect("/profile?account=demo");
  }

  const supabase = await createClient();
  if (!supabase) {
    redirect("/login");
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.linkIdentity({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/profile`,
    },
  });

  if (error || !data.url) {
    redirect("/profile?account=error");
  }

  redirect(data.url);
}

async function maybeIssueCertificate(userId: string, courseId: string) {
  const supabase = await createClient();
  if (!supabase) {
    return;
  }

  const certificateNo = `TECH-${new Date().getFullYear()}-${crypto
    .randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;

  await supabase.from("certificates").upsert(
    {
      user_id: userId,
      course_id: courseId,
      certificate_no: certificateNo,
      issued_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id" },
  );
}
