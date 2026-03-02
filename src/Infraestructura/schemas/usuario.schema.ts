import { z } from 'zod';

export const UsuarioSchema = z.object({
  nickname: z
    .string()
    .min(1, 'el nickname es obligatorio')
    .min(3, 'el nickname debe tener al menos 3 caracteres')
    .max(20, 'el nickname no puede superar los 20 caracteres')
    .trim(),

  pass: z.string().min(4, 'tu pass debe tener al menos 4 caracteres'),

  nombre: z.string().min(1, 'el nombre es obligatorio'),
  apellidos: z.string().min(1, 'los apellidos son obligatorios'),

  // Se incluyen ALUMNO y CLIENTE para evitar errores de coincidencia con la base de datos
  rol: z
    .enum([
      'USUARIO',
      'ENTRENADOR',
      'ALUMNO',
      'CLIENTE',
      'usuario',
      'entrenador',
      'alumno',
      'cliente',
    ])
    .transform((val) => {
      const valorUpper = val.toUpperCase();
      if (valorUpper === 'ALUMNO' || valorUpper === 'CLIENTE') return 'USUARIO';
      return valorUpper as 'USUARIO' | 'ENTRENADOR';
    })
    .optional()
    .default('USUARIO'),

  id_entrenador: z.string().optional(),
});
