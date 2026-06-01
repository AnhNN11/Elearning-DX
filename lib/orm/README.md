# Supabase ORM Layer

This project uses a session-aware ORM/repository layer on top of the Supabase server client.
It intentionally does not open a direct Postgres connection from Next.js, so Supabase Auth,
cookies, and RLS policies continue to apply to every request.

## Entry Point

Use `createOrm()` when Supabase may be missing and `requireApiOrm()` inside API routes when
the request must fail if Supabase is not configured.

```ts
import { createOrm } from "@/lib/orm";

const orm = await createOrm();
const courses = orm ? await orm.courses.list() : [];
```

API routes should use:

```ts
import { requireApiOrm } from "@/lib/api/auth";

const orm = await requireApiOrm();
await orm.learning.enroll(profile.id, courseId);
```

## Repositories

- `orm.courses`: courses, modules, lessons, course assets, publishing, lesson video links.
- `orm.learning`: enrollments, lesson progress, quiz/code submissions, automatic certificate issuing.
- `orm.certificates`: certificate list/detail and idempotent certificate creation.
- `orm.users`: current profile mapping, admin user list, roles, role assignment, profile updates.
- `orm.bookings`: mock interview booking creation and admin status updates.
- `orm.content`: Markdown blog posts and Markdown interview question bank.
- `orm.admin`: dashboard metrics and reusable row counters.

## Mapping Rules

Database rows stay in `snake_case` inside repositories. UI/domain models are mapped to
`camelCase` in `lib/orm/mappers.ts`, so pages and components never need to know Supabase
column names.

Course document uploads still use `supabase.storage`, then persist metadata through `orm.courses`.
Course images and banners upload to Cloudinary, with Supabase storing the delivery URL and metadata.
