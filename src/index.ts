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


