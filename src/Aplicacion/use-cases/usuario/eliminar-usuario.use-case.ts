import { UsuarioRepository } from '../../../Dominio/interfaces/usuario/usuario.repository.interface';
import NodeCache from 'node-cache';

export class EliminarUsuarioUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly cache: NodeCache,
  ) {}

  async execute(nickname: string): Promise<boolean> {
    // PROTECCIÓN DE NIVEL DE SISTEMA
    if (nickname.toLowerCase() === 'mastercoach') {
      throw new Error('No se permite eliminar al administrador del sistema');
    }
    const existente = await this.usuarioRepository.getByNickname(nickname);
    if (!existente) {
      throw new Error(`El usuario con nickname ${nickname} no existe`);
    }

    // 2. Ejecutamos la eliminación en el repositorio
    const eliminado = await this.usuarioRepository.delete(nickname);

    // 3. Limpiamos la caché para que el listado de alumnos se actualice en la App
    if (eliminado) {
      this.cache.del('users_all');
    }

    return eliminado;
  }
}
