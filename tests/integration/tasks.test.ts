import { SELF } from "cloudflare:test";
import { beforeEach, describe, expect, it, vi } from "vitest";

type ApiOk<T> = { success: true; result: T };
type ApiErr = { success: false; errors: Array<{ code?: number; message: string }> };
type ApiEnvelope<T> = ApiOk<T> | ApiErr;

type TaskPayload = {
  name: string;
  slug: string;
  description: string;
  completed: boolean;
  due_date: string; 
};




