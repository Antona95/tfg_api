import { SesionEntrenamiento } from '../../models/sesion.model';

export interface SesionInputDTO {
  idUsuario: string;
  titulo: string;
  fechaProgramada: string;
  ejercicios: Array<{
    nombre: string;
    series: number;
    repeticiones: string | number;
    peso?: number;
    bloque?: number;
  }>;
}

export interface SesionRepository {
  create(sesion: SesionEntrenamiento): Promise<SesionEntrenamiento>;
  getById(id: string): Promise<SesionEntrenamiento | null>;
  getByPlanId(idPlan: string): Promise<SesionEntrenamiento[]>;
  update(id: string, sesion: Partial<SesionEntrenamiento>): Promise<SesionEntrenamiento | null>;
  delete(id: string): Promise<boolean>;

  // Métodos específicos para la comunicación con la App
  crearDesdeApp(datos: SesionInputDTO): Promise<SesionEntrenamiento>;
  getSesionHoy(idUsuario: string): Promise<SesionEntrenamiento | null>;
  findSesionesByUsuario(idUsuario: string): Promise<SesionEntrenamiento[]>;
}
