import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import { openApiSpec } from './Infraestructura/config/swagger';

import { config } from './Infraestructura/config/env';

import { usuarioRouter } from './Infraestructura/routes/usuario.route';
import { ejercicioRouter } from './Infraestructura/routes/ejercicio.route';
import { sesionRouter } from './Infraestructura/routes/sesion.route';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());

const limiterGeneral = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
  message: {
    error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 10 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiterGeneral);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use('/api/usuarios', usuarioRouter);
app.use('/api/ejercicios', ejercicioRouter);
app.use('/api/sesiones', sesionRouter);

app.get('/', (req, res) => {
  res.send('API Hexagonal Funcionando. Ve a /api-docs para ver la documentación.');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', env: config.NODE_ENV });
});

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
