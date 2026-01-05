import { contentJson, OpenAPIRoute } from "chanfana";
import { AppContext } from "../types";
import { z } from "zod";



async function fetchLogDetailsFromSource(args: {
  slug: string;
  name: string;
  c: AppContext;
}) {
  const { slug, name, c } = args;


  const baseUrl = c.env?.SOURCE_API_BASE_URL; 
  if (!baseUrl) throw new Error("Missing SOURCE_API_BASE_URL");

  const res = await fetch(`${baseUrl}/logs/${encodeURIComponent(slug)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Source error (${res.status}): ${text || "no body"}`);
  }
  const json = (await res.json()) as unknown;


  const parsed = z
    .object({
      msg: z.string(),
      slug: z.string(),
      name: z.string(),
    })
    .parse(json);

  return parsed;
}




export class LogDetailsEndpoint extends OpenAPIRoute {
  public schema = {
    tags: ["Logs"],
    summary: "Returns the log details (single-source)",
    operationId: "log-details",
    request: {
      params: z.object({
        slug: z.string(),
      }),
      body: contentJson(
        z.object({
          name: z.string(),
        }),
      ),
    },
