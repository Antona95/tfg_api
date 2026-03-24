import { UsuarioRepository } from '../../Dominio/interfaces/usuario/usuario.repository.interface';
import { Usuario } from '../../Dominio/models/usuario.model';
import NodeCache from 'node-cache';

import { CrearUsuarioUseCase } from '../use-cases/usuario/crear-usuario.use-case';
import { ListarUsuariosUseCase } from '../use-cases/usuario/listar-usuarios.use-case';
import { BuscarUsuarioPorNicknameUseCase } from '../use-cases/usuario/buscar-usuario-por-nickname.use-case';
import { ActualizarUsuarioUseCase } from '../use-cases/usuario/actualizar-usuario.use-case';

export class UsuarioService {
  private readonly crearUsuarioUC: CrearUsuarioUseCase;
  private readonly listarUsuariosUC: ListarUsuariosUseCase;
  private readonly buscarUsuarioPorNicknameUC: BuscarUsuarioPorNicknameUseCase;
  private readonly actualizarUsuarioUC: ActualizarUsuarioUseCase;

  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly cache: NodeCache,
  ) {
    this.crearUsuarioUC = new CrearUsuarioUseCase(this.usuarioRepository, this.cache);
    this.listarUsuariosUC = new ListarUsuariosUseCase(this.usuarioRepository, this.cache);
    this.buscarUsuarioPorNicknameUC = new BuscarUsuarioPorNicknameUseCase(this.usuarioRepository);
    this.actualizarUsuarioUC = new ActualizarUsuarioUseCase(this.usuarioRepository, this.cache);
  }

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
}
