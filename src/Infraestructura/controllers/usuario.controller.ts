import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { UsuarioSchema } from '../schemas/usuario.schema';

import { UsuarioService } from '../../Aplicacion/services/usuario.service';
import { ListarClientesUseCase } from '../../Aplicacion/use-cases/usuario/listar-clientes.use-case';
import { LoginUsuarioUseCase } from '../../Aplicacion/use-cases/usuario/login-usuario.use-case';
import { CrearUsuarioUseCase } from '../../Aplicacion/use-cases/usuario/crear-usuario.use-case';
import { EliminarUsuarioUseCase } from '../../Aplicacion/use-cases/usuario/eliminar-usuario.use-case';

export class UsuarioController {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly loginUseCase: LoginUsuarioUseCase,
    private readonly listarClientesUseCase: ListarClientesUseCase,
    private readonly crearUsuarioUseCase: CrearUsuarioUseCase,
    private readonly eliminarUsuarioUseCase: EliminarUsuarioUseCase,
  ) {}

  login = async (req: Request, res: Response) => {
    try {
      const { nickname, pass } = req.body;

      if (!nickname || !pass) {
        return res.status(400).json({ error: 'faltan datos de acceso' });
      }

      const usuario = await this.loginUseCase.execute(nickname, pass);
      res.status(200).json(usuario);
    } catch (error: unknown) {
      const err = error as Error;
      console.error(err);
      const status = err.message === 'usuario no encontrado' ? 404 : 401;
      res.status(status).json({ error: err.message });
    }
  };

  getClientes = async (req: Request, res: Response) => {
    try {
      const clientes = await this.listarClientesUseCase.execute();
      res.status(200).json(clientes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'error al obtener clientes' });
    }
  };

  createUsuario = async (req: Request, res: Response) => {
    try {
      const validacion = UsuarioSchema.safeParse(req.body);

      if (!validacion.success) {
        return res.status(400).json({ error: validacion.error.issues });
      }

      const datos = validacion.data;
      const nuevo = await this.crearUsuarioUseCase.execute(datos);

      res.status(201).json(nuevo);
    } catch (error: unknown) {
      const err = error as Error;
      console.log('Error al crear un usuario', err);

      if (err.message && err.message.includes('existe')) {
        return res.status(409).json({ error: err.message });
      }

      console.error(err);
      res.status(500).json({ error: 'error interno al crear usuario' });
    }
  };

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

      if (!usuario) {
        return res.status(404).json({ error: 'usuario no encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'error al buscar usuario' });
    }
  };

  updateUsuario = async (req: Request, res: Response) => {
    try {
      const datos = UsuarioSchema.partial().parse(req.body);
      const actualizado = await this.usuarioService.actualizarUsuario(req.params.nickname, datos);

      if (!actualizado) {
        return res.status(404).json({ error: 'usuario no encontrado para actualizar' });
      }

      res.json(actualizado);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.issues });
      }

      console.error(error);
      res.status(500).json({ error: 'error al actualizar usuario' });
    }
  };

  deleteUsuario = async (req: Request, res: Response) => {
    try {
      const eliminado = await this.eliminarUsuarioUseCase.execute(req.params.nickname);

      if (!eliminado) {
        return res.status(404).json({ error: 'usuario no encontrado para eliminar' });
      }

      res.json({ message: 'usuario eliminado correctamente (y sus sesiones)' });
    } catch (error: unknown) {
      const err = error as Error;
      console.error(err);

      if (err.message.includes('no existe')) {
        return res.status(404).json({ error: err.message });
      }

      if (err.message.includes('No se permite eliminar al administrador')) {
        return res.status(403).json({ error: err.message });
      }

      return res.status(500).json({ error: 'error al eliminar usuario' });
    }
  };
}
