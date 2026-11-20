/**
 * OneAtlas seed — real data only.
 *
 * Sources:
 *  1. OpenRouter public models endpoint (no key needed):
 *     https://openrouter.ai/api/v1/models
 *     → model names, descriptions, pricing, context windows, modalities,
 *       capabilities, and Artificial Analysis benchmark indices.
 *  2. Curated vendor-published benchmark scores (see CURATED_BENCHMARKS).
 *     Every value comes from the vendor's own model card / technical report.
 *     Models without a sourced score get NO score row — never invented.
 *
 * Idempotent: clears tables first, then inserts.
 * Run: npm run db:seed
 */
import "dotenv/config";
import { db } from "../src/prisma/db";
import { slugify } from "../src/lib/format";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

interface ORModel {
  id: string;
  canonical_slug?: string;
  name: string;
  description?: string;
  created?: number;
  context_length?: number;
  pricing?: Record<string, string | undefined>;
  architecture?: {
    modality?: string;
    input_modalities?: string[];
    output_modalities?: string[];
    tokenizer?: string;
  };
  top_provider?: { context_length?: number; max_completion_tokens?: number };
  hugging_face_id?: string | null;
  supported_parameters?: string[];
  reasoning?: unknown;
  benchmarks?: {
    artificial_analysis?: Record<string, number | null>;
  };
}

// ---------------------------------------------------------------------------
// Lab directory (vendor metadata). Unknown prefixes get a generated lab.
// ---------------------------------------------------------------------------
interface LabInfo {
  name: string;
  website: string;
  description: string;
  founded?: number;
  headquarters?: string;
}

const LABS: Record<string, LabInfo> = {
  openai: {
    name: "OpenAI",
    website: "https://openai.com",
    description: "Builder of the GPT family, o-series reasoning models and ChatGPT.",
    founded: 2015,
    headquarters: "San Francisco, USA",
  },
  anthropic: {
    name: "Anthropic",
    website: "https://www.anthropic.com",
    description: "Builder of the Claude family of AI assistants, focused on safety.",
    founded: 2021,
    headquarters: "San Francisco, USA",
  },
  google: {
    name: "Google DeepMind",
    website: "https://deepmind.google",
    description: "Builder of the Gemini family, Gemma open models and AlphaFold.",
    founded: 2010,
    headquarters: "London, UK",
  },
  "meta-llama": {
    name: "Meta",
    website: "https://ai.meta.com",
    description: "Builder of the open-weight Llama family of models.",
    founded: 2004,
    headquarters: "Menlo Park, USA",
  },
  meta: {
    name: "Meta",
    website: "https://ai.meta.com",
    description: "Builder of the open-weight Llama family of models.",
    founded: 2004,
    headquarters: "Menlo Park, USA",
  },
  mistralai: {
    name: "Mistral AI",
    website: "https://mistral.ai",
    description: "European lab behind Mistral, Mixtral, Codestral and Pixtral models.",
    founded: 2023,
    headquarters: "Paris, France",
  },
  deepseek: {
    name: "DeepSeek",
    website: "https://www.deepseek.com",
    description: "Chinese lab behind DeepSeek-V3 and DeepSeek-R1 reasoning models.",
    founded: 2023,
    headquarters: "Hangzhou, China",
  },
  "x-ai": {
    name: "xAI",
    website: "https://x.ai",
    description: "Elon Musk's AI company, builder of the Grok family.",
    founded: 2023,
    headquarters: "San Francisco, USA",
  },
  qwen: {
    name: "Qwen (Alibaba)",
    website: "https://qwen.ai",
    description: "Alibaba's Qwen family of open and hosted large language models.",
    founded: 2023,
    headquarters: "Hangzhou, China",
  },
  microsoft: {
    name: "Microsoft",
    website: "https://www.microsoft.com/en-us/ai",
    description: "Builder of Phi small language models and Azure AI services.",
    founded: 1975,
    headquarters: "Redmond, USA",
  },
  cohere: {
    name: "Cohere",
    website: "https://cohere.com",
    description: "Enterprise AI lab behind Command R, Embed and Rerank models.",
    founded: 2019,
    headquarters: "Toronto, Canada",
  },
  ai21: {
    name: "AI21 Labs",
    website: "https://www.ai21.com",
    description: "Israeli lab behind Jamba hybrid SSM-Transformer models.",
    founded: 2017,
    headquarters: "Tel Aviv, Israel",
  },
  perplexity: {
    name: "Perplexity",
    website: "https://www.perplexity.ai",
    description: "Answer engine combining search with large language models.",
    founded: 2022,
    headquarters: "San Francisco, USA",
  },
  groq: {
    name: "Groq",
    website: "https://groq.com",
    description: "Inference hardware and cloud provider for ultra-fast LLM serving.",
    founded: 2016,
    headquarters: "Mountain View, USA",
  },
  together: {
    name: "Together AI",
    website: "https://www.together.ai",
    description: "Open-source model cloud: inference, fine-tuning and GPU clusters.",
    founded: 2022,
    headquarters: "San Francisco, USA",
  },
  fireworks: {
    name: "Fireworks AI",
    website: "https://fireworks.ai",
    description: "Serverless inference platform for open and custom models.",
    founded: 2022,
    headquarters: "San Mateo, USA",
  },
  amazon: {
    name: "Amazon",
    website: "https://aws.amazon.com/bedrock",
    description: "Builder of Nova models and the Bedrock managed AI platform.",
    founded: 1994,
    headquarters: "Seattle, USA",
  },
  nvidia: {
    name: "NVIDIA",
    website: "https://www.nvidia.com",
    description: "GPU maker and builder of Nemotron open models and NIM inference.",
    founded: 1993,
    headquarters: "Santa Clara, USA",
  },
  tencent: {
    name: "Tencent",
    website: "https://www.tencent.com",
    description: "Chinese tech giant behind the Hunyuan model family.",
    founded: 1998,
    headquarters: "Shenzhen, China",
  },
  moonshotai: {
    name: "Moonshot AI",
    website: "https://www.moonshot.ai",
    description: "Chinese lab behind the Kimi long-context model family.",
    founded: 2023,
    headquarters: "Beijing, China",
  },
  "z-ai": {
    name: "Zhipu AI",
    website: "https://www.zhipuai.com",
    description: "Chinese lab behind the GLM family of models.",
    founded: 2019,
    headquarters: "Beijing, China",
  },
  minimax: {
    name: "MiniMax",
    website: "https://www.minimax.io",
    description: "Chinese lab behind MiniMax M1/M2 and Hailuo video models.",
    founded: 2021,
    headquarters: "Shanghai, China",
  },
  stepfun: {
    name: "StepFun",
    website: "https://www.stepfun.com",
    description: "Chinese lab behind the Step series of multimodal models.",
    founded: 2023,
    headquarters: "Shanghai, China",
  },
  baidu: {
    name: "Baidu",
    website: "https://www.baidu.com",
    description: "Chinese tech giant behind the ERNIE model family.",
    founded: 2000,
    headquarters: "Beijing, China",
  },
  bytedance: {
    name: "ByteDance",
    website: "https://www.bytedance.com",
    description: "Builder of the Seed model family and Doubao AI services.",
    founded: 2012,
    headquarters: "Beijing, China",
  },
  nousresearch: {
    name: "Nous Research",
    website: "https://nousresearch.com",
    description: "Open-weight research collective behind Hermes models.",
    founded: 2023,
    headquarters: "New York, USA",
  },
  liquid: {
    name: "Liquid AI",
    website: "https://www.liquid.ai",
    description: "MIT spin-off building liquid neural network foundation models.",
    founded: 2023,
    headquarters: "Cambridge, USA",
  },
  eleutherai: {
    name: "EleutherAI",
    website: "https://www.eleuther.ai",
    description: "Non-profit open AI research collective.",
    founded: 2020,
    headquarters: "USA",
  },
  openrouter: {
    name: "OpenRouter",
    website: "https://openrouter.ai",
    description: "Unified API gateway routing to hundreds of AI models.",
    founded: 2023,
    headquarters: "USA",
  },
  infermatic: {
    name: "Infermatic",
    website: "https://infermatic.ai",
    description: "Inference provider for open-weight models.",
    headquarters: "USA",
  },
};

// Provider per lab (the lab's own inference service where it has one).
const LAB_PROVIDER: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google Cloud",
  "meta-llama": "Together AI",
  mistralai: "Mistral AI",
  deepseek: "DeepSeek",
  "x-ai": "xAI",
  qwen: "Alibaba Cloud",
  microsoft: "Microsoft Azure",
  cohere: "Cohere",
  ai21: "AI21 Labs",
  perplexity: "Perplexity",
  groq: "Groq",
  together: "Together AI",
  fireworks: "Fireworks AI",
  amazon: "Amazon Bedrock",
  nvidia: "NVIDIA NIM",
  tencent: "Tencent Cloud",
  moonshotai: "Moonshot AI",
  "z-ai": "Zhipu AI",
  minimax: "MiniMax",
  stepfun: "StepFun",
  baidu: "Baidu AI Cloud",
  bytedance: "Volcengine",
  nousresearch: "Together AI",
  liquid: "Liquid AI",
  eleutherai: "OpenRouter",
  openrouter: "OpenRouter",
  infermatic: "Infermatic",
};

const PROVIDERS: Record<string, { website: string; description: string }> = {
  OpenRouter: {
    website: "https://openrouter.ai",
    description: "Unified API for hundreds of models from every major lab.",
  },
  OpenAI: {
    website: "https://platform.openai.com",
    description: "OpenAI's own API platform for GPT and o-series models.",
  },
  Anthropic: {
    website: "https://www.anthropic.com/api",
    description: "Anthropic's API for Claude models.",
  },
  "Google Cloud": {
    website: "https://cloud.google.com/vertex-ai",
    description: "Google Cloud Vertex AI serving Gemini and Gemma models.",
  },
  "Together AI": {
    website: "https://www.together.ai",
    description: "Open-model cloud with fast inference and fine-tuning.",
  },
  "Fireworks AI": {
    website: "https://fireworks.ai",
    description: "Serverless inference for open and custom models.",
  },
  Groq: {
    website: "https://groq.com",
    description: "LPU-powered inference with extremely low latency.",
  },
  DeepSeek: {
    website: "https://platform.deepseek.com",
    description: "DeepSeek's own API platform.",
  },
  "Mistral AI": {
    website: "https://console.mistral.ai",
    description: "Mistral's La Plateforme API.",
  },
  xAI: {
    website: "https://x.ai/api",
    description: "xAI's API for Grok models.",
  },
  Cohere: {
    website: "https://cohere.com",
    description: "Cohere's enterprise AI platform.",
  },
  "Amazon Bedrock": {
    website: "https://aws.amazon.com/bedrock",
    description: "AWS managed service for foundation models.",
  },
  "NVIDIA NIM": {
    website: "https://www.nvidia.com/en-us/ai/",
    description: "NVIDIA inference microservices for open models.",
  },
  "Alibaba Cloud": {
    website: "https://www.alibabacloud.com/product/bailian",
    description: "Alibaba Cloud Model Studio serving Qwen models.",
  },
  "Microsoft Azure": {
    website: "https://azure.microsoft.com/en-us/products/ai-foundry",
    description: "Azure AI Foundry model catalog and inference.",
  },
  "AI21 Labs": {
    website: "https://www.ai21.com",
    description: "AI21's Jamba model API.",
  },
  Perplexity: {
    website: "https://www.perplexity.ai",
    description: "Perplexity's Sonar API with live web search.",
  },
  "Tencent Cloud": {
    website: "https://cloud.tencent.com/product/hunyuan",
    description: "Tencent Cloud serving Hunyuan models.",
  },
  "Moonshot AI": {
    website: "https://platform.moonshot.ai",
    description: "Moonshot's Kimi API platform.",
  },
  "Zhipu AI": {
    website: "https://open.bigmodel.cn",
    description: "Zhipu's BigModel open platform for GLM models.",
  },
  MiniMax: {
    website: "https://www.minimax.io",
    description: "MiniMax open platform for M-series models.",
  },
  StepFun: {
    website: "https://www.stepfun.com",
    description: "StepFun's model API platform.",
  },
  "Baidu AI Cloud": {
    website: "https://cloud.baidu.com",
    description: "Baidu AI Cloud serving ERNIE models.",
  },
  Volcengine: {
    website: "https://www.volcengine.com",
    description: "ByteDance's cloud platform serving Seed models.",
  },
  "Liquid AI": {
    website: "https://www.liquid.ai",
    description: "Liquid AI's model serving platform.",
  },
  Infermatic: {
    website: "https://infermatic.ai",
    description: "Infermatic inference cloud for open models.",
  },
};

// ---------------------------------------------------------------------------
// Curated vendor-published benchmark scores.
// Key: substring matched against the OpenRouter model id (first match wins).
// Every value is from the vendor's own published model card / technical report.
// ---------------------------------------------------------------------------
interface CuratedScore {
  match: string;
  benchmark: string;
  score: number;
  source: string;
}

const CURATED_BENCHMARKS: CuratedScore[] = [
  { match: "openai/gpt-5", benchmark: "GPQA Diamond", score: 88.4, source: "OpenAI GPT-5 system card" },
  { match: "openai/gpt-5", benchmark: "AIME 2025", score: 94.6, source: "OpenAI GPT-5 system card" },
  { match: "openai/gpt-4o", benchmark: "MMLU", score: 88.7, source: "OpenAI GPT-4o system card" },
  { match: "openai/gpt-4o", benchmark: "HumanEval", score: 90.2, source: "OpenAI GPT-4o system card" },
  { match: "openai/o3", benchmark: "AIME 2024", score: 96.7, source: "OpenAI o3 system card" },
  { match: "openai/o1", benchmark: "AIME 2024", score: 74.4, source: "OpenAI o1 system card" },
  { match: "openai/o1", benchmark: "GPQA Diamond", score: 78.0, source: "OpenAI o1 system card" },
  { match: "anthropic/claude-sonnet-4.5", benchmark: "SWE-bench Verified", score: 77.2, source: "Anthropic Claude Sonnet 4.5 announcement" },
  { match: "anthropic/claude-sonnet-4.5", benchmark: "GPQA Diamond", score: 83.3, source: "Anthropic Claude Sonnet 4.5 announcement" },
  { match: "anthropic/claude-opus-4.1", benchmark: "SWE-bench Verified", score: 74.5, source: "Anthropic Claude Opus 4.1 announcement" },
  { match: "anthropic/claude-3.7-sonnet", benchmark: "SWE-bench Verified", score: 62.3, source: "Anthropic Claude Sonnet 3.7 announcement" },
  { match: "anthropic/claude-3.5-sonnet", benchmark: "MMLU", score: 88.7, source: "Anthropic Claude 3.5 Sonnet (new) model card" },
  { match: "anthropic/claude-3.5-sonnet", benchmark: "GPQA Diamond", score: 59.4, source: "Anthropic Claude 3.5 Sonnet (new) model card" },
  { match: "google/gemini-2.5-pro", benchmark: "GPQA Diamond", score: 84.0, source: "Google Gemini 2.5 Pro model card" },
  { match: "google/gemini-2.5-pro", benchmark: "MMLU-Pro", score: 86.0, source: "Google Gemini 2.5 Pro model card" },
  { match: "meta-llama/llama-3.1-405b", benchmark: "MMLU", score: 88.6, source: "Meta Llama 3.1 paper" },
  { match: "meta-llama/llama-3.1-405b", benchmark: "HumanEval", score: 89.0, source: "Meta Llama 3.1 paper" },
  { match: "deepseek/deepseek-chat-v3", benchmark: "MMLU", score: 88.5, source: "DeepSeek-V3 technical report" },
  { match: "deepseek/deepseek-chat-v3", benchmark: "HumanEval", score: 82.6, source: "DeepSeek-V3 technical report" },
  { match: "deepseek/deepseek-r1", benchmark: "MMLU", score: 90.8, source: "DeepSeek-R1 paper" },
  { match: "deepseek/deepseek-r1", benchmark: "GPQA Diamond", score: 71.5, source: "DeepSeek-R1 paper" },
  { match: "deepseek/deepseek-r1", benchmark: "MATH-500", score: 97.3, source: "DeepSeek-R1 paper" },
  { match: "x-ai/grok-4", benchmark: "AIME 2025", score: 94.5, source: "xAI Grok 4 model card" },
  { match: "x-ai/grok-4", benchmark: "GPQA Diamond", score: 88.4, source: "xAI Grok 4 model card" },
  { match: "mistralai/mistral-large-2411", benchmark: "MMLU", score: 84.0, source: "Mistral AI Mistral Large 2 announcement" },
  { match: "qwen/qwen-2.5-72b-instruct", benchmark: "MMLU", score: 86.1, source: "Qwen2.5 technical report" },
];

const AA_LABELS: Record<string, string> = {
  intelligence_index: "Artificial Analysis Intelligence Index",
  coding_index: "Artificial Analysis Coding Index",
  agentic_index: "Artificial Analysis Agentic Index",
  economics_index: "Artificial Analysis Economics Index",
  engineering_index: "Artificial Analysis Engineering Index",
  healthcare_and_accounting_index: "Artificial Analysis Healthcare Index",
  healthcare_and_medical_index: "Artificial Analysis Healthcare Index",
  legal_index: "Artificial Analysis Legal Index",
  finance_and_accounting_index: "Artificial Analysis Finance Index",
  strategy_and_ops_index: "Artificial Analysis Strategy Index",
  multilingual_index: "Artificial Analysis Multilingual Index",
  cyber_index: "Artificial Analysis Cyber Index",
  decision_index: "Artificial Analysis Decision Index",
  openness_index: "Artificial Analysis Openness Index",
};

function titleCase(s: string): string {
  return s
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function cleanName(id: string, name: string): string {
  const prefix = id.split("/")[0];
  const vendor = LABS[prefix]?.name;
  if (vendor && name.startsWith(`${vendor}:`)) return name.slice(vendor.length + 1).trim();
  if (name.includes(": ")) {
    const after = name.split(": ").slice(1).join(": ");
    if (after.length > 2) return after;
  }
  return name;
}

function deriveType(m: ORModel): string {
  const id = m.id.toLowerCase();
  const name = m.name.toLowerCase();
  const inMods = m.architecture?.input_modalities ?? [];
  const outMods = m.architecture?.output_modalities ?? [];
  if (id.includes("embed") || name.includes("embed")) return "embedding";
  if (outMods.includes("image")) return "image";
  if (id.includes("whisper") || id.includes("tts") || name.includes("text-to-speech"))
    return "audio";
  if (name.includes("coder") || name.includes("code-") || id.includes("coder"))
    return "code";
  if (m.reasoning || /(\bo[13]\b|reasoning|thinking|r1\b|deepseek-r1)/.test(id + " " + name))
    return "reasoning";
  if (inMods.includes("image") || inMods.includes("video") || inMods.includes("audio"))
    return "multimodal";
  return "chat";
}

function deriveCapabilities(m: ORModel): string[] {
  const caps = new Set<string>();
  const params = m.supported_parameters ?? [];
  if (params.includes("tools") || params.includes("tool_choice")) caps.add("Tool calling");
  if (params.includes("reasoning") || params.includes("include_reasoning") || m.reasoning)
    caps.add("Reasoning");
  if (params.includes("structured_outputs") || params.includes("response_format"))
    caps.add("Structured outputs");
  if (params.includes("seed")) caps.add("Deterministic seed");
  if ((m.architecture?.input_modalities ?? []).includes("image")) caps.add("Vision");
  if ((m.architecture?.input_modalities ?? []).includes("file")) caps.add("File input");
  if ((m.architecture?.input_modalities ?? []).includes("audio")) caps.add("Audio input");
  if ((m.architecture?.output_modalities ?? []).includes("image")) caps.add("Image generation");
  return [...caps];
}

async function fetchModels(): Promise<ORModel[]> {
  try {
    const res = await fetch(OPENROUTER_MODELS_URL, {
      headers: { "User-Agent": "OneAtlas-seed/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { data: ORModel[] };
    console.log(`Fetched ${json.data.length} models from OpenRouter`);
    return json.data;
  } catch (err) {
    console.warn("Live fetch failed, falling back to cached catalog:", err);
    const fs = await import("node:fs");
    const raw = fs.readFileSync("prisma/openrouter-models.json", "utf-8");
    const json = JSON.parse(raw) as { data: ORModel[] };
    console.log(`Using cached catalog: ${json.data.length} models`);
    return json.data;
  }
}

async function main() {
  console.log("OneAtlas seed starting…");

  // Clear existing data (children first).
  await db.orm.public.BenchmarkScore.where((b) => b.id.gt(0)).deleteAll();
  await db.orm.public.Model.where((m) => m.id.gt(0)).deleteAll();
  await db.orm.public.Lab.where((l) => l.id.gt(0)).deleteAll();
  await db.orm.public.Provider.where((p) => p.id.gt(0)).deleteAll();
  console.log("Cleared existing rows.");

  const models = await fetchModels();

  // Providers
  const providerIds = new Map<string, number>();
  for (const [name, info] of Object.entries(PROVIDERS)) {
    const row = await db.orm.public.Provider.create({
      name,
      slug: slugify(name),
      website: info.website,
      description: info.description,
    });
    providerIds.set(name, row.id);
  }
  console.log(`Created ${providerIds.size} providers.`);

  // Labs (from data + known directory). A leading "~" on an OpenRouter
  // vendor prefix denotes the same lab served via another route, so it is
  // stripped before lookup (e.g. "~openai" → OpenAI).
  const labPrefixes = [
    ...new Set(models.map((m) => m.id.split("/")[0].replace(/^~/, ""))),
  ];
  const labIds = new Map<string, number>();
  const labIdsByName = new Map<string, number>();
  for (const prefix of labPrefixes) {
    const info = LABS[prefix];
    const name = info?.name ?? titleCase(prefix);
    // Several vendor prefixes are the same lab (e.g. "meta" and
    // "meta-llama" are both Meta) — share one Lab row per name.
    if (labIdsByName.has(name)) {
      labIds.set(prefix, labIdsByName.get(name)!);
      continue;
    }
    const row = await db.orm.public.Lab.create({
      name,
      slug: slugify(name),
      website: info?.website ?? null,
      description: info?.description ?? null,
      founded: info?.founded ?? null,
      headquarters: info?.headquarters ?? null,
    });
    labIds.set(prefix, row.id);
    labIdsByName.set(name, row.id);
  }
  console.log(`Created ${labIdsByName.size} labs.`);

  // Models
  let inserted = 0;
  let skipped = 0;
  const modelIdBySlug = new Map<string, number>();
  const seenSlugs = new Set<string>();

  for (const m of models) {
    const slugBase = slugify(m.canonical_slug ?? m.id);
    let slug = slugBase;
    let n = 2;
    while (seenSlugs.has(slug)) slug = `${slugBase}-${n++}`;
    seenSlugs.add(slug);

    const prefix = m.id.split("/")[0].replace(/^~/, "");
    const providerName = LAB_PROVIDER[prefix] ?? "OpenRouter";
    const inputPrice = parseFloat(m.pricing?.prompt ?? "0") * 1_000_000 || 0;
    const outputPrice = parseFloat(m.pricing?.completion ?? "0") * 1_000_000 || 0;

    try {
      const row = await db.orm.public.Model.create({
        openRouterId: m.id,
        slug,
        name: cleanName(m.id, m.name).slice(0, 200),
        description: (m.description ?? "").slice(0, 1000) || null,
        labId: labIds.get(prefix) ?? null,
        providerId: providerIds.get(providerName) ?? null,
        type: deriveType(m),
        modality: m.architecture?.modality ?? null,
        contextLength: m.context_length ?? 0,
        inputPrice,
        outputPrice,
        maxCompletionTokens: m.top_provider?.max_completion_tokens ?? null,
        capabilities: deriveCapabilities(m),
        inputModalities: m.architecture?.input_modalities ?? ["text"],
        outputModalities: m.architecture?.output_modalities ?? ["text"],
        huggingFaceId: m.hugging_face_id ?? null,
        releaseDate: m.created ? new Date(m.created * 1000) : null,
      });
      modelIdBySlug.set(slug, row.id);
      inserted++;
    } catch (err) {
      skipped++;
      console.warn(`Skipped ${m.id}:`, (err as Error).message?.slice(0, 120));
    }
  }
  console.log(`Inserted ${inserted} models, skipped ${skipped}.`);

  // Benchmarks from OpenRouter (Artificial Analysis indices)
  let aaCount = 0;
  const benchRows: { modelId: number; benchmark: string; score: number; source: string }[] = [];
  for (const m of models) {
    const slug = slugify(m.canonical_slug ?? m.id);
    const modelId = modelIdBySlug.get(slug);
    if (!modelId) continue;
    const aa = m.benchmarks?.artificial_analysis;
    if (!aa) continue;
    for (const [key, value] of Object.entries(aa)) {
      if (value === null || value === undefined) continue;
      const label = AA_LABELS[key];
      if (!label) continue;
      benchRows.push({
        modelId,
        benchmark: label,
        score: value,
        source: "Artificial Analysis (via OpenRouter)",
      });
    }
  }
  // Curated vendor-published scores (matched by model id substring)
  let curatedMatched = 0;
  const curatedSkipped: string[] = [];
  for (const c of CURATED_BENCHMARKS) {
    const hit = models.find((m) => m.id.toLowerCase().includes(c.match.toLowerCase()));
    if (!hit) {
      curatedSkipped.push(c.match);
      continue;
    }
    const modelId = modelIdBySlug.get(slugify(hit.canonical_slug ?? hit.id));
    if (!modelId) continue;
    if (benchRows.some((r) => r.modelId === modelId && r.benchmark === c.benchmark)) continue;
    benchRows.push({ modelId, benchmark: c.benchmark, score: c.score, source: c.source });
    curatedMatched++;
  }

  // Insert benchmark rows in batches (dedupe by model+benchmark first —
  // two AA indices can map to one label, e.g. healthcare variants).
  const seenBench = new Set<string>();
  const uniqueBenchRows = benchRows.filter((r) => {
    const key = `${r.modelId}|${r.benchmark}`;
    if (seenBench.has(key)) return false;
    seenBench.add(key);
    return true;
  });
  const BATCH = 50;
  for (let i = 0; i < uniqueBenchRows.length; i += BATCH) {
    await Promise.all(
      uniqueBenchRows.slice(i, i + BATCH).map((r) =>
        db.orm.public.BenchmarkScore.create({
          modelId: r.modelId,
          benchmark: r.benchmark,
          score: r.score,
          source: r.source,
        }),
      ),
    );
    aaCount += Math.min(BATCH, uniqueBenchRows.length - i);
  }
  console.log(
    `Inserted ${uniqueBenchRows.length} benchmark rows (curated matched: ${curatedMatched}, unmatched curated: ${curatedSkipped.join(", ") || "none"}).`,
  );

  const counts = await db.orm.public.Model.aggregate((a) => ({ total: a.count() }));
  console.log(`Seed complete. Models in DB: ${counts.total}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
