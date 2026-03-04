import { Request, Response } from 'express';
import { SesionAppSchema } from '../schemas/sesion.schema';
import { SesionService } from '../../Aplicacion/services/sesion.service';
import { CrearSesionUseCase } from '../../Aplicacion/use-cases/sesion/crear-sesion.use-case';
import { SesionRepository } from '../../Dominio/interfaces/sesion/sesion.repository.interface';
import { FinalizarSesionUseCase } from '../../Aplicacion/use-cases/sesion/finalizar-sesion.use-case';
import NodeCache from 'node-cache'; // Asegúrate de inyectar la caché aquí también

export class SesionController {
  constructor(
    private readonly sesionService: SesionService,
    private readonly crearSesionUseCase: CrearSesionUseCase,
    private readonly finalizarSesionUseCase: FinalizarSesionUseCase, // <--- Nuevo
    private readonly sesionRepository: SesionRepository,
    private readonly cache: NodeCache,
  ) {}

  getSesionesByUsuario = async (req: Request, res: Response) => {
    try {
      const { idUsuario } = req.params;
      const cacheKey = `sesiones_usuario_${idUsuario}`;

      // 1. Intentar obtener de caché
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(cachedData);
      }

      // 2. Si no hay caché, ir a BD
      const sesiones = await this.sesionRepository.findSesionesByUsuario(idUsuario);

      // 3. Guardar en caché por 1 hora (3600 seg)
      this.cache.set(cacheKey, sesiones, 3600);

      return res.status(200).json(sesiones);
    } catch (_error) {
      console.error('Error al obtener historial:', _error);
      return res.status(500).json({ error: 'Error al obtener historial de sesiones' });
    }
  };

  createSesionApp = async (req: Request, res: Response) => {
    const validacion = SesionAppSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json({ errores: validacion.error.issues });
    }

    const datos = validacion.data;
    try {
      const nueva = await this.crearSesionUseCase.executeDesdeApp(
        datos.idUsuario,
        datos.titulo,
        datos.fechaProgramada,
        datos.ejercicios,
      );
      // El Caso de Uso ya se encarga de hacer this.cache.del
      return res.status(201).json(nueva);
    } catch (_error) {
      console.error('Error creando sesión:', _error);
      return res.status(500).json({ error: 'Error al procesar la sesión' });
    }
  };

  getSesionHoy = async (req: Request, res: Response) => {
    try {
      const { idUsuario } = req.params;
      const cacheKey = `sesion_hoy_${idUsuario}`;

      const cached = this.cache.get(cacheKey);
      if (cached) return res.status(200).json(cached);

      const sesion = await this.sesionRepository.getSesionHoy(idUsuario);
      if (!sesion) return res.status(404).json({ message: 'No hay entreno' });

      this.cache.set(cacheKey, sesion, 3600);
      return res.status(200).json(sesion);
    } catch (_error) {
      return res.status(500).json({ error: 'Error de servidor' });
    }
  };

  finalizarSesion = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { ejercicios } = req.body;

      // Validamos que vengan ejercicios (mínimo array vacío)
      if (!Array.isArray(ejercicios)) {
        return res.status(400).json({ error: 'Se requiere el array de ejercicios finales' });
      }

      const actualizada = await this.finalizarSesionUseCase.execute(id, ejercicios);

      return res.status(200).json(actualizada);
    } catch (error: any) {
      console.error('Error en finalizarSesion:', error.message);
      return res.status(400).json({ error: error.message });
    }
  };

  getSesionById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const sesion = await this.sesionService.obtenerPorId(id);
      if (!sesion) return res.status(404).json({ error: 'Sesión no encontrada' });
      res.json(sesion);
    } catch (_error) {
      res.status(500).json({ error: 'Error al obtener sesión' });
    }
  };

  getSesionesByPlan = async (req: Request, res: Response) => {
    try {
      const { idPlan } = req.params;
      const sesiones = await this.sesionService.obtenerSesionesDelPlan(idPlan);
      res.json(sesiones);
    } catch (_error) {
      res.status(500).json({ error: 'Error interno' });
    }
  };

  updateSesion = async (req: Request, res: Response) => {
    const { id } = req.params;
    const validacion = SesionAppSchema.partial().safeParse(req.body);

    if (validacion.success) {
      const datosInput = validacion.data;
      try {
        const datosParaActualizar: any = { ...datosInput };
        if (datosInput.ejercicios) {
          datosParaActualizar.ejercicios = datosInput.ejercicios.map((ej) => ({
            nombre: ej.nombre,
            series: ej.series,
            repeticiones: ej.repeticiones,
            peso: ej.peso,
            bloque: ej.bloque,
          }));
        }
        const actualizada = await this.sesionService.actualizarSesion(id, datosParaActualizar);
        if (!actualizada) return res.status(404).json({ error: 'No se pudo actualizar' });
        res.json(actualizada);
      } catch (_error) {
        res.status(500).json({ error: 'Error al actualizar' });
      }
    } else {
      return res.status(400).json({ errores: validacion.error.issues });
    }
  };

  deleteSesion = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const eliminada = await this.sesionService.eliminarSesion(id);
      if (!eliminada) return res.status(404).json({ error: 'No se pudo eliminar' });
      res.json({ message: 'Sesión eliminada correctamente' });
    } catch (_error) {
      res.status(500).json({ error: 'Error al eliminar' });
    }
  };
}
