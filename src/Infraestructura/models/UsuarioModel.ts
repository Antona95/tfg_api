import { Schema, model } from 'mongoose';
import { Usuario } from '../../Dominio/models/usuario.model';

// definimos el esquema. no pasamos <Usuario> al constructor new Schema()
// para evitar conflictos de tipos entre string y objectid,
// pero sí lo usamos en model<Usuario> al final.
const UsuarioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    apellidos: {
      type: String,
      required: true,
    },
    pass: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
      unique: true, // crea un índice único automáticamente
    },
    rol: {
      type: String,
      enum: ['USUARIO', 'ENTRENADOR'], // validación de valores permitidos
      default: 'USUARIO',
      required: true,
    },
    id_entrenador: {
      type: Schema.Types.ObjectId, // en base de datos es un objeto id
      ref: 'Usuario', // permite hacer 'populate' para traer los datos del entrenador
      required: false, // no es obligatorio (los entrenadores no tienen entrenador)
    },
  },
  {
    timestamps: true, // crea automáticamente createdAt y updatedAt
    versionKey: false, // elimina el campo __v interno de mongo
  },
);
// aquí sí vinculamos la interfaz usuario para que el resto de la app tenga autocompletado
export const UsuarioModel = model<Usuario>('Usuario', UsuarioSchema);
