import { redirect } from "next/navigation";

export default async function SepayPayPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  redirect(`/checkout/${orderId}`);
}
