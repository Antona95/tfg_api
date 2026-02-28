import { config as configDotenv } from 'dotenv';
import { z } from 'zod';

// 1. FORZAMOS la lectura del .env ANTES de que Zod actúe
configDotenv();

// 2. Un chivato temporal para ver si por fin lee el archivo (luego lo borramos)
console.log('CHIVATO - Puerto leído del .env:', process.env.PORT);
console.log('CHIVATO - Mongo leído del .env:', process.env.MONGO_URI);

const envSchema = z.object({
  // Validamos que PORT sea un número. Si no existe, usa 3000 por defecto.
  PORT: z.coerce.number().min(1000).default(3000),

  // Define en qué entorno estamos
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // CORS: Qué dominios permitimos
  CORS_ORIGIN: z.string().default('*'),

  // --- CAMBIOS IMPORTANTES ---

  // 1. ELIMINADO: DB_PATH (Ya no usamos SQLite)

  // 2. AÑADIDO: Validación para MongoDB
  // Hacemos que sea obligatorio. Si no está en el .env, la app no arranca.
  MONGO_URI: z.string().min(1, 'Debes definir MONGO_URI en el archivo .env'),

  // 3. AÑADIDO: Variables de JWT (Están en tu .env, mejor validarlas ya)
  // Las ponemos opcionales (.optional()) por ahora para que no te falle si se te olvida ponerlas,
  // pero listas para el futuro.
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().optional(),

  // 4. AÑADIDO: Pool de conexiones para MongoDB
  // protegemos contra negativos, ponemos techo en 50 y valor por defecto 5
  DB_POOL_SIZE: z.coerce.number().min(1).max(50).default(5),
});

// Parseamos process.env. Si falla (ej. falta MONGO_URI), lanza un error explicativo y detiene el servidor.
export const config = envSchema.parse(process.env);
