import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRE: z.string().default('7d'),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASSWORD: z.string(),
  EMAIL_FROM: z.string(),
  PADDLE_ENV: z.enum(['sandbox', 'production']).default('sandbox'),
  PADDLE_ENVIRONMENT: z.enum(['sandbox', 'production']).optional(),
  PADDLE_API_KEY: z.string().optional(),
  PADDLE_WEBHOOK_SECRET: z.string().optional(),
  PADDLE_SANDBOX_API_KEY: z.string().optional(),
  PADDLE_SANDBOX_WEBHOOK_SECRET: z.string().optional(),
  PADDLE_PRODUCTION_API_KEY: z.string().optional(),
  PADDLE_PRODUCTION_WEBHOOK_SECRET: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

const normalizedEnv = {
  ...parsedEnv.data,
  PADDLE_ENVIRONMENT: parsedEnv.data.PADDLE_ENVIRONMENT ?? parsedEnv.data.PADDLE_ENV,
  PADDLE_API_KEY: parsedEnv.data.PADDLE_API_KEY || parsedEnv.data.PADDLE_SANDBOX_API_KEY || parsedEnv.data.PADDLE_PRODUCTION_API_KEY || '',
  PADDLE_WEBHOOK_SECRET: parsedEnv.data.PADDLE_WEBHOOK_SECRET || parsedEnv.data.PADDLE_SANDBOX_WEBHOOK_SECRET || parsedEnv.data.PADDLE_PRODUCTION_WEBHOOK_SECRET || '',
};

export const env = normalizedEnv;
