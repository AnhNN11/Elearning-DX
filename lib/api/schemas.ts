import { z } from "zod";
import { getYouTubeVideoId } from "@/lib/youtube";

export const completeLessonSchema = z.object({
  courseSlug: z.string().min(1),
  lessonSlug: z.string().min(1),
});

export const enrollSchema = z.object({
  courseId: z.string().min(1),
  courseSlug: z.string().min(1),
});

export const courseSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  category: z.string().min(2),
  level: z.string().min(2),
  description: z.string().min(10),
  thumbnailUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine((value) => !value || z.string().url().safeParse(value).success, {
      message: "Link ảnh không hợp lệ",
    }),
  durationHours: z.coerce.number().min(0.5).max(500),
  outcomes: z.string().transform((value) =>
    value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean),
  ),
  accent: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/),
});

export const optionalYouTubeUrlSchema = z
  .string()
  .trim()
  .transform((value) => (value ? value : null))
  .refine((value) => !value || Boolean(getYouTubeVideoId(value)), {
    message: "Link YouTube không hợp lệ",
  });

export const lessonSchema = z.object({
  courseId: z.string().min(1),
  moduleTitle: z.string().min(2),
  title: z.string().min(2),
  slug: z.string().min(2),
  content: z.string().min(10),
  videoUrl: optionalYouTubeUrlSchema,
  estimatedMinutes: z.coerce.number().int().min(1).max(600),
});

export const lessonVideoSchema = z.object({
  courseId: z.string().min(1),
  courseSlug: z.string().min(1),
  lessonId: z.string().min(1),
  videoUrl: optionalYouTubeUrlSchema,
});

export const lessonUpdateSchema = z.object({
  courseId: z.string().min(1),
  courseSlug: z.string().min(1),
  lessonId: z.string().min(1),
  title: z.string().min(2),
  slug: z.string().min(2),
  content: z.string().min(10),
  videoUrl: optionalYouTubeUrlSchema,
  estimatedMinutes: z.coerce.number().int().min(1).max(600),
});

export const coursePublishSchema = z.object({
  courseId: z.string().min(1),
  courseSlug: z.string().min(1),
  published: z.boolean(),
});

export const courseBannerSchema = z.object({
  courseId: z.string().min(1),
  courseSlug: z.string().min(1),
  title: z.string().min(2),
});

export const courseAssetSchema = z.object({
  courseId: z.string().min(1),
  courseSlug: z.string().min(1),
  title: z.string().min(2),
  kind: z.enum(["document", "source", "slide", "resource"]),
});

export const userRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.string().trim().regex(/^[a-z][a-z0-9_]*$/),
});

export const roleSchema = z.object({
  slug: z.string().trim().regex(/^[a-z][a-z0-9_]*$/),
  name: z.string().trim().min(2),
  description: z.string().trim().optional(),
});

export const bookingStatusSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum(["new", "contacted", "confirmed", "completed", "cancelled"]),
});

export const mentorBookingSchema = z.object({
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

export const blogPostSchema = z.object({
  title: z.string().trim().min(2, "cần ít nhất 2 ký tự"),
  slug: z.string().trim().min(2, "cần ít nhất 2 ký tự"),
  excerpt: z.string().trim().min(10, "cần ít nhất 10 ký tự"),
  category: z.string().trim().min(2, "cần ít nhất 2 ký tự"),
  coverImageUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine((value) => !value || z.string().url().safeParse(value).success, {
      message: "Link cover image không hợp lệ",
    }),
  tags: z.string().optional(),
  readTime: z.string().optional(),
  locale: z.enum(["vi", "en"]),
  authorName: z.string().trim().min(2, "cần ít nhất 2 ký tự"),
  authorRole: z.string().optional(),
  mentorName: z.string().trim().min(2, "cần ít nhất 2 ký tự"),
  sourceFileName: z.string().optional(),
  content: z.string().trim().min(10, "cần ít nhất 10 ký tự"),
  published: z.boolean(),
});

export const landingBlockSchema = z.object({
  key: z.string().trim().min(2).regex(/^[a-z][a-z0-9_-]*$/),
  locale: z.enum(["vi", "en"]),
  eyebrow: z.string().trim().optional(),
  title: z.string().trim().min(2),
  description: z.string().trim().optional(),
  ctaLabel: z.string().trim().optional(),
  ctaHref: z.string().trim().optional(),
  secondaryCtaLabel: z.string().trim().optional(),
  secondaryCtaHref: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  items: z.string().optional().transform((value) =>
    (value ?? "")
      .split(/\r?\n/)
      .map((line) => {
        const [title, ...descriptionParts] = line.split("|");
        return {
          title: title?.trim() ?? "",
          description: descriptionParts.join("|").trim() || undefined,
        };
      })
      .filter((item) => item.title),
  ),
  position: z.coerce.number().int().min(0).max(999),
  published: z.boolean(),
});

export const interviewQuestionSchema = z.object({
  category: z.string().min(2),
  level: z.string().min(2),
  role: z.string().optional(),
  skills: z.string().optional(),
  question: z.string().min(5),
  prompt: z.string().min(5),
  answer: z.string().min(5),
  checklist: z.string().min(2),
  locale: z.enum(["vi", "en"]),
  published: z.boolean(),
});

export const quizSchema = z.object({
  assessmentId: z.string().min(1),
  score: z.coerce.number().min(0).max(100),
  passed: z.union([z.boolean(), z.string()]).transform((value) => value === true || value === "true"),
});

export const codeSchema = quizSchema.extend({
  code: z.string().min(1),
  results: z.string().min(2),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2),
  avatarUrl: z
    .string()
    .trim()
    .transform((value) => (value ? value : null))
    .refine((value) => !value || z.string().url().safeParse(value).success, {
      message: "Avatar URL không hợp lệ",
    }),
});
