import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import type { Contract } from './contract.d.js';
import contractJson from './contract.json' with { type: 'json' };

export const contract = contractFromJson<Contract>(contractJson);

export const db = postgres({
  contract,
  // Neon pooled connections reject the driver's lc_monetary startup
  // parameter (PgBouncer), so at runtime use the DIRECT (unpooled)
  // connection. Locally DATABASE_URL_UNPOOLED is unset, so fall back to
  // DATABASE_URL.
  url:
    process.env['DATABASE_URL_UNPOOLED'] ??
    process.env['POSTGRES_PRISMA_URL'] ??
    process.env['DATABASE_URL']!,
});
