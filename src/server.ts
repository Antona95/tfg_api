import app from './app';
import { config } from './Infraestructura/config/env';
import { connectMongoDB } from './Infraestructura/database/mongo';

const startServer = async () => {
  try {
    await connectMongoDB();

    app.listen(config.PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en http://localhost:${config.PORT}`);
      console.log(`Documentación Swagger: http://localhost:${config.PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
