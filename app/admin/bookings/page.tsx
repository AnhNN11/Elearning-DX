import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMentorBookings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminBookingsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const bookings = await getMentorBookings();

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-black uppercase text-primary">Mentor</p>
        <h1 className="mt-2 text-3xl font-black text-foreground">{dict.admin.bookingsTitle}</h1>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{dict.admin.newRequests}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.admin.learner}</TableHead>
                <TableHead>{dict.admin.topic}</TableHead>
                <TableHead>{dict.admin.time}</TableHead>
                <TableHead>{dict.admin.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <p className="font-bold">{booking.fullName}</p>
                    <p className="text-muted-foreground text-sm">{booking.email}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold">{booking.topic}</p>
                    <p className="text-muted-foreground text-sm">{booking.level}</p>
                    {booking.note && <p className="text-muted-foreground mt-1 text-xs">{booking.note}</p>}
                  </TableCell>
                  <TableCell>{booking.preferredTime}</TableCell>
                  <TableCell><Badge>{booking.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
