import { db } from "@/prisma/db";
import { or } from "@prisma/orm-postgres/orm-client";
import type { Models } from "@/prisma/contract";

// The generated Models.* types require every relation to be loaded, but the
// ORM only loads the relations a query includes. These row types describe
// what queries actually return.
export type BenchmarkRow = Omit<Models.public_BenchmarkScore, "model">;
export type LabRow = Omit<Models.public_Lab, "models">;
export type ProviderRow = Omit<Models.public_Provider, "models">;
export type ModelRow = Omit<
  Models.public_Model,
  "benchmarks" | "lab" | "provider"
> & {
  benchmarks: BenchmarkRow[];
  lab: LabRow | null;
  provider: ProviderRow | null;
};
export type LabWithCount = LabRow & { models: number };
export type ProviderWithCount = ProviderRow & { models: number };

export interface ModelFilters {
  q?: string;
  labSlug?: string;
  providerSlug?: string;
  type?: string;
  capability?: string;
  modality?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

const PAGE_SIZE = 24;

/** Intelligence Index (Artificial Analysis) score, if present — used for "popular" sort. */
export function intelligenceIndex(m: ModelRow): number | null {
  const row = m.benchmarks?.find(
    (b) => b.benchmark === "Artificial Analysis Intelligence Index",
  );
  return row ? row.score : null;
}

export async function listModels(filters: ModelFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = filters.limit ?? PAGE_SIZE;

  let labId: number | undefined;
  let providerId: number | undefined;

  if (filters.labSlug) {
    const lab = await db.orm.public.Lab.where({ slug: filters.labSlug }).first();
    labId = lab?.id;
    if (!lab) return { models: [], total: 0, page, totalPages: 0 };
  }
  if (filters.providerSlug) {
    const provider = await db.orm.public.Provider.where({
      slug: filters.providerSlug,
    }).first();
    providerId = provider?.id;
    if (!provider) return { models: [], total: 0, page, totalPages: 0 };
  }

  let query = db.orm.public.Model.include("lab")
    .include("provider")
    .include("benchmarks");

  if (filters.q) {
    const term = `%${filters.q.trim()}%`;
    query = query.where((m) =>
      or(m.name.ilike(term), m.description.ilike(term), m.openRouterId.ilike(term)),
    );
  }
  if (labId !== undefined) query = query.where({ labId });
  if (providerId !== undefined) query = query.where({ providerId });
  if (filters.type) query = query.where({ type: filters.type });

  // DB returns at most a few hundred rows; array filters + sorting run in JS.
  let models = await query.all();

  if (filters.capability) {
    models = models.filter((m) => m.capabilities.includes(filters.capability!));
  }
  if (filters.modality) {
    models = models.filter(
      (m) =>
        m.inputModalities.includes(filters.modality!) ||
        m.outputModalities.includes(filters.modality!),
    );
  }

  const sort = filters.sort ?? "popular";
  const sorted = [...models].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.inputPrice + a.outputPrice - (b.inputPrice + b.outputPrice);
      case "price-desc":
        return b.inputPrice + b.outputPrice - (a.inputPrice + a.outputPrice);
      case "context-desc":
        return b.contextLength - a.contextLength;
      case "context-asc":
        return a.contextLength - b.contextLength;
      case "newest":
        return (
          (b.releaseDate?.getTime() ?? 0) - (a.releaseDate?.getTime() ?? 0) ||
          b.id - a.id
        );
      case "name":
        return a.name.localeCompare(b.name);
      case "popular":
      default: {
        const ai = intelligenceIndex(a);
        const bi = intelligenceIndex(b);
        if (ai !== null && bi !== null) return bi - ai;
        if (ai !== null) return -1;
        if (bi !== null) return 1;
        return b.contextLength - a.contextLength;
      }
    }
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    models: sorted.slice(start, start + limit),
    total,
    page,
    totalPages,
  };
}

export async function getModelBySlug(slug: string): Promise<ModelRow | null> {
  return db.orm.public.Model.where({ slug })
    .include("lab")
    .include("provider")
    .include("benchmarks")
    .first();
}

export async function getModelsBySlugs(slugs: string[]): Promise<ModelRow[]> {
  if (slugs.length === 0) return [];
  const models = await db.orm.public.Model.where((m) => m.slug.in(slugs))
    .include("lab")
    .include("provider")
    .include("benchmarks")
    .all();
  // Preserve the requested order.
  const order = new Map(slugs.map((s, i) => [s, i]));
  return models.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
}

export async function getLabs(): Promise<LabWithCount[]> {
  return db.orm.public.Lab.include("models", (models) => models.count())
    .orderBy((l) => l.name.asc())
    .all();
}

export async function getProviders(): Promise<ProviderWithCount[]> {
  return db.orm.public.Provider.include("models", (models) => models.count())
    .orderBy((p) => p.name.asc())
    .all();
}

export async function getBenchmarkNames(): Promise<string[]> {
  const rows = await db.orm.public.BenchmarkScore.select("benchmark").all();
  return [...new Set(rows.map((r) => r.benchmark))].sort();
}

export async function getRankings(benchmark: string, type?: string) {
  const rows = await db.orm.public.BenchmarkScore.where({ benchmark })
    .include("model", (model) => model.include("lab"))
    .orderBy((b) => b.score.desc())
    .limit(100)
    .all();
  const withModel = rows.filter(
    (r): r is typeof r & { model: NonNullable<typeof r.model> } =>
      r.model !== null,
  );
  if (!type) return withModel;
  return withModel.filter((r) => r.model?.type === type);
}

export async function getStats() {
  const [models, labs, providers] = await Promise.all([
    db.orm.public.Model.aggregate((a) => ({ total: a.count() })),
    db.orm.public.Lab.aggregate((a) => ({ total: a.count() })),
    db.orm.public.Provider.aggregate((a) => ({ total: a.count() })),
  ]);
  return {
    models: models.total,
    labs: labs.total,
    providers: providers.total,
  };
}

export async function getFilterOptions() {
  const [labs, providers, models] = await Promise.all([
    db.orm.public.Lab.select("id", "name", "slug").orderBy((l) => l.name.asc()).all(),
    db.orm.public.Provider.select("id", "name", "slug")
      .orderBy((p) => p.name.asc())
      .all(),
    db.orm.public.Model.select("capabilities", "inputModalities", "type").all(),
  ]);
  const capabilities = [...new Set(models.flatMap((m) => m.capabilities))].sort();
  const modalities = [
    ...new Set(models.flatMap((m) => m.inputModalities)),
  ].sort();
  const types = [...new Set(models.map((m) => m.type))].sort();
  return { labs, providers, capabilities, modalities, types };
}
