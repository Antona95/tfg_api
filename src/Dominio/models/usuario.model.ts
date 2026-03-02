export interface Usuario {
  id?: string; // el id es opcional al crear, pero obligatorio al leer
  nombre: string;
  apellidos: string;
  pass: string;
  nickname: string;

  // nuevos campos requeridos
  rol: 'USUARIO' | 'ENTRENADOR'; // tipado estricto para el rol
  id_entrenador?: string; // opcional (el signo ?) porque un entrenador no tiene entrenador
}

//¿Qué es? Es la Definición Pura (El plano).
//Tecnología: Solo TypeScript (interface).
//¿Qué hace? Le dice a tu aplicación qué datos tiene un usuario, sin importar si usas MongoDB, MySQL o un Excel.
//Dependencias: CERO. No importa mongoose, ni express, ni nada.
//Ejemplo: "Un usuario tiene DNI".
