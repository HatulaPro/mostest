import { z } from 'zod';

export const serverScheme = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	NEXTAUTH_URL: z.string().optional(),
	GITHUB_CLIENT_ID: z.string(),
	GITHUB_CLIENT_SECRET: z.string(),
	AUTH_SECRET: z.string(),
	AUTH_TRUST_HOST: z.string(),
	DATABASE_URL: z.string(),
});

export const clientScheme = z.object({
	MODE: z.enum(['development', 'production', 'test']).default('development'),
});
