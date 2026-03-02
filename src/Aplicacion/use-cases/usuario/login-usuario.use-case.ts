import { UsuarioRepository } from '../../../Dominio/interfaces/usuario/usuario.repository.interface';
import { Usuario } from '../../../Dominio/models/usuario.model';

export class LoginUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async execute(nickname: string, pass: string): Promise<Usuario> {
    // 1. Busqueda del usuario por su identificador unico
    const usuario = await this.usuarioRepository.getByNickname(nickname);

    // 2. Validacion de existencia en el repositorio
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // 3. Verificacion de credenciales
    // Se compara la contrasena almacenada con la proporcionada
    if (usuario.pass !== pass) {
      throw new Error('pass incorrecta');
    }

    // 4. Retorno del objeto de dominio si la validacion es exitosa
    return usuario;
  }
}
