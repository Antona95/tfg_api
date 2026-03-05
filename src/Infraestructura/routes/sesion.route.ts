import { Router } from 'express';
import { sesionController } from '../../container'; // Asegúrate de importar desde container

const router = Router();

// --- RUTAS PÚBLICAS O DE APP ---
// 1. ESTA ES LA RUTA QUE TE FALTA (Create desde App)
router.post('/app', sesionController.createSesionApp);

// --- RUTAS ESTÁNDAR ---
router.post('/', sesionController.createSesionApp); // O la lógica que tengas para crear desde JSON normal
router.get('/usuario/:idUsuario', sesionController.getSesionesByUsuario);
router.get('/hoy/:idUsuario', sesionController.getSesionHoy);

// --- RUTAS CON ID (Siempre al final para no chocar con /app o /hoy) ---
router.get('/:id', sesionController.getSesionById);
router.put('/:id', sesionController.updateSesion);
router.delete('/:id', sesionController.deleteSesion);
// Ruta para finalizar
router.patch('/:id/finalizar', sesionController.finalizarSesion);

export { router as SesionRouter };
