import mongoose from 'mongoose';
import * as dns from 'dns';
import { config } from '../config/env';

dns.setServers(['8.8.8.8', '8.8.4.4']);

mongoose.connection.on('connected', () => console.log(' Mongoose CONECTADO a MongoDB'));
mongoose.connection.on('error', (err) => console.error(' ERROR en Mongoose:', err));
mongoose.connection.on('disconnected', () => {
  console.warn(' MongoDB DESCONECTADO. Intentando RECONECTAR...');
});

export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGO_URI, {
      maxPoolSize: config.DB_POOL_SIZE,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('Base de datos MongoDB conectada correctamente');
  } catch (error) {
    console.error('Error crítico en la conexión inicial a MongoDB:', error);
    throw error;
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
