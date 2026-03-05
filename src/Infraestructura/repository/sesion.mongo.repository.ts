import { Types } from 'mongoose';
import {
  SesionRepository,
  SesionInputDTO,
} from '../../Dominio/interfaces/sesion/sesion.repository.interface';
import { SesionEntrenamiento } from '../../Dominio/models/sesion.model';
import { SesionModel } from '../models/SesionModel';

export class SesionMongoRepository implements SesionRepository {
  // --- NUEVO MÉTODO: Para el historial del Coach/Usuario ---
  async findSesionesByUsuario(idUsuario: string): Promise<SesionEntrenamiento[]> {
    const sesiones = await SesionModel.find({ id_usuario: idUsuario })
      .populate('ejercicios.id_ejercicio')
      .sort({ fecha: -1 }) // Ordenar por fecha descendente
      .lean();

    return sesiones.map((doc) => ({
      ...doc,
      id: (doc as any)._id.toString(), // Mapeo de ID para Android
    })) as unknown as SesionEntrenamiento[];
  }

  async findById(id: string): Promise<SesionEntrenamiento | null> {
    const doc = await SesionModel.findById(id)
      .populate('ejercicios.id_ejercicio') // Hacemos populate igual que en tus otros métodos
      .lean();

    if (!doc) return null;
    return { ...doc, id: (doc as any)._id.toString() } as unknown as SesionEntrenamiento;
  }

  async getSesionHoy(idUsuario: string): Promise<SesionEntrenamiento | null> {
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);
    const finHoy = new Date();
    finHoy.setHours(23, 59, 59, 999);

    const doc = await SesionModel.findOne({
      id_usuario: idUsuario,
      fecha: { $gte: inicioHoy, $lte: finHoy },
    })
      .populate('ejercicios.id_ejercicio')
      .lean();

    if (!doc) return null;
    return { ...doc, id: (doc as any)._id.toString() } as unknown as SesionEntrenamiento;
  }

  async create(sesion: SesionEntrenamiento): Promise<SesionEntrenamiento> {
    const nueva = await SesionModel.create(sesion);
    return (nueva as any).toObject() as unknown as SesionEntrenamiento;
  }

  async update(
    id: string,
    sesion: Partial<SesionEntrenamiento>,
  ): Promise<SesionEntrenamiento | null> {
    const doc = await SesionModel.findByIdAndUpdate(id, sesion, { new: true }).lean();
    if (!doc) return null;
    return { ...doc, id: (doc as any)._id.toString() } as unknown as SesionEntrenamiento;
  }

  async delete(id: string): Promise<boolean> {
    const res = await SesionModel.findByIdAndDelete(id);
    return !!res;
  }

  // Dentro de SesionMongoRepository

  async crearDesdeApp(datos: SesionInputDTO): Promise<SesionEntrenamiento> {
    const ejerciciosMongoose = datos.ejercicios.map((ej) => {
      // Si recibes un ID desde Android úsalo, si no, genera uno (pero mejor recibirlo)
      const idReal = (ej as any).id_ejercicio || new Types.ObjectId();

      const repsFinal =
        typeof ej.repeticiones === 'string' ? parseInt(ej.repeticiones) || 0 : ej.repeticiones;

      return {
        nombre: ej.nombre,
        id_ejercicio: idReal, // <--- Usamos el ID real si viene en el DTO
        series: ej.series,
        repeticiones: repsFinal,
        peso: ej.peso || 0,
        bloque: ej.bloque || 0,
      };
    });

    const nuevaSesion = await SesionModel.create({
      titulo: datos.titulo,
      finalizada: false,
      id_usuario: datos.idUsuario, // Mongoose se encarga de convertir string a ObjectId
      ejercicios: ejerciciosMongoose,
    });

    return this.mapSesionToDomain(nuevaSesion);
  }

  // Método de apoyo para no repetir código de conversión
  private mapSesionToDomain(doc: any): SesionEntrenamiento {
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      ...obj,
      id: obj._id.toString(),
    } as unknown as SesionEntrenamiento;
  }
}
