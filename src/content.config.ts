import { defineCollection } from "astro/content/config";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const link = z.object({ label: z.string(), url: z.string() });

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "*.md" }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
    meta: z.string(),
    highlight: z.boolean().default(false),
    lede: z.string(),
    facts: z.array(z.object({ label: z.string(), value: z.string() })).max(4),
    links: z.array(link),
    say: z.string(),
  }),
});

const experience = defineCollection({
  loader: file("src/content/experience.json"),
  schema: z.object({
    order: z.number(),
    role: z.string(),
    company: z.string(),
    period: z.string(),
    place: z.string(),
    summary: z.string(),
    say: z.string(),
  }),
});

const achievements = defineCollection({
  loader: file("src/content/achievements.json"),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    org: z.string(),
    when: z.string(),
    summary: z.string(),
    say: z.string(),
  }),
});

export const collections = { projects, experience, achievements };
