import { z } from 'zod';

// 1. Sub-esquema para validar CADA ejercicio dentro de la sesión (Dominio interno)
const _DetalleSesionSchema = z.object({
  // Validamos que venga el ID (lo genera Mongo o viene del plan)
  id_ejercicio: z.string().min(1, 'Debes indicar el ID del ejercicio'),

  // --- AÑADIDO: Permitimos que el ejercicio tenga un nombre guardado ---
  // (Ej: "Sentadilla", "Press Banca")
  nombre: z.string().optional().default('Ejercicio'),

  // Simplificamos: z.number() sin argumentos.
  series: z
    .number()
    .int('Las series deben ser un número entero')
    .positive('Las series deben ser mayor a 0'),

  // OJO: Si quieres guardar "10-12", aquí deberías permitir string.
  // De momento lo dejo como number para no romper tu lógica actual.
  repeticiones: z
    .number()
    .int('Las repeticiones deben ser un número entero')
    .positive('Las repeticiones deben ser mayor a 0'),

  peso: z.number().nonnegative('El peso no puede ser negativo'), // Permite 0
  bloque: z.number().optional().default(0), // Para biseries/triseries
});

// 2. Esquema principal de la Sesión (Lo que se guarda en BD)
/**
 * Esquema DTO (Data Transfer Object) para la creación desde la App Android.
 * Este valida LO QUE LLEGA de la petición HTTP.
 */
export const SesionAppSchema = z.object({
  idUsuario: z.string().min(1, 'El ID de usuario es obligatorio'),
  titulo: z.string().min(1, 'El título es obligatorio'),
  fechaProgramada: z.string(),

  ejercicios: z.array(
    z.object({
      // --- CORRECCIÓN 1: La App manda 'nombre', no 'nombreEjercicio' ---
      nombre: z.string().min(1, 'El nombre del ejercicio es obligatorio'),

      series: z.coerce.number().int().positive(),
      repeticiones: z.union([z.string(), z.number()]),
      peso: z.coerce.number().nonnegative().optional().default(0),

      // --- CORRECCIÓN 2: La App manda 'observaciones', no 'notas' ---
      observaciones: z.string().optional(),

      bloque: z.number().optional().default(0),
    }),
  ),
});
