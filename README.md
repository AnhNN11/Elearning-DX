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
   DATABASE_URL=
   DIRECT_URL=
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   CLOUDINARY_UPLOAD_FOLDER=dolphinx
   SEPAY_BANK_CODE=
   SEPAY_BANK_ACCOUNT=
   SEPAY_BANK_ACCOUNT_NAME=
   SEPAY_QR_TEMPLATE=compact
   SEPAY_PAYMENT_EXPIRES_MINUTES=30
   SEPAY_IPN_REQUIRE_SECRET=false
   ```

   Course images and banners upload to Cloudinary, then Supabase stores only the
   resulting URL and metadata. Course documents still upload to Supabase Storage.

   Prisma uses `DATABASE_URL` for the Supabase transaction-mode pooler and
   `DIRECT_URL` for migrations/session-mode access.

   SePay QR checkout renders the bank-transfer QR directly on
   `/checkout/[orderId]` using `SEPAY_BANK_CODE` and `SEPAY_BANK_ACCOUNT`. In the
   SePay dashboard, set IPN URL to:

   ```txt
   https://your-domain.com/api/payments/sepay/ipn
   ```

   If IPN Auth Type is `Không có`, leave `SEPAY_IPN_REQUIRE_SECRET=false`. To
   require a header secret, set `SEPAY_IPN_REQUIRE_SECRET=true` and
   `SEPAY_IPN_SECRET_KEY=`.

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
npm run prisma:validate
npm run prisma:generate
npm run prisma:pull
```

There are no local database scripts in this project. Apply schema changes through
Supabase SQL Editor or Supabase CLI, then keep `supabase/schema.sql` updated.
