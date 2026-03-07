# Documentacion De La API Para Generar Diagramas En ChatGPT

## Objetivo

Este documento resume la informacion estructural y funcional del backend para que ChatGPT pueda generar diagramas sin depender del frontend.

Con esta informacion se pueden generar, como minimo:

- diagrama de arquitectura por capas / hexagonal
- diagrama de componentes
- diagrama de clases del backend
- diagrama entidad-relacion / modelo de datos MongoDB
- diagrama de flujo de datos del backend
- diagramas de secuencia de los endpoints principales
- diagrama de despliegue basico

## Stack Tecnologico

- Runtime: Node.js
- Framework HTTP: Express
- Lenguaje: TypeScript
- Base de datos: MongoDB
- ODM: Mongoose
- Validacion: Zod
- Documentacion API: OpenAPI con `@asteasolutions/zod-to-openapi`
- Cache: `node-cache`
- Seguridad HTTP: `helmet`, `cors`, `express-rate-limit`
- Tests de integracion: `supertest`

## Punto De Entrada Y Ensamblaje

### `src/app.ts`

Responsabilidades:

- crear la instancia de Express
- configurar middlewares globales
- activar `helmet`, `cors`, `express.json()`
- aplicar rate limiting global sobre `/api`
- montar Swagger en `/api-docs`
- montar rutas de usuarios, ejercicios y sesiones
- exponer rutas auxiliares `/` y `/health`

### `src/server.ts`

Responsabilidades:

- cargar la configuracion
- conectar MongoDB antes de aceptar trafico
- arrancar el servidor con `app.listen(...)`

### `src/container.ts`

Es la composition root de la aplicacion.

Responsabilidades:

- instanciar repositorios concretos
- elegir entre repositorios `mongo` o `mock` segun `NODE_ENV === 'test'`
- crear servicios
- crear casos de uso
- crear controladores
- exportar controladores ya ensamblados

## Arquitectura Por Capas

La arquitectura esta organizada en tres capas principales:

### 1. Dominio

Contiene modelos e interfaces puras, sin dependencias de Express o Mongoose.

- `models/`
- `interfaces/`

### 2. Aplicacion

Orquesta casos de uso y servicios.

- `services/`
- `use-cases/`

### 3. Infraestructura

Conecta la aplicacion con HTTP, MongoDB, validacion y configuracion.

- `routes/`
- `controllers/`
- `repository/`
- `models/`
- `schemas/`
- `database/`
- `config/`
- `tests/`

## Estructura De Carpetas Y Archivos

```text
src/
├── app.ts
├── server.ts
├── container.ts
├── README.md
├── Aplicacion/
│   ├── README.md
│   ├── services/
│   │   ├── usuario.service.ts
│   │   ├── sesion.service.ts
│   │   └── ejercicio.service.ts
│   └── use-cases/
│       ├── usuario/
│       │   ├── login-usuario.use-case.ts
│       │   ├── listar-usuarios.use-case.ts
│       │   ├── listar-clientes.use-case.ts
│       │   ├── eliminar-usuario.use-case.ts
│       │   ├── crear-usuario.use-case.ts
│       │   ├── buscar-usuario-por-nickname.use-case.ts
│       │   └── actualizar-usuario.use-case.ts
│       ├── sesion/
│       │   ├── obtener-sesiones-usuario.use-case.ts
│       │   ├── obtener-sesion-por-id.use-case.ts
│       │   ├── finalizar-sesion.use-case.ts
│       │   ├── eliminar-sesion.use-case.ts
│       │   ├── crear-sesion.use-case.ts
│       │   └── actualizar-sesion.use-case.ts
│       └── ejercicio/
│           ├── obtener-ejercicio-por-id.use-case.ts
│           ├── listar-ejercicios.use-case.ts
│           ├── eliminar-ejercicio.use-case.ts
│           └── crear-ejercicio.use-case.ts
├── Dominio/
│   ├── README.md
│   ├── models/
│   │   ├── usuario.model.ts
│   │   ├── sesion.model.ts
│   │   └── ejercicio.model.ts
│   ├── interfaces/
│   │   ├── usuario/
│   │   │   └── usuario.repository.interface.ts
│   │   ├── sesion/
│   │   │   └── sesion.repository.interface.ts
│   │   └── ejercicio/
│   │       └── ejercicio.repository.interface.ts
│   └── repositories/
│       └── sesion.repository.ts
└── Infraestructura/
    ├── README.md
    ├── config/
    │   ├── env.ts
    │   └── swagger.ts
    ├── database/
    │   ├── mongo.ts
    │   └── seed.ts
    ├── controllers/
    │   ├── usuario.controller.ts
    │   ├── sesion.controller.ts
    │   └── ejercicio.controller.ts
    ├── routes/
    │   ├── usuario.route.ts
    │   ├── sesion.route.ts
    │   └── ejercicio.route.ts
    ├── repository/
    │   ├── usuario.mongo.repository.ts
    │   ├── usuario.mock.repository.ts
    │   ├── sesion.mongo.repository.ts
    │   ├── sesion.mock.repository.ts
    │   ├── ejercicio.mongo.repository.ts
    │   └── ejercicio.mock.repository.ts
    ├── models/
    │   ├── UsuarioModel.ts
    │   ├── SesionModel.ts
    │   └── EjercicioModel.ts
    ├── schemas/
    │   ├── usuario.schema.ts
    │   ├── sesion.schema.ts
    │   └── ejercicio.schema.ts
    └── tests/
        ├── usuarios.integration.test.ts
        ├── sesiones.integration.test.ts
        └── ejercicios.integration.test.ts
```

## Entidades Del Dominio

### Usuario

Modelo de dominio:

```ts
interface Usuario {
  id?: string;
  nombre: string;
  apellidos: string;
  pass: string;
  nickname: string;
  rol: 'USUARIO' | 'ENTRENADOR';
  id_entrenador?: string;
}
```

Persistencia Mongoose:

- `nombre: string`
- `apellidos: string`
- `pass: string`
- `nickname: string` unico
- `rol: enum('USUARIO', 'ENTRENADOR')`
- `id_entrenador: ObjectId -> Usuario` opcional
- `createdAt`
- `updatedAt`

Relaciones:

- autorrelacion opcional: un `Usuario` puede tener un `id_entrenador` que apunta a otro `Usuario`
- semantica de negocio:
  - un entrenador puede tener muchos usuarios
  - un usuario puede pertenecer a un entrenador

### Ejercicio

Modelo de dominio:

```ts
interface Ejercicio {
  id?: string;
  nombre: string;
}
```

Persistencia Mongoose:

- `nombre: string` unico
- `createdAt`
- `updatedAt`

Relaciones:

- una `Sesion` referencia ejercicios mediante `ejercicios[].id_ejercicio`

### DetalleSesion

No es una entidad independiente; es un subdocumento embebido dentro de `Sesion`.

```ts
interface DetalleSesion {
  nombre?: string;
  id_ejercicio: string;
  series: number;
  repeticiones: number;
  peso: number;
  bloque?: number;
}
```

Semantica:

- representa una linea de trabajo dentro de una sesion
- `bloque` agrupa ejercicios en biseries, triseries o circuitos

### SesionEntrenamiento

Modelo de dominio:

```ts
interface SesionEntrenamiento {
  id?: string;
  titulo?: string;
  finalizada: boolean;
  id_usuario: string;
  ejercicios: DetalleSesion[];
}
```

Persistencia Mongoose:

- `titulo: string`
- `finalizada: boolean`
- `id_usuario: ObjectId -> Usuario`
- `ejercicios: DetalleSesion[]` embebido
- `createdAt`
- `updatedAt`

Relaciones:

- un `Usuario` tiene muchas `Sesion`
- una `Sesion` pertenece a un `Usuario`
- una `Sesion` contiene muchos `DetalleSesion`
- cada `DetalleSesion` referencia un `Ejercicio`

## Modelo De Datos En MongoDB

Colecciones esperadas:

- `usuarios`
- `ejercicios`
- `sesions` o `sesiones` segun pluralizacion por Mongoose

Observaciones:

- `Usuario` y `Ejercicio` son colecciones principales
- `Sesion` es coleccion principal
- `DetalleSesion` no es coleccion independiente; se almacena embebido dentro de `Sesion`
- `id_entrenador` y `id_usuario` son referencias tipo ObjectId
- `ejercicios.id_ejercicio` es referencia tipo ObjectId a `Ejercicio`

## Contratos De Repositorio

### `UsuarioRepository`

```ts
create(usuario: Usuario): Promise<Usuario>
getAll(): Promise<Usuario[]>
getByNickname(nickname: string): Promise<Usuario | null>
update(nickname: string, usuario: Partial<Usuario>): Promise<Usuario | null>
delete(nickname: string): Promise<boolean>
getByRol(rol: string): Promise<Usuario[]>
```

### `SesionRepository`

```ts
create(sesion: SesionEntrenamiento): Promise<SesionEntrenamiento>
update(id: string, sesion: Partial<SesionEntrenamiento>): Promise<SesionEntrenamiento | null>
delete(id: string): Promise<boolean>
findById(id: string): Promise<SesionEntrenamiento | null>
crearDesdeApp(datos: SesionInputDTO): Promise<SesionEntrenamiento>
getSesionHoy(idUsuario: string): Promise<SesionEntrenamiento | null>
findSesionesByUsuario(idUsuario: string): Promise<SesionEntrenamiento[]>
```

Nota importante:

- la implementacion Mongo de sesiones incluye ademas `deleteManyByUsuario(idUsuario)`
- este metodo se usa para borrado en cascada al eliminar un usuario
- ese metodo no esta declarado formalmente en la interfaz, pero si existe en la implementacion concreta

### `EjercicioRepository`

```ts
create(ejercicio: Ejercicio): Promise<Ejercicio>
getAll(): Promise<Ejercicio[]>
getById(id: string): Promise<Ejercicio | null>
delete(id: string): Promise<boolean>
```

## Implementaciones Concretas

### Repositorios Mongo

- `UsuarioMongoRepository`
- `SesionMongoRepository`
- `EjercicioMongoRepository`

### Repositorios Mock

- `UsuarioMockRepository`
- `SesionMockRepository`
- `EjercicioMockRepository`

Uso:

- `container.ts` selecciona mocks cuando `NODE_ENV === 'test'`
- esto permite diagramar dos variantes:
  - flujo normal con MongoDB
  - flujo de tests con mocks

## Servicios De Aplicacion

### `UsuarioService`

Fachada sobre casos de uso:

- `registrarUsuario`
- `obtenerTodos`
- `obtenerPorNickname`
- `actualizarUsuario`
- `eliminarUsuario`

Casos de uso internos o asociados:

- `CrearUsuarioUseCase`
- `ListarUsuariosUseCase`
- `BuscarUsuarioPorNicknameUseCase`
- `ActualizarUsuarioUseCase`
- `EliminarUsuarioUseCase`

### `SesionService`

Fachada sobre casos de uso:

- `crearSesion`
- `crearDesdeApp`
- `obtenerPorId`
- `actualizarSesion`
- `eliminarSesion`

Casos de uso internos o asociados:

- `CrearSesionUseCase`
- `ObtenerSesionPorIdUseCase`
- `ActualizarSesionUseCase`
- `EliminarSesionUseCase`

### `EjercicioService`

Fachada sobre casos de uso:

- `crearEjercicio`
- `obtenerTodos`
- `obtenerPorId`
- `eliminarEjercicio`

Casos de uso internos o asociados:

- `CrearEjercicioUseCase`
- `ListarEjerciciosUseCase`
- `ObtenerEjercicioPorIdUseCase`
- `EliminarEjercicioUseCase`

## Casos De Uso Clave

### Login de usuario

- entrada: `nickname`, `pass`
- valida credenciales
- devuelve usuario si login correcto

### Crear usuario

- valida con Zod
- normaliza `rol`
- usa repositorio de usuarios
- puede devolver conflicto si el nickname ya existe

### Listar clientes

- obtiene usuarios filtrados por rol cliente/usuario

### Eliminar usuario

- protege al usuario especial `mastercoach`
- busca el usuario por nickname
- elimina usuario
- borra en cascada todas sus sesiones con `deleteManyByUsuario`
- limpia cache global de usuarios

### Crear sesion desde app

- recibe DTO de la app Android
- valida `idUsuario`, `titulo` y array de ejercicios
- traduce payload de app a formato persistente
- crea la sesion en Mongo
- limpia cache de sesiones del usuario

### Finalizar sesion

- marca `finalizada = true`
- actualiza ejercicios finales
- limpia cache del usuario

## Controladores HTTP

### `UsuarioController`

Metodos:

- `login`
- `getClientes`
- `createUsuario`
- `getUsuarios`
- `getUsuarioByNickname`
- `updateUsuario`
- `deleteUsuario`

### `SesionController`

Metodos:

- `getSesionesByUsuario`
- `createSesionApp`
- `getSesionHoy`
- `finalizarSesion`
- `getSesionById`
- `updateSesion`
- `deleteSesion`

### `EjercicioController`

Metodos:

- `createEjercicio`
- `getEjercicios`
- `getEjercicioById`
- `deleteEjercicio`

## Endpoints De La API

Base URL funcional:

- `/api/usuarios`
- `/api/ejercicios`
- `/api/sesiones`

Adicionales:

- `/api-docs`
- `/health`

### Usuarios

#### `POST /api/usuarios/login`

Objetivo:

- autenticar usuario por `nickname` y `pass`

Entrada esperada:

```json
{
  "nickname": "ivan_antona",
  "pass": "password123"
}
```

Respuesta:

- `200` usuario autenticado
- `400` faltan datos
- `401` credenciales invalidas
- `404` usuario no encontrado

Notas:

- rate limit especifico para login: maximo 10 intentos por IP cada 15 minutos

#### `POST /api/usuarios`

Objetivo:

- crear un usuario

Entrada esperada:

```json
{
  "nombre": "Ivan",
  "apellidos": "Antona",
  "pass": "password123",
  "nickname": "ivan_antona",
  "rol": "USUARIO",
  "id_entrenador": "65a9f2b1c83d9a001e5a1b2c"
}
```

Respuesta:

- `201` usuario creado
- `400` error de validacion
- `409` usuario duplicado
- `500` error interno

#### `GET /api/usuarios`

Objetivo:

- listar usuarios

Respuesta:

- `200` array de usuarios

#### `GET /api/usuarios/clientes`

Objetivo:

- listar clientes / usuarios finales

Respuesta:

- `200` array de usuarios

#### `GET /api/usuarios/:nickname`

Objetivo:

- obtener usuario por nickname

Respuesta:

- `200` usuario
- `404` no encontrado

#### `PUT /api/usuarios/:nickname`

Objetivo:

- actualizar usuario por nickname

Respuesta:

- `200` usuario actualizado
- `400` validacion incorrecta
- `404` no encontrado

#### `DELETE /api/usuarios/:nickname`

Objetivo:

- eliminar usuario por nickname

Reglas especiales:

- no se permite eliminar `mastercoach`
- borra tambien sus sesiones

Respuesta:

- `200` eliminado correctamente
- `403` prohibido
- `404` no encontrado

### Ejercicios

#### `POST /api/ejercicios`

Objetivo:

- crear ejercicio

Entrada:

```json
{
  "nombre": "Press Banca"
}
```

Respuesta:

- `201` ejercicio creado
- `400` validacion incorrecta

#### `GET /api/ejercicios`

Objetivo:

- listar ejercicios

Respuesta:

- `200` array de ejercicios

#### `GET /api/ejercicios/:id`

Objetivo:

- obtener ejercicio por id

Respuesta:

- `200` ejercicio
- `404` no encontrado

#### `DELETE /api/ejercicios/:id`

Objetivo:

- eliminar ejercicio por id

Respuesta:

- `200` eliminado
- `404` no encontrado

### Sesiones

#### `POST /api/sesiones/app`

Objetivo:

- crear sesion desde la app cliente

Entrada:

```json
{
  "idUsuario": "65a9f2b1c83d9a001e5a1b2c",
  "titulo": "Entrenamiento de Pecho",
  "ejercicios": [
    {
      "nombre": "Press Banca",
      "series": 4,
      "repeticiones": 10,
      "peso": 80,
      "bloque": 1
    }
  ]
}
```

Respuesta:

- `201` sesion creada
- `400` validacion incorrecta
- `500` error interno

#### `POST /api/sesiones`

Objetivo:

- alias o variante de creacion de sesion
- actualmente apunta al mismo handler `createSesionApp`

#### `GET /api/sesiones/usuario/:idUsuario`

Objetivo:

- listar sesiones de un usuario

Respuesta:

- `200` array de sesiones

#### `GET /api/sesiones/hoy/:idUsuario`

Objetivo:

- obtener la sesion activa o asignada del dia

Respuesta:

- `200` sesion
- `404` no hay entreno para hoy

#### `GET /api/sesiones/:id`

Objetivo:

- obtener sesion por id

Respuesta:

- `200` sesion
- `404` no encontrada

#### `PUT /api/sesiones/:id`

Objetivo:

- actualizar una sesion

Respuesta:

- `200` sesion actualizada
- `400` validacion incorrecta
- `404` no encontrada

#### `DELETE /api/sesiones/:id`

Objetivo:

- eliminar una sesion

Respuesta:

- `200` eliminada
- `404` no encontrada

#### `PATCH /api/sesiones/:id/finalizar`

Objetivo:

- finalizar sesion y guardar ejercicios finales

Entrada:

```json
{
  "ejercicios": [
    {
      "nombre": "Press Banca",
      "series": 4,
      "repeticiones": 8,
      "peso": 85,
      "bloque": 1
    }
  ]
}
```

Respuesta:

- `200` sesion finalizada
- `400` entrada invalida o error de negocio

## Validaciones De Entrada

### UsuarioSchema

Reglas:

- `nickname`: string, minimo 3, maximo 20, trim
- `pass`: string, minimo 2
- `nombre`: obligatorio
- `apellidos`: obligatorio
- `rol`: admite `USUARIO`, `ENTRENADOR`, `ALUMNO`, `CLIENTE` y variantes minusculas
- transformacion de rol:
  - `ALUMNO` -> `USUARIO`
  - `CLIENTE` -> `USUARIO`
  - minusculas -> mayusculas
- `id_entrenador`: opcional

### EjercicioSchema

Reglas:

- `nombre`: string, obligatorio, minimo 2

### SesionAppSchema

Reglas:

- `idUsuario`: obligatorio
- `titulo`: obligatorio
- `ejercicios`: array
- por cada ejercicio:
  - `nombre`: obligatorio
  - `series`: entero positivo
  - `repeticiones`: string o number
  - `peso`: numero no negativo
  - `bloque`: opcional, default 0

## Reglas Tecnicas Relevantes Para Diagramas

- Swagger se monta en `/api-docs`
- existe ruta `/health`
- el rate limit global se aplica a todas las rutas bajo `/api`
- el login tiene su propio rate limit mas estricto
- hay cache compartida en usuarios y algunas operaciones de sesiones y ejercicios
- sesiones usa un array embebido de ejercicios, no una tabla intermedia separada
- los tests de integracion existen en la capa de infraestructura
- la app soporta repositorios mock para pruebas

## Flujo General De Una Peticion HTTP

Flujo base:

1. entra una peticion HTTP a Express
2. pasa por middlewares globales en `app.ts`
3. llega a una ruta en `routes/`
4. la ruta delega en un controlador
5. el controlador valida datos con Zod si aplica
6. el controlador llama a un servicio o caso de uso
7. el caso de uso usa una interfaz de repositorio del dominio
8. el contenedor ha inyectado una implementacion concreta Mongo o Mock
9. el repositorio habla con Mongoose
10. Mongoose persiste o consulta MongoDB
11. la respuesta vuelve por controlador y Express al cliente

## Flujos Relevantes Para Diagramas De Secuencia

### Flujo: crear usuario

`Cliente -> Route /api/usuarios -> UsuarioController.createUsuario -> UsuarioSchema -> CrearUsuarioUseCase -> UsuarioRepository -> UsuarioMongoRepository -> UsuarioModel -> MongoDB`

### Flujo: login

`Cliente -> Route /api/usuarios/login -> rateLimiter -> UsuarioController.login -> LoginUsuarioUseCase -> UsuarioRepository -> UsuarioMongoRepository -> UsuarioModel -> MongoDB`

### Flujo: crear sesion desde app

`Cliente/App -> Route /api/sesiones/app -> SesionController.createSesionApp -> SesionAppSchema -> CrearSesionUseCase.executeDesdeApp -> SesionRepository.crearDesdeApp -> SesionMongoRepository -> SesionModel -> MongoDB`

### Flujo: obtener sesiones de usuario

`Cliente -> Route /api/sesiones/usuario/:idUsuario -> SesionController.getSesionesByUsuario -> SesionRepository.findSesionesByUsuario -> SesionMongoRepository -> SesionModel.populate(ejercicios.id_ejercicio) -> MongoDB`

### Flujo: finalizar sesion

`Cliente -> Route /api/sesiones/:id/finalizar -> SesionController.finalizarSesion -> FinalizarSesionUseCase -> SesionRepository.update -> SesionMongoRepository -> SesionModel -> MongoDB`

### Flujo: eliminar usuario con cascada

`Cliente -> Route /api/usuarios/:nickname -> UsuarioController.deleteUsuario -> EliminarUsuarioUseCase -> UsuarioRepository.delete + SesionRepository.deleteManyByUsuario -> MongoDB`

## Relaciones Entre Clases Del Backend

Relaciones principales:

- `app.ts` depende de routers
- cada router depende de un controlador exportado por `container.ts`
- `container.ts` instancia repositorios, servicios, casos de uso y controladores
- controladores dependen de servicios y/o casos de uso
- servicios dependen de repositorios e internamente de casos de uso
- casos de uso dependen de interfaces de repositorio y cache
- repositorios Mongo dependen de modelos Mongoose
- modelos Mongoose persisten en MongoDB

## Despliegue Basico

Nodos logicos:

- cliente web o app Android
- API Express en Node.js
- MongoDB
- Swagger UI como documentacion embebida en la API

## Casos De Uso De Datos / DFD Posibles

Procesos backend:

- autenticacion de usuario
- alta de usuario
- consulta de usuarios
- alta de ejercicio
- consulta de ejercicios
- alta de sesion
- consulta de sesion del dia
- consulta de historial de sesiones
- actualizacion/finalizacion de sesion
- eliminacion de usuario con borrado en cascada

Almacenes de datos:

- coleccion `Usuario`
- coleccion `Ejercicio`
- coleccion `Sesion`
- cache en memoria

Entidades externas:

- cliente web
- app Android
- entrenador
- usuario final

## Ejemplos Reales Extraidos De Tests

### Crear usuario

```json
{
  "nombre": "test",
  "apellidos": "user",
  "pass": "password123",
  "nickname": "tester_pro",
  "rol": "USUARIO"
}
```

### Crear sesion desde app

```json
{
  "idUsuario": "ObjectId",
  "titulo": "Entrenamiento de Pecho",
  "ejercicios": [
    {
      "nombre": "Press Banca",
      "series": 4,
      "repeticiones": 10,
      "peso": 80,
      "bloque": 1
    }
  ]
}
```

### Crear ejercicio

```json
{
  "nombre": "Press Banca"
}
```

## Instruccion Final Para ChatGPT

Copia desde aqui si quieres que ChatGPT te genere los diagramas directamente:

```text
Quiero que analices la siguiente documentacion tecnica de un backend Node.js + Express + TypeScript con MongoDB y arquitectura por capas/hexagonal.

Tu tarea es generar todos los diagramas que se puedan deducir solo con la informacion del backend, sin inventar elementos del frontend que no esten documentados.

Necesito que me devuelvas en espanol:
1. Un diagrama de arquitectura por capas en Mermaid.
2. Un diagrama de componentes en Mermaid.
3. Un diagrama de clases del backend en Mermaid classDiagram.
4. Un diagrama entidad-relacion / modelo de datos en Mermaid erDiagram.
5. Un diagrama de flujo de datos del backend.
6. Un diagrama de despliegue basico.
7. Diagramas de secuencia de estos casos:
   - login de usuario
   - crear usuario
   - crear sesion desde app
   - obtener sesiones de un usuario
   - finalizar sesion
   - eliminar usuario con borrado en cascada

Reglas:
- Separa claramente Dominio, Aplicacion e Infraestructura.
- Muestra que `container.ts` es el composition root y el punto de inyeccion de dependencias.
- Muestra que en tests se usan repositorios mock.
- Para el ER, considera que `DetalleSesion` es un subdocumento embebido dentro de `Sesion`, no una entidad persistente separada.
- Si detectas ambiguedades, indicalas como notas en lugar de inventarlas.
- Prioriza Mermaid para que pueda copiarlo directamente.
- Despues de cada diagrama, anade una explicacion breve de 3 a 6 lineas.

Documentacion tecnica:

[PEGA AQUI TODO EL CONTENIDO DE ESTE ARCHIVO]
```

## Notas Y Ambiguedades Reales Del Proyecto

Estas notas no impiden generar diagramas, pero conviene reflejarlas como observaciones:

- `Sesion` usa `timestamps`, pero algunos metodos del repositorio consultan por `fecha`; para diagramas, asumir que la sesion tiene informacion temporal asociada al dia.
- `SesionController.updateSesion` actualiza ejercicios sin incluir explicitamente `id_ejercicio` en el mapeo del payload parcial.
- `FinalizarSesionUseCase` muestra una validacion de existencia que en codigo no consulta realmente `findById`; para diagramas conviene representar la intencion funcional: localizar sesion, actualizarla y marcarla como finalizada.
- El archivo OpenAPI documenta solo parte de la API; las rutas reales tambien incluyen login, clientes, historial, update y finalizar sesion.
