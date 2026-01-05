import { z } from "zod";

const zDbBoolean = z.preprocess((v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "1" || s === "true" || s === "yes" || s === "y") return true;
    if (s === "0" || s === "false" || s === "no" || s === "n" || s === "") return false;
  }
  return false;
}, z.boolean());

const zDueDate = z.preprocess((v) => {
  if (v == null || v === "") return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") return v;
  return v;
}, z.string().datetime().nullable());


export const TaskSchema = z.object({
  id: z.coerce.number().int(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().default(""),
  completed: zDbBoolean,
  due_date: zDueDate,
});

export type Task = z.infer<typeof TaskSchema>;

export const TaskModel = {
  tableName: "tasks",
  primaryKeys: ["id"] as const,
  schema: TaskSchema,

  fromRow(row: Record<string, unknown>): Task {
    return TaskSchema.parse(row);
  },
} as const;
