// 1. Definimos el "Detalle" (Series, Reps, Peso)
// Esto NO es una entidad independiente, es un objeto de valor dentro de la sesión
export interface DetalleSesion {
  nombre?: string; // Nombre del ejercicio (opcional, para facilitar la vida a la App)
  id_ejercicio: string; // Referencia al ejercicio (Press Banca, etc.)
  series: number;
  repeticiones: number;
  peso: number;
  // 0 o undefined = Ejercicio normal
  // 1, 2, 3... = Ejercicios que forman una biserie/triserie/circuito entre sí
  bloque?: number;
}

// 2. Definimos la Sesión completa
export interface SesionEntrenamiento {
  id?: string;
  titulo?: string; //Título de la sesión (Ej: "Día 1 - Pierna")
  finalizada: boolean;

  // RELACIONES
  id_usuario: string; // La hace un usuario

  // LISTA DE EJERCICIOS (Tu "Detalle_Sesion" está aquí dentro)
  ejercicios: DetalleSesion[];
}
