import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { UsuarioSchema } from '../schemas/usuario.schema';

// 1. Imports de Servicios y Casos de Uso
import { UsuarioService } from '../../Aplicacion/services/usuario.service';
import { ListarClientesUseCase } from '../../Aplicacion/use-cases/usuario/listar-clientes.use-case';
import { LoginUsuarioUseCase } from '../../Aplicacion/use-cases/usuario/login-usuario.use-case';
import { CrearUsuarioUseCase } from '../../Aplicacion/use-cases/usuario/crear-usuario.use-case';

export class UsuarioController {
  // 2. INYECCIÓN DE DEPENDENCIAS
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly loginUseCase: LoginUsuarioUseCase,
    private readonly listarClientesUseCase: ListarClientesUseCase,
    private readonly crearUsuarioUseCase: CrearUsuarioUseCase,
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
      if (err.message && err.message.includes('existe'))
        return res.status(409).json({ error: err.message });

      console.error(err);
      res.status(500).json({ error: 'error interno al crear usuario' });
    }
  };

  // --- MÉTODOS EXISTENTES ---

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

  deleteUsuario = async (req: Request, res: Response) => {
    try {
      const eliminado = await this.usuarioService.eliminarUsuario(req.params.nickname);
      if (!eliminado) return res.status(404).json({ error: 'usuario no encontrado para eliminar' });
      res.json({ message: 'usuario eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'error al eliminar usuario' });
    }
  };
}
