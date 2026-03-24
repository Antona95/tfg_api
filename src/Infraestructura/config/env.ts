import { config as configDotenv } from 'dotenv';
import { z } from 'zod';

configDotenv();

const envSchema = z.object({
  PORT: z.coerce.number().min(1000).default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().default('*'),
  MONGO_URI: z.string().min(1, 'Debes definir MONGO_URI en el archivo .env'),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().optional(),
  DB_POOL_SIZE: z.coerce.number().min(1).max(50).default(5),
});

export const config = envSchema.parse(process.env);
