import { SesionRepository } from '../../Dominio/interfaces/sesion/sesion.repository.interface';
import { SesionEntrenamiento } from '../../Dominio/models/sesion.model';
import NodeCache from 'node-cache';

// importación de los casos de uso
import { CrearSesionUseCase } from '../use-cases/sesion/crear-sesion.use-case';
import { ObtenerSesionPorIdUseCase } from '../use-cases/sesion/obtener-sesion-por-id.use-case';
import { ActualizarSesionUseCase } from '../use-cases/sesion/actualizar-sesion.use-case';
import { EliminarSesionUseCase } from '../use-cases/sesion/eliminar-sesion.use-case';

export class SesionService {
  // definición de propiedades privadas para los casos de uso
  private readonly crearSesionUC: CrearSesionUseCase;
  private readonly obtenerSesionPorIdUC: ObtenerSesionPorIdUseCase;
  private readonly actualizarSesionUC: ActualizarSesionUseCase;
  private readonly eliminarSesionUC: EliminarSesionUseCase;

  // mantenemos una instancia de caché privada con ttl corto (60s) como tenías originalmente
  private readonly cache: NodeCache;

  constructor(private readonly sesionRepository: SesionRepository) {
    // configuración de caché específica para sesiones (datos muy volátiles)
    this.cache = new NodeCache({ stdTTL: 60 });

    // instanciación de los casos de uso inyectando repositorio y caché
    this.crearSesionUC = new CrearSesionUseCase(this.sesionRepository, this.cache);
    this.obtenerSesionPorIdUC = new ObtenerSesionPorIdUseCase(this.sesionRepository);
    this.actualizarSesionUC = new ActualizarSesionUseCase(this.sesionRepository, this.cache);
    this.eliminarSesionUC = new EliminarSesionUseCase(this.sesionRepository, this.cache);
  }

  // método fachada para crear sesión (uso interno o admin)
  async crearSesion(sesion: SesionEntrenamiento): Promise<SesionEntrenamiento> {
    return await this.crearSesionUC.execute(sesion);
  }

  // --- NUEVO MÉTODO AÑADIDO ---
  // Este es el método que soluciona el error en el Controller.
  // Recibe los datos "crudos" de la App y se los pasa al método especial del Caso de Uso.
  async crearDesdeApp(datos: {
    idUsuario: string;
    titulo: string;
    ejercicios: any[];
  }): Promise<SesionEntrenamiento> {
    return await this.crearSesionUC.executeDesdeApp(
      datos.idUsuario,
      datos.titulo,
      datos.ejercicios,
    );
  }
  // -----------------------------

  // método fachada para obtener sesión por id
  async obtenerPorId(id: string): Promise<SesionEntrenamiento | null> {
    return await this.obtenerSesionPorIdUC.execute(id);
  }

  // método fachada para actualizar sesión
  async actualizarSesion(
    id: string,
    datos: Partial<SesionEntrenamiento>,
  ): Promise<SesionEntrenamiento | null> {
    return await this.actualizarSesionUC.execute(id, datos);
  }

  // método fachada para eliminar sesión
  async eliminarSesion(id: string): Promise<boolean> {
    return await this.eliminarSesionUC.execute(id);
  }
}
