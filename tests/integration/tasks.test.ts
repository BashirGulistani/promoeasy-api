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

type TaskRecord = TaskPayload & { id: number };

const BASE_URL = "http://local.test";

async function http<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ res: Response; json: ApiEnvelope<T> }> {
  const res = await SELF.fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const json = (await res.json()) as ApiEnvelope<T>;
  return { res, json };
}

async function seedTask(overrides: Partial<TaskPayload> = {}): Promise<number> {
  const payload: TaskPayload = {
    name: "Seed Task",
    slug: "seed-task",
    description: "Seeded for tests",
    completed: false,
    due_date: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };

  const { res, json } = await http<TaskRecord>("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  expect(res.status).toBe(201);
  expect(json.success).toBe(true);

  return (json as ApiOk<TaskRecord>).result.id;
}











