# PostHog post-wizard report

The wizard has completed a full PostHog integration for the Amigos do Chapim website. PostHog is initialized via `instrumentation-client.ts` (Next.js 15.3+ approach), with a reverse proxy configured in `next.config.ts` to route through `/ingest` for improved reliability. A server-side client was added to `src/lib/posthog-server.ts` for capturing webhook-triggered events. Users are identified via Supabase auth state changes in the `AuthHandler` component, so sessions are linked to known users as soon as they are authenticated.

| Event name | Description | File |
|---|---|---|
| `donation_checkout_started` | User initiated a donation or subscription checkout | `src/components/donation-section.tsx` |
| `submission_submitted` | User successfully submitted or updated their contest application | `src/app/candidatar/page.tsx` |
| `candidatura_page_viewed` | User viewed the application submission page | `src/app/candidatar/page.tsx` |
| `submission_error` | An error occurred while the user tried to submit their application | `src/app/candidatar/page.tsx` |
| `login_otp_requested` | User requested a magic link / OTP email to log in | `src/app/entrar/page.tsx` |
| `contact_form_submitted` | User submitted the contact/help form | `src/components/contact-form.tsx` |
| `subscription_checkout_completed` | Stripe webhook confirmed a new subscription checkout | `src/app/api/stripe/webhook/route.ts` |
| `donation_checkout_completed` | Stripe webhook confirmed a one-off donation checkout | `src/app/api/stripe/webhook/route.ts` |
| `subscription_cancelled` | Stripe webhook confirmed a subscription was cancelled | `src/app/api/stripe/webhook/route.ts` |

## Next steps

A dashboard and insights have been created in PostHog to track key user behavior:

- **Dashboard**: [Analytics basics (wizard)](https://eu.posthog.com/project/213148/dashboard/784633)
- [Donation checkout started over time](https://eu.posthog.com/project/213148/insights/YeN9APPY)
- [Application submissions over time](https://eu.posthog.com/project/213148/insights/bF7jVAMC)
- [Application submission funnel](https://eu.posthog.com/project/213148/insights/igbtIoQW)
- [Donation conversion funnel](https://eu.posthog.com/project/213148/insights/S7fk1J8d)
- [Subscription cancellations over time](https://eu.posthog.com/project/213148/insights/IwKqwSKe)

## Verify before merging

- [ ] Run a full production build (`pnpm build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any onboarding documentation so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or equivalent) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — the `AuthHandler` now handles this via `onAuthStateChange`, but verify the happy path by logging in and checking that the PostHog person profile updates correctly.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
