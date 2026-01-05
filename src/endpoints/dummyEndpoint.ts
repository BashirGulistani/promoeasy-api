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

