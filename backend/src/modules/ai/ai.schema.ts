import { z } from 'zod';

export const aiQuerySchema = z.object({
  body: z.object({
    prompt: z.string().min(3, 'Search query must be at least 3 characters'),
  }),
});

export type AiQueryInput = z.infer<typeof aiQuerySchema>['body'];
