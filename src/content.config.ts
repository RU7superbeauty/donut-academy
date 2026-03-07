import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    date: z.string(),
    author: z.string(),
    category: z.enum(['AI FRONTIER', 'D0 METHOD', 'RESEARCH']),
    tags: z.array(z.string()),
    description: z.string(),
  }),
});

const playbook = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/playbook' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    date: z.string(),
    difficulty: z.string(),
    time: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    description: z.string(),
    commands: z.array(z.string()),
    prerequisites: z.array(z.string()).optional(),
  }),
});

const courses = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    date: z.string(),
    tier: z.enum(['1', '2', '3']),
    order: z.number(),
    time: z.string(),
    tags: z.array(z.string()),
    description: z.string(),
    commands: z.array(z.string()).optional(),
    status: z.enum(['available', 'coming-soon']).default('available'),
  }),
});

export const collections = { articles, playbook, courses };
