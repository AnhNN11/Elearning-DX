import { cache } from "react";
import { createClient } from "./supabase/server";
import type { Assessment, Certificate, Course, CourseModule, Lesson, MentorBooking } from "./types";

type LessonRow = {
  id: string;
  slug: string;
  title: string;
  content_md: string | null;
  video_url: string | null;
  estimated_minutes: number | null;
  assessments?: AssessmentRow[];
};

type ModuleRow = {
  id: string;
  title: string;
  lessons?: LessonRow[];
};

type AssessmentRow = {
  id: string;
  type: "quiz" | "code";
  title: string;
  passing_score: number | null;
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

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  level: Course["level"];
  duration_hours: number | null;
  published: boolean | null;
  accent: string | null;
  outcomes: string[] | null;
  modules?: ModuleRow[];
};

type MentorBookingRow = {
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

const quiz = (
  id: string,
  title: string,
  prompt: string,
  options: string[],
  correctIndex: number,
): Assessment => ({
  id,
  type: "quiz",
  title,
  passingScore: 70,
  questions: [
    {
      id: `${id}-q1`,
      prompt,
      options,
      correctIndex,
      explanation: "Chọn đáp án thể hiện đúng tư duy cốt lõi của bài học.",
    },
  ],
});

const code = (
  id: string,
  title: string,
  functionName: string,
  prompt: string,
  starterCode: string,
  testCases: { name: string; args: unknown[]; expected: unknown }[],
): Assessment => ({
  id,
  type: "code",
  title,
  passingScore: 100,
  exercise: {
    id: `${id}-exercise`,
    functionName,
    prompt,
    starterCode,
    testCases,
  },
});

const courseModule = (id: string, title: string, lessons: Lesson[]): CourseModule => ({
  id,
  title,
  lessons,
});

export const seedCourses: Course[] = [
  {
    id: "course-next-supabase",
    slug: "nextjs-supabase-fullstack",
    title: "Next.js & Supabase Fullstack",
    description:
      "Xây dựng ứng dụng web hiện đại với App Router, Supabase Auth, database và dashboard quản trị.",
    category: "Web Development",
    level: "Trung cấp",
    durationHours: 12,
    published: true,
    accent: "#075bbb",
    outcomes: ["Thiết kế App Router", "Kết nối Supabase", "Triển khai auth và RLS"],
    modules: [
      courseModule("m-next-1", "Nền tảng ứng dụng", [
        {
          id: "l-next-1",
          slug: "app-router",
          title: "App Router và layout",
          estimatedMinutes: 22,
          content:
            "App Router tổ chức route bằng thư mục, `layout.tsx` giữ phần khung dùng chung và `page.tsx` render nội dung từng màn hình.",
          assessment: quiz(
            "a-next-router",
            "Kiểm tra App Router",
            "File nào tạo UI cho một URL cụ thể trong App Router?",
            ["layout.tsx", "page.tsx", "proxy.ts", "globals.css"],
            1,
          ),
        },
        {
          id: "l-next-2",
          slug: "server-actions",
          title: "Server Actions an toàn",
          estimatedMinutes: 28,
          content:
            "Server Actions chạy trên server và phải kiểm tra quyền bên trong action vì action có thể bị gọi trực tiếp qua POST.",
        },
        {
          id: "l-next-3",
          slug: "supabase-rls",
          title: "Supabase Auth và RLS",
          estimatedMinutes: 34,
          content:
            "RLS giúp database tự bảo vệ dữ liệu theo người dùng. Policy thường dùng `auth.uid()` để giới hạn bản ghi của chính user.",
          assessment: code(
            "a-next-code",
            "Bài code: tính tiến độ",
            "progress",
            "Viết hàm `progress(done, total)` trả về phần trăm hoàn thành được làm tròn.",
            "function progress(done, total) {\n  // return 0 nếu total bằng 0\n}\n",
            [
              { name: "nửa khóa", args: [3, 6], expected: 50 },
              { name: "hoàn thành", args: [5, 5], expected: 100 },
              { name: "không có bài", args: [0, 0], expected: 0 },
            ],
          ),
        },
      ]),
      courseModule("m-next-2", "Sản phẩm thực tế", [
        {
          id: "l-next-4",
          slug: "dashboard",
          title: "Dashboard học viên",
          estimatedMinutes: 25,
          content:
            "Dashboard tốt cần ưu tiên khóa đang học, tiến độ, nhiệm vụ kế tiếp và chứng chỉ đã nhận.",
        },
        {
          id: "l-next-5",
          slug: "admin-content",
          title: "Admin quản lý nội dung",
          estimatedMinutes: 31,
          content:
            "Admin cần CRUD khóa học, module, lesson, assessment và theo dõi trạng thái người học.",
        },
        {
          id: "l-next-6",
          slug: "ship",
          title: "Checklist trước khi release",
          estimatedMinutes: 18,
          content:
            "Trước khi release cần kiểm tra build, auth redirects, RLS policy, trạng thái lỗi và responsive.",
        },
      ]),
    ],
  },
  {
    id: "course-ai",
    slug: "ai-fundamentals",
    title: "AI Fundamentals cho Developer",
    description:
      "Hiểu mô hình AI, prompt, embedding và cách tích hợp AI vào sản phẩm phần mềm.",
    category: "AI Fundamentals",
    level: "Cơ bản",
    durationHours: 9,
    published: true,
    accent: "#13bce7",
    outcomes: ["Nắm khái niệm model", "Thiết kế prompt", "Đánh giá output AI"],
    modules: [
      courseModule("m-ai-1", "Khái niệm AI", [
        {
          id: "l-ai-1",
          slug: "models",
          title: "Model, token và context",
          estimatedMinutes: 24,
          content:
            "Model nhận input dưới dạng token, xử lý trong context window và sinh output xác suất theo mục tiêu huấn luyện.",
          assessment: quiz(
            "a-ai-models",
            "Kiểm tra AI căn bản",
            "Context window dùng để chỉ điều gì?",
            [
              "Dung lượng RAM máy chủ",
              "Lượng thông tin model có thể xét trong một lượt",
              "Số user đang online",
              "Tốc độ mạng",
            ],
            1,
          ),
        },
        {
          id: "l-ai-2",
          slug: "prompting",
          title: "Prompt rõ ràng",
          estimatedMinutes: 20,
          content:
            "Prompt tốt nêu vai trò, dữ liệu, ràng buộc, format đầu ra và tiêu chí đánh giá.",
        },
        {
          id: "l-ai-3",
          slug: "evaluation",
          title: "Đánh giá output",
          estimatedMinutes: 18,
          content:
            "Đánh giá AI nên dùng test case thực tế, tiêu chí rõ ràng và so sánh output theo từng phiên bản.",
        },
      ]),
      courseModule("m-ai-2", "Tích hợp sản phẩm", [
        {
          id: "l-ai-4",
          slug: "rag",
          title: "RAG và tri thức nội bộ",
          estimatedMinutes: 30,
          content:
            "RAG kết hợp truy xuất tài liệu liên quan với model để trả lời dựa trên nguồn dữ liệu riêng.",
        },
        {
          id: "l-ai-5",
          slug: "guardrails",
          title: "Guardrails",
          estimatedMinutes: 22,
          content:
            "Guardrails bao gồm kiểm tra input, chính sách output, logging và fallback khi model không chắc chắn.",
        },
        {
          id: "l-ai-6",
          slug: "cost",
          title: "Tối ưu chi phí",
          estimatedMinutes: 17,
          content:
            "Giảm chi phí bằng cache, chọn model phù hợp, rút gọn context và batch các tác vụ nền.",
        },
      ]),
    ],
  },
  {
    id: "course-cloud",
    slug: "cloud-devops-foundation",
    title: "Cloud & DevOps Foundation",
    description:
      "Làm quen CI/CD, container, logging, monitoring và quy trình vận hành ứng dụng cloud.",
    category: "Cloud & DevOps",
    level: "Cơ bản",
    durationHours: 10,
    published: true,
    accent: "#0f7dd8",
    outcomes: ["Hiểu CI/CD", "Biết container basics", "Theo dõi health và logs"],
    modules: [
      courseModule("m-cloud-1", "Vận hành cơ bản", [
        {
          id: "l-cloud-1",
          slug: "cicd",
          title: "CI/CD pipeline",
          estimatedMinutes: 27,
          content:
            "Pipeline tự động hóa kiểm tra, build và deploy để giảm lỗi thủ công khi release.",
          assessment: quiz(
            "a-cloud-cicd",
            "Kiểm tra CI/CD",
            "Bước nào nên chạy trước deploy?",
            ["Xóa log", "Chạy test/build", "Tăng giá sản phẩm", "Đổi màu logo"],
            1,
          ),
        },
        {
          id: "l-cloud-2",
          slug: "containers",
          title: "Container và image",
          estimatedMinutes: 26,
          content:
            "Image đóng gói runtime và source, container là instance chạy từ image đó.",
        },
        {
          id: "l-cloud-3",
          slug: "health",
          title: "Health check",
          estimatedMinutes: 16,
          content:
            "Health check giúp hệ thống biết service còn phục vụ được request hay cần restart/route away.",
        },
      ]),
      courseModule("m-cloud-2", "Quan sát hệ thống", [
        {
          id: "l-cloud-4",
          slug: "logs",
          title: "Logging",
          estimatedMinutes: 19,
          content:
            "Log nên có timestamp, request id, severity và thông tin vừa đủ để debug mà không lộ dữ liệu nhạy cảm.",
        },
        {
          id: "l-cloud-5",
          slug: "metrics",
          title: "Metrics",
          estimatedMinutes: 21,
          content:
            "Metrics như latency, error rate, CPU, memory và throughput giúp phát hiện vấn đề trước khi user báo lỗi.",
        },
        {
          id: "l-cloud-6",
          slug: "incident",
          title: "Incident response",
          estimatedMinutes: 25,
          content:
            "Một incident tốt cần owner, timeline, impact, mitigations và postmortem không đổ lỗi cá nhân.",
        },
      ]),
    ],
  },
  {
    id: "course-security",
    slug: "cybersecurity-basics",
    title: "Cybersecurity Basics",
    description:
      "Các nguyên tắc bảo mật ứng dụng: auth, phân quyền, input validation và bảo vệ dữ liệu.",
    category: "Cybersecurity",
    level: "Cơ bản",
    durationHours: 8,
    published: true,
    accent: "#173f9f",
    outcomes: ["Nhận biết rủi ro auth", "Validate input", "Thiết kế quyền tối thiểu"],
    modules: [
      courseModule("m-sec-1", "Bảo mật ứng dụng", [
        {
          id: "l-sec-1",
          slug: "authz",
          title: "Authentication vs Authorization",
          estimatedMinutes: 22,
          content:
            "Authentication xác định bạn là ai, authorization xác định bạn được làm gì.",
          assessment: quiz(
            "a-sec-authz",
            "Kiểm tra bảo mật",
            "Authorization trả lời câu hỏi nào?",
            ["Bạn là ai?", "Bạn được làm gì?", "Mật khẩu dài bao nhiêu?", "Server ở đâu?"],
            1,
          ),
        },
        {
          id: "l-sec-2",
          slug: "validation",
          title: "Input validation",
          estimatedMinutes: 24,
          content:
            "Input từ client không đáng tin. Server phải validate kiểu dữ liệu, giới hạn, enum và quyền truy cập.",
        },
        {
          id: "l-sec-3",
          slug: "least-privilege",
          title: "Least privilege",
          estimatedMinutes: 18,
          content:
            "Mỗi user/service chỉ nên có đúng quyền cần thiết để giảm thiệt hại khi bị lộ token hoặc tài khoản.",
        },
      ]),
      courseModule("m-sec-2", "Dữ liệu nhạy cảm", [
        {
          id: "l-sec-4",
          slug: "secrets",
          title: "Quản lý secrets",
          estimatedMinutes: 21,
          content:
            "Secrets không được commit vào repo. Dùng environment variables và phân quyền truy cập theo môi trường.",
        },
        {
          id: "l-sec-5",
          slug: "rls",
          title: "RLS như lớp bảo vệ cuối",
          estimatedMinutes: 25,
          content:
            "RLS đặt rule ở database, giúp tránh bug tầng API vô tình trả dữ liệu của user khác.",
        },
        {
          id: "l-sec-6",
          slug: "audit",
          title: "Audit cơ bản",
          estimatedMinutes: 16,
          content:
            "Audit log ghi lại hành động quan trọng như đổi role, cấp chứng chỉ, xóa khóa học và đăng nhập thất bại.",
        },
      ]),
    ],
  },
  {
    id: "course-mobile",
    slug: "mobile-development-foundation",
    title: "Mobile Development Foundation",
    description:
      "Tư duy xây dựng app mobile: state, offline-first, API, performance và release store.",
    category: "Mobile Development",
    level: "Trung cấp",
    durationHours: 11,
    published: true,
    accent: "#20d3f2",
    outcomes: ["Thiết kế state", "Tối ưu UX mobile", "Chuẩn bị release"],
    modules: [
      courseModule("m-mobile-1", "Trải nghiệm mobile", [
        {
          id: "l-mobile-1",
          slug: "state",
          title: "State và navigation",
          estimatedMinutes: 23,
          content:
            "Ứng dụng mobile cần state rõ ràng giữa màn hình, cache dữ liệu và xử lý lifecycle foreground/background.",
          assessment: quiz(
            "a-mobile-state",
            "Kiểm tra mobile",
            "Điểm nào quan trọng với mobile UX?",
            ["Chỉ desktop layout", "Tap target rõ và phản hồi nhanh", "Không cần cache", "Ẩn lỗi"],
            1,
          ),
        },
        {
          id: "l-mobile-2",
          slug: "offline",
          title: "Offline-first",
          estimatedMinutes: 27,
          content:
            "Offline-first lưu trạng thái cục bộ, đồng bộ lại khi có mạng và xử lý conflict rõ ràng.",
        },
        {
          id: "l-mobile-3",
          slug: "api",
          title: "API cho mobile",
          estimatedMinutes: 19,
          content:
            "API mobile nên giảm roundtrip, trả payload vừa đủ và có versioning để tránh phá app cũ.",
        },
      ]),
      courseModule("m-mobile-2", "Release", [
        {
          id: "l-mobile-4",
          slug: "performance",
          title: "Performance",
          estimatedMinutes: 29,
          content:
            "Theo dõi startup time, frame drops, memory và network để giữ app mượt trên thiết bị thật.",
        },
        {
          id: "l-mobile-5",
          slug: "store",
          title: "Chuẩn bị store listing",
          estimatedMinutes: 20,
          content:
            "Release cần icon, screenshot, privacy policy, mô tả, phân loại nội dung và checklist quyền truy cập.",
        },
        {
          id: "l-mobile-6",
          slug: "crash",
          title: "Crash reporting",
          estimatedMinutes: 17,
          content:
            "Crash reporting giúp ưu tiên lỗi theo số user ảnh hưởng, phiên bản app và stack trace.",
        },
      ]),
    ],
  },
];

function mapAssessment(row: AssessmentRow): Assessment {
  if (row.type === "code") {
    const exercise = row.code_exercises?.[0];
    return {
      id: row.id,
      type: "code",
      title: row.title,
      passingScore: row.passing_score ?? 100,
      exercise: exercise
        ? {
            id: exercise.id,
            functionName: exercise.function_name,
            prompt: exercise.prompt,
            starterCode: exercise.starter_code,
            testCases: exercise.test_cases,
          }
        : undefined,
    };
  }

  return {
    id: row.id,
    type: "quiz",
    title: row.title,
    passingScore: row.passing_score ?? 70,
    questions: row.questions?.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      options: question.options,
      correctIndex:
        typeof question.correct_answer === "number"
          ? question.correct_answer
          : question.correct_answer.correctIndex ?? 0,
      explanation: question.explanation ?? "",
    })),
  };
}

function mapCourse(row: CourseRow): Course {
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
    outcomes: row.outcomes ?? [],
    modules:
      row.modules?.map((item) => ({
        id: item.id,
        title: item.title,
        lessons:
          item.lessons?.map((lesson) => ({
            id: lesson.id,
            slug: lesson.slug,
            title: lesson.title,
            content: lesson.content_md ?? "",
            videoUrl: lesson.video_url ?? undefined,
            estimatedMinutes: lesson.estimated_minutes ?? 0,
            assessment: lesson.assessments?.[0]
              ? mapAssessment(lesson.assessments[0])
              : undefined,
          })) ?? [],
      })) ?? [],
  };
}

export const getCourses = cache(async (includeDrafts = false): Promise<Course[]> => {
  const supabase = await createClient();

  if (!supabase) {
    return seedCourses;
  }

  let query = supabase
    .from("courses")
    .select(
      "*, modules(*, lessons(*, assessments(*, questions(*), code_exercises(*))))",
    )
    .order("title");

  if (!includeDrafts) {
    query = query.eq("published", true);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return seedCourses;
  }

  return (data as CourseRow[]).map(mapCourse);
});

export async function getCourse(slug: string) {
  const courses = await getCourses();
  return courses.find((course) => course.slug === slug) ?? null;
}

export async function getLesson(courseSlug: string, lessonSlug: string) {
  const course = await getCourse(courseSlug);
  const lesson =
    course?.modules.flatMap((item) => item.lessons).find((item) => item.slug === lessonSlug) ??
    null;

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

export async function getDemoCertificates(): Promise<Certificate[]> {
  const courses = await getCourses();

  return courses.slice(0, 2).map((course, index) => ({
    id: `cert-demo-${course.slug}`,
    certificateNo: `TECH-2026-${String(index + 1).padStart(4, "0")}`,
    userName: "Nguyễn Nhật Anh",
    courseTitle: course.title,
    issuedAt: new Date(2026, index, 12).toISOString(),
  }));
}

export async function getCertificate(id: string) {
  const certificates = await getDemoCertificates();
  return certificates.find((certificate) => certificate.id === id) ?? certificates[0];
}

export async function getMentorBookings(): Promise<MentorBooking[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [
      {
        id: "booking-demo-1",
        fullName: "Nguyễn Văn A",
        email: "learner@example.com",
        topic: "Mock interview React + Supabase",
        level: "Junior",
        preferredTime: "Tối thứ 3, 20:00",
        note: "Muốn review portfolio trước khi apply.",
        status: "new",
        createdAt: new Date().toISOString(),
      },
    ];
  }

  const { data: mockData, error: mockError } = await supabase
    .from("mock_interview_bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (!mockError && mockData) {
    return (mockData as MentorBookingRow[]).map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      topic: row.interview_role ? `${row.topic} · ${row.interview_role}` : row.topic,
      level: row.level,
      preferredTime: row.mentor_name ? `${row.preferred_time} · ${row.mentor_name}` : row.preferred_time,
      note: row.note ?? undefined,
      status: row.status,
      createdAt: row.created_at,
    }));
  }

  const { data, error } = await supabase
    .from("mentor_bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as MentorBookingRow[]).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    topic: row.topic,
    level: row.level,
    preferredTime: row.preferred_time,
    note: row.note ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  }));
}
