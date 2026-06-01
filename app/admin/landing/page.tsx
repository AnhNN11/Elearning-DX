import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { upsertLandingBlockAction } from "@/lib/actions";
import { getLandingBlocks } from "@/lib/content";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminLandingPage() {
  const locale = await getLocale();
  const blocks = await getLandingBlocks(locale, true);

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-black uppercase text-primary">Landing CMS</p>
        <h1 className="mt-2 text-3xl font-black text-foreground">Quản lý trang chủ</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Admin có thể thêm block nội dung lên landing page: headline, mô tả, CTA, ảnh và danh sách điểm nổi bật.
          Key giống nhau sẽ cập nhật block hiện có theo locale.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Blocks đang cấu hình</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {blocks.length ? blocks.map((block) => (
              <div className="rounded-base border-2 border-border bg-secondary-background p-4" key={block.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{block.key}</Badge>
                  <Badge variant="outline">{block.locale}</Badge>
                  <Badge variant={block.published ? "default" : "outline"}>{block.published ? "Published" : "Draft"}</Badge>
                  <Badge variant="secondary">#{block.position}</Badge>
                </div>
                {block.eyebrow && <p className="mt-3 text-xs font-black uppercase text-primary">{block.eyebrow}</p>}
                <h2 className="mt-1 text-xl font-black text-foreground">{block.title}</h2>
                {block.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{block.description}</p>}
                {block.items.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {block.items.map((item) => (
                      <Badge key={item.title} variant="outline">{item.title}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )) : (
              <p className="rounded-base border-2 border-dashed border-border p-4 text-sm font-bold text-muted-foreground">
                Chưa có landing block trong Supabase. Trang chủ vẫn dùng nội dung mặc định từ dictionary.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Tạo / cập nhật block</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={upsertLandingBlockAction} className="space-y-3">
              <Input name="key" placeholder="hero / bootcamp / outcomes" required />
              <select className="w-full rounded-base border-2 border-border bg-background px-3 py-2 font-bold" name="locale" defaultValue={locale}>
                <option value="vi">vi</option>
                <option value="en">en</option>
              </select>
              <Input name="position" placeholder="Thứ tự hiển thị" defaultValue="50" required type="number" />
              <Input name="eyebrow" placeholder="Eyebrow" />
              <Input name="title" placeholder="Tiêu đề block" required />
              <Textarea className="min-h-24" name="description" placeholder="Mô tả block" />
              <Input name="ctaLabel" placeholder="CTA label" />
              <Input name="ctaHref" placeholder="/courses hoặc https://..." />
              <Input name="secondaryCtaLabel" placeholder="Secondary CTA label" />
              <Input name="secondaryCtaHref" placeholder="/mentor-booking" />
              <Input name="imageUrl" placeholder="Image URL hoặc /brand/..." />
              <Textarea
                className="min-h-32"
                name="items"
                placeholder={"Mỗi dòng một item: Tiêu đề | Mô tả ngắn\nVí dụ: Mentor 1-1 | Review roadmap và portfolio"}
              />
              <label className="flex items-center gap-2 text-sm font-black">
                <input name="published" type="checkbox" defaultChecked />
                Published
              </label>
              <Button className="w-full" type="submit">Lưu landing block</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
