import NodeCache from 'node-cache';

// ============================================================================
// APUNTE DE CLASE (DAM): EL ARCHIVO CONTAINER (El cerebro del ensamblaje)
// ============================================================================
// Este archivo funciona como un contenedor de Inyección de Dependencias manual.
// Aquí es el ÚNICO lugar de toda la app donde usamos la palabra "new" para
// instanciar nuestras clases, pasándole a cada una lo que necesita para vivir.

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
import { EliminarUsuarioUseCase } from './Aplicacion/use-cases/usuario/eliminar-usuario.use-case'; // <--- NUEVO

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
// Instanciamos los objetos que hablan directamente con MongoDB (o con Mocks si es test)
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

// Aquí instanciamos nuestro Caso de Uso de Eliminar.
// Fíjate que requiere TANTO el repositorio de usuarios (para borrar al alumno)
// COMO el repositorio de sesiones (para el borrado en cascada), más la caché.
const eliminarUsuarioUseCase = new EliminarUsuarioUseCase(usuarioRepo, sesionRepo, appCache); // <--- NUEVO

// =============================================================
// Controladores (El punto de entrada web)
// =============================================================

// Ensamblamos el UsuarioController pasándole todas las piezas que requiere su constructor.
const usuarioController = new UsuarioController(
  usuarioService,
  loginUseCase,
  listarClientesUseCase,
  crearUsuarioUseCase,
  eliminarUsuarioUseCase, // <--- NUEVO: Le inyectamos el caso de uso como 5º parámetro
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
