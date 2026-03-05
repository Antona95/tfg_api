import request from 'supertest';
import app from '../../app';

// forzamos el entorno test
process.env.NODE_ENV = 'test';

describe('api usuarios - tests de integración', () => {
  /**
   * pruebas para código 400 (bad request)
   */
  it('post /api/usuarios - debería devolver 400 si faltan campos obligatorios (nickname)', async () => {
    const res = await request(app).post('/api/usuarios').send({
      nombre: 'solonombre',
      // falta apellidos, contrasena y nickname
    });

    expect(res.status).toBe(400);
    // verificamos que zod haya devuelto un error
    expect(res.body).toHaveProperty('error');
  });

  /**
   * pruebas para código 404 (not found)
   */
  it('get /api/usuarios/:nickname - debería devolver 404 si el nickname no existe', async () => {
    // buscamos un nickname que sabemos que no existe
    const res = await request(app).get('/api/usuarios/usuario_fantasma_123');

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('no encontrado');
  });

  it('delete /api/usuarios/:nickname - debería devolver 404 al borrar un nickname inexistente', async () => {
    const res = await request(app).delete('/api/usuarios/usuario_fantasma_123');

    expect(res.status).toBe(404);
  });

  /**
   * pruebas de flujo exitoso (201 created)
   */
  it('post /api/usuarios - debería devolver 201 si enviamos todos los datos correctos', async () => {
    const nuevoUsuario = {
      nombre: 'test',
      apellidos: 'user',
      pass: 'password123', // clave sin ñ
      nickname: 'tester_pro', // identificador único
      rol: 'USUARIO',
    };

    const res = await request(app).post('/api/usuarios').send(nuevoUsuario);

    // debug: si falla, imprime el error para ver qué dice el backend
    if (res.status !== 201) {
      console.error('error en test post:', res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nickname).toBe(nuevoUsuario.nickname);
  });

  /**
   * prueba de flujo completo (crear -> leer -> borrar)
   * verifica la persistencia y la consistencia de los datos
   */
  it('flujo e2e: crear usuario y luego consultarlo por nickname', async () => {
    const nicknamePrueba = 'flujo_completo_user';

    // 1. crear
    await request(app).post('/api/usuarios').send({
      nombre: 'flujo',
      apellidos: 'completo',
      pass: 'securepass',
      nickname: nicknamePrueba,
      rol: 'ENTRENADOR',
    });

    // 2. consultar por nickname (url dinámica)
    const res = await request(app).get(`/api/usuarios/${nicknamePrueba}`);

    expect(res.status).toBe(200);
    expect(res.body.nickname).toBe(nicknamePrueba);
    expect(res.body.rol).toBe('ENTRENADOR');
  });
});
