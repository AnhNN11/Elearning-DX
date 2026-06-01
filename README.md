# DolphinX Learn

Next.js 16 eLearning platform backed by Supabase Auth, Postgres, RLS, Storage,
Route Handlers, and a Supabase ORM/repository layer.

## Backend Flow

1. Run database SQL in Supabase:

   Open Supabase Dashboard -> SQL Editor -> run `supabase/schema.sql`.

   The schema creates tables, RLS policies, Storage buckets, seed courses, seed
   blog/interview data, and the default admin account:

   ```txt
   admin@dolphinx.local
   Admin@123456
   ```

2. Configure app env:

   ```bash
   cp .env.example .env.local
   ```

   Set:

   ```txt
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   CLOUDINARY_UPLOAD_FOLDER=dolphinx
   ```

   Course images and banners upload to Cloudinary, then Supabase stores only the
   resulting URL and metadata. Course documents still upload to Supabase Storage.

3. Start the app:

   ```bash
   npm run dev
   ```

## Supabase Architecture

- `proxy.ts`: refreshes Supabase SSR session cookies for Next.js 16.
- `lib/supabase/server.ts`: server-side Supabase client for Server Components and API routes.
- `lib/supabase/client.ts`: browser Supabase client for login forms.
- `app/api/**`: all mutations go through Next Route Handlers.
- `lib/orm/**`: the only application layer that calls Supabase tables directly.
- `supabase/schema.sql`: source of truth for schema, RLS, seed data, default admin, and Storage policy.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

There are no local database scripts in this project. Apply schema changes through
Supabase SQL Editor or Supabase CLI, then keep `supabase/schema.sql` updated.
