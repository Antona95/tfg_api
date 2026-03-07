import mongoose from 'mongoose';
import * as dns from 'dns';
import { config } from '../config/env';

dns.setServers(['8.8.8.8', '8.8.4.4']);

// ============================================================================
// APUNTE DE CLASE: GESTIÓN DE EVENTOS DE MONGODB
// Configuramos escuchadores para que el servidor nos avise por consola si
// la base de datos se cae o vuelve, sin que el proceso de Node.js se detenga.
// ============================================================================
mongoose.connection.on('connected', () => console.log('✅ Mongoose CONECTADO a MongoDB'));
mongoose.connection.on('error', (err) => console.error('❌ ERROR en Mongoose:', err));
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB DESCONECTADO. Intentando RECONECTAR...');
});

export const connectMongoDB = async (): Promise<void> => {
  try {
    // Mongoose por defecto ya intenta reconectar indefinidamente (autoReconnect)
    // Pero configuramos tiempos de espera razonables para que no bloquee todo.
    await mongoose.connect(config.MONGO_URI, {
      maxPoolSize: config.DB_POOL_SIZE,
      serverSelectionTimeoutMS: 5000, // Tiempo máximo para encontrar el servidor (5s)
      socketTimeoutMS: 45000, // Tiempo antes de cerrar conexiones inactivas
    });

    console.log(`Base de datos lista en: ${config.MONGO_URI}`);
  } catch (error) {
    // IMPORTANTE: Aquí solo hacemos el exit si es el arranque inicial y falla.
    // Una vez arrancado, mongoose.connection.on('error') se encargará de avisar.
    console.error('Error crítico en la conexión inicial a MongoDB:', error);

    // Si quieres que el servidor arranque aunque la DB esté caída (modo supervivencia):
    // Quita el process.exit(1) de aquí abajo.
    // process.exit(1);
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB desconectado correctamente');
  } catch (error) {
    console.error('Error al desconectar MongoDB:', error);
  }
};
