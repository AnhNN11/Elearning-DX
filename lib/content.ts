import { createClient } from "./supabase/server";
import { hasSupabaseEnv } from "./supabase/config";

export type Mentor = {
  name: string;
  role: string;
  expertise: string[];
  schedule: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  readTime: string;
  publishedAt: string;
  content: string[];
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

type BlogPostRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  tags: string[] | null;
  read_time: string | null;
  published_at: string | null;
  content_md: string | null;
};

type InterviewQuestionRow = {
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

export const mentors: Mentor[] = [
  {
    name: "Anh Minh",
    role: "Senior Fullstack Engineer",
    expertise: ["Next.js", "System Design", "Supabase"],
    schedule: "Tối thứ 3 và thứ 5",
  },
  {
    name: "Chị Linh",
    role: "AI Product Lead",
    expertise: ["AI workflow", "Prompt design", "Portfolio review"],
    schedule: "Cuối tuần",
  },
  {
    name: "Anh Khoa",
    role: "DevOps Mentor",
    expertise: ["Cloud", "CI/CD", "Interview coaching"],
    schedule: "Trưa thứ 2-6",
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "lo-trinh-fullstack-2026",
    title: "Lộ trình Fullstack 2026 cho người muốn đi làm thực tế",
    excerpt:
      "Một lộ trình học tập gọn, ưu tiên sản phẩm thật, database, auth, deployment và kỹ năng review code.",
    category: "Career",
    tags: ["roadmap", "fullstack", "portfolio"],
    readTime: "6 phút",
    publishedAt: "2026-06-01",
    content: [
      "Fullstack 2026 không chỉ là biết viết giao diện. Người học cần hiểu cách một sản phẩm đi từ ý tưởng đến dữ liệu, quyền truy cập, triển khai và đo lường.",
      "Bạn nên bắt đầu bằng HTML/CSS/TypeScript, sau đó học React và Next.js App Router. Khi đã có nền tảng, hãy thêm Supabase để xử lý auth, database, storage và policy.",
      "Mỗi giai đoạn nên có một sản phẩm nhỏ: dashboard học tập, mini CRM, blog có admin hoặc hệ thống đặt lịch. Sản phẩm thật giúp bạn có câu chuyện rõ ràng khi phỏng vấn.",
    ],
  },
  {
    slug: "cach-on-phong-van-javascript",
    title: "Cách ôn phỏng vấn JavaScript không bị học vẹt",
    excerpt:
      "Tập trung vào cơ chế thực thi, async, closure và bài code nhỏ có test case thay vì chỉ học định nghĩa.",
    category: "Interview",
    tags: ["javascript", "interview", "practice"],
    readTime: "5 phút",
    publishedAt: "2026-06-01",
    content: [
      "Một câu trả lời phỏng vấn tốt thường có ba phần: định nghĩa ngắn, ví dụ cụ thể và tradeoff khi áp dụng trong dự án thật.",
      "Với JavaScript, hãy luyện closure, event loop, promise, array methods và cách debug lỗi bất đồng bộ. Sau mỗi chủ đề, viết một hàm nhỏ và tự tạo test case.",
      "Khi trả lời, đừng chỉ nói kết quả. Hãy giải thích luồng chạy từng bước, dữ liệu thay đổi ra sao và vì sao cách làm của bạn dễ bảo trì.",
    ],
  },
  {
    slug: "xay-dung-portfolio-co-admin",
    title: "Portfolio có admin: điểm cộng lớn khi ứng tuyển",
    excerpt:
      "Một portfolio có dashboard, CRUD, auth và analytics cho thấy bạn hiểu sản phẩm hơn một landing page tĩnh.",
    category: "Project",
    tags: ["portfolio", "admin", "supabase"],
    readTime: "4 phút",
    publishedAt: "2026-06-01",
    content: [
      "Nhà tuyển dụng dễ đánh giá năng lực hơn khi portfolio của bạn có luồng người dùng hoàn chỉnh: đăng nhập, quản lý nội dung, lưu trạng thái và phân quyền.",
      "Bạn có thể bắt đầu bằng một hệ thống eLearning nhỏ: admin tạo khóa học, học viên học bài, nộp quiz, chạy code và nhận chứng chỉ.",
      "Thêm analytics, blog kỹ thuật và trang luyện phỏng vấn sẽ biến portfolio thành một sản phẩm có định hướng rõ ràng.",
    ],
  },
  {
    slug: "nextjs-app-router-can-nam",
    title: "Next.js App Router: những điểm cần nắm trước khi làm dự án thật",
    excerpt:
      "Hiểu server component, server action, route segment và caching để tránh copy code mà không biết lỗi đến từ đâu.",
    category: "Engineering",
    tags: ["nextjs", "app-router", "server-actions"],
    readTime: "7 phút",
    publishedAt: "2026-06-01",
    content: [
      "App Router buộc bạn nghĩ rõ dữ liệu nào chạy ở server, dữ liệu nào cần tương tác client và hành động nào nên đi qua Server Action.",
      "Một cấu trúc tốt thường giữ page ở server, component tương tác ở client và tách logic ghi dữ liệu vào file action riêng có kiểm tra quyền.",
      "Khi phỏng vấn, hãy giải thích được vì sao bạn dùng Server Component để giảm JavaScript gửi về browser, và khi nào cần chuyển sang Client Component.",
    ],
  },
  {
    slug: "supabase-rls-cho-nguoi-moi",
    title: "Supabase RLS cho người mới: đừng chỉ bảo vệ bằng frontend",
    excerpt:
      "RLS giúp database tự kiểm tra quyền truy cập, giảm rủi ro khi client hoặc API bị gọi trực tiếp.",
    category: "Database",
    tags: ["supabase", "rls", "security"],
    readTime: "6 phút",
    publishedAt: "2026-06-01",
    content: [
      "Frontend validation giúp trải nghiệm tốt hơn, nhưng không đủ để bảo vệ dữ liệu. Người dùng vẫn có thể gọi trực tiếp endpoint hoặc client SDK.",
      "RLS đưa điều kiện truy cập xuống PostgreSQL. Ví dụ bảng enrollments chỉ cho user đọc bản ghi có user_id bằng auth.uid().",
      "Trong dự án portfolio, việc bật RLS và viết policy rõ ràng cho profiles, courses, submissions và certificates là tín hiệu kỹ thuật rất tốt.",
    ],
  },
  {
    slug: "mock-interview-system-design-lms",
    title: "Mock interview: thiết kế hệ thống eLearning trong 30 phút",
    excerpt:
      "Cách chia bảng, luồng progress, chứng chỉ và phần admin khi được hỏi system design về LMS.",
    category: "Interview",
    tags: ["system-design", "lms", "mock"],
    readTime: "8 phút",
    publishedAt: "2026-06-01",
    content: [
      "Hãy bắt đầu bằng scope: người học đăng ký khóa, học lesson, làm assessment, lưu progress và nhận certificate. Admin quản lý nội dung và theo dõi booking mentor.",
      "Các bảng cốt lõi gồm courses, modules, lessons, enrollments, lesson_progress, assessments, submissions, certificates và mentor_bookings.",
      "Điểm cộng là nói được tradeoff: tính progress real-time hay lưu snapshot, phát hành certificate đồng bộ hay qua job, và policy nào cần được enforce ở database.",
    ],
  },
  {
    slug: "cach-viet-cv-developer-co-du-an",
    title: "Cách viết CV developer khi bạn đã có dự án thật",
    excerpt:
      "Biến dự án eLearning, admin dashboard và code runner thành bullet point có số liệu và ngữ cảnh.",
    category: "Career",
    tags: ["cv", "career", "project"],
    readTime: "5 phút",
    publishedAt: "2026-06-01",
    content: [
      "CV tốt không chỉ liệt kê stack. Mỗi bullet nên nói bạn đã xây gì, người dùng nào hưởng lợi, và kỹ thuật nào chứng minh năng lực.",
      "Ví dụ: xây LMS Next.js có Supabase Auth/RLS, admin CRUD, code runner Web Worker và certificate flow. Đây là một câu chuyện sản phẩm hoàn chỉnh.",
      "Nếu có analytics, booking mentor và blog/interview module, hãy nhấn mạnh bạn biết theo dõi hành vi người dùng và phát triển nội dung hỗ trợ học tập.",
    ],
  },
  {
    slug: "kiem-tra-code-runner-tren-web",
    title: "Code runner trên web: test nhanh nhưng vẫn phải có guardrail",
    excerpt:
      "Chạy bài JavaScript trong Web Worker, giới hạn timeout và lưu test result để mentor review.",
    category: "Engineering",
    tags: ["code-runner", "web-worker", "testing"],
    readTime: "6 phút",
    publishedAt: "2026-06-01",
    content: [
      "Một code runner đơn giản có thể chạy JavaScript bằng Web Worker để không block UI. Khi bài chạy quá lâu, timeout sẽ terminate worker.",
      "Test case nên rõ input, expected output và tên case. Người học cần thấy cả actual để biết sai ở đâu.",
      "Với sản phẩm thật nhiều ngôn ngữ, cần sandbox server-side nghiêm túc hơn. Nhưng cho bài JavaScript cơ bản, Web Worker là MVP hợp lý.",
    ],
  },
];

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: "js-event-loop",
    category: "JavaScript",
    level: "Cơ bản",
    question: "Event loop xử lý Promise và setTimeout khác nhau như thế nào?",
    prompt: "Viết ví dụ console.log có Promise và setTimeout rồi dự đoán thứ tự chạy.",
    answer:
      "Promise callback đi vào microtask queue, còn setTimeout đi vào macrotask queue. Sau khi call stack rỗng, event loop ưu tiên chạy toàn bộ microtask trước rồi mới đến macrotask.",
    checklist: ["Nêu call stack", "Phân biệt microtask/macrotask", "Có ví dụ thứ tự log"],
  },
  {
    id: "js-closure",
    category: "JavaScript",
    level: "Cơ bản",
    question: "Closure là gì và dùng khi nào trong dự án frontend?",
    prompt: "Đưa ví dụ function tạo counter hoặc debounce và giải thích biến nào được giữ lại.",
    answer:
      "Closure xảy ra khi một function ghi nhớ lexical scope nơi nó được tạo ra, kể cả sau khi scope bên ngoài đã chạy xong. Nó hữu ích cho debounce, memoization, factory function và giữ state private.",
    checklist: ["Nêu lexical scope", "Có ví dụ state private", "Nói được rủi ro giữ reference quá lâu"],
  },
  {
    id: "js-promise-error",
    category: "JavaScript",
    level: "Trung cấp",
    question: "Bạn xử lý lỗi async/await như thế nào để không nuốt lỗi?",
    prompt: "Trả lời trong bối cảnh gọi API và cập nhật UI loading/error.",
    answer:
      "Dùng try/catch quanh await, phân biệt lỗi network, lỗi business và lỗi validation. Ở tầng UI cần set loading trong finally, hiển thị thông báo rõ, và log lỗi đủ ngữ cảnh ở tầng phù hợp.",
    checklist: ["Có try/catch/finally", "Phân loại lỗi", "Không expose lỗi nhạy cảm"],
  },
  {
    id: "react-render",
    category: "React",
    level: "Trung cấp",
    question: "Khi nào một React component render lại và bạn tối ưu ra sao?",
    prompt: "Trả lời theo format: nguyên nhân render, cách đo, cách tối ưu, tradeoff.",
    answer:
      "Component render lại khi state, props hoặc context liên quan thay đổi. Tối ưu bằng cách giữ state đúng phạm vi, tách component, memo hóa tính toán đắt và tránh tạo object/function mới không cần thiết.",
    checklist: ["Nói rõ state/props/context", "Không lạm dụng memo", "Ưu tiên thiết kế state tốt"],
  },
  {
    id: "react-state-location",
    category: "React",
    level: "Cơ bản",
    question: "Bạn đặt state ở đâu trong một màn hình có nhiều component con?",
    prompt: "Dùng ví dụ filter danh sách khóa học và card con.",
    answer:
      "State nên đặt ở component thấp nhất nhưng vẫn bao phủ các nơi cần đọc hoặc cập nhật. Nếu chỉ một input và một list dùng filter, đặt state ở parent gần nhất. Tránh đưa state lên global khi chưa cần.",
    checklist: ["Nói lowest common ancestor", "Tránh global state sớm", "Có ví dụ props flow"],
  },
  {
    id: "react-server-client",
    category: "React",
    level: "Trung cấp",
    question: "Trong Next.js, khi nào dùng Server Component và khi nào dùng Client Component?",
    prompt: "Trả lời theo dữ liệu, tương tác, bundle size và bảo mật.",
    answer:
      "Server Component phù hợp cho đọc dữ liệu, render nội dung tĩnh hoặc bảo mật token server. Client Component cần cho state, effect, event handler và API browser. Tách đúng giúp giảm JavaScript và giữ logic nhạy cảm ở server.",
    checklist: ["Nêu event handler cần client", "Nêu dữ liệu server", "Nêu bundle size"],
  },
  {
    id: "next-server-action",
    category: "Next.js",
    level: "Trung cấp",
    question: "Server Action khác API route ở điểm nào và cần kiểm tra gì bên trong?",
    prompt: "Đặt trong bối cảnh form admin tạo lesson.",
    answer:
      "Server Action là function server có thể gọi trực tiếp từ form hoặc client, phù hợp mutation gắn với UI. Dù vậy vẫn phải validate input, kiểm tra session/role và revalidate path sau khi ghi dữ liệu.",
    checklist: ["Validate input", "Check auth/role", "Revalidate/redirect rõ ràng"],
  },
  {
    id: "next-cache",
    category: "Next.js",
    level: "Nâng cao",
    question: "Bạn giải thích caching/revalidation trong Next.js như thế nào?",
    prompt: "Nói cách dữ liệu khóa học thay đổi sau khi admin cập nhật.",
    answer:
      "Next.js có nhiều lớp cache cho render và fetch. Khi dữ liệu thay đổi qua mutation, cần revalidatePath hoặc revalidateTag để route liên quan lấy dữ liệu mới. Dữ liệu theo user thường nên dynamic hoặc đọc ngoài cache public.",
    checklist: ["Nêu revalidatePath/tag", "Phân biệt public/user data", "Có ví dụ admin update"],
  },
  {
    id: "db-rls",
    category: "Database",
    level: "Trung cấp",
    question: "Supabase RLS giúp bảo vệ dữ liệu như thế nào?",
    prompt: "Giải thích khác biệt giữa frontend validation, API guard và database policy.",
    answer:
      "RLS đưa điều kiện truy cập xuống database. Mỗi bảng có policy xác định user nào được select/insert/update/delete, thường dựa trên auth.uid() và role trong profiles.",
    checklist: ["Nêu policy", "Nêu auth.uid()", "Phân biệt client validation và database enforcement"],
  },
  {
    id: "db-index",
    category: "Database",
    level: "Trung cấp",
    question: "Khi nào bạn thêm index cho database?",
    prompt: "Dùng ví dụ tìm course theo slug và lesson theo module.",
    answer:
      "Thêm index cho cột thường dùng trong where, join, order hoặc unique lookup. Ví dụ courses.slug nên unique index, lessons(module_id, slug) giúp tìm lesson nhanh trong course. Không thêm bừa vì index làm tăng chi phí ghi.",
    checklist: ["Nêu where/join/order", "Nêu unique lookup", "Nêu tradeoff khi ghi"],
  },
  {
    id: "security-xss",
    category: "Security",
    level: "Trung cấp",
    question: "XSS là gì và bạn giảm rủi ro trong app học tập ra sao?",
    prompt: "Nêu cả nội dung markdown, video embed và admin content.",
    answer:
      "XSS là khi attacker chèn script chạy trong browser người dùng. Giảm rủi ro bằng escape output mặc định của React, sanitize HTML nếu render markdown, validate URL embed YouTube và không dùng dangerouslySetInnerHTML khi chưa kiểm soát.",
    checklist: ["Nêu escape/sanitize", "Nêu validate URL", "Nêu tránh dangerouslySetInnerHTML"],
  },
  {
    id: "devops-ci",
    category: "DevOps",
    level: "Trung cấp",
    question: "Một pipeline CI tối thiểu cho Next.js app nên có gì?",
    prompt: "Nói các bước trước khi deploy production.",
    answer:
      "Pipeline tối thiểu nên cài dependencies, chạy lint, type-check/build, chạy test quan trọng, kiểm tra env bắt buộc và deploy preview. Với app có Supabase, migration/schema cần được quản lý có kiểm soát.",
    checklist: ["Lint/build", "Test quan trọng", "Kiểm soát env/schema"],
  },
  {
    id: "system-design-lms",
    category: "System Design",
    level: "Nâng cao",
    question: "Thiết kế hệ thống eLearning có progress và chứng chỉ tự động cần những bảng chính nào?",
    prompt: "Nêu entity, quan hệ, cách tính progress và thời điểm phát hành certificate.",
    answer:
      "Cần courses, modules, lessons, enrollments, lesson_progress, assessments, submissions và certificates. Progress được tính từ lesson_progress, certificate phát hành khi enrollment đạt 100%.",
    checklist: ["Nêu entity chính", "Nêu cách tính progress", "Nêu điều kiện cấp chứng chỉ"],
  },
  {
    id: "system-design-code-runner",
    category: "System Design",
    level: "Nâng cao",
    question: "Thiết kế code runner trên web cần chú ý gì?",
    prompt: "Nói security, timeout, test cases và lưu submission.",
    answer:
      "Với JavaScript cơ bản có thể chạy trong Web Worker kèm timeout để tránh block UI. Production cần sandbox mạnh hơn cho nhiều ngôn ngữ. Lưu code, test_results, score và passed để review lại.",
    checklist: ["Sandbox/Worker", "Timeout", "Lưu submission/result"],
  },
  {
    id: "behavior-conflict",
    category: "Behavioral",
    level: "Cơ bản",
    question: "Kể về lần bạn nhận feedback code khó nghe và xử lý ra sao?",
    prompt: "Trả lời theo STAR: Situation, Task, Action, Result.",
    answer:
      "Một câu trả lời tốt nêu bối cảnh cụ thể, phản ứng bình tĩnh, cách bạn xác minh vấn đề, thay đổi code/process và kết quả sau đó. Tránh đổ lỗi, tập trung vào học hỏi và tiêu chuẩn kỹ thuật.",
    checklist: ["Có STAR", "Không đổ lỗi", "Có kết quả cụ thể"],
  },
];

const blogPostsEn: BlogPost[] = [
  {
    slug: "lo-trinh-fullstack-2026",
    title: "Fullstack roadmap 2026 for job-ready learners",
    excerpt:
      "A compact roadmap focused on real products, databases, auth, deployment, and code review skills.",
    category: "Career",
    tags: ["roadmap", "fullstack", "portfolio"],
    readTime: "6 min",
    publishedAt: "2026-06-01",
    content: [
      "Fullstack in 2026 is not just about building screens. You need to understand how a product moves from idea to data, access control, deployment, and measurement.",
      "Start with HTML, CSS, and TypeScript, then move into React and Next.js App Router. Once the foundation is solid, add Supabase for auth, database, storage, and policies.",
      "Each stage should produce a small product: a learning dashboard, mini CRM, admin blog, or booking system. Real products give you concrete interview stories.",
    ],
  },
  {
    slug: "cach-on-phong-van-javascript",
    title: "How to practice JavaScript interviews without memorizing",
    excerpt:
      "Focus on runtime mechanics, async behavior, closures, and small coding tasks with test cases.",
    category: "Interview",
    tags: ["javascript", "interview", "practice"],
    readTime: "5 min",
    publishedAt: "2026-06-01",
    content: [
      "A strong interview answer usually has three parts: a short definition, a concrete example, and the tradeoff when applying it in a real project.",
      "For JavaScript, practice closures, the event loop, promises, array methods, and debugging async issues. After each topic, write a small function with test cases.",
      "When answering, do not just state the result. Explain the execution flow, how data changes, and why your approach is maintainable.",
    ],
  },
  {
    slug: "xay-dung-portfolio-co-admin",
    title: "A portfolio with admin: a strong signal when applying",
    excerpt:
      "A dashboard, CRUD, auth, and analytics show product thinking beyond a static landing page.",
    category: "Project",
    tags: ["portfolio", "admin", "supabase"],
    readTime: "4 min",
    publishedAt: "2026-06-01",
    content: [
      "Recruiters can evaluate your ability faster when your portfolio has a complete user flow: login, content management, saved state, and authorization.",
      "A compact eLearning system is a good start: admin creates courses, students learn lessons, submit quizzes, run code, and receive certificates.",
      "Analytics, mentor booking, and interview modules turn the portfolio into a focused product rather than a static showcase.",
    ],
  },
  {
    slug: "nextjs-app-router-can-nam",
    title: "Next.js App Router: what to know before real projects",
    excerpt:
      "Understand Server Components, Server Actions, route segments, and caching before copying code blindly.",
    category: "Engineering",
    tags: ["nextjs", "app-router", "server-actions"],
    readTime: "7 min",
    publishedAt: "2026-06-01",
    content: [
      "App Router forces you to decide what runs on the server, what requires client interaction, and which mutations should go through Server Actions.",
      "A solid structure keeps pages on the server, interactive widgets on the client, and write logic in dedicated action files with permission checks.",
      "In interviews, explain why Server Components reduce browser JavaScript and when a Client Component is actually required.",
    ],
  },
  {
    slug: "supabase-rls-cho-nguoi-moi",
    title: "Supabase RLS for beginners: do not protect data only in frontend",
    excerpt:
      "RLS lets the database enforce access rules and reduces risk when clients or APIs are called directly.",
    category: "Database",
    tags: ["supabase", "rls", "security"],
    readTime: "6 min",
    publishedAt: "2026-06-01",
    content: [
      "Frontend validation improves UX, but it is not enough for data protection. Users can still call endpoints or client SDKs directly.",
      "RLS moves access conditions into PostgreSQL. For example, enrollments should only be readable when user_id equals auth.uid().",
      "For portfolio projects, enabling RLS and writing clear policies for profiles, courses, submissions, and certificates is a strong technical signal.",
    ],
  },
  {
    slug: "mock-interview-system-design-lms",
    title: "Mock interview: design an eLearning system in 30 minutes",
    excerpt:
      "How to split tables, progress flows, certificates, and admin features for an LMS system design interview.",
    category: "Interview",
    tags: ["system-design", "lms", "mock"],
    readTime: "8 min",
    publishedAt: "2026-06-01",
    content: [
      "Start with scope: learners enroll in courses, study lessons, complete assessments, track progress, and receive certificates. Admin manages content and mentor bookings.",
      "Core tables include courses, modules, lessons, enrollments, lesson_progress, assessments, submissions, certificates, and mentor_bookings.",
      "Bonus points come from discussing tradeoffs: real-time progress versus snapshots, synchronous certificate issuing versus jobs, and which policies must be enforced in the database.",
    ],
  },
  {
    slug: "cach-viet-cv-developer-co-du-an",
    title: "How to write a developer CV when you have real projects",
    excerpt:
      "Turn an eLearning project, admin dashboard, and code runner into concrete bullets with context.",
    category: "Career",
    tags: ["cv", "career", "project"],
    readTime: "5 min",
    publishedAt: "2026-06-01",
    content: [
      "A strong CV does not only list a stack. Each bullet should explain what you built, who benefits, and which technical decision proves your ability.",
      "Example: built a Next.js LMS with Supabase Auth/RLS, admin CRUD, Web Worker code runner, and certificate flow. That is a complete product story.",
      "If the app includes analytics, mentor booking, and blog/interview modules, emphasize that you understand user behavior and learning content operations.",
    ],
  },
  {
    slug: "kiem-tra-code-runner-tren-web",
    title: "Web code runners: fast tests still need guardrails",
    excerpt:
      "Run JavaScript in a Web Worker, enforce timeouts, and store test results for mentor review.",
    category: "Engineering",
    tags: ["code-runner", "web-worker", "testing"],
    readTime: "6 min",
    publishedAt: "2026-06-01",
    content: [
      "A simple runner can execute JavaScript inside a Web Worker so the UI stays responsive. If code runs too long, a timeout can terminate the worker.",
      "Test cases should show input, expected output, and actual output. Learners need to see exactly why a case failed.",
      "For production systems with multiple languages, use stronger server-side sandboxing. For basic JavaScript exercises, a Web Worker is a reasonable MVP.",
    ],
  },
];

const interviewQuestionsEn: InterviewQuestion[] = [
  {
    id: "js-event-loop",
    category: "JavaScript",
    level: "Beginner",
    question: "How does the event loop handle Promise callbacks and setTimeout differently?",
    prompt: "Write a console.log example with Promise and setTimeout, then predict the order.",
    answer:
      "Promise callbacks go into the microtask queue, while setTimeout callbacks go into the macrotask queue. After the call stack is empty, the event loop runs all microtasks before macrotasks.",
    checklist: ["Mention call stack", "Separate microtasks/macrotasks", "Give a log-order example"],
  },
  {
    id: "js-closure",
    category: "JavaScript",
    level: "Beginner",
    question: "What is a closure and when would you use it in frontend work?",
    prompt: "Use a counter or debounce factory and explain which variable is preserved.",
    answer:
      "A closure happens when a function remembers the lexical scope where it was created, even after the outer scope has finished. It is useful for debounce, memoization, factories, and private state.",
    checklist: ["Mention lexical scope", "Show private state", "Mention retained-reference risk"],
  },
  {
    id: "js-promise-error",
    category: "JavaScript",
    level: "Intermediate",
    question: "How do you handle async/await errors without swallowing failures?",
    prompt: "Answer in the context of calling an API and updating loading/error UI.",
    answer:
      "Wrap awaits in try/catch, distinguish network, business, and validation errors, and set loading state in finally. Show clear user messages and log enough context at the right layer.",
    checklist: ["Use try/catch/finally", "Classify errors", "Avoid exposing sensitive details"],
  },
  {
    id: "react-render",
    category: "React",
    level: "Intermediate",
    question: "When does a React component re-render and how do you optimize it?",
    prompt: "Use this format: render causes, how to measure, optimization, tradeoff.",
    answer:
      "A component re-renders when relevant state, props, or context changes. Optimize by placing state correctly, splitting components, memoizing expensive work, and avoiding unnecessary new objects/functions.",
    checklist: ["Mention state/props/context", "Do not overuse memo", "Prefer good state design"],
  },
  {
    id: "react-state-location",
    category: "React",
    level: "Beginner",
    question: "Where do you put state in a screen with multiple child components?",
    prompt: "Use a course filter input and course cards as the example.",
    answer:
      "State should live in the lowest component that still covers every place that needs to read or update it. If one input and one list need the filter, put it in their nearest parent.",
    checklist: ["Mention lowest common ancestor", "Avoid premature global state", "Explain props flow"],
  },
  {
    id: "react-server-client",
    category: "React",
    level: "Intermediate",
    question: "In Next.js, when do you use Server Components versus Client Components?",
    prompt: "Answer through data, interaction, bundle size, and security.",
    answer:
      "Server Components are best for reading data, rendering content, and keeping secrets on the server. Client Components are needed for state, effects, event handlers, and browser APIs.",
    checklist: ["Event handlers need client", "Data can stay server-side", "Mention bundle size"],
  },
  {
    id: "next-server-action",
    category: "Next.js",
    level: "Intermediate",
    question: "How is a Server Action different from an API route, and what checks belong inside?",
    prompt: "Use an admin form that creates a lesson as context.",
    answer:
      "A Server Action is a server function callable from forms or client code, useful for UI-bound mutations. It still needs input validation, session/role checks, and revalidation after writing data.",
    checklist: ["Validate input", "Check auth/role", "Revalidate or redirect clearly"],
  },
  {
    id: "next-cache",
    category: "Next.js",
    level: "Advanced",
    question: "How do you explain caching and revalidation in Next.js?",
    prompt: "Discuss what happens after an admin updates course data.",
    answer:
      "Next.js has caching layers for rendering and fetching. After mutations, use revalidatePath or revalidateTag so affected routes fetch fresh data. User-specific data should be dynamic or read outside public cache.",
    checklist: ["Mention revalidatePath/tag", "Separate public/user data", "Use an admin update example"],
  },
  {
    id: "db-rls",
    category: "Database",
    level: "Intermediate",
    question: "How does Supabase RLS protect data?",
    prompt: "Contrast frontend validation, API guards, and database policy.",
    answer:
      "RLS moves access control into the database. Each table has policies that define who can select, insert, update, or delete rows, often based on auth.uid() and profile roles.",
    checklist: ["Mention policy", "Mention auth.uid()", "Separate validation from enforcement"],
  },
  {
    id: "db-index",
    category: "Database",
    level: "Intermediate",
    question: "When do you add an index to a database?",
    prompt: "Use course lookup by slug and lesson lookup by module as examples.",
    answer:
      "Add indexes for columns used in where clauses, joins, ordering, or unique lookups. courses.slug should be unique, and lessons(module_id, slug) helps find lessons quickly. Indexes also add write cost.",
    checklist: ["Mention where/join/order", "Mention unique lookup", "Mention write tradeoff"],
  },
  {
    id: "security-xss",
    category: "Security",
    level: "Intermediate",
    question: "What is XSS and how do you reduce risk in a learning app?",
    prompt: "Mention markdown content, video embeds, and admin-managed content.",
    answer:
      "XSS is when an attacker injects script that runs in the user's browser. Reduce risk with React escaping, sanitizing rendered HTML, validating YouTube URLs, and avoiding dangerouslySetInnerHTML unless controlled.",
    checklist: ["Escape/sanitize", "Validate URLs", "Avoid unsafe HTML"],
  },
  {
    id: "devops-ci",
    category: "DevOps",
    level: "Intermediate",
    question: "What should a minimal CI pipeline for a Next.js app include?",
    prompt: "List the steps before production deployment.",
    answer:
      "A minimal pipeline installs dependencies, runs lint, type-check/build, executes critical tests, validates required env vars, and deploys previews. Supabase schema changes should be managed deliberately.",
    checklist: ["Lint/build", "Critical tests", "Env/schema control"],
  },
  {
    id: "system-design-lms",
    category: "System Design",
    level: "Advanced",
    question: "Which core tables are needed for an eLearning system with progress and certificates?",
    prompt: "Mention entities, relationships, progress calculation, and certificate issuing.",
    answer:
      "You need courses, modules, lessons, enrollments, lesson_progress, assessments, submissions, and certificates. Progress comes from completed lessons, and certificates are issued when enrollment reaches 100%.",
    checklist: ["Name core entities", "Explain progress", "Explain certificate condition"],
  },
  {
    id: "system-design-code-runner",
    category: "System Design",
    level: "Advanced",
    question: "What should you consider when designing a browser code runner?",
    prompt: "Discuss security, timeouts, test cases, and submission storage.",
    answer:
      "For basic JavaScript, a Web Worker with timeout can avoid blocking the UI. Production runners need stronger sandboxing for multiple languages. Store code, test_results, score, and passed status for review.",
    checklist: ["Sandbox/Worker", "Timeout", "Store submission/result"],
  },
  {
    id: "behavior-conflict",
    category: "Behavioral",
    level: "Beginner",
    question: "Tell me about a time you received difficult code feedback and how you handled it.",
    prompt: "Use STAR: Situation, Task, Action, Result.",
    answer:
      "A good answer gives a specific context, a calm reaction, how you verified the issue, what code or process changed, and the result. Avoid blaming others and focus on technical standards.",
    checklist: ["Use STAR", "Avoid blame", "Show concrete result"],
  },
];

export async function getBlogPosts(locale: "vi" | "en") {
  if (hasSupabaseEnv) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug,title,excerpt,category,tags,read_time,published_at,content_md")
        .eq("locale", locale)
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (!error && data?.length) {
        return (data as BlogPostRow[]).map((row) => ({
          slug: row.slug,
          title: row.title,
          excerpt: row.excerpt ?? "",
          category: row.category ?? "Engineering",
          tags: row.tags ?? [],
          readTime: row.read_time ?? "5 phút",
          publishedAt: row.published_at ?? new Date().toISOString(),
          content: (row.content_md ?? "").split(/\n{2,}/).filter(Boolean),
        }));
      }
    }
  }

  return locale === "en" ? blogPostsEn : blogPosts;
}

export async function getInterviewQuestions(locale: "vi" | "en") {
  if (hasSupabaseEnv) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("interview_questions")
        .select("id,category,level,question,prompt_md,answer_md,checklist_md")
        .eq("locale", locale)
        .eq("published", true)
        .order("position", { ascending: true });

      if (!error && data?.length) {
        return (data as InterviewQuestionRow[]).map((row) => ({
          id: row.id,
          category: row.category ?? "General",
          level: row.level ?? "Cơ bản",
          question: row.question,
          prompt: row.prompt_md ?? row.prompt ?? "",
          answer: row.answer_md ?? row.answer ?? "",
          checklist: row.checklist_md
            ? row.checklist_md.split("\n").map((item) => item.replace(/^[-*]\s*/, "").trim()).filter(Boolean)
            : row.checklist ?? [],
        }));
      }
    }
  }

  return locale === "en" ? interviewQuestionsEn : interviewQuestions;
}
