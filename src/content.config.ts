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

export const collections = { articles };
