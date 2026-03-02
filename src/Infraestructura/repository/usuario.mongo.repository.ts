import { UsuarioRepository } from '../../Dominio/interfaces/usuario/usuario.repository.interface';
import { Usuario } from '../../Dominio/models/usuario.model';
import { UsuarioModel } from '../models/UsuarioModel';

export class UsuarioMongoRepository implements UsuarioRepository {
  async create(usuario: Usuario): Promise<Usuario> {
    const nuevo = await UsuarioModel.create(usuario);
    return this.mapToDomain(nuevo);
  }

  async getAll(): Promise<Usuario[]> {
    const docs = await UsuarioModel.find().lean();
    return docs.map((d) => this.mapToDomain(d));
  }

  // Se flexibiliza el tipo para aceptar los roles reales usados en el proyecto
  async getByRol(rol: string): Promise<Usuario[]> {
    // Buscamos ignorando mayusculas/minusculas para evitar errores de registro
    const docs = await UsuarioModel.find({
      rol: { $regex: new RegExp(`^${rol}$`, 'i') },
    }).lean();
    return docs.map((d) => this.mapToDomain(d));
  }

  async getByNickname(nickname: string): Promise<Usuario | null> {
    // Buscamos el nickname de forma insensible a mayusculas/minusculas (^ y $ aseguran coincidencia exacta)
    const doc = await UsuarioModel.findOne({
      nickname: { $regex: new RegExp(`^${nickname}$`, 'i') },
    }).lean();

    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async update(nickname: string, data: Partial<Usuario>): Promise<Usuario | null> {
    const doc = await UsuarioModel.findOneAndUpdate({ nickname: nickname }, data, {
      new: true,
    }).lean();

    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async delete(nickname: string): Promise<boolean> {
    const result = await UsuarioModel.findOneAndDelete({ nickname: nickname });
    return !!result;
  }

  private mapToDomain(mongoDoc: any): Usuario {
    return {
      id: mongoDoc._id.toString(),
      nombre: mongoDoc.nombre,
      apellidos: mongoDoc.apellidos,
      pass: mongoDoc.pass,
      nickname: mongoDoc.nickname,
      rol: mongoDoc.rol,
      id_entrenador: mongoDoc.id_entrenador ? mongoDoc.id_entrenador.toString() : undefined,
    };
  }
}
