## S3 uploads

Contest uploads use direct browser uploads to S3 through `POST /api/uploads/presign`.

Local development should keep uploads separated from production with a different key prefix:

```env
S3_BUCKET=alramalhosandbox
S3_REGION=eu-central-1
S3_KEY_PREFIX=amigos_do_chapim/local
S3_PUBLIC_BASE_URL=https://alramalhosandbox.s3.eu-central-1.amazonaws.com
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

Production should use the same bucket with:

```env
S3_KEY_PREFIX=amigos_do_chapim/prod
```

Allowed file types are PDF, Word documents, JPEG, PNG, and WebP. The current limit is 25 MB per file.
