const courseBanners: Record<string, string> = {
  "ai-fundamentals": "/course-banners/ai-fundamentals.svg",
  "cloud-devops-foundation": "/course-banners/cloud-devops-foundation.svg",
  "cybersecurity-basics": "/course-banners/cybersecurity-basics.svg",
  "mobile-development-foundation": "/course-banners/mobile-development-foundation.svg",
  "nextjs-supabase-fullstack": "/course-banners/nextjs-supabase-fullstack.svg",
};

export function getCourseBanner(slug: string) {
  return courseBanners[slug] ?? "/course-banners/nextjs-supabase-fullstack.svg";
}
