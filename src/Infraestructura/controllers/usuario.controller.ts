import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { UsuarioSchema } from '../schemas/usuario.schema';

// ============================================================================
// APUNTE DE CLASE (DAM): IMPORTACIONES DE APLICACIÓN
// ============================================================================
// Aquí traemos la lógica de negocio. Fíjate cómo hemos importado el nuevo
// EliminarUsuarioUseCase para poder usar el borrado en cascada.
import { UsuarioService } from '../../Aplicacion/services/usuario.service';
import { ListarClientesUseCase } from '../../Aplicacion/use-cases/usuario/listar-clientes.use-case';
import { LoginUsuarioUseCase } from '../../Aplicacion/use-cases/usuario/login-usuario.use-case';
import { CrearUsuarioUseCase } from '../../Aplicacion/use-cases/usuario/crear-usuario.use-case';
import { EliminarUsuarioUseCase } from '../../Aplicacion/use-cases/usuario/eliminar-usuario.use-case'; // <--- NUEVO

export class UsuarioController {
  // ============================================================================
  // APUNTE DE CLASE (DAM): INYECCIÓN DE DEPENDENCIAS EN EL CONSTRUCTOR
  // ============================================================================
  // Un buen controlador NO hace consultas a la base de datos ni crea los objetos
  // con "new". Simplemente recibe las herramientas por el constructor (Inyección).
  // Esto cumple el principio de Inversión de Dependencias (la 'D' de SOLID).
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly loginUseCase: LoginUsuarioUseCase,
    private readonly listarClientesUseCase: ListarClientesUseCase,
    private readonly crearUsuarioUseCase: CrearUsuarioUseCase,
    private readonly eliminarUsuarioUseCase: EliminarUsuarioUseCase, // <--- NUEVO: Añadido al constructor
  ) {}

  // --- MÉTODO REFACTORIZADO (LOGIN) ---
  login = async (req: Request, res: Response) => {
    try {
      const { nickname, pass } = req.body;

      if (!nickname || !pass) {
        return res.status(400).json({ error: 'faltan datos de acceso' });
      }

      const usuario = await this.loginUseCase.execute(nickname, pass);
      res.status(200).json(usuario);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      console.error(err);
      const status = err.message === 'Usuario no encontrado' ? 404 : 401;
      res.status(status).json({ error: err.message });
    }
  };

  // --- NUEVO MÉTODO (LISTAR CLIENTES) ---
  getClientes = async (req: Request, res: Response) => {
    try {
      const clientes = await this.listarClientesUseCase.execute();
      res.status(200).json(clientes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'error al obtener clientes' });
    }
  };

  // --- CREATE USUARIO ---
  createUsuario = async (req: Request, res: Response) => {
    try {
      const validacion = UsuarioSchema.safeParse(req.body);

      if (!validacion.success) {
        return res.status(400).json({ error: validacion.error.issues });
      }

      const datos = validacion.data;

      const nuevo = await this.crearUsuarioUseCase.execute({
        ...datos,
        pass: datos.pass,
        rol: datos.rol,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      res.status(201).json(nuevo);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      console.log('Error al crear un usuario', err);
      // OJO: Manejo del error 409 (Conflicto) si el usuario ya existe
      if (err.message && err.message.includes('existe'))
        return res.status(409).json({ error: err.message });

      console.error(err);
      res.status(500).json({ error: 'error interno al crear usuario' });
    }
  };

  // --- MÉTODOS EXISTENTES (Lectura y Actualización) ---
  getUsuarios = async (req: Request, res: Response) => {
    try {
      const usuarios = await this.usuarioService.obtenerTodos();
      res.json(usuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'error al obtener el listado de usuarios' });
    }
  };

  getUsuarioByNickname = async (req: Request, res: Response) => {
    try {
      const { nickname } = req.params;
      const usuario = await this.usuarioService.obtenerPorNickname(nickname);
      if (!usuario) return res.status(404).json({ error: 'usuario no encontrado' });
      res.json(usuario);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'error al buscar usuario' });
    }
  };

  updateUsuario = async (req: Request, res: Response) => {
    try {
      const datos = UsuarioSchema.partial().parse(req.body);
      const actualizado = await this.usuarioService.actualizarUsuario(
        req.params.nickname,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        datos as any,
      );
      if (!actualizado)
        return res.status(404).json({ error: 'usuario no encontrado para actualizar' });
      res.json(actualizado);
    } catch (error: unknown) {
      if (error instanceof ZodError) return res.status(400).json({ error: error.issues });

      console.error(error);
      res.status(500).json({ error: 'error al actualizar usuario' });
    }
  };

  // ============================================================================
  // APUNTE DE CLASE (DAM): MÉTODO DELETE REFACTORIZADO
  // ============================================================================
  // Antes usábamos el "usuarioService". Ahora delegamos la responsabilidad
  // al "EliminarUsuarioUseCase" que es el encargado de hacer el borrado en cascada
  // (borrar al usuario Y sus sesiones en MongoDB).
  deleteUsuario = async (req: Request, res: Response) => {
    try {
      // Llamamos a nuestro nuevo Caso de Uso
      const eliminado = await this.eliminarUsuarioUseCase.execute(req.params.nickname);

      if (!eliminado) return res.status(404).json({ error: 'usuario no encontrado para eliminar' });
      res.json({ message: 'usuario eliminado correctamente (y sus sesiones)' });
    } catch (error: any) {
      // Manejo de errores específicos lanzados por el Caso de Uso

      // 1. Si el usuario no existe (404 Not Found)
      if (error.message && error.message.includes('no existe')) {
        return res.status(404).json({ error: error.message });
      }

      // 2. Si intentan borrar al MasterCoach (403 Forbidden - Prohibido)
      if (error.message && error.message.includes('No se permite eliminar al administrador')) {
        return res.status(403).json({ error: error.message });
      }

      // 3. Fallo genérico del servidor (500 Internal Server Error)
      res.status(500).json({ error: 'error al eliminar usuario' });
    }
  };
}
