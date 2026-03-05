import { UsuarioRepository } from '../../Dominio/interfaces/usuario/usuario.repository.interface';
import { Usuario } from '../../Dominio/models/usuario.model';
import NodeCache from 'node-cache';

// importación de los casos de uso actualizados
import { CrearUsuarioUseCase } from '../use-cases/usuario/crear-usuario.use-case';
import { ListarUsuariosUseCase } from '../use-cases/usuario/listar-usuarios.use-case';
import { BuscarUsuarioPorNicknameUseCase } from '../use-cases/usuario/buscar-usuario-por-nickname.use-case';
import { ActualizarUsuarioUseCase } from '../use-cases/usuario/actualizar-usuario.use-case';
import { EliminarUsuarioUseCase } from '../use-cases/usuario/eliminar-usuario.use-case';

export class UsuarioService {
  // declaramos las propiedades de los casos de uso
  private readonly crearUsuarioUC: CrearUsuarioUseCase;
  private readonly listarUsuariosUC: ListarUsuariosUseCase;
  private readonly buscarUsuarioPorNicknameUC: BuscarUsuarioPorNicknameUseCase;
  private readonly actualizarUsuarioUC: ActualizarUsuarioUseCase;
  private readonly eliminarUsuarioUC: EliminarUsuarioUseCase;

  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly cache: NodeCache,
  ) {
    // instanciamos los casos de uso dentro del servicio inyectando las dependencias necesarias
    this.crearUsuarioUC = new CrearUsuarioUseCase(this.usuarioRepository, this.cache);
    this.listarUsuariosUC = new ListarUsuariosUseCase(this.usuarioRepository, this.cache);
    this.buscarUsuarioPorNicknameUC = new BuscarUsuarioPorNicknameUseCase(this.usuarioRepository);
    this.actualizarUsuarioUC = new ActualizarUsuarioUseCase(this.usuarioRepository, this.cache);
    this.eliminarUsuarioUC = new EliminarUsuarioUseCase(this.usuarioRepository, this.cache);
  }

  // métodos fachada: actúan como intermediarios entre el controlador y los casos de uso

  async registrarUsuario(usuario: Usuario) {
    return await this.crearUsuarioUC.execute(usuario);
  }

  async obtenerTodos() {
    return await this.listarUsuariosUC.execute();
  }

  async obtenerPorNickname(nickname: string) {
    return await this.buscarUsuarioPorNicknameUC.execute(nickname);
  }

  async actualizarUsuario(nickname: string, datos: Partial<Usuario>) {
    return await this.actualizarUsuarioUC.execute(nickname, datos);
  }

  async eliminarUsuario(nickname: string) {
    return await this.eliminarUsuarioUC.execute(nickname);
  }
}
