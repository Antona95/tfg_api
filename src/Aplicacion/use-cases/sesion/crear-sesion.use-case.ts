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
    this.limpiarCache(sesion.id_usuario);
    return nuevaSesion;
  }

  // Método específico para la App (usado por el Coach)
  async executeDesdeApp(
    idUsuario: string,
    titulo: string,
    ejercicios: any[],
  ): Promise<SesionEntrenamiento> {
    // 👈 aquí faltaba la llave

    const nuevaSesion = await this.sesionRepository.crearDesdeApp({
      idUsuario,
      titulo,
      ejercicios: ejercicios.map((ej) => ({
        nombre: ej.nombre,
        series: ej.series,
        repeticiones: ej.repeticiones,
        peso: ej.peso,
        bloque: ej.bloque,
      })),
    });

    // --- LIMPIEZA DE CACHÉ ---
    this.limpiarCache(idUsuario);

    return nuevaSesion;
  }

  private limpiarCache(idUsuario?: string) {
    if (idUsuario) {
      this.cache.del(`sesiones_usuario_${idUsuario}`);
      this.cache.del(`sesion_hoy_${idUsuario}`);
    }
  }
}
