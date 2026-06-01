import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDemoCertificates } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminCertificatesPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const certificates = await getDemoCertificates();

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-black uppercase text-primary">Credentials</p>
        <h1 className="mt-2 text-3xl font-black text-foreground">{dict.admin.certificatesTitle}</h1>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{dict.admin.issuedCertificates}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.admin.code}</TableHead>
                <TableHead>{dict.admin.course}</TableHead>
                <TableHead>{dict.admin.learner}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((certificate) => (
                <TableRow key={certificate.id}>
                  <TableCell className="font-black text-primary">{certificate.certificateNo}</TableCell>
                  <TableCell className="font-bold">{certificate.courseTitle}</TableCell>
                  <TableCell>{certificate.userName}</TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/certificate/${certificate.id}`}>{dict.admin.view}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
