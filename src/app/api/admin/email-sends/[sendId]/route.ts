import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserEmail, isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sendId: string }> }
) {
  const email = await getCurrentUserEmail(request);
  if (!email || !isAdminEmail(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { sendId } = await params;
  const send = await prisma.emailSend.findUnique({
    where: { id: sendId },
    include: {
      deliveries: {
        orderBy: [{ status: "asc" }, { email: "asc" }],
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          error: true,
          attempts: true,
          acceptedAt: true,
          deliveredAt: true,
        },
      },
    },
  });

  if (!send) {
    return NextResponse.json({ error: "Envio não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ send });
}
