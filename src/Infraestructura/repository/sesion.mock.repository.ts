import {
  SesionRepository,
  SesionInputDTO,
} from '../../Dominio/interfaces/sesion/sesion.repository.interface';
import { SesionEntrenamiento } from '../../Dominio/models/sesion.model';

export class SesionMockRepository implements SesionRepository {
  private sesiones: SesionEntrenamiento[] = [];

  async create(sesion: SesionEntrenamiento): Promise<SesionEntrenamiento> {
    const nueva = { ...sesion, id: 'sesion-mock-' + Date.now() };
    this.sesiones.push(nueva);
    return nueva;
  }

  async getById(id: string): Promise<SesionEntrenamiento | null> {
    return this.sesiones.find((s) => (s as any).id === id) || null;
  }

  // --- NUEVO: Necesario para que el Mock cumpla con la interfaz ---
  async findSesionesByUsuario(idUsuario: string): Promise<SesionEntrenamiento[]> {
    return this.sesiones
      .filter((s) => s.id_usuario === idUsuario)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  async getSesionHoy(idUsuario: string): Promise<SesionEntrenamiento | null> {
    const today = new Date().toISOString().split('T')[0];
    return (
      this.sesiones.find(
        (s) =>
          s.id_usuario === idUsuario && new Date(s.fecha).toISOString().split('T')[0] === today,
      ) || null
    );
  }

  async getByPlanId(idPlan: string): Promise<SesionEntrenamiento[]> {
    return this.sesiones.filter((s) => s.id_plan === idPlan);
  }

  async update(
    id: string,
    datos: Partial<SesionEntrenamiento>,
  ): Promise<SesionEntrenamiento | null> {
    const index = this.sesiones.findIndex((s) => (s as any).id === id);
    if (index === -1) return null;
    this.sesiones[index] = { ...this.sesiones[index], ...datos };
    return this.sesiones[index];
  }

  async delete(id: string): Promise<boolean> {
    const inicial = this.sesiones.length;
    this.sesiones = this.sesiones.filter((s) => (s as any).id !== id);
    return this.sesiones.length < inicial;
  }

  async crearDesdeApp(datos: SesionInputDTO): Promise<SesionEntrenamiento> {
    const nuevaSesionMock: SesionEntrenamiento = {
      id: 'sesion-app-mock-' + Date.now(),
      fecha: datos.fechaProgramada,
      titulo: datos.titulo,
      finalizada: false,
      id_plan: 'plan-dummy-mock',
      id_usuario: datos.idUsuario,

      ejercicios: datos.ejercicios.map((ej, index) => ({
        nombreEjercicio: ej.nombre, // Sincronizado con Dominio
        id_ejercicio: 'ejercicio-mock-' + index,
        series: ej.series,
        repeticiones:
          typeof ej.repeticiones === 'string' ? parseInt(ej.repeticiones) || 0 : ej.repeticiones,
        peso: ej.peso || 0,
        bloque: ej.bloque || 0,
      })),
    } as any;

    this.sesiones.push(nuevaSesionMock);
    return nuevaSesionMock;
  }
}
