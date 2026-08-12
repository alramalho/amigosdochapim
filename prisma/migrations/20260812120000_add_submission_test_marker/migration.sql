ALTER TABLE "submissions"
ADD COLUMN "is_test" BOOLEAN NOT NULL DEFAULT false;

UPDATE "submissions"
SET "is_test" = true
WHERE LOWER("email") = 'goncalo.melo.4+candidato@gmail.com';
