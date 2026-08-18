import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import {
  INTERVIEW_DURATION_MINUTES,
  getExternalJurorEmails,
  getInterviewSlots,
  isAvailabilityChoice,
  isInterviewSlot,
} from "@/lib/interviews";
import { isSpecialJurorEmail } from "@/lib/jury";
import { prisma } from "@/lib/prisma";

function canRespond(email: string) {
  return isSpecialJurorEmail(email) || isAdminEmail(email);
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user || !canRespond(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const jurors = getExternalJurorEmails();
  const isAdmin = isAdminEmail(user.email);
  const responses = await prisma.interviewAvailability.findMany({
    where: isAdmin ? {} : { jurorEmail: user.email },
    orderBy: { slotStart: "asc" },
  });

  return NextResponse.json({
    durationMinutes: INTERVIEW_DURATION_MINUTES,
    jurors,
    isAdmin,
    viewerEmail: user.email,
    slots: getInterviewSlots().map(({ day, time, startsAt }) => ({
      day,
      time,
      startsAt: startsAt.toISOString(),
    })),
    responses: responses.map((response) => ({
      jurorEmail: response.jurorEmail,
      slotStart: response.slotStart.toISOString(),
      choice: response.choice,
    })),
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user || !canRespond(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const startsAt = new Date(body.slotStart);

  if (Number.isNaN(startsAt.getTime()) || !isInterviewSlot(startsAt)) {
    return NextResponse.json({ error: "Slot inválido." }, { status: 400 });
  }

  if (!isAvailabilityChoice(body.choice)) {
    return NextResponse.json({ error: "Resposta inválida." }, { status: 400 });
  }

  const saved = await prisma.interviewAvailability.upsert({
    where: {
      jurorEmail_slotStart: { jurorEmail: user.email, slotStart: startsAt },
    },
    update: { choice: body.choice },
    create: { jurorEmail: user.email, slotStart: startsAt, choice: body.choice },
  });

  return NextResponse.json({
    jurorEmail: saved.jurorEmail,
    slotStart: saved.slotStart.toISOString(),
    choice: saved.choice,
  });
}
