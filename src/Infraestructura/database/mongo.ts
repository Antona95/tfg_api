import mongoose from 'mongoose';
import * as dns from 'dns'; // 1. AÑADE ESTO: Importa la librería nativa de Node
import { config } from '../config/env';

// 2. AÑADE ESTO: Obligamos a Node a resolver los DNS por su cuenta y esquivar el bug
dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGO_URI, {
      maxPoolSize: config.DB_POOL_SIZE,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`Base de datos conectada: ${config.MONGO_URI}`);
    console.log(`Pool de conexiones: ${config.DB_POOL_SIZE}`);
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB desconectado');
  } catch (error) {
    console.error('Error desconectando:', error);
  }
};
