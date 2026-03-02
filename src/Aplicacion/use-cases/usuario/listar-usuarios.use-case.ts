import { Usuario } from '../../../Dominio/models/usuario.model';
import { UsuarioRepository } from '../../../Dominio/interfaces/usuario/usuario.repository.interface';
import NodeCache from 'node-cache';

export class ListarUsuariosUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly cache: NodeCache,
  ) {}

  async execute(): Promise<Usuario[]> {
    const cacheKey = 'users_all';
    const datosEnCache = this.cache.get<Usuario[]>(cacheKey);

    if (datosEnCache) {
      return datosEnCache;
    }

    const usuarios = await this.usuarioRepository.getAll();
    this.cache.set(cacheKey, usuarios, 600);

    return usuarios;
  }
}
