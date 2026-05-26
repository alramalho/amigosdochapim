<p align="center">
  <img src="public/logo_v2.png" alt="Amigos do Chapim" width="360" />
</p>

<p align="center">
  Uma plataforma simples para abrir portas a jovens artistas.
</p>

## O projeto

Os Amigos do Chapim apoiam talento artístico com financiamento, recursos e uma comunidade de pessoas que quer ver projetos sair do papel.

O primeiro concurso é dedicado a curtas-metragens: candidaturas, avaliação do júri, submissão de materiais finais e acompanhamento do projeto vencedor.

## Stack

- Next.js
- React
- Prisma
- Supabase Auth
- Stripe
- S3 uploads

## Desenvolvimento

```bash
pnpm install
pnpm db:generate
pnpm dev
```

O site corre em `http://localhost:3027`.

## Uploads

As candidaturas usam uploads diretos para S3 através de `POST /api/uploads/presign`.

```env
S3_BUCKET=alramalhosandbox
S3_REGION=eu-central-1
S3_KEY_PREFIX=amigos_do_chapim/local
S3_PUBLIC_BASE_URL=https://alramalhosandbox.s3.eu-central-1.amazonaws.com
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

Em produção:

```env
S3_KEY_PREFIX=amigos_do_chapim/prod
```

Ficheiros aceites: PDF, Word, JPEG, PNG e WebP. Limite atual: 25 MB por ficheiro.
