import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateUserRoleAction } from "@/lib/actions";
import { getAdminRoles, getAdminUsers } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminUsersPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const [users, roles] = await Promise.all([getAdminUsers(), getAdminRoles()]);

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-black uppercase text-primary">People</p>
        <h1 className="mt-2 text-3xl font-black text-foreground">{dict.admin.usersTitle}</h1>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{dict.admin.userList}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.admin.name}</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>{dict.admin.role}</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>{dict.admin.userProgress}</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Role action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length ? users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-bold">{user.fullName}</TableCell>
                  <TableCell>
                    <p>{user.email || "Chưa có email trong users"}</p>
                    <p className="text-muted-foreground mt-1 text-xs font-bold">{user.status}</p>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant={role === "admin" ? "default" : "outline"}>{role}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-primary">{user.averageProgress}%</TableCell>
                  <TableCell>{user.enrollmentCount} / {user.completedCourses} completed</TableCell>
                  <TableCell>
                    <form action={updateUserRoleAction} className="flex items-center gap-2">
                      <input name="userId" type="hidden" value={user.id} />
                      <select className="rounded-base border-2 border-border bg-background px-2 py-1 text-xs font-bold" name="role" defaultValue={user.role}>
                        {roles.map((role) => (
                          <option key={role.id} value={role.slug}>{role.slug}</option>
                        ))}
                      </select>
                      <Button size="sm" type="submit" variant="outline">Lưu</Button>
                    </form>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell className="text-muted-foreground font-bold" colSpan={7}>
                    Chưa có user thật trong Supabase users.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
