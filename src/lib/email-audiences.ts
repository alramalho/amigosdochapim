export const EMAIL_AUDIENCE_SEGMENTS = [
  "NEWSLETTER",
  "PAYING_MEMBERS",
  "ADMINS",
  "CONTEST_APPLICANTS",
] as const;

export type EmailAudienceSegment = (typeof EMAIL_AUDIENCE_SEGMENTS)[number];

export const EMAIL_AUDIENCE_META: Record<
  EmailAudienceSegment,
  { label: string; description: string }
> = {
  NEWSLETTER: {
    label: "Newsletter",
    description: "Pessoas inscritas para receber novidades e oportunidades futuras.",
  },
  PAYING_MEMBERS: {
    label: "Membros pagantes",
    description: "Subscrições ativas dos planos Apoiante e Amigo.",
  },
  ADMINS: {
    label: "Administradores",
    description: "Emails configurados com acesso de administração.",
  },
  CONTEST_APPLICANTS: {
    label: "Candidatos",
    description: "Pessoas que submeteram uma candidatura ao concurso.",
  },
};

const emailAudienceSet = new Set<string>(EMAIL_AUDIENCE_SEGMENTS);

export function parseEmailAudienceSegments(value: unknown): EmailAudienceSegment[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value.filter(
        (segment): segment is EmailAudienceSegment =>
          typeof segment === "string" && emailAudienceSet.has(segment)
      )
    )
  );
}
