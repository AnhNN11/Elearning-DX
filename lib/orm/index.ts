import type { SupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  AdminRepository,
  BookingsRepository,
  CertificatesRepository,
  ContentRepository,
  CoursesRepository,
  LearningRepository,
  UsersRepository,
} from "./repositories";

export class SupabaseOrm {
  readonly admin: AdminRepository;
  readonly bookings: BookingsRepository;
  readonly certificates: CertificatesRepository;
  readonly content: ContentRepository;
  readonly courses: CoursesRepository;
  readonly learning: LearningRepository;
  readonly users: UsersRepository;

  constructor(readonly supabase: SupabaseClient) {
    this.admin = new AdminRepository(supabase);
    this.bookings = new BookingsRepository(supabase);
    this.certificates = new CertificatesRepository(supabase);
    this.content = new ContentRepository(supabase);
    this.courses = new CoursesRepository(supabase);
    this.learning = new LearningRepository(supabase);
    this.users = new UsersRepository(supabase);
  }
}

export async function createOrm(supabaseClient?: SupabaseClient) {
  if (supabaseClient) {
    return new SupabaseOrm(supabaseClient);
  }

  if (!hasSupabaseEnv) {
    return null;
  }

  const supabase = await createClient();
  return supabase ? new SupabaseOrm(supabase) : null;
}

export async function requireOrm(supabaseClient?: SupabaseClient) {
  const orm = await createOrm(supabaseClient);

  if (!orm) {
    throw new Error("Supabase ORM chưa được cấu hình.");
  }

  return orm;
}

export type { BlogPost, InterviewQuestion, MentorBookingCreateInput } from "./shared";
