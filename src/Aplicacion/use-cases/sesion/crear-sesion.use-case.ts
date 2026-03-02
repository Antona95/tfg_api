import { SesionEntrenamiento } from '../../../Dominio/models/sesion.model';
import { SesionRepository } from '../../../Dominio/interfaces/sesion/sesion.repository.interface';
import NodeCache from 'node-cache';

export class CrearSesionUseCase {
  constructor(
    private readonly sesionRepository: SesionRepository,
    private readonly cache: NodeCache,
  ) {}

  // Método estándar (usado por otros servicios)
  async execute(sesion: SesionEntrenamiento): Promise<SesionEntrenamiento> {
    const nuevaSesion = await this.sesionRepository.create(sesion);
    this.limpiarCache(sesion.id_usuario, sesion.id_plan);
    return nuevaSesion;
  }

  // Método específico para la App (usado por el Coach)
  async executeDesdeApp(
    idUsuario: string,
    titulo: string,
    fechaString: string,
    ejercicios: any[],
  ): Promise<SesionEntrenamiento> {
    const fecha = new Date(fechaString);

    if (isNaN(fecha.getTime())) {
      throw new Error('Fecha inválida proporcionada desde la App');
    }

    const nuevaSesion = await this.sesionRepository.crearDesdeApp({
      idUsuario,
      titulo,
      fechaProgramada: fecha.toISOString(),
      ejercicios: ejercicios.map((ej) => ({
        nombre: ej.nombre,
        series: ej.series,
        repeticiones: ej.repeticiones,
        peso: ej.peso,
        bloque: ej.bloque,
      })),
    });

    // --- LIMPIEZA DE CACHÉ ---
    // Borramos tanto la sesión de hoy como el historial para que la App refresque
    this.limpiarCache(idUsuario);

    return nuevaSesion;
  }

  private limpiarCache(idUsuario?: string, idPlan?: string) {
    if (idUsuario) {
      // Estas keys deben coincidir con las que usas en el Repository/Controller para leer
      this.cache.del(`sesiones_usuario_${idUsuario}`);
      this.cache.del(`sesion_hoy_${idUsuario}`);
    }
    if (idPlan) {
      this.cache.del(`sesiones_plan_${idPlan}`);
    }
  }
}
