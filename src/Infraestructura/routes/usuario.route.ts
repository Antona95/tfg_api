import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { usuarioController } from '../../container';

const router = Router();

// =========================================================
// ESCUDO DE TITANIO (SOLO PARA LOGIN)
// =========================================================
// Protege contra ataques de fuerza bruta (adivinar contraseñas masivamente)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Tiempo de memoria: 15 minutos
  max: 1000, // Límite estricto: máximo 1000 intentos por IP en esos 15 minutos
  message: {
    error: 'Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// =========================================================
// RUTAS BASE: /api/usuarios
// =========================================================

// Aplicamos el middleware 'loginLimiter' SOLO a esta ruta
router.post('/login', loginLimiter, usuarioController.login);

// El resto de rutas quedan protegidas por el limitador global configurado en app.ts
router.post('/', usuarioController.createUsuario);
router.get('/', usuarioController.getUsuarios);
router.get('/clientes', usuarioController.getClientes);
router.get('/:nickname', usuarioController.getUsuarioByNickname);
router.put('/:nickname', usuarioController.updateUsuario);
router.delete('/:nickname', usuarioController.deleteUsuario);

export { router as usuarioRouter };
