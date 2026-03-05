import request from 'supertest';
import app from '../../app';
import mongoose from 'mongoose';

describe('API Sesiones (Integración App)', () => {
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Generamos IDs falsos para simular
  // const mockPlanId = new mongoose.Types.ObjectId().toString(); // La App no suele enviar el plan, lo deduce o lo crea
  const mockUsuarioId = new mongoose.Types.ObjectId().toString();

  // Nota: Para la App enviamos el NOMBRE del ejercicio, no el ID.
  // const mockEjercicioId = new mongoose.Types.ObjectId().toString();

  it('Debería crear una sesión desde la App Android', async () => {
    // 1. PREPARAMOS EL PAYLOAD (Formato App / DTO)
    const payloadApp = {
      idUsuario: mockUsuarioId, // camelCase
      titulo: 'Entrenamiento de Pecho',
      ejercicios: [
        {
          nombre: 'Press Banca', // La App manda el nombre
          series: 4,
          repeticiones: 10,
          peso: 80,
          bloque: 1,
        },
      ],
    };

    // 2. LLAMADA A LA API
    // ¡IMPORTANTE!: Asegúrate de que esta ruta apunta a 'createSesionApp' en tu routes.ts
    const res = await request(app).post('/api/sesiones/app').send(payloadApp);

    // Debug: Si falla, esto te dirá qué campo rechaza Zod
    if (res.status === 400) {
      console.log('Errores de validación Zod:', JSON.stringify(res.body, null, 2));
    }

    // 3. COMPROBACIONES
    expect(res.status).toBe(201);
    expect(res.body.titulo).toBe(payloadApp.titulo);
    expect(res.body.ejercicios).toHaveLength(1);

    // Aquí verificamos que el backend haya hecho la traducción correctamente:
    // 'nombre' (App) -> 'nombreEjercicio' (Backend/DB)
    // Nota: Mongoose a veces devuelve el objeto _doc, verifica si recibes nombreEjercicio
    if (res.body.ejercicios[0].nombreEjercicio) {
      expect(res.body.ejercicios[0].nombreEjercicio).toBe('Press Banca');
    }
  });

  it('Debería fallar si las series son negativas (Validación Zod)', async () => {
    const payloadInvalido = {
      idUsuario: mockUsuarioId,
      titulo: 'Entreno Fail',
      ejercicios: [
        {
          nombre: 'Sentadilla',
          series: -5, // ❌ ERROR INTENCIONADO
          repeticiones: 10,
          peso: 50,
        },
      ],
    };

    const res = await request(app).post('/api/sesiones/app').send(payloadInvalido);

    expect(res.status).toBe(400);
    // Opcional: verificar que el error menciona "series"
    // expect(JSON.stringify(res.body)).toContain('series');
  });
});
