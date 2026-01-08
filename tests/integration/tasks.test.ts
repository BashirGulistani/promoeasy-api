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


describe("Tasks API (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /tasks", () => {
    it("returns [] when there are no tasks", async () => {
      const { res, json } = await http<TaskRecord[]>("/tasks");

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect((json as ApiOk<TaskRecord[]>).result).toEqual([]);
    });

    it("returns one task after creation", async () => {
      await seedTask({
        name: "Test Task",
        slug: "test-task",
        description: "A task for testing",
        completed: false,
        due_date: "2025-01-01T00:00:00.000Z",
      });

      const { res, json } = await http<TaskRecord[]>("/tasks");

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      const list = (json as ApiOk<TaskRecord[]>).result;
      expect(list).toHaveLength(1);
      expect(list[0]).toEqual(
        expect.objectContaining({
          name: "Test Task",
          slug: "test-task",
        }),
      );
    });
  });

  describe("POST /tasks", () => {
    it("creates a task", async () => {
      const payload: TaskPayload = {
        name: "New Task",
        slug: "new-task",
        description: "A brand new task",
        completed: false,
        due_date: "2025-12-31T23:59:59.000Z",
      };

      const { res, json } = await http<TaskRecord>("/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect((json as ApiOk<TaskRecord>).result).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          ...payload,
        }),
      );
    });

    it("rejects invalid input with 400", async () => {
      const badPayload = {
        description: "Missing required fields",
      };

      const { res, json } = await http<any>("/tasks", {
        method: "POST",
        body: JSON.stringify(badPayload),
      });

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect((json as ApiErr).errors).toBeInstanceOf(Array);
    });
  });


  describe("GET /tasks/:id", () => {
    it("fetches a task by id", async () => {
      const payload: TaskPayload = {
        name: "Specific Task",
        slug: "specific-task",
        description: "A task to be fetched by ID",
        completed: false,
        due_date: "2025-06-01T12:00:00.000Z",
      };

      const id = await seedTask(payload);

      const { res, json } = await http<TaskRecord>(`/tasks/${id}`);

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect((json as ApiOk<TaskRecord>).result).toEqual(
        expect.objectContaining({
          id,
          ...payload,
        }),
      );
    });

    it("returns 404 for unknown id", async () => {
      const { res, json } = await http<any>("/tasks/9999");

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
      expect((json as ApiErr).errors[0]?.message).toBe("Not Found");
    });
  });








  

 
  






