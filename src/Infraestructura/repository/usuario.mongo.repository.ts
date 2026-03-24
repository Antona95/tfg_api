import { UsuarioRepository } from '../../Dominio/interfaces/usuario/usuario.repository.interface';
import { Usuario } from '../../Dominio/models/usuario.model';

export class UsuarioMockRepository implements UsuarioRepository {
  private usuarios: Usuario[] = [];

  async create(usuario: Usuario): Promise<Usuario> {
    const nuevo = { ...usuario, id: usuario.id || 'mock-id-' + Date.now() };
    this.usuarios.push(nuevo);
    return nuevo;
  }

  async getAll(): Promise<Usuario[]> {
    return this.usuarios;
  }

  async getByRol(rol: 'USUARIO' | 'ENTRENADOR'): Promise<Usuario[]> {
    return this.usuarios.filter((u) => u.rol.toLowerCase() === rol.toLowerCase());
  }

  async getByNickname(nickname: string): Promise<Usuario | null> {
    return this.usuarios.find((u) => u.nickname.toLowerCase() === nickname.toLowerCase()) || null;
  }

  async update(nickname: string, data: Partial<Usuario>): Promise<Usuario | null> {
    const index = this.usuarios.findIndex(
      (u) => u.nickname.toLowerCase() === nickname.toLowerCase(),
    );
    if (index === -1) return null;

    this.usuarios[index] = { ...this.usuarios[index], ...data };
    return this.usuarios[index];
  }

  async delete(nickname: string): Promise<boolean> {
    const inicial = this.usuarios.length;
    this.usuarios = this.usuarios.filter(
      (u) => u.nickname.toLowerCase() !== nickname.toLowerCase(),
    );
    return this.usuarios.length < inicial;
  }
}
