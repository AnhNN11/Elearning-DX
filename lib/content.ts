import { createOrm, type BlogPost, type InterviewQuestion } from "./orm";
import type { LandingBlock } from "./types";

export type Mentor = {
  name: string;
  role: string;
  expertise: string[];
  schedule: string;
};

export type { BlogPost, InterviewQuestion };
export type { LandingBlock };

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
    schedule: "Trưa thứ 2-4",
  },
];

export async function getBlogPosts(locale: "vi" | "en", includeDrafts = false) {
  const orm = await createOrm();
  return orm ? orm.content.listBlogPosts(locale, includeDrafts) : [];
}

export async function getLandingBlocks(locale: "vi" | "en", includeDrafts = false) {
  const orm = await createOrm();
  return orm ? orm.content.listLandingBlocks(locale, includeDrafts) : [];
}

export async function getInterviewQuestions(locale: "vi" | "en", includeDrafts = false) {
  const orm = await createOrm();
  return orm ? orm.content.listInterviewQuestions(locale, includeDrafts) : [];
}
