import { UsuarioRepository } from '../../../Dominio/interfaces/usuario/usuario.repository.interface';
import { Usuario } from '../../../Dominio/models/usuario.model';

export class LoginUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async execute(nickname: string, pass: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.getByNickname(nickname);

    if (!usuario) {
      throw new Error('usuario no encontrado');
    }

    if (usuario.pass !== pass) {
      throw new Error('pass incorrecta');
    }

    return usuario;
  }
}
