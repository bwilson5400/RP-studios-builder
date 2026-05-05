# RP Studios Builder

A Vercel-ready starter build for the RP Studios website builder platform.

## Included in this first build

- Clean modern UI with white background and purple accents
- Seller dashboard
- Place New Order flow
- Bundle Builder pricing/promos
- AI Website Build Flow with confirmation-before-action logic
- Client account dashboard
- Domain marketplace preview
- Billing & Contracts section
- Seller Action Records admin page
- CRM / Leads
- Reporting
- Knowledge Hub
- Settings with theme preference
- Preview Mode rules:
  - Seller PIN: `1234`
  - Admin PIN: `0000`

## Important

This is the first functional starter build. It includes mock data and the structure for real Supabase/Vercel integration. Real billing, domain purchasing, SMS verification, email verification, AI generation, and publishing should be wired next.

## Deploy to Vercel

1. Import this repo into Vercel.
2. Set environment variables from `.env.example`.
3. Deploy.

## Next build phase

- Supabase auth + roles
- Database tables using `supabase/schema.sql`
- Twilio SMS OTP
- Email verification
- OpenAI API AI builder
- Vercel deploy/publish integration
- Domain provider integration
- Square payment flow
