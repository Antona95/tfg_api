import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import { openApiSpec } from './Infraestructura/config/swagger';

// IMPORTAR CONFIG
import { config } from './Infraestructura/config/env';

// Importación de rutas
import { usuarioRouter } from './Infraestructura/routes/usuario.route';
import { ejercicioRouter } from './Infraestructura/routes/ejercicio.route';
import { SesionRouter } from './Infraestructura/routes/sesion.route';

const app = express();

// =========================================================
// MIDDLEWARES DE SEGURIDAD Y CONFIGURACIÓN
// =========================================================
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());

// 2. CONFIGURAMOS EL ESCUDO GENERAL (RATE LIMIT)
const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos de "memoria"
  max: 10, // Límite de 10 peticiones por IP cada 15 minutos
  message: {
    error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true, // Devuelve información del límite en las cabeceras (RateLimit-Limit)
  legacyHeaders: false, // Deshabilita las cabeceras antiguas (X-RateLimit)
});

// 3. APLICAMOS EL ESCUDO SOLO A LAS RUTAS DE LA API (Dejamos Swagger libre)
app.use('/api', limiterGeneral);

// =========================================================
// RUTAS
// =========================================================

// --- RUTA DE DOCUMENTACIÓN SWAGGER ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// --- RUTAS DE LA API ---
app.use('/api/usuarios', usuarioRouter);
app.use('/api/ejercicios', ejercicioRouter);
app.use('/api/sesiones', SesionRouter);

// Ruta base
app.get('/', (req, res) => {
  res.send('API Hexagonal Funcionando. Ve a /api-docs para ver la documentación.');
});

// Ruta de Salud (Útil para saber en qué entorno estás)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', env: config.NODE_ENV });
});

export default app;
