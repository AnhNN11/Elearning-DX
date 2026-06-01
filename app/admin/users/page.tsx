import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

const users = [
  { name: "Nguyễn Nhật Anh", email: "admin@techlearn.local", role: "admin", progress: "100%" },
  { name: "Linh Tran", email: "linh@example.com", role: "student", progress: "72%" },
  { name: "Minh Pham", email: "minh@example.com", role: "student", progress: "38%" },
  { name: "Hoa Le", email: "hoa@example.com", role: "student", progress: "91%" },
];

export default async function AdminUsersPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

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
                <TableHead>{dict.admin.userProgress}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.email}>
                  <TableCell className="font-bold">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                  <TableCell className="font-black text-primary">{user.progress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
