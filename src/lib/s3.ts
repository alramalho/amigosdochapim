import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DEFAULT_REGION = "eu-central-1";
const DEFAULT_BUCKET = "alramalhosandbox";
const DEFAULT_PREFIX = "amigos_do_chapim/local";
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type UploadPurpose = "CV" | "FINAL_MATERIAL";

export type UploadDescriptor = {
  objectKey: string;
  publicUrl: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
};

export function getS3Config() {
  const bucket = process.env.S3_BUCKET || DEFAULT_BUCKET;
  const region = process.env.S3_REGION || process.env.AWS_REGION || DEFAULT_REGION;
  const keyPrefix = (process.env.S3_KEY_PREFIX || DEFAULT_PREFIX).replace(/^\/+|\/+$/g, "");
  const publicBaseUrl =
    process.env.S3_PUBLIC_BASE_URL?.replace(/\/+$/g, "") ||
    `https://${bucket}.s3.${region}.amazonaws.com`;

  return { bucket, region, keyPrefix, publicBaseUrl };
}

export function validateUploadRequest(body: Record<string, unknown>) {
  const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";
  const contentType = typeof body.contentType === "string" ? body.contentType.trim() : "";
  const sizeBytes = Number(body.sizeBytes);
  const purpose = body.purpose === "FINAL_MATERIAL" ? "FINAL_MATERIAL" : body.purpose === "CV" ? "CV" : null;

  if (!fileName || !contentType || !purpose || !Number.isInteger(sizeBytes)) {
    return { error: "Pedido de upload inválido." };
  }

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return { error: "Tipo de ficheiro não permitido." };
  }

  if (sizeBytes <= 0 || sizeBytes > MAX_FILE_SIZE_BYTES) {
    return { error: "O ficheiro excede o limite de 25 MB." };
  }

  return { fileName, contentType, sizeBytes, purpose };
}

export function parseUploadDescriptor(value: unknown): UploadDescriptor | null {
  if (!value || typeof value !== "object") return null;
  const upload = value as Record<string, unknown>;
  const objectKey = typeof upload.objectKey === "string" ? upload.objectKey : "";
  const publicUrl = typeof upload.publicUrl === "string" ? upload.publicUrl : "";
  const fileName = typeof upload.fileName === "string" ? upload.fileName : "";
  const contentType = typeof upload.contentType === "string" ? upload.contentType : "";
  const sizeBytes = Number(upload.sizeBytes);

  if (!objectKey || !publicUrl || !fileName || !contentType || !Number.isInteger(sizeBytes)) return null;
  return { objectKey, publicUrl, fileName, contentType, sizeBytes };
}

export function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 120) || "ficheiro";
}

export async function createPresignedUploadUrl({
  ownerSegment,
  contestSlug,
  purpose,
  fileName,
  contentType,
}: {
  ownerSegment: string;
  contestSlug: string;
  purpose: UploadPurpose;
  fileName: string;
  contentType: string;
}) {
  const { bucket, region, keyPrefix, publicBaseUrl } = getS3Config();
  const safeName = sanitizeFileName(fileName);
  const purposePath = purpose === "CV" ? "cv" : "final-materials";
  const objectKey = `${keyPrefix}/submissions/${contestSlug}/${ownerSegment}/${purposePath}/${crypto.randomUUID()}-${safeName}`;

  const client = new S3Client({ region });
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });
  return {
    bucket,
    objectKey,
    uploadUrl,
    publicUrl: `${publicBaseUrl}/${objectKey}`,
  };
}
