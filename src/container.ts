import NodeCache from 'node-cache';

// importación de servicios
import { UsuarioService } from './Aplicacion/services/usuario.service';
import { EjercicioService } from './Aplicacion/services/ejercicio.service';
import { SesionService } from './Aplicacion/services/sesion.service';

// importación de casos de uso
import { LoginUsuarioUseCase } from './Aplicacion/use-cases/usuario/login-usuario.use-case';
import { ListarClientesUseCase } from './Aplicacion/use-cases/usuario/listar-clientes.use-case';
import { CrearUsuarioUseCase } from './Aplicacion/use-cases/usuario/crear-usuario.use-case';
import { CrearSesionUseCase } from './Aplicacion/use-cases/sesion/crear-sesion.use-case';
import { FinalizarSesionUseCase } from './Aplicacion/use-cases/sesion/finalizar-sesion.use-case';

// importación de repositorios
import { UsuarioMongoRepository } from './Infraestructura/repository/usuario.mongo.repository';
import { UsuarioMockRepository } from './Infraestructura/repository/usuario.mock.repository';
import { EjercicioMongoRepository } from './Infraestructura/repository/ejercicio.mongo.repository';
import { EjercicioMockRepository } from './Infraestructura/repository/ejercicio.mock.repository';
import { SesionMongoRepository } from './Infraestructura/repository/sesion.mongo.repository';
import { SesionMockRepository } from './Infraestructura/repository/sesion.mock.repository';

// importación de controladores
import { UsuarioController } from './Infraestructura/controllers/usuario.controller';
import { EjercicioController } from './Infraestructura/controllers/ejercicio.controller';
import { SesionController } from './Infraestructura/controllers/sesion.controller';

const isTest = process.env.NODE_ENV === 'test';
const appCache = new NodeCache({ stdTTL: 300 });
// =============================================================
// Infraestructura (Repositorios)
// =============================================================
const usuarioRepo = isTest ? new UsuarioMockRepository() : new UsuarioMongoRepository();
const ejercicioRepo = isTest ? new EjercicioMockRepository() : new EjercicioMongoRepository();
const sesionRepo = isTest ? new SesionMockRepository() : new SesionMongoRepository();

// =============================================================
// Aplicación (Servicios y Casos de Uso)
// =============================================================
const usuarioService = new UsuarioService(usuarioRepo, appCache);
const ejercicioService = new EjercicioService(ejercicioRepo);
const sesionService = new SesionService(sesionRepo);

const loginUseCase = new LoginUsuarioUseCase(usuarioRepo);
const listarClientesUseCase = new ListarClientesUseCase(usuarioRepo, appCache);
const crearSesionUseCase = new CrearSesionUseCase(sesionRepo, appCache);
const crearUsuarioUseCase = new CrearUsuarioUseCase(usuarioRepo, appCache);
const finalizarSesionUseCase = new FinalizarSesionUseCase(sesionRepo, appCache);

// =============================================================
// Controladores
// =============================================================

const usuarioController = new UsuarioController(
  usuarioService,
  loginUseCase,
  listarClientesUseCase,
  crearUsuarioUseCase,
);
const ejercicioController = new EjercicioController(ejercicioService);

// CORREGIDO: Inyectamos sesionService, crearSesionUseCase Y sesionRepo
const sesionController = new SesionController(
  sesionService,
  crearSesionUseCase,
  finalizarSesionUseCase,
  sesionRepo,
  appCache, // Inyectamos la misma instancia de caché para que el Controller pueda limpiar
);

export { usuarioController, ejercicioController, sesionController };
