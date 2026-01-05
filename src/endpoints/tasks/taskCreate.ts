import { D1CreateEndpoint } from "chanfana";
import { z } from "zod";
import { HandleArgs } from "../../types";
import { TaskModel } from "./base";

const TaskCreateSchema = TaskModel.schema
  .omit({ id: true })
  .extend({
    description: z.string().default(""),
    completed: z.coerce.boolean().default(false),
    due_date: z.string().datetime().optional().nullable(),
  });

export class TaskCreate extends D1CreateEndpoint<HandleArgs> {
  _meta = {
    model: TaskModel,
    fields: TaskCreateSchema,
  };
}
