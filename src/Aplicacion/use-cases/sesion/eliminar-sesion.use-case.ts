import { SesionRepository } from '../../../Dominio/interfaces/sesion/sesion.repository.interface';
import NodeCache from 'node-cache';

export class EliminarSesionUseCase {
  constructor(
    private readonly sesionRepository: SesionRepository,
    private readonly cache: NodeCache,
  ) {}

  async execute(id: string): Promise<boolean> {
    const eliminado = await this.sesionRepository.delete(id);

    return eliminado;
  }
}
