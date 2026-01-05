import { contentJson, OpenAPIRoute } from "chanfana";
import { AppContext } from "../types";
import { z } from "zod";



async function fetchLogDetailsFromSource(args: {
  slug: string;
  name: string;
  c: AppContext;
}) {
  const { slug, name, c } = args;

