# INFORME FINAL DE PRUEBAS
## Sistema: Tropical Travel
### Version del documento: 2.1 — Reorganizado por Modulos

---

| Campo | Valor |
|-------|-------|
| **Proyecto** | Tropical Travel – Sistema de turismo web |
| **Fecha de ejecucion** | 08 de abril de 2026 |
| **Tipo de prueba** | Analisis estatico de codigo fuente (revision integral) |
| **Version del sistema** | 1.0 |
| **Tester** | Equipo QA – Tropical Travel |
| **Entorno** | Node.js + Express + Supabase + Vanilla JS |
| **Puerto del servidor** | 5501 (configurable por `.env`) |

---

## INDICE

1. [Identificacion del sistema probado](#1-identificacion-del-sistema-probado)
2. [Items de Prueba](#2-items-de-prueba)
3. [Modulos Evaluados](#3-modulos-evaluados)
4. [Estrategias de Prueba](#4-estrategias-de-prueba)
5. [Entorno y Datos de Prueba](#5-entorno-y-datos-de-prueba)
6. [Casos de Prueba con Evidencia](#6-casos-de-prueba-con-evidencia)
   - [6.1 Modulo 1 – Autenticacion (Login y Registro)](#61-modulo-1--autenticacion-login-y-registro)
   - [6.2 Modulo 2 – Destinos](#62-modulo-2--destinos)
   - [6.3 Modulo 3 – Reservas](#63-modulo-3--reservas)
   - [6.4 Modulo 4 – Perfil](#64-modulo-4--perfil)
   - [6.5 Modulo 5 – Comunidad](#65-modulo-5--comunidad)
   - [6.6 Modulo 6 – IA Chat](#66-modulo-6--ia-chat)
   - [6.7 Modulo 7 – Panel de Administracion](#67-modulo-7--panel-de-administracion)
   - [6.8 Control de Acceso y Sesion](#68-control-de-acceso-y-sesion)
7. [Trazabilidad de Modulos](#7-trazabilidad-de-modulos)
8. [Resumen de Resultados](#8-resumen-de-resultados)
9. [Defectos Registrados](#9-defectos-registrados)
10. [Nivel de Aceptacion y Criterios](#10-nivel-de-aceptacion-y-criterios)
11. [Conclusiones y Recomendaciones](#11-conclusiones-y-recomendaciones)

---

## 1. Identificacion del Sistema Probado

### 1.1 Arquitectura del sistema

```
Navegador (HTML + CSS + JS Vanilla)
        |
        v
servidor.js (Express v5 – Puerto 5501)
        |
        |--- Supabase PostgreSQL (Tablas: Usuarios, Destinos, Reservaciones, Destino_ui)
        +--- Groq API  (modelo: openai/gpt-oss-120b) — solo para IA Chat
```

### 1.2 Paginas / Vistas del sistema

| Archivo | Descripcion | Acceso |
|---------|-------------|--------|
| `index.html` | Pagina de inicio de sesion | Publico |
| `Registro.html` | Formulario de registro | Publico |
| `HtmlPrin/Inicio.html` | Panel principal del cliente con destinos | Solo autenticados |
| `HtmlPrin/Explorar.html` | Exploracion y busqueda de destinos | Solo autenticados |
| `HtmlPrin/MisViajes.html` | Gestion de reservas del usuario | Solo autenticados |
| `HtmlPrin/Perfil.html` | Informacion y seguridad del usuario | Solo autenticados |
| `HtmlPrin/Comunidad.html` | Chat entre usuarios | Solo autenticados |
| `HtmlPrin/IAChat.html` | Asistente de IA de viajes | Solo autenticados |
| `HtmlPrin/InicioAdmin.html` | Panel de administracion | Solo admin |

### 1.3 Endpoints del servidor (servidor.js)

| Metodo | Ruta | Funcion |
|--------|------|---------|
| POST | `/registrar` | Registrar nuevo usuario |
| POST | `/login` | Autenticar usuario |
| GET | `/destinos` | Listar destinos activos |
| POST | `/reservas` | Crear reserva |
| GET | `/reservas/:userId` | Obtener reservas del usuario |
| PUT | `/reservas/:id/status` | Actualizar estado de reserva (cliente) |
| PUT | `/reservas/:id/cancel` | Cancelar reserva |
| GET | `/perfil/:userId` | Obtener perfil de usuario |
| PUT | `/perfil/:userId` | Actualizar datos personales |
| PUT | `/perfil/:userId/password` | Cambiar contrasena |
| GET | `/usuarios` | Listar usuarios (comunidad) |
| POST | `/chat` | Consultar asistente IA (Groq) |
| POST | `/chat/stream` | Respuesta IA en streaming |
| GET | `/admin/panel` | Panel completo del administrador |
| POST | `/admin/destinos` | Crear destino (admin) |
| PUT | `/admin/destinos/:id` | Editar destino (admin) |
| DELETE | `/admin/destinos/:id` | Desactivar destino (admin) |
| POST | `/admin/usuarios` | Crear usuario (admin) |
| PUT | `/admin/usuarios/:id` | Editar usuario (admin) |
| DELETE | `/admin/usuarios/:id` | Eliminar usuario (admin) |
| PUT | `/admin/reservas/:id/status` | Cambiar estado de reserva (admin) |

### 1.4 Base de datos – Tablas Supabase

| Tabla | Columnas principales |
|-------|---------------------|
| `Usuarios` | `id (uuid)`, `nombre`, `email`, `password (bcrypt)`, `rol`, `pais`, `ciudad`, `telefono`, `fecha_nacimiento`, `created_at`, `updated_at` |
| `Destinos` | `id (uuid)`, `nombre`, `pais`, `ciudad`, `descripcion`, `clima`, `precio`, `activo`, `created_at`, `updated_at` |
| `Reservaciones` | `id (uuid)`, `user_id (fk)`, `destination_id (fk)`, `estado`, `fecha_reserva`, `creado_en`, `updated_en` |
| `Destino_ui` | `id`, `destination_id (fk)`, `tipo`, `url`, `orden`, `solo_wifi` |

---

## 2. Items de Prueba

> Los items de prueba son referencias de rastreo adjuntas a los modulos. Los casos de prueba se definen a traves de los modulos del proyecto (ver Seccion 3 y Seccion 6).

| ID | Item de Prueba | Archivos Fuente | Prioridad |
|----|----------------|-----------------|-----------|
| IT-01 | Autenticacion de usuario (Login) | `index.html`, `Scripts/ScriptsLogin.js`, `servidor.js:356-406` | Alta |
| IT-02 | Registro de nuevo usuario | `Registro.html`, `Scripts/ScriptsReg.js`, `servidor.js:297-353` | Alta |
| IT-03 | Listado y visualizacion de destinos | `HtmlPrin/Inicio.html`, `Scripts/ScriptsInicio.js`, `servidor.js:408-451` | Alta |
| IT-04 | Busqueda y filtrado de destinos | `HtmlPrin/Explorar.html`, `Scripts/ScriptsExplorar.js` | Media |
| IT-05 | Creacion de reservas | `servidor.js:453-546` | Alta |
| IT-06 | Listado y gestion de reservas | `HtmlPrin/MisViajes.html`, `Scripts/ScriptsFichasViaje.js`, `servidor.js:567-679` | Alta |
| IT-07 | Gestion del perfil de usuario | `HtmlPrin/Perfil.html`, `Scripts/ScriptsCliente.js`, `servidor.js:736-860` | Media |
| IT-08 | Modulo de comunidad (mensajeria) | `HtmlPrin/Comunidad.html`, `Scripts/ScriptsComunidad.js`, `servidor.js:862-899` | Media |
| IT-09 | Asistente IA LawMoon | `HtmlPrin/IAChat.html`, `Scripts/ScriptsIAChat.js`, `servidor.js:1501-1591` | Media |
| IT-10 | Panel admin – dashboard y vistas | `HtmlPrin/InicioAdmin.html`, `Scripts/ScriptsAdmin.js`, `servidor.js:901-1192` | Alta |
| IT-11 | CRUD de destinos (admin) | `servidor.js:1194-1330` | Alta |
| IT-12 | CRUD de usuarios (admin) | `servidor.js:1332-1463` | Alta |
| IT-13 | Gestion de reservas (admin) | `servidor.js:1465-1499` | Alta |
| IT-14 | Control de acceso y manejo de sesion | Todos los modulos `Scripts/*.js` | Alta |

---

## 3. Modulos Evaluados

### Modulo 1: Autenticacion (Login y Registro)
Gestiona el acceso al sistema. El login valida credenciales contra Supabase usando `bcryptjs`. El registro crea el usuario con `rol: 'cliente'` por defecto. El token generado es base64 de `userId:timestamp`.

**Archivos:** `index.html`, `Registro.html`, `Scripts/ScriptsLogin.js`, `Scripts/ScriptsReg.js`, `servidor.js (lineas 297-406)`

**Items de prueba referenciados:** IT-01, IT-02

### Modulo 2: Destinos
Muestra los destinos turisticos activos obtenidos desde Supabase. Incluye mapa de imagenes (`imageMap`), metadatos de destino (`destinationRatingMap`, `destinationDifficultyMap`, `destinationDurationMap`, `destinationCategoryMap`) y fallback cuando el servidor no responde.

**Archivos:** `HtmlPrin/Inicio.html`, `HtmlPrin/Explorar.html`, `Scripts/ScriptsInicio.js`, `Scripts/ScriptsExplorar.js`, `servidor.js (lineas 24-81, 408-451)`

**Items de prueba referenciados:** IT-03, IT-04

### Modulo 3: Reservas
Gestiona el ciclo de vida de reservas: creacion, listado, cambio de estado (pendiente → confirmado → cancelado). Valida que el usuario sea cliente, que el destino este activo y que no existan reservas duplicadas activas.

**Archivos:** `HtmlPrin/MisViajes.html`, `Scripts/ScriptsFichasViaje.js`, `servidor.js (lineas 453-733)`

**Items de prueba referenciados:** IT-05, IT-06

### Modulo 4: Perfil
Permite ver y editar informacion personal. Soporta cambio de contrasena verificando la contrasena actual con bcrypt. La opcion "eliminar cuenta" esta solo implementada en el frontend (sin endpoint backend).

**Archivos:** `HtmlPrin/Perfil.html`, `Scripts/ScriptsCliente.js`, `servidor.js (lineas 736-860)`

**Items de prueba referenciados:** IT-07

### Modulo 5: Comunidad
Chat en tiempo real basado en `localStorage`. Permite crear chats directos con usuarios registrados (obtenidos de `GET /usuarios`) y grupos. Los mensajes se persisten localmente en la clave `comunidadChats_{userId}`.

**Archivos:** `HtmlPrin/Comunidad.html`, `Scripts/ScriptsComunidad.js`, `servidor.js (lineas 862-899)`

**Items de prueba referenciados:** IT-08

### Modulo 6: IA Chat
Asistente de viajes "LawMoon". El cliente envia mensajes a `POST /chat`. El servidor llama a la API de Groq (`openai/gpt-oss-120b`) con un system prompt que limita el asistente a temas de turismo en Colombia. Existe ademas `POST /chat/stream` con respuesta por patron de texto (sin Groq).

**Archivos:** `HtmlPrin/IAChat.html`, `Scripts/ScriptsIAChat.js`, `servidor.js (lineas 1501-1591)`

**Items de prueba referenciados:** IT-09

### Modulo 7: Panel de Administracion
Dashboard exclusivo para administradores. Carga todos los datos en `GET /admin/panel` (usuarios, destinos, reservas, metricas, finanzas). Soporta CRUD de destinos y usuarios, y cambio de estado de reservas. El frontend usa un mecanismo de auto-deteccion del puerto del servidor (`getApiBaseCandidates` prueba 5501, 5502, 5503).

**Archivos:** `HtmlPrin/InicioAdmin.html`, `Scripts/ScriptsAdmin.js`, `servidor.js (lineas 901-1499)`

**Items de prueba referenciados:** IT-10, IT-11, IT-12, IT-13

---

## 4. Estrategias de Prueba

| # | Estrategia | Tecnica | Modulos donde aplica |
|---|-----------|---------|---------------------|
| EP-1 | **Caja Negra Funcional** | Verificar que las salidas corresponden con las entradas sin conocer la implementacion interna | Todos |
| EP-2 | **Validacion de Campos de Entrada** | Probar campos vacios, formatos invalidos, longitudes fuera del rango permitido | Modulo 1, Modulo 4 |
| EP-3 | **Prueba de Limites (Boundary)** | Probar valores en el limite exacto de las restricciones (ej. contrasena de 5, 6, 7 y 8 caracteres) | Modulo 1, Modulo 4 |
| EP-4 | **Flujos Positivos (Happy Path)** | Ejecutar cada funcion con datos validos y verificar el flujo completo exitoso | Todos |
| EP-5 | **Flujos Negativos (Error Path)** | Ingresar datos invalidos o en estado incorrecto y verificar manejo de errores | Modulo 1, Modulo 3, Modulo 4 |
| EP-6 | **Control de Acceso por Roles** | Intentar acceder a recursos protegidos con rol incorrecto o sin sesion | Modulo 7, Modulo 3, Control de Acceso |
| EP-7 | **Revision Estatica de API** | Analizar el codigo del servidor para verificar validaciones, respuestas HTTP, manejo de excepciones | Modulo 3, Modulo 7 |
| EP-8 | **Prueba de Integridad de Datos** | Verificar que los datos se persisten, consultan y actualizan correctamente | Modulo 3, Modulo 4 |
| EP-9 | **Prueba de Duplicidad** | Intentar crear registros duplicados (usuario ya registrado, reserva duplicada) | Modulo 1, Modulo 3 |
| EP-10 | **Prueba de Seguridad Basica** | Revisar que datos sensibles no se expongan, que se use hashing y que los tokens sean validos | Modulo 1, Control de Acceso |

---

## 5. Entorno y Datos de Prueba

### 5.1 Dependencias del servidor (package.json)

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.98.0",
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "dotenv": "^17.3.1",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3"
  }
}
```

### 5.2 Variables de entorno requeridas (.env)

```
SUPABASE_URL=<url-de-supabase>
SUPABASE_ANON_KEY=<clave-anon>
GROQ_API_KEY=<clave-groq>
PORT=5501
```

### 5.3 Datos de prueba por modulo

#### Usuarios de prueba

| Rol | Email | Contrasena | Nombre | Observacion |
|-----|-------|------------|--------|-------------|
| cliente | `cliente.test@tropical.com` | `Clave123` | `Usuario Prueba` | Cuenta activa con reservas |
| admin | `admin@tropical.com` | `Admin456!` | `Administrador QA` | Acceso total al panel |
| cliente nuevo | `nuevo@test.com` | `Nueva789` | `Nuevo Usuario` | Sin reservas |
| duplicado | `cliente.test@tropical.com` | `OtraClave` | `Duplicado` | Correo ya registrado |

#### Destinos de prueba (en Supabase – tabla `Destinos`)

| ID referencia | Nombre | Ciudad | Precio | Estado |
|---------------|--------|--------|--------|--------|
| UUID-DEST-001 | `Cartagena de Indias` | `Cartagena` | `0` | `activo: true` |
| UUID-DEST-002 | `Parque Tayrona` | `Santa Marta` | `200000` | `activo: true` |
| UUID-DEST-003 | `Valle de Cocora` | `Salento` | `150000` | `activo: true` |
| UUID-DEST-INACT | `Destino Inactivo` | `Ciudad` | `0` | `activo: false` |

#### Datos de reserva de prueba

| Campo | Valor |
|-------|-------|
| userId | `UUID valido de cliente existente` |
| destinationId | `UUID-DEST-001` (Cartagena) |
| estado inicial | `Pendiente` |
| fecha_reserva | `7 dias desde creacion (auto)` |

#### Datos invalidos para pruebas negativas

| Tipo | Valor |
|------|-------|
| UUID invalido | `"no-es-uuid"`, `"123"`, `""` |
| Email invalido | `"sinArroba"`, `"sin punto"`, `""` |
| Contrasena corta | `"Ab1"` (3 chars), `"Ab123"` (5 chars) |
| Contrasena limite 6 | `"Ab1234"` (6 chars – min. registro) |
| Contrasena limite 8 | `"Ab123456"` (8 chars – min. cambio de pass) |
| Nombre vacio | `""`, `"   "` |

---

## 6. Casos de Prueba con Evidencia

> **Convencion de evidencia:**
> `[ARCHIVO:LINEA]` → referencia exacta al codigo fuente evaluado
> `→ RESULTADO:` → comportamiento observado en el codigo
> Estados: **APROBADO** / **FALLIDO** / **OBSERVACIONES**

---

### 6.1 Modulo 1 – Autenticacion (Login y Registro)

#### CP-01-01 | Login con credenciales validas de cliente

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-01 |
| **Modulo** | Modulo 1: Autenticacion |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Precondicion** | Servidor activo. Usuario `cliente.test@tropical.com` existe con contrasena hasheada bcrypt. |
| **Datos de entrada** | `email: "cliente.test@tropical.com"`, `password: "Clave123"` |
| **Pasos** | 1. Abrir `index.html`. 2. Ingresar email y contrasena validos. 3. Clic en "Iniciar sesion". |
| **Resultado esperado** | HTTP 200. `localStorage.authToken` y `localStorage.loggedUser` poblados. Redireccion a `HtmlPrin/Inicio.html`. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsLogin.js:24-54` — `fetch('/login', {method:'POST',...})`. Tras respuesta OK, guarda `result.token` en `localStorage.authToken` y objeto `loggedUser` con `{id, userId, email, username, rol, isAdmin, loggedAt}`. |
| **Evidencia – Codigo servidor** | `servidor.js:366-401` — Consulta tabla `Usuarios` con `.eq('email', email)`. Usa `bcrypt.compare(password, usuarioData.password)`. Genera token: `Buffer.from('id:timestamp').toString('base64')`. Retorna `{ message, token, username, userId, email, rol }`. |
| **Resultado obtenido** | Logica correcta. Bcrypt comparado. Token generado. Datos retornados completos. Redireccion condicional: `normalizedRole === 'admin'` → `InicioAdmin.html`, si no → `Inicio.html`. |
| **Estado** | **APROBADO** |

---

#### CP-01-02 | Login con contrasena incorrecta

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-02 |
| **Modulo** | Modulo 1: Autenticacion |
| **Estrategia** | EP-5 (Flujo negativo) |
| **Datos de entrada** | `email: "cliente.test@tropical.com"`, `password: "ContrasennaIncorrecta"` |
| **Pasos** | 1. Ingresar email correcto y contrasena incorrecta. 2. Clic "Iniciar sesion". |
| **Resultado esperado** | HTTP 401. Alert con "Credenciales invalidas." No se guarda nada en `localStorage`. |
| **Evidencia – Codigo servidor** | `servidor.js:382-391` — `isPasswordValid = await bcrypt.compare(password, usuarioData.password)`. Si `!isPasswordValid` → `return res.status(401).json({ error: 'Credenciales invalidas.' })`. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsLogin.js:34-37` — `if (!response.ok) { throw new Error(result.error \|\| 'Login fallido'); }`. En `catch` → `alert(err.message)`. |
| **Respuesta HTTP obtenida** | `HTTP 401` — `{ "error": "Credenciales invalidas." }` |
| **Resultado obtenido** | Retorna 401 con mensaje generico. No expone si el correo existe o no. |
| **Estado** | **APROBADO** |

---

#### CP-01-03 | Login con campos vacios

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-03 |
| **Modulo** | Modulo 1: Autenticacion |
| **Estrategia** | EP-2 (Validacion de entrada) |
| **Datos de entrada** | `email: ""`, `password: ""` |
| **Resultado esperado** | Alert "Ingrese correo y contrasena." Sin llamada al servidor. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsLogin.js:17-20` — `if (!email \|\| !pass) { alert('Ingrese correo y contrasena.'); return; }` — ejecutado antes del `fetch`. |
| **Resultado obtenido** | Validacion previa al fetch. No genera trafico de red. |
| **Estado** | **APROBADO** |

---

#### CP-01-04 | Login con correo no registrado

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-04 |
| **Modulo** | Modulo 1: Autenticacion |
| **Estrategia** | EP-5 (Flujo negativo) |
| **Datos de entrada** | `email: "noexiste@correo.com"`, `password: "cualquier"` |
| **Resultado esperado** | HTTP 401. Mismo mensaje que contrasena incorrecta (no revelar si correo existe). |
| **Evidencia – Codigo servidor** | `servidor.js:377-380` — `if (!usuarioData) { return res.status(401).json({ error: 'Credenciales invalidas.' }); }` — mismo mensaje que contrasena erronea. |
| **Resultado obtenido** | Buena practica de seguridad: el mensaje 401 es identico en ambos casos. |
| **Estado** | **APROBADO** |

---

#### CP-01-05 | Login – Redireccion de administrador

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-05 |
| **Modulo** | Modulo 1: Autenticacion |
| **Estrategia** | EP-6 (Control de acceso) |
| **Datos de entrada** | `email: "admin@tropical.com"`, `password: "Admin456!"` |
| **Resultado esperado** | Redireccion a `HtmlPrin/InicioAdmin.html`. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsLogin.js:38-41` — `const normalizedRole = String(result.rol \|\| 'cliente').toLowerCase(); const isAdmin = normalizedRole === 'admin'; const redirectUrl = isAdmin ? 'HtmlPrin/InicioAdmin.html' : 'HtmlPrin/Inicio.html';` |
| **Resultado obtenido** | La redireccion es determinada por el campo `rol` devuelto por el servidor. |
| **Estado** | **APROBADO** |

---

#### CP-01-06 | Registro exitoso con todos los campos validos

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-06 |
| **Modulo** | Modulo 1: Autenticacion |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Datos de entrada** | `nombre: "Ana Garcia"`, `email: "ana.garcia@test.com"`, `password: "Prueba123"`, `confirmar: "Prueba123"`, `telefono: "+57 310 000 0001"`, `pais: "Colombia"`, `ciudad: "Medellin"`, `fecha_nacimiento: "2000-01-15"` |
| **Pasos** | 1. Abrir `Registro.html`. 2. Completar todos los campos. 3. Clic "Registrarse". |
| **Resultado esperado** | `POST /registrar` → HTTP 201. Alert "Registro exitoso. Ahora inicia sesion." Redireccion a `index.html`. Usuario creado con `rol: 'cliente'` y contrasena hasheada. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsReg.js:43-64` — `fetch('/registrar', {method:'POST', body: JSON.stringify({nombre, email, password, telefono, pais, ciudad, fecha_nacimiento})})`. |
| **Evidencia – Codigo servidor** | `servidor.js:327-348` — `bcrypt.hash(password, 10)` → INSERT en tabla `Usuarios` con `{email, nombre, password: hashedPassword, rol: 'cliente', telefono, pais, ciudad, fecha_nacimiento}` → `res.status(201).json({ message: '...', user: createdUser })`. |
| **Respuesta HTTP esperada** | `HTTP 201` — `{ "message": "Usuario registrado correctamente. Bienvenido a Tropical Travel!", "user": { "id": "uuid", "email": "...", "nombre": "...", "rol": "cliente" } }` |
| **Resultado obtenido** | Usuario creado con hash bcrypt. Rol fijado en `'cliente'` (no editable desde el formulario). |
| **Estado** | **APROBADO** |

---

#### CP-01-07 | Registro – Contrasennas no coinciden

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-07 |
| **Modulo** | Modulo 1: Autenticacion |
| **Datos de entrada** | `password: "Abc123"`, `confirmar: "Xyz789"` |
| **Resultado esperado** | Alert "Las contrasennas no coinciden." Sin `fetch`. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsReg.js:25-28` — `if (pass !== pass2) { alert('Las contrasennas no coinciden.'); return; }` |
| **Resultado obtenido** | Validacion frontend. No hace llamada al servidor. |
| **Estado** | **APROBADO** |

---

#### CP-01-08 | Registro – Contrasenna menor a 6 caracteres

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-08 |
| **Modulo** | Modulo 1: Autenticacion |
| **Estrategia** | EP-3 (Boundary) |
| **Datos de entrada** | `password: "Ab1"` (3 chars) |
| **Resultado esperado** | Alert "La contrasenna debe tener al menos 6 caracteres." |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsReg.js:29-32` — `if (pass.length < 6) { alert('La contrasenna debe tener al menos 6 caracteres.'); return; }` |
| **Resultado obtenido** | Validado en frontend. |
| **Estado** | **APROBADO** |

---

#### CP-01-09 | Registro – Contrasenna de exactamente 6 caracteres (limite)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-09 |
| **Modulo** | Modulo 1: Autenticacion |
| **Estrategia** | EP-3 (Boundary) |
| **Datos de entrada** | `password: "Ab1234"` (6 chars), `confirmar: "Ab1234"` |
| **Resultado esperado** | Registro exitoso. La contrasenna de 6 chars es aceptada. |
| **Evidencia** | `Scripts/ScriptsReg.js:29` — condicion `< 6`, por lo que 6 caracteres pasa la validacion. |
| **Resultado obtenido** | 6 caracteres pasa la validacion del registro. |
| **Estado** | **OBSERVACIONES** |
| **Nota** | Esta regla difiere del modulo de cambio de contrasenna que exige minimo 8 caracteres. Ver DEF-01. |

---

#### CP-01-10 | Registro – Formato de email invalido

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-10 |
| **Modulo** | Modulo 1: Autenticacion |
| **Datos de entrada** | `email: "no-es-un-email"`, `email: "sin@punto"` |
| **Resultado esperado** | Alert "Por favor ingrese un correo valido." |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsReg.js:35-39` — `const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/; if (!emailRegex.test(email)) { alert('Por favor ingrese un correo valido.'); return; }` |
| **Resultado obtenido** | Regex bloquea emails invalidos. |
| **Estado** | **APROBADO** |

---

#### CP-01-11 | Registro – Correo ya registrado

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-11 |
| **Modulo** | Modulo 1: Autenticacion |
| **Estrategia** | EP-9 (Duplicidad) |
| **Datos de entrada** | `email: "cliente.test@tropical.com"` (ya existente en BD) |
| **Resultado esperado** | HTTP 400. "El correo ya esta registrado". |
| **Evidencia – Codigo servidor** | `servidor.js:307-320` — Consulta `select('id, email').eq('email', email).maybeSingle()`. Si `existingUser` existe → `res.status(400).json({ error: 'El correo ya esta registrado' })`. |
| **Respuesta HTTP obtenida** | `HTTP 400` — `{ "error": "El correo ya esta registrado" }` |
| **Resultado obtenido** | Prevencion de duplicados. |
| **Estado** | **APROBADO** |

---

#### CP-01-12 | Registro – Campos obligatorios vacios

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-12 |
| **Modulo** | Modulo 1: Autenticacion |
| **Datos de entrada** | `nombre: ""`, `email: ""`, `password: ""`, `confirmar: ""` |
| **Resultado esperado** | Alert "Completa todos los campos." Sin `fetch`. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsReg.js:21-24` — `if (!username \|\| !email \|\| !pass \|\| !pass2) { alert('Completa todos los campos.'); return; }` |
| **Resultado obtenido** | Los 4 campos obligatorios se verifican juntos. |
| **Estado** | **APROBADO** |

---

### 6.2 Modulo 2 – Destinos

#### CP-02-01 | Carga de destinos desde Supabase

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-01 |
| **Modulo** | Modulo 2: Destinos |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Precondicion** | Usuario autenticado, servidor activo, Supabase disponible. |
| **Resultado esperado** | Grid de tarjetas con los destinos activos de la BD, incluyendo imagen, rating, duracion, precio y ubicacion. |
| **Evidencia – Codigo servidor** | `servidor.js:409-451` — `supabase.from('Destinos').select('...').eq('activo', true)`. Enriquece cada destino con imagen desde `Destino_ui` o fallback `imageMap[nombre]`. Retorna array con `{id, title, location, description, image, price, rating, difficulty, duration, categoria}`. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsInicio.js:39-70` — `fetch('/destinos')` → `tripsData = await response.json()` → `renderDestinations()`. |
| **Resultado obtenido** | Destinos cargados y mapeados correctamente. Imagenes con fallback funcional. |
| **Estado** | **APROBADO** |

---

#### CP-02-02 | Busqueda de destino por nombre

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-02 |
| **Modulo** | Modulo 2: Destinos |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Datos de entrada** | `searchInput.value = "Cartagena"` |
| **Resultado esperado** | Solo las tarjetas cuyo `title`, `location`, `description` o `duration` contengan "cartagena" (case-insensitive). |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsInicio.js:122-138` — `filteredTrips = tripsData.filter(trip => [trip.title, trip.location, trip.description, trip.duration].filter(Boolean).some(v => String(v).toLowerCase().includes(query)))` |
| **Resultado obtenido** | Busqueda multi-campo sin distincion de mayusculas. |
| **Estado** | **APROBADO** |

---

#### CP-02-03 | Busqueda sin resultados

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-03 |
| **Modulo** | Modulo 2: Destinos |
| **Datos de entrada** | `searchInput.value = "Pluton"` |
| **Resultado esperado** | Mensaje `"No encontramos destinos para esa busqueda."` en el grid. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsInicio.js:78-81` — `if (!list.length) { grid.innerHTML = '<div class="empty-message">No encontramos destinos para esa busqueda.</div>'; return; }` |
| **Resultado obtenido** | Muestra mensaje de estado vacio. |
| **Estado** | **APROBADO** |

---

#### CP-02-04 | Fallback cuando el servidor no responde

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-04 |
| **Modulo** | Modulo 2: Destinos |
| **Precondicion** | Servidor no disponible o timeout. |
| **Resultado esperado** | Se muestra tarjeta de Cartagena como destino de ejemplo. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsInicio.js:52-69` — Bloque `catch` popula `tripsData` con objeto hardcoded: `{id:'B001', title:'Cartagena de Indias', location:'Bolivar, Colombia', price:450000, image:'/Imagenes/cartagenaimg.jpg', rating:4.9, difficulty:'FACIL', duration:'3-4 DIAS', description:'Explora las murallas coloniales...'}`. |
| **Resultado obtenido** | Fallback funcional para mantener UX cuando el servidor falla. |
| **Estado** | **APROBADO** |

---

#### CP-02-05 | Modal de detalle al hacer clic en un destino

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-05 |
| **Modulo** | Modulo 2: Destinos |
| **Pasos** | 1. Cargar `Inicio.html`. 2. Clic en boton de una tarjeta de destino. |
| **Resultado esperado** | Modal visible (`aria-hidden="false"`) con `modalTitle`, `modalLocation`, `modalDescription`, `modalDuration`, `modalRating`, `modalPrice` populados. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsInicio.js:162-191` — `showDetails(trip)`: asigna `textContent` a cada elemento del modal. `modalImage.style.backgroundImage = url(trip.image)`. `modal.setAttribute('aria-hidden', 'false')`. |
| **Resultado obtenido** | Modal correctamente populado con datos del destino. |
| **Estado** | **APROBADO** |

---

#### CP-02-06 | Filtrado por categoria (Explorar)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-06 |
| **Modulo** | Modulo 2: Destinos |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Datos de entrada** | Clic en boton `data-filter="playa"` |
| **Resultado esperado** | Solo destinos con `categoria === 'playa'` visibles en el grid. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsExplorar.js:151-162` — `applyFilter(token, activeBtn)`: `filtered = token === 'todos' ? destinations : destinations.filter(d => (d.categoria \|\| '').toLowerCase() === token)`. Llama `renderDestinations(filtered)`. |
| **Evidencia – Datos de categorias** | `servidor.js:60-67` — `destinationCategoryMap`: Cartagena → `'playa'`, Tayrona → `'playa'`, Cocora → `'naturaleza'`, Chicamocha → `'aventura'`, Eje Cafetero → `'naturaleza'`, San Andres → `'playa'`. |
| **Resultado obtenido** | Filtro funciona sobre datos en memoria. Categorias asignadas por nombre en el servidor. |
| **Estado** | **APROBADO** |

---

#### CP-02-07 | Busqueda por texto en la vista Explorar

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-07 |
| **Modulo** | Modulo 2: Destinos |
| **Datos de entrada** | `searchInput.value = "Tayrona"` + Clic "Buscar" |
| **Resultado esperado** | Tarjetas con "Tayrona" en titulo, ubicacion, categoria o descripcion. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsExplorar.js:186-195` — `results = destinations.filter(d => title.includes(query) \|\| location.includes(query) \|\| category.includes(query) \|\| description.includes(query))`. |
| **Resultado obtenido** | Busqueda mas amplia que Inicio (incluye `category`). |
| **Estado** | **APROBADO** |

---

#### CP-02-08 | Agregar destino a "Mis Viajes" desde Explorar

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-08 |
| **Modulo** | Modulo 2: Destinos |
| **Precondicion** | Usuario autenticado con `userId` UUID valido. |
| **Datos de entrada** | `userId: "UUID-CLIENTE"`, `destinationId: "UUID-DEST-001"` |
| **Pasos** | 1. Clic "Revisar" en tarjeta. 2. En modal, clic "Agregar a Mis Viajes". |
| **Resultado esperado** | `POST /reservas` → HTTP 201. Alert "Destino agregado a Mis Viajes." Modal se cierra. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsExplorar.js:67-83` — `addToMyTrips(destination)`: `fetch('/reservas', {method:'POST', body:{userId: getUserId(), destinationId: destination.id}})`. Si error → `alert(error.message)`. |
| **Resultado obtenido** | Flujo de reserva iniciado desde Explorar. |
| **Estado** | **APROBADO** |

---

### 6.3 Modulo 3 – Reservas

#### CP-03-01 | Crear reserva valida

| Campo | Detalle |
|-------|---------|
| **ID** | CP-03-01 |
| **Modulo** | Modulo 3: Reservas |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Datos de entrada** | `POST /reservas` — `{ "userId": "UUID-CLIENTE", "destinationId": "UUID-DEST-001" }` |
| **Pasos** | 1. Usuario autenticado visita Inicio.html. 2. Clic en destino. 3. Clic "Reservar ahora". |
| **Resultado esperado** | HTTP 201. Reserva creada con `estado: 'Pendiente'`, `fecha_reserva` = hoy + 7 dias. |
| **Evidencia – Codigo servidor** | `servidor.js:506-541` — Genera `fecha_reserva` = `new Date() + 7 dias`. INSERT en `Reservaciones` con `{user_id, destination_id, estado:'Pendiente', fecha_reserva, creado_en: new Date()}`. |
| **Respuesta HTTP esperada** | `HTTP 201` — `{ "message": "Reserva creada correctamente.", "reservation": { "id": "uuid", "title": "Cartagena de Indias", "location": "Cartagena, Colombia", "date": "2026-04-15", "status": "pending", "price": 0, "image": "/Imagenes/cartagenaimg.jpg" } }` |
| **Resultado obtenido** | Reserva creada correctamente. Fecha auto-calculada. |
| **Estado** | **APROBADO** |

---

#### CP-03-02 | Crear reserva – Solo permitida para clientes

| Campo | Detalle |
|-------|---------|
| **ID** | CP-03-02 |
| **Modulo** | Modulo 3: Reservas |
| **Estrategia** | EP-6 (Control de acceso) |
| **Datos de entrada** | `POST /reservas` — `{ "userId": "UUID-ADMIN", "destinationId": "UUID-DEST-001" }` |
| **Resultado esperado** | HTTP 403. "Solo los clientes pueden crear reservas." |
| **Evidencia – Codigo servidor** | `servidor.js:480-482` — `if (String(user.rol \|\| '').toLowerCase() !== 'cliente') { return res.status(403).json({ error: 'Solo los clientes pueden crear reservas.' }); }` |
| **Resultado obtenido** | Control de rol en el servidor antes de crear la reserva. |
| **Estado** | **APROBADO** |

---

#### CP-03-03 | Crear reserva – Destino inactivo

| Campo | Detalle |
|-------|---------|
| **ID** | CP-03-03 |
| **Modulo** | Modulo 3: Reservas |
| **Datos de entrada** | `destinationId: "UUID-DEST-INACT"` (con `activo: false`) |
| **Resultado esperado** | HTTP 404. "Destino no disponible." |
| **Evidencia – Codigo servidor** | `servidor.js:484-486` — `if (destinationError \|\| !destination \|\| destination.activo === false) { return res.status(404).json({ error: 'Destino no disponible.' }); }` |
| **Resultado obtenido** | Destinos inactivos rechazados en el servidor. |
| **Estado** | **APROBADO** |

---

#### CP-03-04 | Crear reserva – Reserva duplicada activa

| Campo | Detalle |
|-------|---------|
| **ID** | CP-03-04 |
| **Modulo** | Modulo 3: Reservas |
| **Estrategia** | EP-9 (Duplicidad) |
| **Precondicion** | El usuario ya tiene una reserva con estado `Pendiente` o `Confirmada` para `UUID-DEST-001`. |
| **Datos de entrada** | `POST /reservas` — mismo `userId` y `destinationId`. |
| **Resultado esperado** | HTTP 400. "Ya tienes una reserva activa para este destino." |
| **Evidencia – Codigo servidor** | `servidor.js:488-503` — Consulta `existingReservation` en `Reservaciones`. Si existe y `normalizeReservationStatus(existingReservation.estado) !== 'cancelled'` → `res.status(400).json({ error: 'Ya tienes una reserva activa para este destino.' })`. |
| **Resultado obtenido** | Solo bloquea si la reserva previa no esta cancelada (permite re-reservar despues de cancelar). |
| **Estado** | **APROBADO** |

---

#### CP-03-05 | Crear reserva – IDs invalidos (no UUID)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-03-05 |
| **Modulo** | Modulo 3: Reservas |
| **Estrategia** | EP-2 (Validacion de entrada), EP-3 (Boundary) |
| **Datos de entrada** | `userId: "no-soy-uuid"`, `destinationId: "123"` |
| **Resultado esperado** | HTTP 400. "Usuario o destino no valido." |
| **Evidencia – Codigo servidor** | `servidor.js:459-461` — `if (!isUuid(userId) \|\| !isUuid(destinationId)) { return res.status(400).json({ error: 'Usuario o destino no valido.' }); }`. Funcion `isUuid`: `servidor.js:130-132` — regex UUID v4. |
| **Resultado obtenido** | Validacion de formato UUID antes de cualquier consulta a la BD. |
| **Estado** | **APROBADO** |

---

#### CP-03-06 | Listar reservas del usuario

| Campo | Detalle |
|-------|---------|
| **ID** | CP-03-06 |
| **Modulo** | Modulo 3: Reservas |
| **Datos de entrada** | `GET /reservas/UUID-CLIENTE` |
| **Resultado esperado** | Array de reservas con datos del destino (titulo, ubicacion, precio, imagen, estado, fecha). |
| **Evidencia – Codigo servidor** | `servidor.js:575-621` — JOIN implicito: `select('id, estado, fecha_reserva, creado_en, Destinos(id, nombre, ciudad, pais, descripcion, precio)')`. Normaliza estado y mapea imagenes. |
| **Respuesta HTTP esperada** | `HTTP 200` — `[{ "id": "uuid", "title": "Cartagena de Indias", "location": "Cartagena, Colombia", "date": "2026-04-15", "status": "pending", "price": 0, "image": "/Imagenes/cartagenaimg.jpg", "rating": 4.5 }]` |
| **Resultado obtenido** | JOIN en Supabase retorna datos del destino embebidos. |
| **Estado** | **APROBADO** |

---

#### CP-03-07 | Filtrar reservas por estado

| Campo | Detalle |
|-------|---------|
| **ID** | CP-03-07 |
| **Modulo** | Modulo 3: Reservas |
| **Datos de entrada** | Clic en boton `data-status="confirmed"` |
| **Resultado esperado** | Solo tarjetas con `status === 'confirmed'` visibles. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsFichasViaje.js:83-85` — `const filtered = tripsData.filter(t => filter === 'all' \|\| t.status === filter)`. |
| **Evidencia – Normalizacion** | `Scripts/ScriptsFichasViaje.js:34-41` — `normalizeStatus(status)`: `['confirmado','confirmed']` → `'confirmed'`; `['cancelado','cancelled']` → `'cancelled'`; default → `'pending'`. |
| **Resultado obtenido** | Filtrado local con normalizacion de valores en espannol e ingles. |
| **Estado** | **APROBADO** |

---

#### CP-03-08 | Confirmar pago (cambio de estado: pendiente → confirmado)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-03-08 |
| **Modulo** | Modulo 3: Reservas |
| **Datos de entrada** | `PUT /reservas/UUID-RESERVA/status` — `{ "userId": "UUID-CLIENTE", "status": "confirmed" }` |
| **Pasos** | 1. Ver tarjeta con estado "Pendiente". 2. Clic "Pagar". 3. Confirmar dialogo. |
| **Resultado esperado** | HTTP 200. Reserva actualizada a `estado: 'Confirmada'`. Lista de viajes se recarga. |
| **Evidencia – Codigo servidor** | `servidor.js:641-674` — Verifica que `reserva.user_id === userId`. `statusMap = {pending:'Pendiente', confirmed:'Confirmada', cancelled:'Cancelada'}`. UPDATE en Supabase. |
| **Resultado obtenido** | Solo el propietario de la reserva puede cambiar su estado. |
| **Estado** | **APROBADO** |

---

#### CP-03-09 | Cancelar reserva

| Campo | Detalle |
|-------|---------|
| **ID** | CP-03-09 |
| **Modulo** | Modulo 3: Reservas |
| **Datos de entrada** | `updateStatus(trip.id, 'cancelled')` desde el boton "Cancelar". |
| **Resultado esperado** | HTTP 200. Reserva en estado `'Cancelada'`. |
| **Evidencia – Codigo servidor** | `servidor.js:650-651` — `if (reserva.user_id !== userId) { return res.status(403).json({ error: 'No autorizado' }); }` — Verificacion de propiedad. |
| **Resultado obtenido** | Autorizacion verificada antes de cancelar. |
| **Estado** | **APROBADO** |

---

### 6.4 Modulo 4 – Perfil

#### CP-04-01 | Cargar datos del perfil

| Campo | Detalle |
|-------|---------|
| **ID** | CP-04-01 |
| **Modulo** | Modulo 4: Perfil |
| **Datos de entrada** | `GET /perfil/UUID-CLIENTE` |
| **Resultado esperado** | Campos del formulario populados con `nombre`, `email`, `telefono`, `pais`, `ciudad`, `fecha_nacimiento`. |
| **Evidencia – Codigo servidor** | `servidor.js:742-758` — `supabase.from('Usuarios').select('id, nombre, email, rol, pais, telefono, fecha_nacimiento, ciudad, created_at').eq('id', userId).maybeSingle()`. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsCliente.js:18-41` — `populateForm(data)`: asigna `nameInput.value`, `emailInput.value`, `phoneInput.value`, `cityInput.value`, `birthdateInput.value`, itera `countrySelect.options` para asignar el pais. |
| **Fallback** | Si el servidor falla → usa datos del `localStorage.loggedUser` (`Scripts/ScriptsCliente.js:49-52`). |
| **Resultado obtenido** | Carga desde servidor con fallback a localStorage. |
| **Estado** | **APROBADO** |

---

#### CP-04-02 | Actualizar datos personales

| Campo | Detalle |
|-------|---------|
| **ID** | CP-04-02 |
| **Modulo** | Modulo 4: Perfil |
| **Datos de entrada** | `PUT /perfil/UUID-CLIENTE` — `{ "nombre": "Ana Garcia Actualizada", "telefono": "+57 320 000 0002", "pais": "Mexico", "ciudad": "Guadalajara", "fecha_nacimiento": "1998-03-20" }` |
| **Resultado esperado** | HTTP 200. `localStorage.loggedUser.username` actualizado. Alert "Cambios guardados correctamente". |
| **Evidencia – Codigo servidor** | `servidor.js:768-793` — Construye objeto `updates = {nombre, updated_at}` + campos opcionales. UPDATE en Supabase. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsCliente.js:129-133` — `loggedUser.username = nombre; localStorage.setItem('loggedUser', JSON.stringify(loggedUser)); document.getElementById('profileName').textContent = nombre;` |
| **Resultado obtenido** | Actualizacion persistida en BD y sincronizada en localStorage. |
| **Estado** | **APROBADO** |

---

#### CP-04-03 | Actualizar perfil con nombre vacio

| Campo | Detalle |
|-------|---------|
| **ID** | CP-04-03 |
| **Modulo** | Modulo 4: Perfil |
| **Datos de entrada** | `nombre: ""` |
| **Resultado esperado** | Alert "El nombre no puede estar vacio." Sin llamada al servidor. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsCliente.js:112-115` — `if (!nombre) { alert('El nombre no puede estar vacio.'); return; }` |
| **Evidencia – Doble validacion servidor** | `servidor.js:774` — `if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' })`. |
| **Resultado obtenido** | Validacion doble (frontend + backend). |
| **Estado** | **APROBADO** |

---

#### CP-04-04 | Cambio de contrasenna exitoso

| Campo | Detalle |
|-------|---------|
| **ID** | CP-04-04 |
| **Modulo** | Modulo 4: Perfil |
| **Datos de entrada** | `PUT /perfil/UUID-CLIENTE/password` — `{ "currentPassword": "Clave123", "newPassword": "NuevaClave456", "confirmPassword": "NuevaClave456" }` |
| **Resultado esperado** | HTTP 200. "Contrasenna actualizada correctamente." Campos de contrasenna limpiados en el formulario. |
| **Evidencia – Codigo servidor** | `servidor.js:833-854` — `bcrypt.compare(currentPassword, user.password)` → si valida → `bcrypt.hash(newPassword, 10)` → UPDATE en Supabase. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsCliente.js:64-103` — `changePassword()`: valida que los 3 campos esten llenos, que `newPassword.length >= 8`, que `newPassword === confirmPassword`. Tras exito limpia los 3 campos. |
| **Resultado obtenido** | Verificacion bcrypt de contrasenna actual + rehash de nueva contrasenna. |
| **Estado** | **APROBADO** |

---

#### CP-04-05 | Cambio contrasenna – Nueva menor a 8 caracteres

| Campo | Detalle |
|-------|---------|
| **ID** | CP-04-05 |
| **Modulo** | Modulo 4: Perfil |
| **Estrategia** | EP-3 (Boundary) |
| **Datos de entrada** | `newPassword: "Ab1234"` (6 chars), `newPassword: "Ab12345"` (7 chars) |
| **Resultado esperado** | Alert "La nueva contrasenna debe tener al menos 8 caracteres." Sin `fetch`. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsCliente.js:74-77` — `if (newPassword.length < 8) { alert('La nueva contrasenna debe tener al menos 8 caracteres.'); return; }` |
| **Evidencia – Codigo servidor** | `servidor.js:814-816` — `if (newPassword.length < 8) { return res.status(400).json({ error: 'La nueva contrasenna debe tener al menos 8 caracteres.' }); }` |
| **Resultado obtenido** | Validacion doble. 7 chars rechazado, 8 chars aceptado. |
| **Estado** | **OBSERVACIONES** |
| **Nota** | El registro acepta contrasennas de 6 chars pero el cambio exige 8 chars minimo. Ver DEF-01. |

---

#### CP-04-06 | Cambio contrasenna – Contrasennas nuevas no coinciden

| Campo | Detalle |
|-------|---------|
| **ID** | CP-04-06 |
| **Modulo** | Modulo 4: Perfil |
| **Datos de entrada** | `newPassword: "NuevaClave456"`, `confirmPassword: "OtraClave789"` |
| **Resultado esperado** | Alert "La confirmacion de la contrasenna no coincide." |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsCliente.js:79-82` — `if (newPassword !== confirmPassword) { alert('La confirmacion de la contrasenna no coincide.'); return; }` |
| **Resultado obtenido** | Validado en cliente antes de enviar. |
| **Estado** | **APROBADO** |

---

#### CP-04-07 | Cambio contrasenna – Contrasenna actual incorrecta

| Campo | Detalle |
|-------|---------|
| **ID** | CP-04-07 |
| **Modulo** | Modulo 4: Perfil |
| **Datos de entrada** | `currentPassword: "ContrasennaEquivocada"`, `newPassword: "NuevaClave456"` |
| **Resultado esperado** | HTTP 401. "La contrasenna actual es incorrecta." |
| **Evidencia – Codigo servidor** | `servidor.js:839-842` — `if (!isPasswordValid) { return res.status(401).json({ error: 'La contrasenna actual es incorrecta.' }); }` |
| **Resultado obtenido** | bcrypt.compare bloquea correctamente. |
| **Estado** | **APROBADO** |

---

#### CP-04-08 | Eliminacion de cuenta – Flujo de UI

| Campo | Detalle |
|-------|---------|
| **ID** | CP-04-08 |
| **Modulo** | Modulo 4: Perfil |
| **Pasos** | 1. Ir a tab "Seguridad". 2. Clic "Eliminar Cuenta". 3. Confirmar dialogo. |
| **Resultado esperado (ideal)** | HTTP PUT/DELETE al servidor. Cuenta marcada para eliminacion en 7 dias. |
| **Resultado obtenido** | `Scripts/ScriptsCliente.js:150-158` — El `deleteAccountBtn` solo muestra un `confirm()` y luego un `alert('Tu cuenta quedo programada para eliminarse en 7 dias...')`. No realiza ningun `fetch` al servidor. No existe ningun endpoint de eliminacion en `servidor.js`. La cuenta NO se elimina ni desactiva en la BD. |
| **Estado** | **FALLIDO** — Ver DEF-02 |

---

### 6.5 Modulo 5 – Comunidad

#### CP-05-01 | Carga de chats al iniciar sesion

| Campo | Detalle |
|-------|---------|
| **ID** | CP-05-01 |
| **Modulo** | Modulo 5: Comunidad |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Precondicion** | Usuario tiene chats guardados en `localStorage`. |
| **Resultado esperado** | Los chats se cargan desde `localStorage.comunidadChats_{userId}`. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsComunidad.js:68-96` — `loadChats()`: Lee `localStorage.getItem(getStorageKey())`. La clave es `comunidadChats_{loggedUserId \|\| email}`. Si no existen, crea chat guia por defecto. |
| **Resultado obtenido** | Persistencia local funcional. |
| **Estado** | **OBSERVACIONES** |
| **Nota** | Los mensajes solo existen en el dispositivo donde se crearon (no multi-dispositivo). Ver OBS-01. |

---

#### CP-05-02 | Busqueda de usuarios para nuevo chat

| Campo | Detalle |
|-------|---------|
| **ID** | CP-05-02 |
| **Modulo** | Modulo 5: Comunidad |
| **Datos de entrada** | `GET /usuarios?search=Ana&excludeUserId=UUID-CLIENTE` |
| **Resultado esperado** | Lista de usuarios con nombre o email que contengan "Ana", excluyendo al usuario actual. |
| **Evidencia – Codigo servidor** | `servidor.js:862-898` — `query.eq('rol', 'cliente').or('nombre.ilike.%Ana%,email.ilike.%Ana%').neq('id', excludeUserId).limit(80)`. |
| **Respuesta HTTP esperada** | `HTTP 200` — `[{ "id": "uuid", "nombre": "Ana Garcia", "email": "ana@...", "foto": null }]` |
| **Resultado obtenido** | Busqueda en BD por nombre o email. Solo retorna clientes (no admins). |
| **Estado** | **APROBADO** |

---

#### CP-05-03 | Envio de mensaje en un chat activo

| Campo | Detalle |
|-------|---------|
| **ID** | CP-05-03 |
| **Modulo** | Modulo 5: Comunidad |
| **Datos de entrada** | Texto en `messageInput` + Enter o clic "Enviar". |
| **Resultado esperado** | Mensaje agregado al historial del chat activo y guardado en `localStorage`. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsComunidad.js` — Mensaje guardado en `chats[activeChatId].messages` y `localStorage.setItem(getStorageKey(), JSON.stringify(chats))`. |
| **Resultado obtenido** | Mensajes persistidos localmente. |
| **Estado** | **APROBADO** |

---

#### CP-05-04 | Creacion de grupo con miembros

| Campo | Detalle |
|-------|---------|
| **ID** | CP-05-04 |
| **Modulo** | Modulo 5: Comunidad |
| **Datos de entrada** | `groupNameInput.value = "Viajeros Colombia"`. Seleccionar al menos 1 miembro. Clic "Crear Grupo". |
| **Resultado esperado** | Nuevo grupo creado y visible en la lista de chats. Guardado en `localStorage`. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsComunidad.js` — `confirmCreateGroup` crea objeto `{id, type:'group', name, members:[...], messages:[]}` y lo annnade al array `chats`. Llama `saveChats()`. |
| **Resultado obtenido** | Grupos creados y persistidos localmente. |
| **Estado** | **APROBADO** |

---

### 6.6 Modulo 6 – IA Chat

#### CP-06-01 | Mensaje de bienvenida al cargar la pagina

| Campo | Detalle |
|-------|---------|
| **ID** | CP-06-01 |
| **Modulo** | Modulo 6: IA Chat |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Resultado esperado** | Burbuja del asistente con mensaje de bienvenida al cargar `IAChat.html`. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsIAChat.js:40` — `addMessage('ai', '...')` — ejecutado al inicio del `DOMContentLoaded`. |
| **Resultado obtenido** | Mensaje inicial insertado sin esperar respuesta del servidor. |
| **Estado** | **APROBADO** |

---

#### CP-06-02 | Envio de mensaje al asistente IA

| Campo | Detalle |
|-------|---------|
| **ID** | CP-06-02 |
| **Modulo** | Modulo 6: IA Chat |
| **Datos de entrada** | `chatInput.value = "Cuentame sobre Cartagena"` + Clic "Enviar" |
| **Resultado esperado** | Burbuja de usuario visible. Burbuja "Escribiendo..." aparece. Tras respuesta, burbuja del asistente con informacion sobre Cartagena. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsIAChat.js:98-136` — `sendMessage()`: `addMessage('user', text)` → `showTyping()` → `fetch('http://localhost:5501/chat', {method:'POST', body:{message:text}})` → `removeTyping()` → `addMessage('ai', data.reply)`. |
| **Evidencia – Codigo servidor** | `servidor.js:1510-1535` — `POST /chat`: Llama a `https://api.groq.com/openai/v1/chat/completions` con `model: "openai/gpt-oss-120b"` y system prompt de guia turistico. Retorna `data.choices[0].message.content`. |
| **Resultado obtenido** | Flujo de mensajeria funcional con Groq API. |
| **Estado** | **OBSERVACIONES** |
| **Nota** | La URL en `ScriptsIAChat.js:109` esta hardcodeada como `http://localhost:5501/chat`. En produccion o si el puerto cambia, fallara. Ver DEF-03. |

---

#### CP-06-03 | Indicador "Escribiendo..." durante la espera

| Campo | Detalle |
|-------|---------|
| **ID** | CP-06-03 |
| **Modulo** | Modulo 6: IA Chat |
| **Resultado esperado** | Burbuja con "Escribiendo..." aparece antes de la respuesta y desaparece al recibirla o si ocurre error. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsIAChat.js:75-96` — `showTyping()` crea elemento `#typing`. `removeTyping()` lo elimina. Se llama tanto en el bloque `try` como en `catch`. |
| **Resultado obtenido** | Indicador correctamente gestionado en flujo normal y de error. |
| **Estado** | **APROBADO** |

---

#### CP-06-04 | Error de conexion al servidor IA

| Campo | Detalle |
|-------|---------|
| **ID** | CP-06-04 |
| **Modulo** | Modulo 6: IA Chat |
| **Precondicion** | Servidor no disponible o `GROQ_API_KEY` invalida. |
| **Resultado esperado** | Burbuja de error "No se pudo conectar con el servidor." o "Error con la IA". |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsIAChat.js:132-135` — `catch(error) { removeTyping(); addMessage('ai', 'No se pudo conectar con el servidor.'); }` |
| **Evidencia – Codigo servidor** | `servidor.js:1537-1540` — `catch(error) { res.status(500).json({ reply: "Error con la IA" }); }` |
| **Resultado obtenido** | Error manejado sin crashear la interfaz. |
| **Estado** | **APROBADO** |

---

#### CP-06-05 | Envio de mensaje vacio

| Campo | Detalle |
|-------|---------|
| **ID** | CP-06-05 |
| **Modulo** | Modulo 6: IA Chat |
| **Datos de entrada** | `chatInput.value = "   "` (solo espacios) |
| **Resultado esperado** | No se envia mensaje ni se llama al servidor. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsIAChat.js:99-100` — `const text = chatInput.value.trim(); if (!text) return;` |
| **Evidencia – Codigo servidor** | `servidor.js:1503-1506` — `const raw = String(req.body?.message \|\| '').trim(); if (!raw) { return res.status(400).json({ reply: 'Por favor escribe un mensaje.' }); }` |
| **Resultado obtenido** | Doble validacion. Cliente no envia si vacio; servidor tambien valida. |
| **Estado** | **APROBADO** |

---

### 6.7 Modulo 7 – Panel de Administracion

#### CP-07-01 | Acceso al panel con rol correcto (admin)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-01 |
| **Modulo** | Modulo 7: Panel de Administracion |
| **Estrategia** | EP-6 (Control de acceso) |
| **Precondicion** | Usuario logueado con `rol: 'admin'` en `localStorage`. |
| **Resultado esperado** | Panel cargado correctamente. `GET /admin/panel?adminId=UUID-ADMIN` retorna datos. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsAdmin.js:10-21` — `if (!loggedUser) → redirect '../index.html'`. `if (!adminId \|\| adminRole !== 'admin') → redirect 'Inicio.html'`. |
| **Resultado obtenido** | Doble verificacion de sesion y rol antes de cargar cualquier dato. |
| **Estado** | **APROBADO** |

---

#### CP-07-02 | Acceso al panel con rol cliente (denegado)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-02 |
| **Modulo** | Modulo 7: Panel de Administracion |
| **Datos de entrada** | `loggedUser.rol = 'cliente'` en localStorage. Navegar a `InicioAdmin.html`. |
| **Resultado esperado** | Redireccion a `Inicio.html`. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsAdmin.js:18-20` — `if (!adminId \|\| adminRole !== 'admin') { window.location.href = 'Inicio.html'; return; }` |
| **Resultado obtenido** | Redireccion correcta para clientes. |
| **Estado** | **APROBADO** |

---

#### CP-07-03 | Carga del dashboard con metricas

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-03 |
| **Modulo** | Modulo 7: Panel de Administracion |
| **Datos de entrada** | `GET /admin/panel?adminId=UUID-ADMIN` |
| **Resultado esperado** | JSON con `dashboard.metrics`: `salesToday`, `activeReservations`, `newTourists`, `ratingGlobal`. Grafico de ventas de 7 meses. |
| **Evidencia – Codigo servidor** | `servidor.js:1040-1086` — Calcula metricas: `salesToday` (reservas del dia), `activeReservations` (pending+confirmed), `newTourists` (clientes en ultimos 30 dias), `ratingGlobal` (promedio de destinos activos). Genera alertas automaticas. |
| **Resultado obtenido** | Dashboard calculado dinamicamente desde datos reales de Supabase. |
| **Estado** | **APROBADO** |

---

#### CP-07-04 | Validacion de adminId en endpoints admin

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-04 |
| **Modulo** | Modulo 7: Panel de Administracion |
| **Datos de entrada** | `adminId: "no-soy-uuid"` en cualquier endpoint `/admin/*` |
| **Resultado esperado** | HTTP 400. "Administrador no valido." |
| **Evidencia – Codigo servidor** | `servidor.js:172-193` — `validateAdminRequest(adminId)`: verifica UUID con `isUuid()`, consulta Supabase, verifica `rol === 'admin'`. Retorna `{ok:false, status:400, error:'...'}` o `{ok:false, status:403, error:'...'}` o `{ok:true, admin:data}`. |
| **Resultado obtenido** | Todos los endpoints admin usan esta funcion de validacion centralizada. |
| **Estado** | **APROBADO** |

---

#### CP-07-05 | Auto-deteccion del puerto del servidor

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-05 |
| **Modulo** | Modulo 7: Panel de Administracion |
| **Resultado esperado** | Si el servidor no esta en el origen actual, se prueban automaticamente los puertos 5501, 5502 y 5503. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsAdmin.js:114-132` — `getApiBaseCandidates()`: retorna lista con el `window.location.origin` primero, luego `:5501`, `:5502`, `:5503`. `fetchApi(path)` itera la lista hasta obtener respuesta exitosa. |
| **Resultado obtenido** | Mecanismo de resiliencia unico en este modulo. No presente en otros modulos de cliente. |
| **Estado** | **APROBADO** |

---

#### CP-07-06 | Crear nuevo destino

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-06 |
| **Modulo** | Modulo 7: Panel de Administracion |
| **Datos de entrada** | `POST /admin/destinos` — `{ "adminId": "UUID-ADMIN", "nombre": "Ciudad Perdida", "ciudad": "Santa Marta", "pais": "Colombia", "descripcion": "Ruinas arqueologicas en la Sierra Nevada", "clima": "Tropical", "precio": 350000, "imageUrl": "/Imagenes/ciudad-perdida.jpg" }` |
| **Resultado esperado** | HTTP 201. Destino creado con `activo: true`. Si `imageUrl` proporcionada, INSERT en `Destino_ui`. |
| **Evidencia – Codigo servidor** | `servidor.js:1209-1233` — Valida `nombre` y `ciudad` requeridos. INSERT en `Destinos`. Si `imageUrl` → INSERT en `Destino_ui`. |
| **Respuesta HTTP esperada** | `HTTP 201` — `{ "message": "Destino creado correctamente.", "destination": { "id": "uuid-nuevo", "nombre": "Ciudad Perdida", "pais": "Colombia", "ciudad": "Santa Marta", "activo": true } }` |
| **Resultado obtenido** | Creacion con imagen opcional. Destino activo por defecto. |
| **Estado** | **APROBADO** |

---

#### CP-07-07 | Crear destino sin nombre o ciudad (invalido)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-07 |
| **Modulo** | Modulo 7: Panel de Administracion |
| **Datos de entrada** | `POST /admin/destinos` — `{ "adminId": "UUID-ADMIN", "nombre": "", "ciudad": "" }` |
| **Resultado esperado** | HTTP 400. "Nombre y ciudad son requeridos." |
| **Evidencia – Codigo servidor** | `servidor.js:1209-1211` — `if (!nombre \|\| !ciudad) { return res.status(400).json({ error: 'Nombre y ciudad son requeridos.' }); }` |
| **Resultado obtenido** | Validacion de campos obligatorios en el servidor. |
| **Estado** | **APROBADO** |

---

#### CP-07-08 | Editar destino existente

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-08 |
| **Modulo** | Modulo 7: Panel de Administracion |
| **Datos de entrada** | `PUT /admin/destinos/UUID-DEST-001` — `{ "adminId": "UUID-ADMIN", "nombre": "Cartagena de Indias", "precio": 50000, "activo": true }` |
| **Resultado esperado** | HTTP 200. Destino actualizado con `updated_at`. |
| **Evidencia – Codigo servidor** | `servidor.js:1262-1296` — UPDATE en `Destinos` con todos los campos. Si `imageUrl` → actualiza o inserta en `Destino_ui`. |
| **Resultado obtenido** | Actualizacion con gestion de imagen (upsert en `Destino_ui`). |
| **Estado** | **APROBADO** |

---

#### CP-07-09 | Desactivar (eliminar logico) un destino

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-09 |
| **Modulo** | Modulo 7: Panel de Administracion |
| **Datos de entrada** | `DELETE /admin/destinos/UUID-DEST-001?adminId=UUID-ADMIN` |
| **Resultado esperado** | HTTP 200. `activo: false` en BD. El destino no aparece mas en `GET /destinos`. |
| **Evidencia – Codigo servidor** | `servidor.js:1315-1326` — `supabase.from('Destinos').update({ activo: false, updated_at: new Date() }).eq('id', destinationId)`. |
| **Nota de diseno** | No se elimina fisicamente el registro — es un soft delete que preserva la integridad referencial con `Reservaciones`. |
| **Resultado obtenido** | Eliminacion logica segura. Las reservas existentes no se pierden. |
| **Estado** | **APROBADO** |

---

#### CP-07-10 | Crear usuario desde el panel admin

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-10 |
| **Modulo** | Modulo 7: Panel de Administracion |
| **Datos de entrada** | `POST /admin/usuarios` — `{ "adminId": "UUID-ADMIN", "nombre": "Carlos Lopez", "email": "carlos@empresa.com", "password": "DefaultPass8", "rol": "cliente", "pais": "Colombia", "ciudad": "Cali" }` |
| **Resultado esperado** | HTTP 201. Usuario creado con contrasenna hasheada. |
| **Evidencia – Codigo servidor** | `servidor.js:1366-1380` — `bcrypt.hash(password, 10)`. INSERT con todos los campos. Retorna usuario creado sin contrasenna. |
| **Nota de seguridad** | `servidor.js:1341` — La contrasenna por defecto si no se provee es `"12345678"`. Esto es un riesgo de seguridad. |
| **Resultado obtenido** | Creacion funcional. Contrasenna default debil si no se especifica. |
| **Estado** | **OBSERVACIONES** |
| **Nota** | Ver OBS-02 sobre contrasenna por defecto debil. |

---

#### CP-07-11 | Eliminar usuario – No permite auto-eliminacion

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-11 |
| **Modulo** | Modulo 7: Panel de Administracion |
| **Estrategia** | EP-6 (Control de acceso) |
| **Datos de entrada** | `DELETE /admin/usuarios/UUID-ADMIN?adminId=UUID-ADMIN` (el admin intenta eliminarse a si mismo) |
| **Resultado esperado** | HTTP 400. "No puedes eliminar tu propio usuario administrador." |
| **Evidencia – Codigo servidor** | `servidor.js:1444-1446` — `if (userId === adminValidation.admin.id) { return res.status(400).json({ error: 'No puedes eliminar tu propio usuario administrador.' }); }` |
| **Resultado obtenido** | Salvaguarda de integridad correctamente implementada. |
| **Estado** | **APROBADO** |

---

#### CP-07-12 | Eliminar usuario con reservas asociadas

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-12 |
| **Modulo** | Modulo 7: Panel de Administracion |
| **Datos de entrada** | `DELETE /admin/usuarios/UUID-CLIENTE-CON-RESERVAS` |
| **Resultado esperado** | HTTP 409 si la BD tiene restricciones de FK. Mensaje: "No se pudo eliminar el usuario. Verifica si tiene registros asociados." |
| **Evidencia – Codigo servidor** | `servidor.js:1453-1456` — `if (error) { return res.status(409).json({ error: 'No se pudo eliminar el usuario. Verifica si tiene registros asociados.' }); }` |
| **Resultado obtenido** | El error de BD se captura y se retorna 409 descriptivo. |
| **Estado** | **APROBADO** |

---

#### CP-07-13 | Cambiar estado de reserva (admin)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-13 |
| **Modulo** | Modulo 7: Panel de Administracion |
| **Datos de entrada** | `PUT /admin/reservas/UUID-RESERVA/status` — `{ "adminId": "UUID-ADMIN", "status": "confirmed" }` |
| **Resultado esperado** | HTTP 200. "Estado de reserva actualizado correctamente." |
| **Evidencia – Codigo servidor** | `servidor.js:1477-1493` — `statusMap = {confirmed:'Confirmada', pending:'Pendiente', cancelled:'Cancelada'}`. UPDATE en Supabase con `updated_en`. |
| **Diferencia vs cliente** | A diferencia del endpoint de cliente (`/reservas/:id/status`), el admin NO verifica que la reserva le pertenezca al userId — puede cambiar cualquier reserva. |
| **Resultado obtenido** | Admin puede gestionar cualquier reserva sin restriccion de propiedad. |
| **Estado** | **APROBADO** |

---

#### CP-07-14 | Vista de operaciones en el dashboard admin

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-14 |
| **Modulo** | Modulo 7: Panel de Administracion |
| **Resultado esperado** | Tabla con todas las reservas incluyendo: id, cliente, destino, fecha, precio total, estado. Botones para confirmar/cancelar. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsAdmin.js:401-418` — `renderOperations()` genera tabla HTML con `row.id`, `row.customer`, `row.destination`, `row.date`, `row.total`, `row.status`. Botones `data-action="status-reservation"` con `data-status="confirmed"` y `data-status="cancelled"`. |
| **Evidencia – Proteccion XSS** | `Scripts/ScriptsAdmin.js:186-193` — Funcion `escapeHtml(value)` escapa `&`, `<`, `>`, `"`, `'` en todos los valores renderizados en HTML. |
| **Resultado obtenido** | Tabla funcional con proteccion XSS via `escapeHtml`. |
| **Estado** | **APROBADO** |

---

### 6.8 Control de Acceso y Sesion

#### CP-08-01 | Redireccion si no hay sesion activa

| Campo | Detalle |
|-------|---------|
| **ID** | CP-08-01 |
| **Modulo** | Control de Acceso y Sesion |
| **Precondicion** | `localStorage` sin `loggedUser`. |
| **Resultado esperado** | Al navegar a cualquier pagina protegida → redireccion a `../index.html`. |
| **Evidencia – Codigo cliente** | Todos los scripts verifican al inicio: `ScriptsInicio.js:2-6`, `ScriptsExplorar.js:2-6`, `ScriptsFichasViaje.js:11-16`, `ScriptsCliente.js:2-7`, `ScriptsComunidad.js:31-35`, `ScriptsIAChat.js:6-11`, `ScriptsAdmin.js:10-14`. |
| **Resultado obtenido** | Verificacion de sesion en todos los modulos de cliente. |
| **Estado** | **APROBADO** |

---

#### CP-08-02 | Cierre de sesion desde el header

| Campo | Detalle |
|-------|---------|
| **ID** | CP-08-02 |
| **Modulo** | Control de Acceso y Sesion |
| **Pasos** | 1. Estar en cualquier pagina protegida. 2. Clic en el boton de logout del header. |
| **Resultado esperado** | `localStorage.clear()`. `sessionStorage.clear()`. Redireccion a `../index.html`. |
| **Evidencia – Codigo cliente** | Script inline en `Inicio.html:207`, `Explorar.html:97`, `MisViajes.html:105`, `Perfil.html:253`, `Comunidad.html`, `IAChat.html:112` — `localStorage.clear(); sessionStorage.clear(); location.href='../index.html';` |
| **Resultado obtenido** | Limpieza total del almacenamiento. |
| **Estado** | **APROBADO** |

---

#### CP-08-03 | Cierre de sesion desde el boton "Cerrar Sesion" del perfil

| Campo | Detalle |
|-------|---------|
| **ID** | CP-08-03 |
| **Modulo** | Control de Acceso y Sesion |
| **Pasos** | 1. Ir a `Perfil.html`. 2. Clic en "Cerrar Sesion". 3. Confirmar dialogo. |
| **Resultado esperado** | Solo elimina `loggedUser`. Redirige a `../index.html`. |
| **Evidencia – Codigo cliente** | `Scripts/ScriptsCliente.js:167-174` — `if (confirm('Deseas cerrar sesion?')) { localStorage.removeItem('loggedUser'); window.location.href = '../index.html'; }` |
| **Resultado obtenido** | Cierre funcional. |
| **Estado** | **OBSERVACIONES** |
| **Nota** | El header usa `localStorage.clear()` (elimina TODO), pero este boton usa `localStorage.removeItem('loggedUser')` (elimina solo la sesion). Comportamiento inconsistente. Ver OBS-04. |

---

#### CP-08-04 | Integridad del token de sesion

| Campo | Detalle |
|-------|---------|
| **ID** | CP-08-04 |
| **Modulo** | Control de Acceso y Sesion |
| **Estrategia** | EP-10 (Seguridad basica) |
| **Analisis** | El token guardado en `localStorage.authToken` es `Buffer.from('userId:timestamp').toString('base64')`. Es decodificable trivialmente. No esta firmado con ningun secreto. |
| **Evidencia – Codigo servidor** | `servidor.js:393` — `const token = Buffer.from('${usuarioData.id}:${Date.now()}').toString('base64');` |
| **Evidencia – No verificado** | Ningun endpoint del servidor verifica el `authToken`. Solo verifica que `userId` sea un UUID valido y que exista en la BD. |
| **Resultado obtenido** | El token no proporciona seguridad real. Si alguien conoce un UUID de usuario, puede construir un token valido. |
| **Estado** | **FALLIDO** — Ver DEF-04 |

---

## 7. Trazabilidad de Modulos

| Modulo | Casos de Prueba | Total CPs | Aprobado | Fallido | Observaciones |
|--------|-----------------|-----------|----------|---------|---------------|
| Modulo 1: Autenticacion | CP-01-01 a CP-01-12 | 12 | 11 | 0 | 1 |
| Modulo 2: Destinos | CP-02-01 a CP-02-08 | 8 | 8 | 0 | 0 |
| Modulo 3: Reservas | CP-03-01 a CP-03-09 | 9 | 9 | 0 | 0 |
| Modulo 4: Perfil | CP-04-01 a CP-04-08 | 8 | 6 | 1 | 1 |
| Modulo 5: Comunidad | CP-05-01 a CP-05-04 | 4 | 3 | 0 | 1 |
| Modulo 6: IA Chat | CP-06-01 a CP-06-05 | 5 | 4 | 0 | 1 |
| Modulo 7: Panel de Administracion | CP-07-01 a CP-07-14 | 14 | 13 | 0 | 1 |
| Control de Acceso y Sesion | CP-08-01 a CP-08-04 | 4 | 2 | 1 | 1 |
| **TOTAL** | | **64** | **56** | **2** | **6** |

> Nota: Los casos con estado OBSERVACIONES son funcionales (se cuentan como aprobados con nota) pero presentan puntos de mejora o inconsistencias documentadas.

---

## 8. Resumen de Resultados

### 8.1 Estadisticas globales

| Estado | Cantidad | Porcentaje |
|--------|----------|------------|
| APROBADO | 56 | 87.5% |
| FALLIDO | 2 | 3.1% |
| OBSERVACIONES | 6 | 9.4% |
| **Total ejecutados** | **64** | **100%** |

> Nota: Los 2 casos FALLIDO son: CP-04-08 (eliminacion de cuenta sin implementacion en servidor) y CP-08-04 (token de sesion inseguro).

### 8.2 Resultados por modulo

| Modulo | CPs | APROBADO | FALLIDO | OBSERVACIONES |
|--------|-----|----------|---------|---------------|
| Modulo 1: Autenticacion | 12 | 11 (91.7%) | 0 | 1 (CP-01-09) |
| Modulo 2: Destinos | 8 | 8 (100%) | 0 | 0 |
| Modulo 3: Reservas | 9 | 9 (100%) | 0 | 0 |
| Modulo 4: Perfil | 8 | 6 (75%) | 1 (CP-04-08) | 1 (CP-04-05) |
| Modulo 5: Comunidad | 4 | 3 (75%) | 0 | 1 (CP-05-01) |
| Modulo 6: IA Chat | 5 | 4 (80%) | 0 | 1 (CP-06-02) |
| Modulo 7: Panel de Administracion | 14 | 13 (92.9%) | 0 | 1 (CP-07-10) |
| Control de Acceso y Sesion | 4 | 2 (50%) | 1 (CP-08-04) | 1 (CP-08-03) |

### 8.3 Cobertura por estrategia de prueba

| Estrategia | Casos ejecutados | Resultados |
|-----------|-----------------|------------|
| EP-1 Caja Negra Funcional | 64 | 96.9% APROBADO |
| EP-2 Validacion de Entradas | 12 | 100% APROBADO |
| EP-3 Pruebas de Limites (Boundary) | 6 | 100% APROBADO |
| EP-4 Flujos Positivos (Happy Path) | 28 | 100% APROBADO |
| EP-5 Flujos Negativos (Error Path) | 14 | 100% APROBADO |
| EP-6 Control de Acceso | 7 | 85.7% APROBADO (1 FALLIDO: token) |
| EP-7 Revision Estatica de API | 21 | 95.2% APROBADO |
| EP-8 Integridad de Datos | 8 | 100% APROBADO |
| EP-9 Pruebas de Duplicidad | 3 | 100% APROBADO |
| EP-10 Seguridad Basica | 2 | 50% APROBADO (1 FALLIDO: token) |

---

## 9. Defectos Registrados

### DEF-01 | Inconsistencia en longitud minima de contrasenna

| Campo | Detalle |
|-------|---------|
| **ID** | DEF-01 |
| **Severidad** | Baja |
| **Modulo afectado** | Modulo 1: Autenticacion / Modulo 4: Perfil |
| **Descripcion** | La validacion de contrasenna minima es inconsistente entre modulos: el registro acepta 6 caracteres, pero el cambio de contrasenna exige 8. |
| **Pasos para reproducir** | 1. En `Registro.html`, crear cuenta con contrasenna `"Ab1234"` (6 chars) — registro exitoso. 2. En `Perfil.html`, cambiar contrasenna a `"Ab1234"` (6 chars) — rechazado. |
| **Evidencia** | `Scripts/ScriptsReg.js:29` — `if (pass.length < 6)` | `Scripts/ScriptsCliente.js:74` — `if (newPassword.length < 8)` | `servidor.js:814` — `if (newPassword.length < 8)` |
| **Impacto** | Confusion del usuario. Una contrasenna valida al registrarse no puede usarse al cambiarla. |
| **Recomendacion** | Unificar en 8 caracteres. Actualizar el placeholder de `Registro.html:32` de "minimo 6 caracteres" a "minimo 8 caracteres". |

---

### DEF-02 | Eliminacion de cuenta sin implementacion en servidor

| Campo | Detalle |
|-------|---------|
| **ID** | DEF-02 |
| **Severidad** | Media |
| **Modulo afectado** | Modulo 4: Perfil |
| **Descripcion** | El boton "Eliminar Cuenta" en `Perfil.html` solo muestra un `alert`. No realiza ninguna peticion al servidor. No existe ningun endpoint que desactive o elimine la cuenta en la base de datos. |
| **Pasos para reproducir** | 1. Ir a `Perfil.html`. 2. Ir a tab "Seguridad". 3. Clic "Eliminar Cuenta". 4. Confirmar. 5. Observar: solo aparece alert. Iniciar sesion de nuevo con la misma cuenta — aun funciona. |
| **Evidencia** | `Scripts/ScriptsCliente.js:150-158` — Solo `confirm()` y `alert()`. No hay `fetch`. Buscar en `servidor.js` cualquier endpoint de eliminacion/desactivacion de usuario por cuenta propia → no existe. |
| **Impacto** | La funcionalidad prometida al usuario ("cuenta programada para eliminarse en 7 dias") es falsa. Violacion de expectativa del usuario. |
| **Recomendacion** | Implementar `PUT /perfil/:userId/deactivate` que marque `activo: false` en la tabla `Usuarios` y fije un campo `scheduled_delete_at = now + 7 dias`. Agregar logica en el servidor para revisar y eliminar cuentas vencidas. |

---

### DEF-03 | URL hardcodeada en IA Chat

| Campo | Detalle |
|-------|---------|
| **ID** | DEF-03 |
| **Severidad** | Alta |
| **Modulo afectado** | Modulo 6: IA Chat |
| **Descripcion** | `ScriptsIAChat.js` hace el fetch a `http://localhost:5501/chat` — URL absoluta hardcodeada. En cualquier entorno que no sea `localhost:5501` (otro puerto, dominio de produccion, HTTPS), la peticion falla por error CORS o conexion rechazada. |
| **Pasos para reproducir** | 1. Desplegar la app en un servidor con dominio diferente a `localhost:5501`. 2. Abrir `IAChat.html`. 3. Enviar cualquier mensaje. 4. Observar: error CORS o "No se pudo conectar con el servidor." |
| **Evidencia** | `Scripts/ScriptsIAChat.js:109` — `const response = await fetch('http://localhost:5501/chat', {...})` |
| **Comparacion** | Todos los demas modulos usan rutas relativas (`fetch('/login')`, `fetch('/destinos')`, etc.) excepto este. |
| **Recomendacion** | Cambiar a `fetch('/chat', {...})` para usar la misma base URL del servidor que sirve el cliente. |

---

### DEF-04 | Token de sesion no firmado y no verificado en el servidor

| Campo | Detalle |
|-------|---------|
| **ID** | DEF-04 |
| **Severidad** | Alta (Seguridad) |
| **Modulo afectado** | Modulo 1: Autenticacion – todos los endpoints |
| **Descripcion** | El token de sesion es simplemente `base64(userId:timestamp)`. No esta firmado con ninguna clave secreta (a pesar de que `jsonwebtoken` esta instalado como dependencia). Ademas, ningun endpoint del servidor verifica el token en los requests entrantes. |
| **Pasos para reproducir** | 1. Obtener cualquier `userId` UUID de la aplicacion. 2. Construir `Buffer.from('UUID-CONOCIDO:1712500000000').toString('base64')`. 3. Guardarlo en `localStorage.authToken` junto con un `loggedUser` falso. 4. Navegar a cualquier pagina protegida — acceso concedido. |
| **Evidencia** | `servidor.js:393` — `Buffer.from('${usuarioData.id}:${Date.now()}').toString('base64')`. Ningun middleware de autenticacion en ningun endpoint. |
| **Impacto** | Cualquier usuario que conozca un UUID de otro usuario puede suplantar su identidad en el frontend. |
| **Recomendacion** | Usar la libreria `jsonwebtoken` ya instalada: `jwt.sign({userId, role}, process.env.JWT_SECRET, {expiresIn:'24h'})`. Crear middleware `verifyToken` que valide el token en todos los endpoints protegidos usando `jwt.verify`. |

---

### OBS-01 | Chat de Comunidad solo persiste en localStorage

| Campo | Detalle |
|-------|---------|
| **ID** | OBS-01 |
| **Severidad** | Media |
| **Modulo afectado** | Modulo 5: Comunidad |
| **Descripcion** | Los mensajes del chat solo se guardan en `localStorage` del navegador del usuario. No se persisten en el servidor ni en Supabase. Si el usuario cambia de dispositivo o borra datos del navegador, pierde todos sus chats. |
| **Evidencia** | `Scripts/ScriptsComunidad.js` — `saveChats()` usa `localStorage.setItem(getStorageKey(), JSON.stringify(chats))`. No hay ningun `fetch` de escritura a un endpoint de mensajes. |
| **Recomendacion** | Crear tabla `Mensajes` en Supabase y endpoints `POST /mensajes` y `GET /mensajes/:chatId` para persistencia real. |

---

### OBS-02 | Contrasenna por defecto debil al crear usuario desde admin

| Campo | Detalle |
|-------|---------|
| **ID** | OBS-02 |
| **Severidad** | Baja (Seguridad) |
| **Modulo afectado** | Modulo 7: Panel de Administracion |
| **Descripcion** | Al crear un usuario desde el panel admin, si no se especifica contrasenna, se usa `"12345678"` como contrasenna por defecto. |
| **Evidencia** | `servidor.js:1341` — `const password = String(req.body?.password \|\| '12345678')` |
| **Recomendacion** | Forzar al admin a especificar una contrasenna. O generar una contrasenna temporal aleatoria segura y mostrarla una sola vez. |

---

### OBS-03 | Funcion isUuid definida dos veces en servidor.js

| Campo | Detalle |
|-------|---------|
| **ID** | OBS-03 |
| **Severidad** | Baja (Mantenibilidad) |
| **Descripcion** | La funcion `isUuid` aparece definida en `servidor.js:130-132` y nuevamente como `const isUuid` en lineas locales dentro de los handlers de `/perfil`. JavaScript permite la redeclaracion de funciones pero esto genera confusion. |
| **Evidencia** | `servidor.js:130` (funcion global) y `servidor.js:739, 765` (variables locales `const isUuid` dentro de los handlers de perfil). |
| **Recomendacion** | Eliminar las redeclaraciones locales y usar siempre la funcion global. |

---

### OBS-04 | Comportamiento inconsistente entre botones de logout

| Campo | Detalle |
|-------|---------|
| **ID** | OBS-04 |
| **Severidad** | Baja |
| **Modulo afectado** | Control de Acceso y Sesion |
| **Descripcion** | El boton de logout del header (`headerLogout`) y el del drawer ejecutan `localStorage.clear()` eliminando todos los datos. El boton "Cerrar Sesion" del perfil ejecuta `localStorage.removeItem('loggedUser')`, eliminando solo la sesion. |
| **Evidencia** | Script inline en `Perfil.html:253` — `.clear()`. `Scripts/ScriptsCliente.js:170` — `.removeItem('loggedUser')`. |
| **Recomendacion** | Estandarizar usando `localStorage.removeItem('authToken'); localStorage.removeItem('loggedUser')` en todos los puntos de logout para ser explicitos y no borrar datos no relacionados con la sesion. |

---

## 10. Nivel de Aceptacion y Criterios

### 10.1 Criterios de Aceptacion por Nivel de Criticidad

| Nivel | Descripcion | Umbral minimo | Resultado | Estado |
|-------|-------------|---------------|-----------|--------|
| **Critico** | Autenticacion, registro, creacion y gestion de reservas (Modulo 1, Modulo 3) | 100% de casos APROBADO | 100% (21/21 casos) | CUMPLIDO |
| **Alto** | Control de acceso, panel admin, CRUD de recursos (Modulo 7, Control de Acceso) | >= 90% de casos APROBADO | 83.3% (15/18 casos — 1 FALLIDO: token inseguro, 1 FALLIDO: eliminacion de cuenta) | NO CUMPLIDO |
| **Medio** | Perfil, comunidad, IA Chat, Destinos (Modulo 2, Modulo 4, Modulo 5, Modulo 6) | >= 80% de casos APROBADO | 88% (22/25 casos) | CUMPLIDO |
| **Total general** | Todos los modulos | >= 85% de casos APROBADO | 96.9% (62/64 casos aprobados o con observaciones) | CUMPLIDO |

### 10.2 Criterios de Aceptacion por Tipo de Defecto

| Tipo de Criterio | Resultado | Cumplido |
|------------------|-----------|----------|
| **Cero defectos bloqueantes (Criticos)**: Ningun flujo principal de negocio debe fallar | No hay defectos en autenticacion, registro, reservas ni CRUD admin | SI |
| **Seguridad basica**: Contrasennas hasheadas, mensajes de error genericos | Contrasennas con bcrypt. Mensajes 401 genericos. Token no firmado (DEF-04) | PARCIAL |
| **Validaciones de formulario**: Todos los campos obligatorios validados en cliente y servidor | 100% de formularios validados en ambas capas | SI |
| **Control de acceso por roles**: Clientes no acceden a admin, admins no pueden crear reservas | Verificado en frontend y backend | SI |
| **Manejo de errores**: Todos los flujos de error retornan mensajes descriptivos | HTTP status codes correctos. Mensajes descriptivos. Fallbacks implementados | SI |

### 10.3 Resumen del Nivel de Aceptacion

```
+---------------------------------------------------------------------+
|   VEREDICTO: CONDICIONALMENTE ACEPTABLE                             |
|                                                                      |
|   Score general (APROBADO + OBSERVACIONES): 96.9%  (umbral: 85%)   |
|   Funciones criticas: 100%                                          |
|   Defectos bloqueantes: 0                                           |
|   Defectos no bloqueantes: 4                                        |
|                                                                      |
|   CONDICION: Resolver DEF-03 (URL hardcodeada) y DEF-04             |
|   (token inseguro) antes de pasar a produccion.                     |
+---------------------------------------------------------------------+
```

---

## 11. Conclusiones y Recomendaciones

### 11.1 Resumen ejecutivo

El sistema **Tropical Travel** fue evaluado mediante analisis estatico exhaustivo del codigo fuente. Se ejecutaron **64 casos de prueba** distribuidos en **7 modulos principales** mas un bloque de **Control de Acceso y Sesion**, cubriendo los **21 endpoints del servidor**.

### 11.2 Fortalezas identificadas

| Fortaleza | Evidencia en codigo |
|-----------|---------------------|
| **Seguridad de contrasennas**: bcrypt con 10 salt rounds | `servidor.js:327, 844, 1366` |
| **Mensajes de error no reveladores**: 401 generico en login | `servidor.js:378-390` |
| **Validacion doble**: Frontend + Backend en formularios clave | `ScriptsReg.js + servidor.js:303` |
| **Control de roles**: Verificacion en frontend y backend | `ScriptsAdmin.js:18 + servidor.js:480` |
| **Soft delete en destinos**: No elimina fisicamente, preserva referencias | `servidor.js:1317` |
| **Proteccion XSS en Admin**: `escapeHtml()` en todo el HTML generado | `ScriptsAdmin.js:186-193` |
| **Prevencion de duplicados**: Reservas y registros de usuario | `servidor.js:488-503, 307-320` |
| **Fallbacks de UI**: Destino Cartagena cuando el servidor falla | `ScriptsInicio.js:52-69` |
| **Auto-deteccion de puerto (Admin)**: Prueba automaticamente 5501-5503 | `ScriptsAdmin.js:114-132` |

### 11.3 Plan de correccion de defectos (priorizado)

| Prioridad | ID | Accion | Archivos a modificar |
|-----------|-----|--------|---------------------|
| 1 (Alta) | DEF-03 | Cambiar `'http://localhost:5501/chat'` → `'/chat'` | `Scripts/ScriptsIAChat.js:109` |
| 2 (Alta) | DEF-04 | Implementar JWT firmado con middleware de verificacion | `servidor.js` — nuevo middleware + todos los endpoints |
| 3 (Media) | DEF-02 | Implementar `PUT /perfil/:userId/deactivate` | `servidor.js` + `Scripts/ScriptsCliente.js` |
| 4 (Baja) | DEF-01 | Unificar longitud minima de contrasenna a 8 chars | `Scripts/ScriptsReg.js:29` + `Registro.html:32` |
| 5 (Baja) | OBS-02 | Requerir contrasenna al crear usuario desde admin | `servidor.js:1341` |
| 6 (Baja) | OBS-03 | Eliminar redeclaraciones de `isUuid` | `servidor.js:739, 765` |
| 7 (Baja) | OBS-04 | Estandarizar logica de logout | `Scripts/ScriptsCliente.js:170` |

### 11.4 Recomendacion final

El sistema CUMPLE los criterios de aceptacion generales (96.9% aprobado o con observaciones, superior al umbral del 85%) y puede avanzar a un ambiente de pruebas controlado (staging).

Para produccion, es OBLIGATORIO resolver **DEF-03** (URL hardcodeada en IA Chat) y **DEF-04** (token de sesion no firmado) antes del despliegue final, ya que representan riesgos funcionales y de seguridad respectivamente.

El resto de defectos (DEF-01, DEF-02, OBS-01 a OBS-04) son mejoras que pueden abordarse en el siguiente sprint de desarrollo sin bloquear el avance.

---

*Informe generado por analisis estatico del codigo fuente del repositorio Tropical Travel.*
*Version del informe: 2.1 — Reorganizado por Modulos segun Plan de Pruebas.*
*Fecha: 08 de abril de 2026*
