import { connectMongoDB, disconnectMongoDB } from './mongo';
import { UsuarioModel } from '../models/UsuarioModel';
import { EjercicioModel } from '../models/EjercicioModel';
import { PlanModel } from '../models/PlanModel';
import { SesionModel } from '../models/SesionModel';

const seed = async () => {
  try {
    await connectMongoDB();

    console.log('Limpiando colecciones...');
    await UsuarioModel.deleteMany({});
    await EjercicioModel.deleteMany({});
    await PlanModel.deleteMany({});
    await SesionModel.deleteMany({});

    console.log('Creando usuarios...');
    const entrenador = await UsuarioModel.create({
      nombre: 'Ana',
      apellidos: 'García',
      pass: '1234',
      nickname: 'ana_garcia',
      rol: 'ENTRENADOR',
    });

    const usuario = await UsuarioModel.create({
      nombre: 'Juan',
      apellidos: 'Pérez',
      pass: 'abcd',
      nickname: 'juan_perez',
      rol: 'USUARIO',
      id_entrenador: entrenador._id.toString(), //  usuario._id es ObjectId y id_usuario espera string, por eso se pone .toString().
    });

    console.log('Creando ejercicios...');
    const ejercicio1 = await EjercicioModel.create({ nombre: 'Sentadilla' });
    const ejercicio2 = await EjercicioModel.create({ nombre: 'Press de banca' });
    const ejercicio3 = await EjercicioModel.create({ nombre: 'Peso muerto' });

    console.log('Creando plan...');
    const plan = await PlanModel.create({
      objetivo_principal: 'Aumentar fuerza',
      id_usuario: usuario._id.toString(),
      fecha_inicio: new Date(),
    });

    console.log('Creando sesión de entrenamiento...');
    const sesion = await SesionModel.create({
      fecha: new Date(),
      finalizada: false,
      id_plan: plan._id.toString(),
      id_usuario: usuario._id.toString(),
      ejercicios: [
        { id_ejercicio: ejercicio1._id.toString(), series: 3, repeticiones: 10, peso: 50 },
        { id_ejercicio: ejercicio2._id.toString(), series: 4, repeticiones: 8, peso: 60 },
        { id_ejercicio: ejercicio3._id.toString(), series: 3, repeticiones: 6, peso: 100 },
      ],
    });

    console.log('Seed completado:');
    console.log(`Usuario: ${usuario._id}`);
    console.log(`Entrenador: ${entrenador._id}`);
    console.log(`Plan: ${plan._id}`);
    console.log(`Sesion: ${sesion._id}`);
    console.log(`Ejercicios: ${ejercicio1._id}, ${ejercicio2._id}, ${ejercicio3._id}`);

    await disconnectMongoDB();
  } catch (error) {
    console.error('Error en seed:', error);
    await disconnectMongoDB();
    process.exit(1);
  }
};

// Ejecutar seed
seed();
