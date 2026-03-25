import NodeCache from 'node-cache';

import { UsuarioService } from './Aplicacion/services/usuario.service';
import { EjercicioService } from './Aplicacion/services/ejercicio.service';
import { SesionService } from './Aplicacion/services/sesion.service';

import { LoginUsuarioUseCase } from './Aplicacion/use-cases/usuario/login-usuario.use-case';
import { ListarClientesUseCase } from './Aplicacion/use-cases/usuario/listar-clientes.use-case';
import { CrearUsuarioUseCase } from './Aplicacion/use-cases/usuario/crear-usuario.use-case';
import { CrearSesionUseCase } from './Aplicacion/use-cases/sesion/crear-sesion.use-case';
import { FinalizarSesionUseCase } from './Aplicacion/use-cases/sesion/finalizar-sesion.use-case';
import { EliminarUsuarioUseCase } from './Aplicacion/use-cases/usuario/eliminar-usuario.use-case';

import { UsuarioMongoRepository } from './Infraestructura/repository/usuario.mongo.repository';
import { UsuarioMockRepository } from './Infraestructura/repository/usuario.mock.repository';
import { EjercicioMongoRepository } from './Infraestructura/repository/ejercicio.mongo.repository';
import { EjercicioMockRepository } from './Infraestructura/repository/ejercicio.mock.repository';
import { SesionMongoRepository } from './Infraestructura/repository/sesion.mongo.repository';
import { SesionMockRepository } from './Infraestructura/repository/sesion.mock.repository';

import { UsuarioController } from './Infraestructura/controllers/usuario.controller';
import { EjercicioController } from './Infraestructura/controllers/ejercicio.controller';
import { SesionController } from './Infraestructura/controllers/sesion.controller';

const isTest = process.env.NODE_ENV === 'test';
const appCache = new NodeCache({ stdTTL: 300 });

const usuarioRepo = isTest ? new UsuarioMockRepository() : new UsuarioMongoRepository();
const ejercicioRepo = isTest ? new EjercicioMockRepository() : new EjercicioMongoRepository();
const sesionRepo = isTest ? new SesionMockRepository() : new SesionMongoRepository();

const usuarioService = new UsuarioService(usuarioRepo, appCache);
const ejercicioService = new EjercicioService(ejercicioRepo);
const sesionService = new SesionService(sesionRepo);

const loginUseCase = new LoginUsuarioUseCase(usuarioRepo);
const listarClientesUseCase = new ListarClientesUseCase(usuarioRepo, appCache);
const crearSesionUseCase = new CrearSesionUseCase(sesionRepo, appCache);
const crearUsuarioUseCase = new CrearUsuarioUseCase(usuarioRepo, appCache);
const finalizarSesionUseCase = new FinalizarSesionUseCase(sesionRepo, appCache);
const eliminarUsuarioUseCase = new EliminarUsuarioUseCase(usuarioRepo, sesionRepo, appCache);

const usuarioController = new UsuarioController(
  usuarioService,
  loginUseCase,
  listarClientesUseCase,
  crearUsuarioUseCase,
  eliminarUsuarioUseCase,
);

const ejercicioController = new EjercicioController(ejercicioService);

const sesionController = new SesionController(
  sesionService,
  crearSesionUseCase,
  finalizarSesionUseCase,
  sesionRepo,
  appCache,
);

export { usuarioController, ejercicioController, sesionController };
