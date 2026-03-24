import { UsuarioRepository } from '../../../Dominio/interfaces/usuario/usuario.repository.interface';
import { SesionRepository } from '../../../Dominio/interfaces/sesion/sesion.repository.interface';
import NodeCache from 'node-cache';

export class EliminarUsuarioUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly sesionRepository: SesionRepository,
    private readonly cache: NodeCache,
  ) {}

  async execute(nickname: string): Promise<boolean> {
    if (nickname.toLowerCase() === 'mastercoach') {
      throw new Error('No se permite eliminar al administrador del sistema');
    }

    const existente = await this.usuarioRepository.getByNickname(nickname);
    if (!existente) {
      throw new Error(`El usuario con nickname ${nickname} no existe`);
    }

    const eliminado = await this.usuarioRepository.delete(nickname);

    if (eliminado && existente.id) {
      await this.sesionRepository.deleteManyByUsuario(existente.id);
      this.cache.del('users_all');
    }

    return eliminado;
  }
}
