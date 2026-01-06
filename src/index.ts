import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import type { Context, Next } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

import { tasksRouter } from "./endpoints/tasks/router";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";

type Env = {
  ENVIRONMENT?: "dev" | "staging" | "prod";
  LOG_LEVEL?: "debug" | "info" | "warn" | "error";
  API_KEY?: string; 
  RATE_LIMIT_PER_MIN?: string; 
  REQUEST_ID_HEADER?: string; 
};


type AppBindings = { Bindings: Env };

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue };

type ApiError = { code: number; message: string; meta?: Record<string, JsonValue> };
type ApiResponse<T extends JsonValue = JsonValue> =
  | { success: true; data: T; meta?: Record<string, JsonValue> }
  | { success: false; errors: ApiError[]; meta?: Record<string, JsonValue> };

type LogLevel = NonNullable<Env["LOG_LEVEL"]>;
type Environment = NonNullable<Env["ENVIRONMENT"]>;

type RequestContext = {
  requestId: string;
  startedAt: number;
  ip?: string;
  ua?: string;
  route?: string;
};

type SafeError = {
  status: number;
  errors: ApiError[];
  expose: boolean; 
};

type RateLimitState = {
  windowStartMs: number;
  count: number;
};

type InternalState = {
  rl: Map<string, RateLimitState>;
  metrics: {
    total: number;
    byRoute: Map<string, number>;
    byStatus: Map<number, number>;
    durationsMs: number[]; 
  };
};

const state: InternalState = {
  rl: new Map(),
  metrics: {
    total: 0,
    byRoute: new Map(),
    byStatus: new Map(),
    durationsMs: [],
  },
};


function nowMs(): number {
  return Date.now();
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function safeJson(value: unknown): JsonValue {
  if (value === null) return null;
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean") return value;
  if (Array.isArray(value)) return value.map(safeJson);
  if (t === "object") {
    const out: Record<string, JsonValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = safeJson(v);
    return out;
  }
  return String(value);
}

function pickHeader(c: Context, names: string[]): string | undefined {
  for (const n of names) {
    const v = c.req.header(n);
    if (v) return v;
  }
  return undefined;
}

function parseIntOr<T extends number>(raw: string | undefined, fallback: T): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

function envOr(env: Env, key: keyof Env, fallback: string): string {
  const v = env[key];
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function envEnum<T extends string>(
  env: Env,
  key: keyof Env,
  allowed: readonly T[],
  fallback: T,
): T {
  const v = env[key];
  if (typeof v === "string" && (allowed as readonly string[]).includes(v)) return v as T;
  return fallback;
}

function makeRequestId(c: Context<AppBindings>): string {
  const headerName = envOr(c.env, "REQUEST_ID_HEADER", "x-request-id").toLowerCase();
  const fromHeader = c.req.header(headerName) || c.req.header("x-request-id") || c.req.header("cf-ray");
  if (fromHeader && fromHeader.trim()) return fromHeader.trim();
  return `${nowMs().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function setCommonHeaders(c: Context, reqId: string) {
  c.header("x-request-id", reqId);
  c.header("x-content-type-options", "nosniff");
  c.header("x-frame-options", "DENY");
  c.header("cache-control", "no-store");
}

function jsonOk<T extends JsonValue>(c: Context, data: T, meta?: Record<string, JsonValue>) {
  const body: ApiResponse<T> = { success: true, data, ...(meta ? { meta } : {}) };
  return c.json(body, 200);
}

function jsonErr(c: Context, status: number, errors: ApiError[], meta?: Record<string, JsonValue>) {
  const body: ApiResponse = { success: false, errors, ...(meta ? { meta } : {}) };
  return c.json(body, status as ContentfulStatusCode);
}

function normalizeRoutePath(pathname: string): string {
  return pathname
    .replace(/\/\d+(?=\/|$)/g, "/:id")
    .replace(/\/[a-f0-9]{8,}(?=\/|$)/gi, "/:token");
}
function hashKey(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16);
}

type Logger = ReturnType<typeof createLogger>;

function createLogger(env: Env) {
  const level = envEnum<LogLevel>(env, "LOG_LEVEL", ["debug", "info", "warn", "error"] as const, "info");
  const rank: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
  const minRank = rank[level];














