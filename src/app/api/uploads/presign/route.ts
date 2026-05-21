import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateCurrentContest } from "@/lib/contest-db";
import { createPresignedUploadUrl, validateUploadRequest, type UploadPurpose } from "@/lib/s3";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  const body = await request.json();
  const upload = validateUploadRequest(body);

  if ("error" in upload) {
    return NextResponse.json({ error: upload.error }, { status: 400 });
  }

  const contest = await getOrCreateCurrentContest();
  const presigned = await createPresignedUploadUrl({
    ownerSegment: user ? `users/${user.id}` : `pending/${crypto.randomUUID()}`,
    contestSlug: contest.slug,
    purpose: upload.purpose as UploadPurpose,
    fileName: upload.fileName,
    contentType: upload.contentType,
  });

  return NextResponse.json({
    ...presigned,
    fileName: upload.fileName,
    contentType: upload.contentType,
    sizeBytes: upload.sizeBytes,
  });
}
