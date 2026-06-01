import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createRoleAction } from "@/lib/actions";
import { getAdminRoles } from "@/lib/data";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminRolesPage() {
  const locale = await getLocale();
  const roles = await getAdminRoles();
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-black uppercase text-primary">Access control</p>
        <h1 className="mt-2 text-3xl font-black text-foreground">
          {locale === "vi" ? "Quản lý roles" : "Role management"}
        </h1>
        <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-6">
          {locale === "vi"
            ? "Roles được lưu trong bảng roles và gán user qua bảng user_roles. Quyền admin được kiểm tra bằng role slug admin."
            : "Roles are stored in the roles table and assigned through user_roles. Admin access is checked through the admin role slug."}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>System</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length ? roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-black text-primary">{role.slug}</TableCell>
                    <TableCell>
                      <p className="font-bold">{role.name}</p>
                      {role.description && (
                        <p className="text-muted-foreground mt-1 text-xs">{role.description}</p>
                      )}
                    </TableCell>
                    <TableCell>{role.userCount}</TableCell>
                    <TableCell>
                      <Badge variant={role.isSystem ? "default" : "outline"}>
                        {role.isSystem ? "system" : "custom"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(role.createdAt).toLocaleDateString(dateLocale)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell className="text-muted-foreground font-bold" colSpan={5}>
                      Chưa có role trong Supabase.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{locale === "vi" ? "Tạo role mới" : "Create role"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createRoleAction} className="space-y-3">
              <Input name="name" placeholder="Content Manager" required />
              <Input name="slug" placeholder="content_manager" required />
              <Input name="description" placeholder="Mô tả quyền hạn" />
              <Button className="w-full" type="submit">
                {locale === "vi" ? "Lưu role" : "Save role"}
              </Button>
            </form>
            <p className="text-muted-foreground mt-4 text-xs leading-5">
              Slug chỉ dùng chữ thường, số và dấu gạch dưới. Ví dụ: admin, mentor, content_manager.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
