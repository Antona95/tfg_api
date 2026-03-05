import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Configuración inicial de Zod + OpenAPI
extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();

// ==========================================
// 1. DEFINICIÓN DE ESQUEMAS (MODELOS)
// ==========================================

// --- Esquema USUARIO ---
const UsuarioInputSchema = registry.register(
  'UsuarioInput',
  z.object({
    nombre: z.string().openapi({ example: 'Iván' }),
    apellidos: z.string().openapi({ example: 'Antona' }),
    nickname: z.string().openapi({ example: 'ivan_antona' }),
    pass: z.string().openapi({ example: 'password123' }),
  }),
);

const UsuarioResponseSchema = registry.register(
  'UsuarioResponse',
  z.object({
    id: z.string().openapi({ example: '65a9f2b1c83d9a001e5a1b2c' }),
    nombre: z.string().openapi({ example: 'Iván' }),
    apellidos: z.string().openapi({ example: 'Antona' }),
    nickname: z.string().openapi({ example: 'ivan_antona' }),
  }),
);

// --- Esquema DETALLE DE EJERCICIO (Dentro de la Sesión) ---
const DetalleSesionSchema = registry.register(
  'DetalleSesion',
  z.object({
    nombre: z.string().openapi({ example: 'Press Militar' }),
    id_ejercicio: z.string().openapi({ example: '65b1234567890abcdef12345' }), // ObjectId ref
    series: z.number().openapi({ example: 3 }),
    repeticiones: z.number().openapi({ example: 12 }),
    peso: z.number().openapi({ example: 40 }),
    bloque: z
      .number()
      .default(0)
      .openapi({ example: 1, description: 'Agrupación de ejercicios (0, 1, 2...)' }),
  }),
);

// --- Esquema SESIÓN ---
const SesionSchema = registry.register(
  'Sesion',
  z.object({
    id: z.string().openapi({ example: 'sesion_999' }),
    titulo: z.string().openapi({ example: 'Rutina de Empuje - Bloque A' }),
    id_usuario: z.string().openapi({ example: '65a9f2b1c83d9a001e5a1b2c' }),
    finalizada: z.boolean().default(false).openapi({ example: false }),
    ejercicios: z.array(DetalleSesionSchema),
  }),
);

// ==========================================
// 2. DEFINICIÓN DE RUTAS (ENDPOINTS)
// ==========================================

/** * USUARIOS */
registry.registerPath({
  method: 'post',
  path: '/api/usuarios',
  summary: 'Registrar nuevo usuario',
  tags: ['Usuarios'],
  request: {
    body: { content: { 'application/json': { schema: UsuarioInputSchema } } },
  },
  responses: {
    201: {
      description: 'Usuario creado',
      content: { 'application/json': { schema: UsuarioResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/usuarios/{nickname}',
  summary: 'Obtener usuario por Nickname',
  tags: ['Usuarios'],
  request: {
    params: z.object({ nickname: z.string() }),
  },
  responses: {
    200: {
      description: 'Usuario encontrado',
      content: { 'application/json': { schema: UsuarioResponseSchema } },
    },
    404: { description: 'Usuario no encontrado' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/usuarios/{nickname}',
  summary: 'Eliminar usuario por Nickname',
  tags: ['Usuarios'],
  request: {
    params: z.object({ nickname: z.string() }),
  },
  responses: {
    200: { description: 'Usuario eliminado correctamente' },
    404: { description: 'Usuario no encontrado' },
  },
});

/** * SESIONES */
registry.registerPath({
  method: 'post',
  path: '/api/sesiones',
  summary: 'Crear sesión de entrenamiento (desde App)',
  tags: ['Sesiones'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SesionSchema.omit({ id: true }), // El ID lo genera Mongo
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Sesión guardada',
      content: { 'application/json': { schema: SesionSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/sesiones/hoy/{idUsuario}',
  summary: 'Obtener sesión activa de hoy',
  tags: ['Sesiones'],
  request: {
    params: z.object({ idUsuario: z.string() }),
  },
  responses: {
    200: {
      description: 'Sesión de hoy',
      content: { 'application/json': { schema: SesionSchema } },
    },
    404: { description: 'No hay sesión para hoy' },
  },
});

// ==========================================
// 3. GENERACIÓN DEL DOCUMENTO
// ==========================================

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiSpec = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'API TFG Entrenamiento - Iván Antona',
    version: '1.1.0',
    description:
      'Documentación oficial de la API. Soporte para bloques de ejercicios y gestión de usuarios.',
  },
  servers: [{ url: '/' }],
});
