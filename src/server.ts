import app from './app'; // IMPORTANTE: Importamos la app ya configurada en app.ts
import { config } from './Infraestructura/config/env';
import { connectMongoDB } from './Infraestructura/database/mongo';

const startServer = async () => {
  try {
    // 1. Conectamos a la Base de Datos
    await connectMongoDB();

    const PORT = config.PORT;
    // 2. Arrancamos el servidor
    // Usamos la instancia 'app' que importamos arriba
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Documentación Swagger: http://localhost:${PORT}/api-docs`);
      console.log(`Rutas activas:`);
      console.log(`   - /api/usuarios`);
      console.log(`   - /api/ejercicios`);
      console.log(`   - /api/planes`);
      console.log(`   - /api/sesiones`);
    });
  } catch (error) {
    console.error('Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

// 3. Ejecutar
startServer();
