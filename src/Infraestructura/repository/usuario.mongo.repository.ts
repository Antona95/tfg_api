import { UsuarioRepository } from '../../Dominio/interfaces/usuario/usuario.repository.interface';
import { Usuario } from '../../Dominio/models/usuario.model';
import { UsuarioModel } from '../models/UsuarioModel';

type UsuarioMongoDoc = {
  _id: { toString(): string };
  nombre: string;
  apellidos: string;
  pass: string;
  nickname: string;
  rol: 'USUARIO' | 'ENTRENADOR';
  id_entrenador?: { toString(): string };
};

export class UsuarioMongoRepository implements UsuarioRepository {
  async create(usuario: Usuario): Promise<Usuario> {
    const nuevo = await UsuarioModel.create(usuario);
    return this.mapToDomain(nuevo as UsuarioMongoDoc);
  }

  async getAll(): Promise<Usuario[]> {
    const docs = await UsuarioModel.find().lean();
    return docs.map((d) => this.mapToDomain(d as UsuarioMongoDoc));
  }

  async getByRol(rol: string): Promise<Usuario[]> {
    const docs = await UsuarioModel.find({
      rol: { $regex: new RegExp(`^${rol}$`, 'i') },
    }).lean();

    return docs.map((d) => this.mapToDomain(d as UsuarioMongoDoc));
  }

  async getByNickname(nickname: string): Promise<Usuario | null> {
    const doc = await UsuarioModel.findOne({
      nickname: { $regex: new RegExp(`^${nickname}$`, 'i') },
    }).lean();

    if (!doc) return null;
    return this.mapToDomain(doc as UsuarioMongoDoc);
  }

  async update(nickname: string, data: Partial<Usuario>): Promise<Usuario | null> {
    const doc = await UsuarioModel.findOneAndUpdate(
      {
        nickname: { $regex: new RegExp(`^${nickname}$`, 'i') },
      },
      data,
      { new: true },
    ).lean();

    if (!doc) return null;
    return this.mapToDomain(doc as UsuarioMongoDoc);
  }

  async delete(nickname: string): Promise<boolean> {
    const result = await UsuarioModel.findOneAndDelete({
      nickname: { $regex: new RegExp(`^${nickname}$`, 'i') },
    });

    return !!result;
  }

  private mapToDomain(mongoDoc: UsuarioMongoDoc): Usuario {
    return {
      id: mongoDoc._id.toString(),
      nombre: mongoDoc.nombre,
      apellidos: mongoDoc.apellidos,
      pass: mongoDoc.pass,
      nickname: mongoDoc.nickname,
      rol: mongoDoc.rol,
      id_entrenador: mongoDoc.id_entrenador?.toString(),
    };
  }
}
