import { SesionEntrenamiento } from '../../../Dominio/models/sesion.model';
import { SesionRepository } from '../../../Dominio/interfaces/sesion/sesion.repository.interface';

export class ObtenerSesionPorIdUseCase {
  constructor(private readonly sesionRepository: SesionRepository) {}

  async execute(id: string): Promise<SesionEntrenamiento | null> {
    // recuperación directa de la sesión por su identificador único
    return await this.sesionRepository.findById(id);
  }
}
