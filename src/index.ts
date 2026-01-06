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

