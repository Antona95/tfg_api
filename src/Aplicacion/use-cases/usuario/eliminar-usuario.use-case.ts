import { UsuarioRepository } from '../../../Dominio/interfaces/usuario/usuario.repository.interface';
import { SesionRepository } from '../../../Dominio/interfaces/sesion/sesion.repository.interface'; // AÑADIDO
import NodeCache from 'node-cache';

export class EliminarUsuarioUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly sesionRepository: SesionRepository, // <--- AÑADIDO AL CONSTRUCTOR
    private readonly cache: NodeCache,
  ) {}

  async execute(nickname: string): Promise<boolean> {
    // 1. PROTECCIÓN DE NIVEL DE SISTEMA
    if (nickname.toLowerCase() === 'mastercoach') {
      throw new Error('No se permite eliminar al administrador del sistema');
    }

    // 2. Buscamos al usuario ANTES de borrarlo para poder sacar su ID real (ObjectId)
    const existente = await this.usuarioRepository.getByNickname(nickname);
    if (!existente) {
      throw new Error(`El usuario con nickname ${nickname} no existe`);
    }

    // 3. Ejecutamos la eliminación del usuario en su repositorio
    const eliminado = await this.usuarioRepository.delete(nickname);

    // 4. EFECTO CASCADA: Si se borró el usuario, barremos todas sus rutinas
    if (eliminado && existente.id) {
      // Necesitamos castearlo a 'any' temporalmente porque no hemos añadido el método
      // deleteManyByUsuario a tu interfaz SesionRepository aún.
      await (this.sesionRepository as any).deleteManyByUsuario(existente.id);

      // Limpiamos la caché global
      this.cache.del('users_all');
    }

    return eliminado;
  }
}
