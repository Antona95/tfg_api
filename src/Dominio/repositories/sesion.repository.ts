import { SesionEntrenamiento } from '../models/sesion.model';

// DTO: Datos que llegan desde Android (limpios, sin IDs de Mongo todavía)
export interface SesionInputDTO {
  idUsuario: string; // ID del usuario (String)
  titulo: string;
  ejercicios: {
    nombreEjercicio: string; // Android manda el nombre, no el ID
    series: number;
    repeticiones: string | number; // Aceptamos ambos para evitar errores de tipo
    peso: number;
    bloque?: number;
  }[];
}

// CONTRATO: La regla que debe cumplir la base de datos
export interface SesionRepository {
  crearSesion(datos: SesionInputDTO): Promise<SesionEntrenamiento>;
}
