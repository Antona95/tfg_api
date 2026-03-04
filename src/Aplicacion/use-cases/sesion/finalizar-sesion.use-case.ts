import { SesionRepository } from '../../../Dominio/interfaces/sesion/sesion.repository.interface';
import { SesionEntrenamiento } from '../../../Dominio/models/sesion.model';
import NodeCache from 'node-cache';

export class FinalizarSesionUseCase {
  constructor(
    private readonly sesionRepository: SesionRepository,
    private readonly cache: NodeCache,
  ) {}

  async execute(idSesion: string, ejerciciosFinales: any[]): Promise<SesionEntrenamiento> {
    // 1. Validamos existencia
    const sesionExistente = await this.sesionRepository.getById(idSesion);
    if (!sesionExistente) {
      throw new Error('No se encontró la sesión para finalizar');
    }

    // 2. Aplicamos lógica de finalización
    const actualizada = await this.sesionRepository.update(idSesion, {
      finalizada: true,
      ejercicios: ejerciciosFinales,
      fecha: new Date(), // Seteamos la fecha real de fin
    });

    if (!actualizada) {
      throw new Error('Error crítico al actualizar el estado de la sesión');
    }

    // 3. Limpiamos caché (siguiendo tu patrón)
    this.limpiarCache(actualizada.id_usuario);

    return actualizada;
  }

  private limpiarCache(idUsuario: string) {
    // Keys consistentes con tus otros Casos de Uso
    this.cache.del(`sesiones_usuario_${idUsuario}`);
    this.cache.del(`sesion_hoy_${idUsuario}`);
  }
}
