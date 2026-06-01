import { cache } from "react";
import { createOrm } from "./orm";
import type {
  AdminDashboardMetrics,
  AdminRole,
  AdminUser,
  Certificate,
  Course,
  Enrollment,
  Lesson,
  MentorBooking,
} from "./types";

export const getCourses = cache(async (includeDrafts = false): Promise<Course[]> => {
  const orm = await createOrm();
  return orm ? orm.courses.list(includeDrafts) : [];
});

export async function getCourse(slug: string) {
  const orm = await createOrm();
  return orm ? orm.courses.findBySlug(slug) : null;
}

export async function getLesson(courseSlug: string, lessonSlug: string) {
  const course = await getCourse(courseSlug);
  const lesson =
    course?.modules.flatMap((item) => item.lessons).find((item) => item.slug === lessonSlug) ?? null;

  return { course, lesson };
}

export function getCourseLessonCount(course: Course) {
  return course.modules.reduce((total, item) => total + item.lessons.length, 0);
}

export function getNextLesson(course: Course, lesson: Lesson) {
  const lessons = course.modules.flatMap((item) => item.lessons);
  const index = lessons.findIndex((item) => item.id === lesson.id);
  return lessons[index + 1] ?? null;
}

export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
  const orm = await createOrm();
  return orm ? orm.learning.listEnrollmentsByUser(userId) : [];
}

export async function getCertificates(): Promise<Certificate[]> {
  const orm = await createOrm();
  return orm ? orm.certificates.list() : [];
}

export async function getUserCertificates(userId: string): Promise<Certificate[]> {
  const orm = await createOrm();
  return orm ? orm.certificates.listByUser(userId) : [];
}

export async function getCertificate(id: string) {
  const orm = await createOrm();
  return orm ? orm.certificates.find(id) : null;
}

export async function getMentorBookings(): Promise<MentorBooking[]> {
  const orm = await createOrm();
  return orm ? orm.bookings.listMentorBookings() : [];
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const orm = await createOrm();
  return orm ? orm.users.listAdminUsers() : [];
}

export async function getAdminRoles(): Promise<AdminRole[]> {
  const orm = await createOrm();
  return orm ? orm.users.listRoles() : [];
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const orm = await createOrm();

  if (!orm) {
    return {
      courses: 0,
      publishedCourses: 0,
      lessons: 0,
      users: 0,
      activeEnrollments: 0,
      certificates: 0,
      bookings: 0,
      blogPosts: 0,
      interviewQuestions: 0,
      submissions: 0,
    };
  }

  return orm.admin.dashboardMetrics();
}
