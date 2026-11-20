import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import type { Contract } from './contract.d.js';
import contractJson from './contract.json' with { type: 'json' };

export const contract = contractFromJson<Contract>(contractJson);

export const db = postgres({
  contract,
  // On Vercel, POSTGRES_PRISMA_URL is Neon's pooled URL with pgbouncer=true,
  // which the driver needs (the plain pooled DATABASE_URL is rejected by
  // PgBouncer for unsupported startup parameters). Locally it is unset, so
  // fall back to DATABASE_URL.
  url: process.env['POSTGRES_PRISMA_URL'] ?? process.env['DATABASE_URL']!,
});
