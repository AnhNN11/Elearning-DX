alter table public.blog_posts add column if not exists author_name text;
alter table public.blog_posts add column if not exists author_role text;
alter table public.blog_posts add column if not exists mentor_name text;
alter table public.blog_posts add column if not exists source_file_name text;
alter table public.blog_posts add column if not exists cover_image_url text;

notify pgrst, 'reload schema';
