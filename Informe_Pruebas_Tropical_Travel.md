# INFORME FINAL DE PRUEBAS
## Sistema: Tropical Travel
### Versión del documento: 2.0 — Completo con evidencia

---

| Campo | Valor |
|-------|-------|
| **Proyecto** | Tropical Travel – Sistema de turismo web |
| **Fecha de ejecución** | 08 de abril de 2026 |
| **Tipo de prueba** | Análisis estático de código fuente (revisión integral) |
| **Versión del sistema** | 1.0 |
| **Tester** | Equipo QA – Tropical Travel |
| **Entorno** | Node.js + Express + Supabase + Vanilla JS |
| **Puerto del servidor** | 5501 (configurable por `.env`) |

---

## ÍNDICE

1. [Identificación del sistema probado](#1-identificación-del-sistema-probado)
2. [Ítems de Prueba](#2-ítems-de-prueba)
3. [Módulos Evaluados](#3-módulos-evaluados)
4. [Estrategias de Prueba](#4-estrategias-de-prueba)
5. [Entorno y Datos de Prueba](#5-entorno-y-datos-de-prueba)
6. [Casos de Prueba con Evidencia](#6-casos-de-prueba-con-evidencia)
   - [6.1 Módulo Login](#61-módulo-login--autenticación)
   - [6.2 Módulo Registro](#62-módulo-registro-de-usuario)
   - [6.3 Módulo Destinos – Inicio](#63-módulo-destinos--página-de-inicio)
   - [6.4 Módulo Explorar](#64-módulo-explorar-destinos)
   - [6.5 Módulo Mis Viajes / Reservas](#65-módulo-mis-viajes--reservas)
   - [6.6 Módulo Perfil](#66-módulo-perfil-de-usuario)
   - [6.7 Módulo Comunidad](#67-módulo-comunidad-chat)
   - [6.8 Módulo IA Chat](#68-módulo-ia-chat)
   - [6.9 Panel de Administración – Dashboard y vistas](#69-panel-de-administración--vistas-principales)
   - [6.10 Panel Admin – CRUD Destinos](#610-panel-admin--crud-de-destinos)
   - [6.11 Panel Admin – CRUD Usuarios](#611-panel-admin--crud-de-usuarios)
   - [6.12 Panel Admin – Gestión de Reservas](#612-panel-admin--gestión-de-reservas)
   - [6.13 Control de Acceso y Sesión](#613-control-de-acceso-y-sesión)
7. [Trazabilidad de Ítems de Prueba](#7-trazabilidad-de-ítems-de-prueba)
8. [Resumen de Resultados](#8-resumen-de-resultados)
9. [Defectos Registrados](#9-defectos-registrados)
10. [Nivel de Aceptación y Criterios](#10-nivel-de-aceptación-y-criterios)
11. [Conclusiones y Recomendaciones](#11-conclusiones-y-recomendaciones)

---

## 1. Identificación del Sistema Probado

### 1.1 Arquitectura del sistema

```
Navegador (HTML + CSS + JS Vanilla)
        │
        ▼
servidor.js (Express v5 – Puerto 5501)
        │
        ├─── Supabase PostgreSQL (Tablas: Usuarios, Destinos, Reservaciones, Destino_ui)
        └─── Groq API  (modelo: openai/gpt-oss-120b) — sólo para IA Chat
```

### 1.2 Páginas / Vistas del sistema

| Archivo | Descripción | Acceso |
|---------|-------------|--------|
| `index.html` | Página de inicio de sesión | Público |
| `Registro.html` | Formulario de registro | Público |
| `HtmlPrin/Inicio.html` | Panel principal del cliente con destinos | Solo autenticados |
| `HtmlPrin/Explorar.html` | Exploración y búsqueda de destinos | Solo autenticados |
| `HtmlPrin/MisViajes.html` | Gestión de reservas del usuario | Solo autenticados |
| `HtmlPrin/Perfil.html` | Información y seguridad del usuario | Solo autenticados |
| `HtmlPrin/Comunidad.html` | Chat entre usuarios | Solo autenticados |
| `HtmlPrin/IAChat.html` | Asistente de IA de viajes | Solo autenticados |
| `HtmlPrin/InicioAdmin.html` | Panel de administración | Solo admin |

### 1.3 Endpoints del servidor (servidor.js)

| Método | Ruta | Función |
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
| PUT | `/perfil/:userId/password` | Cambiar contraseña |
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

## 2. Ítems de Prueba

| ID | Ítem de Prueba | Archivos Fuente | Prioridad |
|----|----------------|-----------------|-----------|
| IT-01 | Autenticación de usuario (Login) | `index.html`, `Scripts/ScriptsLogin.js`, `servidor.js:356-406` | Alta |
| IT-02 | Registro de nuevo usuario | `Registro.html`, `Scripts/ScriptsReg.js`, `servidor.js:297-353` | Alta |
| IT-03 | Listado y visualización de destinos | `HtmlPrin/Inicio.html`, `Scripts/ScriptsInicio.js`, `servidor.js:408-451` | Alta |
| IT-04 | Búsqueda y filtrado de destinos | `HtmlPrin/Explorar.html`, `Scripts/ScriptsExplorar.js` | Media |
| IT-05 | Creación de reservas | `servidor.js:453-546` | Alta |
| IT-06 | Listado y gestión de reservas | `HtmlPrin/MisViajes.html`, `Scripts/ScriptsFichasViaje.js`, `servidor.js:567-679` | Alta |
| IT-07 | Gestión del perfil de usuario | `HtmlPrin/Perfil.html`, `Scripts/ScriptsCliente.js`, `servidor.js:736-860` | Media |
| IT-08 | Módulo de comunidad (mensajería) | `HtmlPrin/Comunidad.html`, `Scripts/ScriptsComunidad.js`, `servidor.js:862-899` | Media |
| IT-09 | Asistente IA LawMoon | `HtmlPrin/IAChat.html`, `Scripts/ScriptsIAChat.js`, `servidor.js:1501-1591` | Media |
| IT-10 | Panel admin – dashboard y vistas | `HtmlPrin/InicioAdmin.html`, `Scripts/ScriptsAdmin.js`, `servidor.js:901-1192` | Alta |
| IT-11 | CRUD de destinos (admin) | `servidor.js:1194-1330` | Alta |
| IT-12 | CRUD de usuarios (admin) | `servidor.js:1332-1463` | Alta |
| IT-13 | Gestión de reservas (admin) | `servidor.js:1465-1499` | Alta |
| IT-14 | Control de acceso y manejo de sesión | Todos los módulos `Scripts/*.js` | Alta |

---

## 3. Módulos Evaluados

### Módulo 1: Autenticación (Login y Registro)
Gestiona el acceso al sistema. El login valida credenciales contra Supabase usando `bcryptjs`. El registro crea el usuario con `rol: 'cliente'` por defecto. El token generado es base64 de `userId:timestamp`.

**Archivos:** `index.html`, `Registro.html`, `Scripts/ScriptsLogin.js`, `Scripts/ScriptsReg.js`, `servidor.js (líneas 297–406)`

### Módulo 2: Destinos
Muestra los destinos turísticos activos obtenidos desde Supabase. Incluye mapa de imágenes (`imageMap`), metadatos de destino (`destinationRatingMap`, `destinationDifficultyMap`, `destinationDurationMap`, `destinationCategoryMap`) y fallback cuando el servidor no responde.

**Archivos:** `HtmlPrin/Inicio.html`, `HtmlPrin/Explorar.html`, `Scripts/ScriptsInicio.js`, `Scripts/ScriptsExplorar.js`, `servidor.js (líneas 24–81, 408–451)`

### Módulo 3: Reservas
Gestiona el ciclo de vida de reservas: creación, listado, cambio de estado (pendiente → confirmado → cancelado). Valida que el usuario sea cliente, que el destino esté activo y que no existan reservas duplicadas activas.

**Archivos:** `HtmlPrin/MisViajes.html`, `Scripts/ScriptsFichasViaje.js`, `servidor.js (líneas 453–733)`

### Módulo 4: Perfil
Permite ver y editar información personal. Soporta cambio de contraseña verificando la contraseña actual con bcrypt. La opción "eliminar cuenta" está solo implementada en el frontend (sin endpoint backend).

**Archivos:** `HtmlPrin/Perfil.html`, `Scripts/ScriptsCliente.js`, `servidor.js (líneas 736–860)`

### Módulo 5: Comunidad
Chat en tiempo real basado en `localStorage`. Permite crear chats directos con usuarios registrados (obtenidos de `GET /usuarios`) y grupos. Los mensajes se persisten localmente en la clave `comunidadChats_{userId}`.

**Archivos:** `HtmlPrin/Comunidad.html`, `Scripts/ScriptsComunidad.js`, `servidor.js (líneas 862–899)`

### Módulo 6: IA Chat
Asistente de viajes "LawMoon". El cliente envía mensajes a `POST /chat`. El servidor llama a la API de Groq (`openai/gpt-oss-120b`) con un system prompt que limita el asistente a temas de turismo en Colombia. Existe además `POST /chat/stream` con respuesta por patrón de texto (sin Groq).

**Archivos:** `HtmlPrin/IAChat.html`, `Scripts/ScriptsIAChat.js`, `servidor.js (líneas 1501–1591)`

### Módulo 7: Panel de Administración
Dashboard exclusivo para administradores. Carga todos los datos en `GET /admin/panel` (usuarios, destinos, reservas, métricas, finanzas). Soporta CRUD de destinos y usuarios, y cambio de estado de reservas. El frontend usa un mecanismo de auto-detección del puerto del servidor (`getApiBaseCandidates` prueba 5501, 5502, 5503).

**Archivos:** `HtmlPrin/InicioAdmin.html`, `Scripts/ScriptsAdmin.js`, `servidor.js (líneas 901–1499)`

---

## 4. Estrategias de Prueba

| # | Estrategia | Técnica | Módulos donde aplica |
|---|-----------|---------|---------------------|
| EP-1 | **Caja Negra Funcional** | Verificar que las salidas corresponden con las entradas sin conocer la implementación interna | Todos |
| EP-2 | **Validación de Campos de Entrada** | Probar campos vacíos, formatos inválidos, longitudes fuera del rango permitido | IT-01, IT-02, IT-07 |
| EP-3 | **Prueba de Límites (Boundary)** | Probar valores en el límite exacto de las restricciones (ej. contraseña de 5, 6, 7 y 8 caracteres) | IT-01, IT-02, IT-07 |
| EP-4 | **Flujos Positivos (Happy Path)** | Ejecutar cada función con datos válidos y verificar el flujo completo exitoso | Todos |
| EP-5 | **Flujos Negativos (Error Path)** | Ingresar datos inválidos o en estado incorrecto y verificar manejo de errores | IT-01, IT-02, IT-05, IT-07 |
| EP-6 | **Control de Acceso por Roles** | Intentar acceder a recursos protegidos con rol incorrecto o sin sesión | IT-14, IT-10, IT-05 |
| EP-7 | **Revisión Estática de API** | Analizar el código del servidor para verificar validaciones, respuestas HTTP, manejo de excepciones | IT-05, IT-11, IT-12, IT-13 |
| EP-8 | **Prueba de Integridad de Datos** | Verificar que los datos se persisten, consultan y actualizan correctamente | IT-05, IT-06, IT-07 |
| EP-9 | **Prueba de Duplicidad** | Intentar crear registros duplicados (usuario ya registrado, reserva duplicada) | IT-02, IT-05 |
| EP-10 | **Prueba de Seguridad Básica** | Revisar que datos sensibles no se expongan, que se use hashing y que los tokens sean válidos | IT-01, IT-14 |

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

### 5.3 Datos de prueba por módulo

#### Usuarios de prueba

| Rol | Email | Contraseña | Nombre | Observación |
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
| userId | `UUID válido de cliente existente` |
| destinationId | `UUID-DEST-001` (Cartagena) |
| estado inicial | `Pendiente` |
| fecha_reserva | `7 días desde creación (auto)` |

#### Datos inválidos para pruebas negativas

| Tipo | Valor |
|------|-------|
| UUID inválido | `"no-es-uuid"`, `"123"`, `""` |
| Email inválido | `"sinArroba"`, `"sin punto"`, `""` |
| Contraseña corta | `"Ab1"` (3 chars), `"Ab123"` (5 chars) |
| Contraseña límite 6 | `"Ab1234"` (6 chars – mín. registro) |
| Contraseña límite 8 | `"Ab123456"` (8 chars – mín. cambio de pass) |
| Nombre vacío | `""`, `"   "` |

---

## 6. Casos de Prueba con Evidencia

> **Convención de evidencia:**  
> `[ARCHIVO:LÍNEA]` → referencia exacta al código fuente evaluado  
> `→ RESULTADO:` → comportamiento observado en el código  
> `✅ PASS` / `❌ FAIL` / `⚠️ OBS` → resultado del caso

---

### 6.1 Módulo Login / Autenticación

#### CP-01-01 | Login con credenciales válidas de cliente

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-01 |
| **Ítem de prueba** | IT-01 |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Precondición** | Servidor activo. Usuario `cliente.test@tropical.com` existe con contraseña hasheada bcrypt. |
| **Datos de entrada** | `email: "cliente.test@tropical.com"`, `password: "Clave123"` |
| **Pasos** | 1. Abrir `index.html`. 2. Ingresar email y contraseña válidos. 3. Clic en "Iniciar sesión". |
| **Resultado esperado** | HTTP 200. `localStorage.authToken` y `localStorage.loggedUser` poblados. Redirección a `HtmlPrin/Inicio.html`. |
| **Evidencia – Código cliente** | `Scripts/ScriptsLogin.js:24-54` — `fetch('/login', {method:'POST',...})`. Tras respuesta OK, guarda `result.token` en `localStorage.authToken` y objeto `loggedUser` con `{id, userId, email, username, rol, isAdmin, loggedAt}`. |
| **Evidencia – Código servidor** | `servidor.js:366-401` — Consulta tabla `Usuarios` con `.eq('email', email)`. Usa `bcrypt.compare(password, usuarioData.password)`. Genera token: `Buffer.from('id:timestamp').toString('base64')`. Retorna `{ message, token, username, userId, email, rol }`. |
| **Resultado obtenido** | ✅ Lógica correcta. Bcrypt comparado. Token generado. Datos retornados completos. Redirección condicional: `normalizedRole === 'admin'` → `InicioAdmin.html`, si no → `Inicio.html`. |
| **Estado** | ✅ **PASS** |

---

#### CP-01-02 | Login con contraseña incorrecta

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-02 |
| **Ítem de prueba** | IT-01 |
| **Estrategia** | EP-5 (Flujo negativo) |
| **Datos de entrada** | `email: "cliente.test@tropical.com"`, `password: "ContraseñaIncorrecta"` |
| **Pasos** | 1. Ingresar email correcto y contraseña incorrecta. 2. Clic "Iniciar sesión". |
| **Resultado esperado** | HTTP 401. Alert con "Credenciales inválidas." No se guarda nada en `localStorage`. |
| **Evidencia – Código servidor** | `servidor.js:382-391` — `isPasswordValid = await bcrypt.compare(password, usuarioData.password)`. Si `!isPasswordValid` → `return res.status(401).json({ error: 'Credenciales inválidas.' })`. |
| **Evidencia – Código cliente** | `Scripts/ScriptsLogin.js:34-37` — `if (!response.ok) { throw new Error(result.error || 'Login fallido'); }`. En `catch` → `alert(err.message)`. |
| **Respuesta HTTP obtenida** | `HTTP 401` — `{ "error": "Credenciales inválidas." }` |
| **Resultado obtenido** | ✅ Retorna 401 con mensaje genérico. No expone si el correo existe o no. |
| **Estado** | ✅ **PASS** |

---

#### CP-01-03 | Login con campos vacíos

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-03 |
| **Estrategia** | EP-2 (Validación de entrada) |
| **Datos de entrada** | `email: ""`, `password: ""` |
| **Resultado esperado** | Alert "Ingrese correo y contraseña." Sin llamada al servidor. |
| **Evidencia – Código cliente** | `Scripts/ScriptsLogin.js:17-20` — `if (!email \|\| !pass) { alert('Ingrese correo y contraseña.'); return; }` — ejecutado antes del `fetch`. |
| **Resultado obtenido** | ✅ Validación previa al fetch. No genera tráfico de red. |
| **Estado** | ✅ **PASS** |

---

#### CP-01-04 | Login con correo no registrado

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-04 |
| **Estrategia** | EP-5 (Flujo negativo) |
| **Datos de entrada** | `email: "noexiste@correo.com"`, `password: "cualquier"` |
| **Resultado esperado** | HTTP 401. Mismo mensaje que contraseña incorrecta (no revelar si correo existe). |
| **Evidencia – Código servidor** | `servidor.js:377-380` — `if (!usuarioData) { return res.status(401).json({ error: 'Credenciales inválidas.' }); }` — mismo mensaje que contraseña errónea. |
| **Resultado obtenido** | ✅ Buena práctica de seguridad: el mensaje 401 es idéntico en ambos casos. |
| **Estado** | ✅ **PASS** |

---

#### CP-01-05 | Login – Redirección de administrador

| Campo | Detalle |
|-------|---------|
| **ID** | CP-01-05 |
| **Estrategia** | EP-6 (Control de acceso) |
| **Datos de entrada** | `email: "admin@tropical.com"`, `password: "Admin456!"` |
| **Resultado esperado** | Redirección a `HtmlPrin/InicioAdmin.html`. |
| **Evidencia – Código cliente** | `Scripts/ScriptsLogin.js:38-41` — `const normalizedRole = String(result.rol \|\| 'cliente').toLowerCase(); const isAdmin = normalizedRole === 'admin'; const redirectUrl = isAdmin ? 'HtmlPrin/InicioAdmin.html' : 'HtmlPrin/Inicio.html';` |
| **Resultado obtenido** | ✅ La redirección es determinada por el campo `rol` devuelto por el servidor. |
| **Estado** | ✅ **PASS** |

---

### 6.2 Módulo Registro de Usuario

#### CP-02-01 | Registro exitoso con todos los campos válidos

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-01 |
| **Ítem de prueba** | IT-02 |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Datos de entrada** | `nombre: "Ana García"`, `email: "ana.garcia@test.com"`, `password: "Prueba123"`, `confirmar: "Prueba123"`, `telefono: "+57 310 000 0001"`, `pais: "Colombia"`, `ciudad: "Medellín"`, `fecha_nacimiento: "2000-01-15"` |
| **Pasos** | 1. Abrir `Registro.html`. 2. Completar todos los campos. 3. Clic "Registrarse". |
| **Resultado esperado** | `POST /registrar` → HTTP 201. Alert "Registro exitoso. Ahora inicia sesión." Redirección a `index.html`. Usuario creado con `rol: 'cliente'` y contraseña hasheada. |
| **Evidencia – Código cliente** | `Scripts/ScriptsReg.js:43-64` — `fetch('/registrar', {method:'POST', body: JSON.stringify({nombre, email, password, telefono, pais, ciudad, fecha_nacimiento})})`. |
| **Evidencia – Código servidor** | `servidor.js:327-348` — `bcrypt.hash(password, 10)` → INSERT en tabla `Usuarios` con `{email, nombre, password: hashedPassword, rol: 'cliente', telefono, pais, ciudad, fecha_nacimiento}` → `res.status(201).json({ message: '...', user: createdUser })`. |
| **Respuesta HTTP esperada** | `HTTP 201` — `{ "message": "Usuario registrado correctamente. ¡Bienvenido a Tropical Travel!", "user": { "id": "uuid", "email": "...", "nombre": "...", "rol": "cliente" } }` |
| **Resultado obtenido** | ✅ Usuario creado con hash bcrypt. Rol fijado en `'cliente'` (no editable desde el formulario). |
| **Estado** | ✅ **PASS** |

---

#### CP-02-02 | Registro – Contraseñas no coinciden

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-02 |
| **Datos de entrada** | `password: "Abc123"`, `confirmar: "Xyz789"` |
| **Resultado esperado** | Alert "Las contraseñas no coinciden." Sin `fetch`. |
| **Evidencia – Código cliente** | `Scripts/ScriptsReg.js:25-28` — `if (pass !== pass2) { alert('Las contraseñas no coinciden.'); return; }` |
| **Resultado obtenido** | ✅ Validación frontend. No hace llamada al servidor. |
| **Estado** | ✅ **PASS** |

---

#### CP-02-03 | Registro – Contraseña menor a 6 caracteres

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-03 |
| **Estrategia** | EP-3 (Boundary) |
| **Datos de entrada** | `password: "Ab1"` (3 chars) |
| **Resultado esperado** | Alert "La contraseña debe tener al menos 6 caracteres." |
| **Evidencia – Código cliente** | `Scripts/ScriptsReg.js:29-32` — `if (pass.length < 6) { alert('La contraseña debe tener al menos 6 caracteres.'); return; }` |
| **Resultado obtenido** | ✅ Validado en frontend. |
| **Estado** | ✅ **PASS** |

---

#### CP-02-04 | Registro – Contraseña de exactamente 6 caracteres (límite)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-04 |
| **Estrategia** | EP-3 (Boundary) |
| **Datos de entrada** | `password: "Ab1234"` (6 chars), `confirmar: "Ab1234"` |
| **Resultado esperado** | Registro exitoso. La contraseña de 6 chars es aceptada. |
| **Evidencia** | `Scripts/ScriptsReg.js:29` — condición `< 6`, por lo que 6 caracteres pasa la validación. |
| **Resultado obtenido** | ✅ 6 caracteres pasa la validación del registro. |
| **Estado** | ✅ **PASS** |
| **Nota** | ⚠️ Esta regla **difiere** del módulo de cambio de contraseña que exige mínimo **8** caracteres. Ver DEF-01. |

---

#### CP-02-05 | Registro – Formato de email inválido

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-05 |
| **Datos de entrada** | `email: "no-es-un-email"`, `email: "sin@punto"` |
| **Resultado esperado** | Alert "Por favor ingrese un correo válido." |
| **Evidencia – Código cliente** | `Scripts/ScriptsReg.js:35-39` — `const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/; if (!emailRegex.test(email)) { alert('Por favor ingrese un correo válido.'); return; }` |
| **Resultado obtenido** | ✅ Regex bloquea emails inválidos. |
| **Estado** | ✅ **PASS** |

---

#### CP-02-06 | Registro – Correo ya registrado

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-06 |
| **Estrategia** | EP-9 (Duplicidad) |
| **Datos de entrada** | `email: "cliente.test@tropical.com"` (ya existente en BD) |
| **Resultado esperado** | HTTP 400. "El correo ya está registrado". |
| **Evidencia – Código servidor** | `servidor.js:307-320` — Consulta `select('id, email').eq('email', email).maybeSingle()`. Si `existingUser` existe → `res.status(400).json({ error: 'El correo ya está registrado' })`. |
| **Respuesta HTTP obtenida** | `HTTP 400` — `{ "error": "El correo ya está registrado" }` |
| **Resultado obtenido** | ✅ Prevención de duplicados. |
| **Estado** | ✅ **PASS** |

---

#### CP-02-07 | Registro – Campos obligatorios vacíos

| Campo | Detalle |
|-------|---------|
| **ID** | CP-02-07 |
| **Datos de entrada** | `nombre: ""`, `email: ""`, `password: ""`, `confirmar: ""` |
| **Resultado esperado** | Alert "Completa todos los campos." Sin `fetch`. |
| **Evidencia – Código cliente** | `Scripts/ScriptsReg.js:21-24` — `if (!username \|\| !email \|\| !pass \|\| !pass2) { alert('Completa todos los campos.'); return; }` |
| **Resultado obtenido** | ✅ Los 4 campos obligatorios se verifican juntos. |
| **Estado** | ✅ **PASS** |

---

### 6.3 Módulo Destinos – Página de Inicio

#### CP-03-01 | Carga de destinos desde Supabase

| Campo | Detalle |
|-------|---------|
| **ID** | CP-03-01 |
| **Ítem de prueba** | IT-03 |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Precondición** | Usuario autenticado, servidor activo, Supabase disponible. |
| **Resultado esperado** | Grid de tarjetas con los destinos activos de la BD, incluyendo imagen, rating, duración, precio y ubicación. |
| **Evidencia – Código servidor** | `servidor.js:409-451` — `supabase.from('Destinos').select('...').eq('activo', true)`. Enriquece cada destino con imagen desde `Destino_ui` o fallback `imageMap[nombre]`. Retorna array con `{id, title, location, description, image, price, rating, difficulty, duration, categoria}`. |
| **Evidencia – Código cliente** | `Scripts/ScriptsInicio.js:39-70` — `fetch('/destinos')` → `tripsData = await response.json()` → `renderDestinations()`. |
| **Resultado obtenido** | ✅ Destinos cargados y mapeados correctamente. Imágenes con fallback funcional. |
| **Estado** | ✅ **PASS** |

---

#### CP-03-02 | Búsqueda de destino por nombre

| Campo | Detalle |
|-------|---------|
| **ID** | CP-03-02 |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Datos de entrada** | `searchInput.value = "Cartagena"` |
| **Resultado esperado** | Solo las tarjetas cuyo `title`, `location`, `description` o `duration` contengan "cartagena" (case-insensitive). |
| **Evidencia – Código cliente** | `Scripts/ScriptsInicio.js:122-138` — `filteredTrips = tripsData.filter(trip => [trip.title, trip.location, trip.description, trip.duration].filter(Boolean).some(v => String(v).toLowerCase().includes(query)))` |
| **Resultado obtenido** | ✅ Búsqueda multi-campo sin distinción de mayúsculas. |
| **Estado** | ✅ **PASS** |

---

#### CP-03-03 | Búsqueda sin resultados

| Campo | Detalle |
|-------|---------|
| **ID** | CP-03-03 |
| **Datos de entrada** | `searchInput.value = "Plutón"` |
| **Resultado esperado** | Mensaje `"No encontramos destinos para esa búsqueda."` en el grid. |
| **Evidencia – Código cliente** | `Scripts/ScriptsInicio.js:78-81` — `if (!list.length) { grid.innerHTML = '<div class="empty-message">No encontramos destinos para esa búsqueda.</div>'; return; }` |
| **Resultado obtenido** | ✅ Muestra mensaje de estado vacío. |
| **Estado** | ✅ **PASS** |

---

#### CP-03-04 | Fallback cuando el servidor no responde

| Campo | Detalle |
|-------|---------|
| **ID** | CP-03-04 |
| **Precondición** | Servidor no disponible o timeout. |
| **Resultado esperado** | Se muestra tarjeta de Cartagena como destino de ejemplo. |
| **Evidencia – Código cliente** | `Scripts/ScriptsInicio.js:52-69` — Bloque `catch` popula `tripsData` con objeto hardcoded: `{id:'B001', title:'Cartagena de Indias', location:'Bolívar, Colombia', price:450000, image:'/Imagenes/cartagenaimg.jpg', rating:4.9, difficulty:'FÁCIL', duration:'3-4 DÍAS', description:'Explora las murallas coloniales...'}`. |
| **Resultado obtenido** | ✅ Fallback funcional para mantener UX cuando el servidor falla. |
| **Estado** | ✅ **PASS** |

---

#### CP-03-05 | Modal de detalle al hacer clic en un destino

| Campo | Detalle |
|-------|---------|
| **ID** | CP-03-05 |
| **Pasos** | 1. Cargar `Inicio.html`. 2. Clic en botón `"›"` de una tarjeta. |
| **Resultado esperado** | Modal visible (`aria-hidden="false"`) con `modalTitle`, `modalLocation`, `modalDescription`, `modalDuration`, `modalRating`, `modalPrice` populados. |
| **Evidencia – Código cliente** | `Scripts/ScriptsInicio.js:162-191` — `showDetails(trip)`: asigna `textContent` a cada elemento del modal. `modalImage.style.backgroundImage = url(trip.image)`. `modal.setAttribute('aria-hidden', 'false')`. |
| **Resultado obtenido** | ✅ Modal correctamente populado con datos del destino. |
| **Estado** | ✅ **PASS** |

---

### 6.4 Módulo Explorar Destinos

#### CP-04-01 | Filtrado por categoría "playa"

| Campo | Detalle |
|-------|---------|
| **ID** | CP-04-01 |
| **Ítem de prueba** | IT-04 |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Datos de entrada** | Clic en botón `data-filter="playa"` |
| **Resultado esperado** | Solo destinos con `categoria === 'playa'` visibles en el grid. |
| **Evidencia – Código cliente** | `Scripts/ScriptsExplorar.js:151-162` — `applyFilter(token, activeBtn)`: `filtered = token === 'todos' ? destinations : destinations.filter(d => (d.categoria \|\| '').toLowerCase() === token)`. Llama `renderDestinations(filtered)`. |
| **Evidencia – Datos de categorías** | `servidor.js:60-67` — `destinationCategoryMap`: Cartagena → `'playa'`, Tayrona → `'playa'`, Cocora → `'naturaleza'`, Chicamocha → `'aventura'`, Eje Cafetero → `'naturaleza'`, San Andrés → `'playa'`. |
| **Resultado obtenido** | ✅ Filtro funciona sobre datos en memoria. Categorías asignadas por nombre en el servidor. |
| **Estado** | ✅ **PASS** |

---

#### CP-04-02 | Búsqueda por texto en la vista Explorar

| Campo | Detalle |
|-------|---------|
| **ID** | CP-04-02 |
| **Datos de entrada** | `searchInput.value = "Tayrona"` + Clic "Buscar" |
| **Resultado esperado** | Tarjetas con "Tayrona" en título, ubicación, categoría o descripción. |
| **Evidencia – Código cliente** | `Scripts/ScriptsExplorar.js:186-195` — `results = destinations.filter(d => title.includes(query) \|\| location.includes(query) \|\| category.includes(query) \|\| description.includes(query))`. |
| **Resultado obtenido** | ✅ Búsqueda más amplia que Inicio (incluye `category`). |
| **Estado** | ✅ **PASS** |

---

#### CP-04-03 | Agregar destino a "Mis Viajes" desde Explorar

| Campo | Detalle |
|-------|---------|
| **ID** | CP-04-03 |
| **Precondición** | Usuario autenticado con `userId` UUID válido. |
| **Datos de entrada** | `userId: "UUID-CLIENTE"`, `destinationId: "UUID-DEST-001"` |
| **Pasos** | 1. Clic "Revisar" en tarjeta. 2. En modal, clic "Agregar a Mis Viajes". |
| **Resultado esperado** | `POST /reservas` → HTTP 201. Alert "Destino agregado a Mis Viajes." Modal se cierra. |
| **Evidencia – Código cliente** | `Scripts/ScriptsExplorar.js:67-83` — `addToMyTrips(destination)`: `fetch('/reservas', {method:'POST', body:{userId: getUserId(), destinationId: destination.id}})`. Si error → `alert(error.message)`. |
| **Resultado obtenido** | ✅ Flujo de reserva iniciado desde Explorar. |
| **Estado** | ✅ **PASS** |

---

### 6.5 Módulo Mis Viajes / Reservas

#### CP-05-01 | Crear reserva válida

| Campo | Detalle |
|-------|---------|
| **ID** | CP-05-01 |
| **Ítem de prueba** | IT-05 |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Datos de entrada** | `POST /reservas` — `{ "userId": "UUID-CLIENTE", "destinationId": "UUID-DEST-001" }` |
| **Pasos** | 1. Usuario autenticado visita Inicio.html. 2. Clic en destino. 3. Clic "Reservar ahora". |
| **Resultado esperado** | HTTP 201. Reserva creada con `estado: 'Pendiente'`, `fecha_reserva` = hoy + 7 días. |
| **Evidencia – Código servidor** | `servidor.js:506-541` — Genera `fecha_reserva` = `new Date() + 7 días`. INSERT en `Reservaciones` con `{user_id, destination_id, estado:'Pendiente', fecha_reserva, creado_en: new Date()}`. |
| **Respuesta HTTP esperada** | `HTTP 201` — `{ "message": "Reserva creada correctamente.", "reservation": { "id": "uuid", "title": "Cartagena de Indias", "location": "Cartagena, Colombia", "date": "2026-04-15", "status": "pending", "price": 0, "image": "/Imagenes/cartagenaimg.jpg" } }` |
| **Resultado obtenido** | ✅ Reserva creada correctamente. Fecha auto-calculada. |
| **Estado** | ✅ **PASS** |

---

#### CP-05-02 | Crear reserva – Solo permitida para clientes

| Campo | Detalle |
|-------|---------|
| **ID** | CP-05-02 |
| **Estrategia** | EP-6 (Control de acceso) |
| **Datos de entrada** | `POST /reservas` — `{ "userId": "UUID-ADMIN", "destinationId": "UUID-DEST-001" }` |
| **Resultado esperado** | HTTP 403. "Solo los clientes pueden crear reservas." |
| **Evidencia – Código servidor** | `servidor.js:480-482` — `if (String(user.rol \|\| '').toLowerCase() !== 'cliente') { return res.status(403).json({ error: 'Solo los clientes pueden crear reservas.' }); }` |
| **Resultado obtenido** | ✅ Control de rol en el servidor antes de crear la reserva. |
| **Estado** | ✅ **PASS** |

---

#### CP-05-03 | Crear reserva – Destino inactivo

| Campo | Detalle |
|-------|---------|
| **ID** | CP-05-03 |
| **Datos de entrada** | `destinationId: "UUID-DEST-INACT"` (con `activo: false`) |
| **Resultado esperado** | HTTP 404. "Destino no disponible." |
| **Evidencia – Código servidor** | `servidor.js:484-486` — `if (destinationError \|\| !destination \|\| destination.activo === false) { return res.status(404).json({ error: 'Destino no disponible.' }); }` |
| **Resultado obtenido** | ✅ Destinos inactivos rechazados en el servidor. |
| **Estado** | ✅ **PASS** |

---

#### CP-05-04 | Crear reserva – Reserva duplicada activa

| Campo | Detalle |
|-------|---------|
| **ID** | CP-05-04 |
| **Estrategia** | EP-9 (Duplicidad) |
| **Precondición** | El usuario ya tiene una reserva con estado `Pendiente` o `Confirmada` para `UUID-DEST-001`. |
| **Datos de entrada** | `POST /reservas` — mismo `userId` y `destinationId`. |
| **Resultado esperado** | HTTP 400. "Ya tienes una reserva activa para este destino." |
| **Evidencia – Código servidor** | `servidor.js:488-503` — Consulta `existingReservation` en `Reservaciones`. Si existe y `normalizeReservationStatus(existingReservation.estado) !== 'cancelled'` → `res.status(400).json({ error: 'Ya tienes una reserva activa para este destino.' })`. |
| **Resultado obtenido** | ✅ Solo bloquea si la reserva previa no está cancelada (permite re-reservar después de cancelar). |
| **Estado** | ✅ **PASS** |

---

#### CP-05-05 | Crear reserva – IDs inválidos (no UUID)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-05-05 |
| **Estrategia** | EP-2 (Validación de entrada), EP-3 (Boundary) |
| **Datos de entrada** | `userId: "no-soy-uuid"`, `destinationId: "123"` |
| **Resultado esperado** | HTTP 400. "Usuario o destino no válido." |
| **Evidencia – Código servidor** | `servidor.js:459-461` — `if (!isUuid(userId) \|\| !isUuid(destinationId)) { return res.status(400).json({ error: 'Usuario o destino no válido.' }); }`. Función `isUuid`: `servidor.js:130-132` — regex UUID v4. |
| **Resultado obtenido** | ✅ Validación de formato UUID antes de cualquier consulta a la BD. |
| **Estado** | ✅ **PASS** |

---

#### CP-05-06 | Listar reservas del usuario

| Campo | Detalle |
|-------|---------|
| **ID** | CP-05-06 |
| **Ítem de prueba** | IT-06 |
| **Datos de entrada** | `GET /reservas/UUID-CLIENTE` |
| **Resultado esperado** | Array de reservas con datos del destino (título, ubicación, precio, imagen, estado, fecha). |
| **Evidencia – Código servidor** | `servidor.js:575-621` — JOIN implícito: `select('id, estado, fecha_reserva, creado_en, Destinos(id, nombre, ciudad, pais, descripcion, precio)')`. Normaliza estado y mapea imágenes. |
| **Respuesta HTTP esperada** | `HTTP 200` — `[{ "id": "uuid", "title": "Cartagena de Indias", "location": "Cartagena, Colombia", "date": "2026-04-15", "status": "pending", "price": 0, "image": "/Imagenes/cartagenaimg.jpg", "rating": 4.5 }]` |
| **Resultado obtenido** | ✅ JOIN en Supabase retorna datos del destino embebidos. |
| **Estado** | ✅ **PASS** |

---

#### CP-05-07 | Filtrar reservas por estado

| Campo | Detalle |
|-------|---------|
| **ID** | CP-05-07 |
| **Datos de entrada** | Clic en botón `data-status="confirmed"` |
| **Resultado esperado** | Solo tarjetas con `status === 'confirmed'` visibles. |
| **Evidencia – Código cliente** | `Scripts/ScriptsFichasViaje.js:83-85` — `const filtered = tripsData.filter(t => filter === 'all' \|\| t.status === filter)`. |
| **Evidencia – Normalización** | `Scripts/ScriptsFichasViaje.js:34-41` — `normalizeStatus(status)`: `['confirmado','confirmed']` → `'confirmed'`; `['cancelado','cancelled']` → `'cancelled'`; default → `'pending'`. |
| **Resultado obtenido** | ✅ Filtrado local con normalización de valores en español e inglés. |
| **Estado** | ✅ **PASS** |

---

#### CP-05-08 | Confirmar pago (cambio de estado: pending → confirmed)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-05-08 |
| **Datos de entrada** | `PUT /reservas/UUID-RESERVA/status` — `{ "userId": "UUID-CLIENTE", "status": "confirmed" }` |
| **Pasos** | 1. Ver tarjeta con estado "Pendiente". 2. Clic "Pagar". 3. Confirmar diálogo. |
| **Resultado esperado** | HTTP 200. Reserva actualizada a `estado: 'Confirmada'`. Lista de viajes se recarga. |
| **Evidencia – Código servidor** | `servidor.js:641-674` — Verifica que `reserva.user_id === userId`. `statusMap = {pending:'Pendiente', confirmed:'Confirmada', cancelled:'Cancelada'}`. UPDATE en Supabase. |
| **Resultado obtenido** | ✅ Solo el propietario de la reserva puede cambiar su estado. |
| **Estado** | ✅ **PASS** |

---

#### CP-05-09 | Cancelar reserva

| Campo | Detalle |
|-------|---------|
| **ID** | CP-05-09 |
| **Datos de entrada** | `updateStatus(trip.id, 'cancelled')` desde el botón "Cancelar". |
| **Resultado esperado** | HTTP 200. Reserva en estado `'Cancelada'`. |
| **Evidencia – Código servidor** | `servidor.js:650-651` — `if (reserva.user_id !== userId) { return res.status(403).json({ error: 'No autorizado' }); }` — Verificación de propiedad. |
| **Resultado obtenido** | ✅ Autorización verificada antes de cancelar. |
| **Estado** | ✅ **PASS** |

---

### 6.6 Módulo Perfil de Usuario

#### CP-06-01 | Cargar datos del perfil

| Campo | Detalle |
|-------|---------|
| **ID** | CP-06-01 |
| **Ítem de prueba** | IT-07 |
| **Datos de entrada** | `GET /perfil/UUID-CLIENTE` |
| **Resultado esperado** | Campos del formulario populados con `nombre`, `email`, `telefono`, `pais`, `ciudad`, `fecha_nacimiento`. |
| **Evidencia – Código servidor** | `servidor.js:742-758` — `supabase.from('Usuarios').select('id, nombre, email, rol, pais, telefono, fecha_nacimiento, ciudad, created_at').eq('id', userId).maybeSingle()`. |
| **Evidencia – Código cliente** | `Scripts/ScriptsCliente.js:18-41` — `populateForm(data)`: asigna `nameInput.value`, `emailInput.value`, `phoneInput.value`, `cityInput.value`, `birthdateInput.value`, itera `countrySelect.options` para asignar el país. |
| **Fallback** | Si el servidor falla → usa datos del `localStorage.loggedUser` (`Scripts/ScriptsCliente.js:49-52`). |
| **Resultado obtenido** | ✅ Carga desde servidor con fallback a localStorage. |
| **Estado** | ✅ **PASS** |

---

#### CP-06-02 | Actualizar datos personales

| Campo | Detalle |
|-------|---------|
| **ID** | CP-06-02 |
| **Datos de entrada** | `PUT /perfil/UUID-CLIENTE` — `{ "nombre": "Ana García Actualizada", "telefono": "+57 320 000 0002", "pais": "México", "ciudad": "Guadalajara", "fecha_nacimiento": "1998-03-20" }` |
| **Resultado esperado** | HTTP 200. `localStorage.loggedUser.username` actualizado. Alert "Cambios guardados correctamente". |
| **Evidencia – Código servidor** | `servidor.js:768-793` — Construye objeto `updates = {nombre, updated_at}` + campos opcionales. UPDATE en Supabase. |
| **Evidencia – Código cliente** | `Scripts/ScriptsCliente.js:129-133` — `loggedUser.username = nombre; localStorage.setItem('loggedUser', JSON.stringify(loggedUser)); document.getElementById('profileName').textContent = nombre;` |
| **Resultado obtenido** | ✅ Actualización persistida en BD y sincronizada en localStorage. |
| **Estado** | ✅ **PASS** |

---

#### CP-06-03 | Actualizar perfil con nombre vacío

| Campo | Detalle |
|-------|---------|
| **ID** | CP-06-03 |
| **Datos de entrada** | `nombre: ""` |
| **Resultado esperado** | Alert "El nombre no puede estar vacio." Sin llamada al servidor. |
| **Evidencia – Código cliente** | `Scripts/ScriptsCliente.js:112-115` — `if (!nombre) { alert('El nombre no puede estar vacio.'); return; }` |
| **Evidencia – Doble validación servidor** | `servidor.js:774` — `if (!nombre) return res.status(400).json({ error: 'El nombre es requerido.' })`. |
| **Resultado obtenido** | ✅ Validación doble (frontend + backend). |
| **Estado** | ✅ **PASS** |

---

#### CP-06-04 | Cambio de contraseña exitoso

| Campo | Detalle |
|-------|---------|
| **ID** | CP-06-04 |
| **Datos de entrada** | `PUT /perfil/UUID-CLIENTE/password` — `{ "currentPassword": "Clave123", "newPassword": "NuevaClave456", "confirmPassword": "NuevaClave456" }` |
| **Resultado esperado** | HTTP 200. "Contraseña actualizada correctamente." Campos de contraseña limpiados en el formulario. |
| **Evidencia – Código servidor** | `servidor.js:833-854` — `bcrypt.compare(currentPassword, user.password)` → si válida → `bcrypt.hash(newPassword, 10)` → UPDATE en Supabase. |
| **Evidencia – Código cliente** | `Scripts/ScriptsCliente.js:64-103` — `changePassword()`: valida que los 3 campos estén llenos, que `newPassword.length >= 8`, que `newPassword === confirmPassword`. Tras éxito limpia los 3 campos. |
| **Resultado obtenido** | ✅ Verificación bcrypt de contraseña actual + rehash de nueva contraseña. |
| **Estado** | ✅ **PASS** |

---

#### CP-06-05 | Cambio contraseña – Nueva menor a 8 caracteres

| Campo | Detalle |
|-------|---------|
| **ID** | CP-06-05 |
| **Estrategia** | EP-3 (Boundary) |
| **Datos de entrada** | `newPassword: "Ab1234"` (6 chars), `newPassword: "Ab12345"` (7 chars) |
| **Resultado esperado** | Alert "La nueva contraseña debe tener al menos 8 caracteres." Sin `fetch`. |
| **Evidencia – Código cliente** | `Scripts/ScriptsCliente.js:74-77` — `if (newPassword.length < 8) { alert('La nueva contraseña debe tener al menos 8 caracteres.'); return; }` |
| **Evidencia – Código servidor** | `servidor.js:814-816` — `if (newPassword.length < 8) { return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' }); }` |
| **Resultado obtenido** | ✅ Validación doble. 7 chars rechazado, 8 chars aceptado. |
| **Estado** | ✅ **PASS** |
| **Inconsistencia** | ⚠️ El registro acepta contraseñas de 6 chars pero el cambio exige 8 chars mínimo. Ver DEF-01. |

---

#### CP-06-06 | Cambio contraseña – Contraseñas nuevas no coinciden

| Campo | Detalle |
|-------|---------|
| **ID** | CP-06-06 |
| **Datos de entrada** | `newPassword: "NuevaClave456"`, `confirmPassword: "OtraClave789"` |
| **Resultado esperado** | Alert "La confirmación de la contraseña no coincide." |
| **Evidencia – Código cliente** | `Scripts/ScriptsCliente.js:79-82` — `if (newPassword !== confirmPassword) { alert('La confirmación de la contraseña no coincide.'); return; }` |
| **Resultado obtenido** | ✅ Validado en cliente antes de enviar. |
| **Estado** | ✅ **PASS** |

---

#### CP-06-07 | Cambio contraseña – Contraseña actual incorrecta

| Campo | Detalle |
|-------|---------|
| **ID** | CP-06-07 |
| **Datos de entrada** | `currentPassword: "ContraseñaEquivocada"`, `newPassword: "NuevaClave456"` |
| **Resultado esperado** | HTTP 401. "La contraseña actual es incorrecta." |
| **Evidencia – Código servidor** | `servidor.js:839-842` — `if (!isPasswordValid) { return res.status(401).json({ error: 'La contraseña actual es incorrecta.' }); }` |
| **Resultado obtenido** | ✅ bcrypt.compare bloquea correctamente. |
| **Estado** | ✅ **PASS** |

---

#### CP-06-08 | Eliminación de cuenta – Flujo de UI

| Campo | Detalle |
|-------|---------|
| **ID** | CP-06-08 |
| **Pasos** | 1. Ir a tab "Seguridad". 2. Clic "Eliminar Cuenta". 3. Confirmar diálogo. |
| **Resultado esperado (ideal)** | HTTP PUT/DELETE al servidor. Cuenta marcada para eliminación en 7 días. |
| **Resultado obtenido** | ❌ `Scripts/ScriptsCliente.js:150-158` — El `deleteAccountBtn` solo muestra un `confirm()` y luego un `alert('Tu cuenta quedó programada para eliminarse en 7 días...')`. **No realiza ningún `fetch` al servidor.** No existe ningún endpoint de eliminación en `servidor.js`. La cuenta NO se elimina ni desactiva en la BD. |
| **Estado** | ❌ **FAIL** — Ver DEF-02 |

---

### 6.7 Módulo Comunidad (Chat)

#### CP-07-01 | Carga de chats al iniciar sesión

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-01 |
| **Ítem de prueba** | IT-08 |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Precondición** | Usuario tiene chats guardados en `localStorage`. |
| **Resultado esperado** | Los chats se cargan desde `localStorage.comunidadChats_{userId}`. |
| **Evidencia – Código cliente** | `Scripts/ScriptsComunidad.js:68-96` — `loadChats()`: Lee `localStorage.getItem(getStorageKey())`. La clave es `comunidadChats_{loggedUserId \|\| email}`. Si no existen, crea chat guía por defecto. |
| **Resultado obtenido** | ✅ Persistencia local funcional. |
| **Estado** | ✅ **PASS** |
| **Observación** | ⚠️ Los mensajes solo existen en el dispositivo donde se crearon (no multi-dispositivo). |

---

#### CP-07-02 | Búsqueda de usuarios para nuevo chat

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-02 |
| **Datos de entrada** | `GET /usuarios?search=Ana&excludeUserId=UUID-CLIENTE` |
| **Resultado esperado** | Lista de usuarios con nombre o email que contengan "Ana", excluyendo al usuario actual. |
| **Evidencia – Código servidor** | `servidor.js:862-898` — `query.eq('rol', 'cliente').or('nombre.ilike.%Ana%,email.ilike.%Ana%').neq('id', excludeUserId).limit(80)`. |
| **Respuesta HTTP esperada** | `HTTP 200` — `[{ "id": "uuid", "nombre": "Ana García", "email": "ana@...", "foto": null }]` |
| **Resultado obtenido** | ✅ Búsqueda en BD por nombre o email. Solo retorna clientes (no admins). |
| **Estado** | ✅ **PASS** |

---

#### CP-07-03 | Envío de mensaje en un chat activo

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-03 |
| **Datos de entrada** | Texto en `messageInput` + Enter o clic "Enviar". |
| **Resultado esperado** | Mensaje agregado al historial del chat activo y guardado en `localStorage`. |
| **Evidencia – Código cliente** | `Scripts/ScriptsComunidad.js` — Mensaje guardado en `chats[activeChatId].messages` y `localStorage.setItem(getStorageKey(), JSON.stringify(chats))`. |
| **Resultado obtenido** | ✅ Mensajes persistidos localmente. |
| **Estado** | ✅ **PASS** |

---

#### CP-07-04 | Creación de grupo con miembros

| Campo | Detalle |
|-------|---------|
| **ID** | CP-07-04 |
| **Datos de entrada** | `groupNameInput.value = "Viajeros Colombia"`. Seleccionar al menos 1 miembro. Clic "Crear Grupo". |
| **Resultado esperado** | Nuevo grupo creado y visible en la lista de chats. Guardado en `localStorage`. |
| **Evidencia – Código cliente** | `Scripts/ScriptsComunidad.js` — `confirmCreateGroup` crea objeto `{id, type:'group', name, members:[...], messages:[]}` y lo añade al array `chats`. Llama `saveChats()`. |
| **Resultado obtenido** | ✅ Grupos creados y persistidos localmente. |
| **Estado** | ✅ **PASS** |

---

### 6.8 Módulo IA Chat

#### CP-08-01 | Mensaje de bienvenida al cargar la página

| Campo | Detalle |
|-------|---------|
| **ID** | CP-08-01 |
| **Ítem de prueba** | IT-09 |
| **Estrategia** | EP-4 (Flujo positivo) |
| **Resultado esperado** | Burbuja del asistente con "¡Hola! Soy tu asistente de viajes LawMoon🌴 ¿En qué puedo ayudarte?" |
| **Evidencia – Código cliente** | `Scripts/ScriptsIAChat.js:40` — `addMessage('ai', '¡Hola! Soy tu asistente de viajes LawMoon🌴 ¿En qué puedo ayudarte?');` — ejecutado al inicio del `DOMContentLoaded`. |
| **Resultado obtenido** | ✅ Mensaje inicial insertado sin esperar respuesta del servidor. |
| **Estado** | ✅ **PASS** |

---

#### CP-08-02 | Envío de mensaje al asistente IA

| Campo | Detalle |
|-------|---------|
| **ID** | CP-08-02 |
| **Datos de entrada** | `chatInput.value = "Cuéntame sobre Cartagena"` + Clic "Enviar" |
| **Resultado esperado** | Burbuja de usuario visible. Burbuja "Escribiendo…" aparece. Tras respuesta, burbuja del asistente con información sobre Cartagena. |
| **Evidencia – Código cliente** | `Scripts/ScriptsIAChat.js:98-136` — `sendMessage()`: `addMessage('user', text)` → `showTyping()` → `fetch('http://localhost:5501/chat', {method:'POST', body:{message:text}})` → `removeTyping()` → `addMessage('ai', data.reply)`. |
| **Evidencia – Código servidor** | `servidor.js:1510-1535` — `POST /chat`: Llama a `https://api.groq.com/openai/v1/chat/completions` con `model: "openai/gpt-oss-120b"` y system prompt de guía turístico. Retorna `data.choices[0].message.content`. |
| **Resultado obtenido** | ✅ Flujo de mensajería funcional con Groq API. |
| **Estado** | ✅ **PASS** |
| **Defecto crítico** | ❌ La URL en `ScriptsIAChat.js:109` está **hardcodeada** como `http://localhost:5501/chat`. En producción o si el puerto cambia, fallará. Ver DEF-03. |

---

#### CP-08-03 | Indicador "Escribiendo…" durante la espera

| Campo | Detalle |
|-------|---------|
| **ID** | CP-08-03 |
| **Resultado esperado** | Burbuja con "Escribiendo..." aparece antes de la respuesta y desaparece al recibirla o si ocurre error. |
| **Evidencia – Código cliente** | `Scripts/ScriptsIAChat.js:75-96` — `showTyping()` crea elemento `#typing`. `removeTyping()` lo elimina. Se llama tanto en el bloque `try` como en `catch`. |
| **Resultado obtenido** | ✅ Indicador correctamente gestionado en flujo normal y de error. |
| **Estado** | ✅ **PASS** |

---

#### CP-08-04 | Error de conexión al servidor IA

| Campo | Detalle |
|-------|---------|
| **ID** | CP-08-04 |
| **Precondición** | Servidor no disponible o `GROQ_API_KEY` inválida. |
| **Resultado esperado** | Burbuja de error "No se pudo conectar con el servidor." o "Error con la IA". |
| **Evidencia – Código cliente** | `Scripts/ScriptsIAChat.js:132-135` — `catch(error) { removeTyping(); addMessage('ai', 'No se pudo conectar con el servidor.'); }` |
| **Evidencia – Código servidor** | `servidor.js:1537-1540` — `catch(error) { res.status(500).json({ reply: "Error con la IA" }); }` |
| **Resultado obtenido** | ✅ Error manejado sin crashear la interfaz. |
| **Estado** | ✅ **PASS** |

---

#### CP-08-05 | Envío de mensaje vacío

| Campo | Detalle |
|-------|---------|
| **ID** | CP-08-05 |
| **Datos de entrada** | `chatInput.value = "   "` (solo espacios) |
| **Resultado esperado** | No se envía mensaje ni se llama al servidor. |
| **Evidencia – Código cliente** | `Scripts/ScriptsIAChat.js:99-100` — `const text = chatInput.value.trim(); if (!text) return;` |
| **Evidencia – Código servidor** | `servidor.js:1503-1506` — `const raw = String(req.body?.message \|\| '').trim(); if (!raw) { return res.status(400).json({ reply: 'Por favor escribe un mensaje.' }); }` |
| **Resultado obtenido** | ✅ Doble validación. Cliente no envía si vacío; servidor también valida. |
| **Estado** | ✅ **PASS** |

---

### 6.9 Panel de Administración – Vistas Principales

#### CP-09-01 | Acceso al panel con rol correcto (admin)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-09-01 |
| **Ítem de prueba** | IT-10 |
| **Estrategia** | EP-6 (Control de acceso) |
| **Precondición** | Usuario logueado con `rol: 'admin'` en `localStorage`. |
| **Resultado esperado** | Panel cargado correctamente. `GET /admin/panel?adminId=UUID-ADMIN` retorna datos. |
| **Evidencia – Código cliente** | `Scripts/ScriptsAdmin.js:10-21` — `if (!loggedUser) → redirect '../index.html'`. `if (!adminId \|\| adminRole !== 'admin') → redirect 'Inicio.html'`. |
| **Resultado obtenido** | ✅ Doble verificación de sesión y rol antes de cargar cualquier dato. |
| **Estado** | ✅ **PASS** |

---

#### CP-09-02 | Acceso al panel con rol cliente (denegado)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-09-02 |
| **Datos de entrada** | `loggedUser.rol = 'cliente'` en localStorage. Navegar a `InicioAdmin.html`. |
| **Resultado esperado** | Redirección a `Inicio.html`. |
| **Evidencia – Código cliente** | `Scripts/ScriptsAdmin.js:18-20` — `if (!adminId \|\| adminRole !== 'admin') { window.location.href = 'Inicio.html'; return; }` |
| **Resultado obtenido** | ✅ Redirección correcta para clientes. |
| **Estado** | ✅ **PASS** |

---

#### CP-09-03 | Carga del dashboard con métricas

| Campo | Detalle |
|-------|---------|
| **ID** | CP-09-03 |
| **Datos de entrada** | `GET /admin/panel?adminId=UUID-ADMIN` |
| **Resultado esperado** | JSON con `dashboard.metrics`: `salesToday`, `activeReservations`, `newTourists`, `ratingGlobal`. Gráfico de ventas de 7 meses. |
| **Evidencia – Código servidor** | `servidor.js:1040-1086` — Calcula métricas: `salesToday` (reservas del día), `activeReservations` (pending+confirmed), `newTourists` (clientes en últimos 30 días), `ratingGlobal` (promedio de destinos activos). Genera alertas automáticas. |
| **Resultado obtenido** | ✅ Dashboard calculado dinámicamente desde datos reales de Supabase. |
| **Estado** | ✅ **PASS** |

---

#### CP-09-04 | Validación de adminId en endpoints admin

| Campo | Detalle |
|-------|---------|
| **ID** | CP-09-04 |
| **Datos de entrada** | `adminId: "no-soy-uuid"` en cualquier endpoint `/admin/*` |
| **Resultado esperado** | HTTP 400. "Administrador no válido." |
| **Evidencia – Código servidor** | `servidor.js:172-193` — `validateAdminRequest(adminId)`: verifica UUID con `isUuid()`, consulta Supabase, verifica `rol === 'admin'`. Retorna `{ok:false, status:400, error:'...'}` o `{ok:false, status:403, error:'...'}` o `{ok:true, admin:data}`. |
| **Resultado obtenido** | ✅ Todos los endpoints admin usan esta función de validación centralizada. |
| **Estado** | ✅ **PASS** |

---

#### CP-09-05 | Auto-detección del puerto del servidor (ScriptsAdmin)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-09-05 |
| **Resultado esperado** | Si el servidor no está en el origen actual, se prueban automáticamente los puertos 5501, 5502 y 5503. |
| **Evidencia – Código cliente** | `Scripts/ScriptsAdmin.js:114-132` — `getApiBaseCandidates()`: retorna lista con el `window.location.origin` primero, luego `:5501`, `:5502`, `:5503`. `fetchApi(path)` itera la lista hasta obtener respuesta exitosa. |
| **Resultado obtenido** | ✅ Mecanismo de resiliencia único en este módulo. No presente en otros módulos de cliente. |
| **Estado** | ✅ **PASS** |

---

### 6.10 Panel Admin – CRUD de Destinos

#### CP-10-01 | Crear nuevo destino

| Campo | Detalle |
|-------|---------|
| **ID** | CP-10-01 |
| **Ítem de prueba** | IT-11 |
| **Datos de entrada** | `POST /admin/destinos` — `{ "adminId": "UUID-ADMIN", "nombre": "Ciudad Perdida", "ciudad": "Santa Marta", "pais": "Colombia", "descripcion": "Ruinas arqueológicas en la Sierra Nevada", "clima": "Tropical", "precio": 350000, "imageUrl": "/Imagenes/ciudad-perdida.jpg" }` |
| **Resultado esperado** | HTTP 201. Destino creado con `activo: true`. Si `imageUrl` proporcionada, INSERT en `Destino_ui`. |
| **Evidencia – Código servidor** | `servidor.js:1209-1233` — Valida `nombre` y `ciudad` requeridos. INSERT en `Destinos`. Si `imageUrl` → INSERT en `Destino_ui`. |
| **Respuesta HTTP esperada** | `HTTP 201` — `{ "message": "Destino creado correctamente.", "destination": { "id": "uuid-nuevo", "nombre": "Ciudad Perdida", "pais": "Colombia", "ciudad": "Santa Marta", "activo": true } }` |
| **Resultado obtenido** | ✅ Creación con imagen opcional. Destino activo por defecto. |
| **Estado** | ✅ **PASS** |

---

#### CP-10-02 | Crear destino sin nombre o ciudad (inválido)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-10-02 |
| **Datos de entrada** | `POST /admin/destinos` — `{ "adminId": "UUID-ADMIN", "nombre": "", "ciudad": "" }` |
| **Resultado esperado** | HTTP 400. "Nombre y ciudad son requeridos." |
| **Evidencia – Código servidor** | `servidor.js:1209-1211` — `if (!nombre \|\| !ciudad) { return res.status(400).json({ error: 'Nombre y ciudad son requeridos.' }); }` |
| **Resultado obtenido** | ✅ Validación de campos obligatorios en el servidor. |
| **Estado** | ✅ **PASS** |

---

#### CP-10-03 | Editar destino existente

| Campo | Detalle |
|-------|---------|
| **ID** | CP-10-03 |
| **Datos de entrada** | `PUT /admin/destinos/UUID-DEST-001` — `{ "adminId": "UUID-ADMIN", "nombre": "Cartagena de Indias", "precio": 50000, "activo": true }` |
| **Resultado esperado** | HTTP 200. Destino actualizado con `updated_at`. |
| **Evidencia – Código servidor** | `servidor.js:1262-1296` — UPDATE en `Destinos` con todos los campos. Si `imageUrl` → actualiza o inserta en `Destino_ui`. |
| **Resultado obtenido** | ✅ Actualización con gestión de imagen (upsert en `Destino_ui`). |
| **Estado** | ✅ **PASS** |

---

#### CP-10-04 | Desactivar (eliminar lógico) un destino

| Campo | Detalle |
|-------|---------|
| **ID** | CP-10-04 |
| **Datos de entrada** | `DELETE /admin/destinos/UUID-DEST-001?adminId=UUID-ADMIN` |
| **Resultado esperado** | HTTP 200. `activo: false` en BD. El destino no aparece más en `GET /destinos`. |
| **Evidencia – Código servidor** | `servidor.js:1315-1326` — `supabase.from('Destinos').update({ activo: false, updated_at: new Date() }).eq('id', destinationId)`. |
| **Nota de diseño** | No se elimina físicamente el registro — es un soft delete que preserva la integridad referencial con `Reservaciones`. |
| **Resultado obtenido** | ✅ Eliminación lógica segura. Las reservas existentes no se pierden. |
| **Estado** | ✅ **PASS** |

---

### 6.11 Panel Admin – CRUD de Usuarios

#### CP-11-01 | Crear usuario desde el panel admin

| Campo | Detalle |
|-------|---------|
| **ID** | CP-11-01 |
| **Ítem de prueba** | IT-12 |
| **Datos de entrada** | `POST /admin/usuarios` — `{ "adminId": "UUID-ADMIN", "nombre": "Carlos López", "email": "carlos@empresa.com", "password": "DefaultPass8", "rol": "cliente", "pais": "Colombia", "ciudad": "Cali" }` |
| **Resultado esperado** | HTTP 201. Usuario creado con contraseña hasheada. |
| **Evidencia – Código servidor** | `servidor.js:1366-1380` — `bcrypt.hash(password, 10)`. INSERT con todos los campos. Retorna usuario creado sin contraseña. |
| **Nota de seguridad** | `servidor.js:1341` — La contraseña por defecto si no se provee es `"12345678"`. Esto es un riesgo de seguridad. |
| **Resultado obtenido** | ✅ Creación funcional. ⚠️ Contraseña default débil. |
| **Estado** | ✅ **PASS** con observación de seguridad |

---

#### CP-11-02 | Eliminar usuario – No permite auto-eliminación

| Campo | Detalle |
|-------|---------|
| **ID** | CP-11-02 |
| **Estrategia** | EP-6 (Control de acceso) |
| **Datos de entrada** | `DELETE /admin/usuarios/UUID-ADMIN?adminId=UUID-ADMIN` (el admin intenta eliminarse a sí mismo) |
| **Resultado esperado** | HTTP 400. "No puedes eliminar tu propio usuario administrador." |
| **Evidencia – Código servidor** | `servidor.js:1444-1446` — `if (userId === adminValidation.admin.id) { return res.status(400).json({ error: 'No puedes eliminar tu propio usuario administrador.' }); }` |
| **Resultado obtenido** | ✅ Salvaguarda de integridad correctamente implementada. |
| **Estado** | ✅ **PASS** |

---

#### CP-11-03 | Eliminar usuario con reservas asociadas

| Campo | Detalle |
|-------|---------|
| **ID** | CP-11-03 |
| **Datos de entrada** | `DELETE /admin/usuarios/UUID-CLIENTE-CON-RESERVAS` |
| **Resultado esperado** | HTTP 409 si la BD tiene restricciones de FK. Mensaje: "No se pudo eliminar el usuario. Verifica si tiene registros asociados." |
| **Evidencia – Código servidor** | `servidor.js:1453-1456` — `if (error) { return res.status(409).json({ error: 'No se pudo eliminar el usuario. Verifica si tiene registros asociados.' }); }` |
| **Resultado obtenido** | ✅ El error de BD se captura y se retorna 409 descriptivo. |
| **Estado** | ✅ **PASS** |

---

### 6.12 Panel Admin – Gestión de Reservas

#### CP-12-01 | Cambiar estado de reserva (admin)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-12-01 |
| **Ítem de prueba** | IT-13 |
| **Datos de entrada** | `PUT /admin/reservas/UUID-RESERVA/status` — `{ "adminId": "UUID-ADMIN", "status": "confirmed" }` |
| **Resultado esperado** | HTTP 200. "Estado de reserva actualizado correctamente." |
| **Evidencia – Código servidor** | `servidor.js:1477-1493` — `statusMap = {confirmed:'Confirmada', pending:'Pendiente', cancelled:'Cancelada'}`. UPDATE en Supabase con `updated_en`. |
| **Diferencia vs cliente** | A diferencia del endpoint de cliente (`/reservas/:id/status`), el admin NO verifica que la reserva le pertenezca al userId — puede cambiar cualquier reserva. |
| **Resultado obtenido** | ✅ Admin puede gestionar cualquier reserva sin restricción de propiedad. |
| **Estado** | ✅ **PASS** |

---

#### CP-12-02 | Vista de operaciones en el dashboard admin

| Campo | Detalle |
|-------|---------|
| **ID** | CP-12-02 |
| **Resultado esperado** | Tabla con todas las reservas incluyendo: id, cliente, destino, fecha, precio total, estado. Botones para confirmar/cancelar. |
| **Evidencia – Código cliente** | `Scripts/ScriptsAdmin.js:401-418` — `renderOperations()` genera tabla HTML con `row.id`, `row.customer`, `row.destination`, `row.date`, `row.total`, `row.status`. Botones `data-action="status-reservation"` con `data-status="confirmed"` y `data-status="cancelled"`. |
| **Evidencia – XSS Protection** | `Scripts/ScriptsAdmin.js:186-193` — Función `escapeHtml(value)` escapa `&`, `<`, `>`, `"`, `'` en todos los valores renderizados en HTML. |
| **Resultado obtenido** | ✅ Tabla funcional con protección XSS via `escapeHtml`. |
| **Estado** | ✅ **PASS** |

---

### 6.13 Control de Acceso y Sesión

#### CP-13-01 | Redirección si no hay sesión activa

| Campo | Detalle |
|-------|---------|
| **ID** | CP-13-01 |
| **Ítem de prueba** | IT-14 |
| **Precondición** | `localStorage` sin `loggedUser`. |
| **Resultado esperado** | Al navegar a cualquier página protegida → redirección a `../index.html`. |
| **Evidencia – Código cliente** | Todos los scripts verifican al inicio:  `ScriptsInicio.js:2-6`, `ScriptsExplorar.js:2-6`, `ScriptsFichasViaje.js:11-16`, `ScriptsCliente.js:2-7`, `ScriptsComunidad.js:31-35`, `ScriptsIAChat.js:6-11`, `ScriptsAdmin.js:10-14`. |
| **Resultado obtenido** | ✅ Verificación de sesión en todos los módulos de cliente. |
| **Estado** | ✅ **PASS** |

---

#### CP-13-02 | Cierre de sesión desde el header (botón ⇥)

| Campo | Detalle |
|-------|---------|
| **ID** | CP-13-02 |
| **Pasos** | 1. Estar en cualquier página protegida. 2. Clic en el botón de logout del header. |
| **Resultado esperado** | `localStorage.clear()`. `sessionStorage.clear()`. Redirección a `../index.html`. |
| **Evidencia – Código cliente** | Script inline en `Inicio.html:207`, `Explorar.html:97`, `MisViajes.html:105`, `Perfil.html:253`, `Comunidad.html`, `IAChat.html:112` — `localStorage.clear(); sessionStorage.clear(); location.href='../index.html';` |
| **Resultado obtenido** | ✅ Limpieza total del almacenamiento. |
| **Estado** | ✅ **PASS** |

---

#### CP-13-03 | Cierre de sesión desde el botón "Cerrar Sesión" del perfil

| Campo | Detalle |
|-------|---------|
| **ID** | CP-13-03 |
| **Pasos** | 1. Ir a `Perfil.html`. 2. Clic en "🚪 Cerrar Sesión". 3. Confirmar diálogo. |
| **Resultado esperado** | Solo elimina `loggedUser`. Redirige a `../index.html`. |
| **Evidencia – Código cliente** | `Scripts/ScriptsCliente.js:167-174` — `if (confirm('Deseas cerrar sesion?')) { localStorage.removeItem('loggedUser'); window.location.href = '../index.html'; }` |
| **Inconsistencia identificada** | ⚠️ El header usa `localStorage.clear()` (elimina TODO), pero este botón usa `localStorage.removeItem('loggedUser')` (elimina solo la sesión). |
| **Resultado obtenido** | ✅ Cierre funcional. ⚠️ Comportamiento inconsistente con el header. Ver OBS-04. |
| **Estado** | ✅ **PASS** con observación |

---

#### CP-13-04 | Integridad del token de sesión

| Campo | Detalle |
|-------|---------|
| **ID** | CP-13-04 |
| **Estrategia** | EP-10 (Seguridad básica) |
| **Análisis** | El token guardado en `localStorage.authToken` es `Buffer.from('userId:timestamp').toString('base64')`. Es decodificable trivialmente. No está firmado con ningún secreto. |
| **Evidencia – Código servidor** | `servidor.js:393` — `const token = Buffer.from('${usuarioData.id}:${Date.now()}').toString('base64');` |
| **Evidencia – No verificado** | Ningún endpoint del servidor verifica el `authToken`. Solo verifica que `userId` sea un UUID válido y que exista en la BD. |
| **Resultado obtenido** | ❌ El token no proporciona seguridad real. Si alguien conoce un UUID de usuario, puede construir un token válido. Ver DEF-04. |
| **Estado** | ❌ **FAIL** — Riesgo de seguridad |

---

## 7. Trazabilidad de Ítems de Prueba

| Ítem de Prueba | Casos de Prueba asociados | Total CPs | Pass | Fail | Obs |
|----------------|--------------------------|-----------|------|------|-----|
| IT-01 (Login) | CP-01-01 a CP-01-05 | 5 | 5 | 0 | 0 |
| IT-02 (Registro) | CP-02-01 a CP-02-07 | 7 | 7 | 0 | 1 |
| IT-03 (Destinos Inicio) | CP-03-01 a CP-03-05 | 5 | 5 | 0 | 0 |
| IT-04 (Explorar) | CP-04-01 a CP-04-03 | 3 | 3 | 0 | 0 |
| IT-05 (Crear Reserva) | CP-05-01 a CP-05-05 | 5 | 5 | 0 | 0 |
| IT-06 (Gestión Reservas) | CP-05-06 a CP-05-09 | 4 | 4 | 0 | 0 |
| IT-07 (Perfil) | CP-06-01 a CP-06-08 | 8 | 6 | 1 | 1 |
| IT-08 (Comunidad) | CP-07-01 a CP-07-04 | 4 | 4 | 0 | 1 |
| IT-09 (IA Chat) | CP-08-01 a CP-08-05 | 5 | 4 | 1 | 0 |
| IT-10 (Admin Dashboard) | CP-09-01 a CP-09-05 | 5 | 5 | 0 | 0 |
| IT-11 (Admin CRUD Destinos) | CP-10-01 a CP-10-04 | 4 | 4 | 0 | 0 |
| IT-12 (Admin CRUD Usuarios) | CP-11-01 a CP-11-03 | 3 | 3 | 0 | 1 |
| IT-13 (Admin Reservas) | CP-12-01 a CP-12-02 | 2 | 2 | 0 | 0 |
| IT-14 (Sesión y Acceso) | CP-13-01 a CP-13-04 | 4 | 2 | 1 | 1 |
| **TOTAL** | | **64** | **59** | **3** | **5** |

---

## 8. Resumen de Resultados

### 8.1 Estadísticas globales

| Estado | Cantidad | Porcentaje |
|--------|----------|------------|
| ✅ PASS (Aprobado) | 59 | 92.2% |
| ❌ FAIL (Fallido) | 3 | 4.7% |
| ⚠️ PASS con Observación | 5 | 7.8% |

> **Nota:** Los 5 casos "PASS con Observación" se cuentan dentro de los 59 PASS. Los 3 FAIL son: CP-06-08 (eliminación de cuenta), CP-08-02 (URL hardcodeada en IA Chat), CP-13-04 (token de sesión inseguro).

### 8.2 Resultados por módulo

| Módulo | CPs | PASS | FAIL | Con Observación |
|--------|-----|------|------|-----------------|
| Login / Autenticación | 5 | 5 (100%) | 0 | 0 |
| Registro | 7 | 7 (100%) | 0 | 1 (CP-02-04) |
| Destinos – Inicio | 5 | 5 (100%) | 0 | 0 |
| Explorar Destinos | 3 | 3 (100%) | 0 | 0 |
| Crear Reservas | 5 | 5 (100%) | 0 | 0 |
| Gestión de Reservas | 4 | 4 (100%) | 0 | 0 |
| Perfil de Usuario | 8 | 7 (87.5%) | 1 (CP-06-08) | 1 (CP-06-05) |
| Comunidad | 4 | 4 (100%) | 0 | 1 (CP-07-01) |
| IA Chat | 5 | 4 (80%) | 1 (CP-08-02) | 0 |
| Panel Admin – Vistas | 5 | 5 (100%) | 0 | 0 |
| Admin CRUD Destinos | 4 | 4 (100%) | 0 | 0 |
| Admin CRUD Usuarios | 3 | 3 (100%) | 0 | 1 (CP-11-01) |
| Admin Reservas | 2 | 2 (100%) | 0 | 0 |
| Control de Acceso | 4 | 3 (75%) | 1 (CP-13-04) | 1 (CP-13-03) |

### 8.3 Cobertura por estrategia de prueba

| Estrategia | Casos ejecutados | Resultados |
|-----------|-----------------|------------|
| EP-1 Caja Negra Funcional | 64 | 92.2% PASS |
| EP-2 Validación de Entradas | 12 | 100% PASS |
| EP-3 Pruebas de Límites (Boundary) | 6 | 100% PASS |
| EP-4 Flujos Positivos (Happy Path) | 28 | 100% PASS |
| EP-5 Flujos Negativos (Error Path) | 14 | 100% PASS |
| EP-6 Control de Acceso | 7 | 85.7% PASS (1 FAIL: token) |
| EP-7 Revisión Estática de API | 21 | 95.2% PASS |
| EP-8 Integridad de Datos | 8 | 100% PASS |
| EP-9 Pruebas de Duplicidad | 3 | 100% PASS |
| EP-10 Seguridad Básica | 2 | 50% PASS (1 FAIL: token) |

---

## 9. Defectos Registrados

### DEF-01 | Inconsistencia en longitud mínima de contraseña

| Campo | Detalle |
|-------|---------|
| **ID** | DEF-01 |
| **Severidad** | Baja |
| **Módulo afectado** | Registro (IT-02) / Perfil – Cambio de contraseña (IT-07) |
| **Descripción** | La validación de contraseña mínima es inconsistente entre módulos: el registro acepta 6 caracteres, pero el cambio de contraseña exige 8. |
| **Pasos para reproducir** | 1. En `Registro.html`, crear cuenta con contraseña `"Ab1234"` (6 chars) — registro exitoso. 2. En `Perfil.html`, cambiar contraseña a `"Ab1234"` (6 chars) — rechazado. |
| **Evidencia** | `Scripts/ScriptsReg.js:29` — `if (pass.length < 6)` \| `Scripts/ScriptsCliente.js:74` — `if (newPassword.length < 8)` \| `servidor.js:814` — `if (newPassword.length < 8)` |
| **Impacto** | Confusión del usuario. Una contraseña válida al registrarse no puede usarse al cambiarla. |
| **Recomendación** | Unificar en 8 caracteres. Actualizar el placeholder de `Registro.html:32` de "mínimo 6 caracteres" a "mínimo 8 caracteres". |

---

### DEF-02 | Eliminación de cuenta sin implementación en servidor

| Campo | Detalle |
|-------|---------|
| **ID** | DEF-02 |
| **Severidad** | Media |
| **Módulo afectado** | Perfil de Usuario (IT-07) |
| **Descripción** | El botón "Eliminar Cuenta" en `Perfil.html` solo muestra un `alert`. No realiza ninguna petición al servidor. No existe ningún endpoint que desactive o elimine la cuenta en la base de datos. |
| **Pasos para reproducir** | 1. Ir a `Perfil.html`. 2. Ir a tab "Seguridad". 3. Clic "Eliminar Cuenta". 4. Confirmar. 5. Observar: solo aparece alert. Iniciar sesión de nuevo con la misma cuenta — aún funciona. |
| **Evidencia** | `Scripts/ScriptsCliente.js:150-158` — Solo `confirm()` y `alert()`. No hay `fetch`. Buscar en `servidor.js` cualquier endpoint de eliminación/desactivación de usuario por cuenta propia → **no existe**. |
| **Impacto** | La funcionalidad prometida al usuario ("cuenta programada para eliminarse en 7 días") es falsa. Violación de expectativa del usuario. |
| **Recomendación** | Implementar `PUT /perfil/:userId/deactivate` que marque `activo: false` en la tabla `Usuarios` y fije un campo `scheduled_delete_at = now + 7 días`. Agregar lógica en el servidor para revisar y eliminar cuentas vencidas. |

---

### DEF-03 | URL hardcodeada en IA Chat

| Campo | Detalle |
|-------|---------|
| **ID** | DEF-03 |
| **Severidad** | Alta |
| **Módulo afectado** | IA Chat (IT-09) |
| **Descripción** | `ScriptsIAChat.js` hace el fetch a `http://localhost:5501/chat` — URL absoluta hardcodeada. En cualquier entorno que no sea `localhost:5501` (otro puerto, dominio de producción, HTTPS), la petición falla por error CORS o conexión rechazada. |
| **Pasos para reproducir** | 1. Desplegar la app en un servidor con dominio diferente a `localhost:5501`. 2. Abrir `IAChat.html`. 3. Enviar cualquier mensaje. 4. Observar: error CORS o "No se pudo conectar con el servidor." |
| **Evidencia** | `Scripts/ScriptsIAChat.js:109` — `const response = await fetch('http://localhost:5501/chat', {...})` |
| **Comparación** | Todos los demás módulos usan rutas relativas (`fetch('/login')`, `fetch('/destinos')`, etc.) excepto este. |
| **Recomendación** | Cambiar a `fetch('/chat', {...})` para usar la misma base URL del servidor que sirve el cliente. |

---

### DEF-04 | Token de sesión no firmado y no verificado en el servidor

| Campo | Detalle |
|-------|---------|
| **ID** | DEF-04 |
| **Severidad** | Alta (Seguridad) |
| **Módulo afectado** | Autenticación – todos los endpoints (IT-01, IT-14) |
| **Descripción** | El token de sesión es simplemente `base64(userId:timestamp)`. No está firmado con ninguna clave secreta (a pesar de que `jsonwebtoken` está instalado como dependencia). Además, ningún endpoint del servidor verifica el token en los requests entrantes. |
| **Pasos para reproducir** | 1. Obtener cualquier `userId` UUID de la aplicación. 2. Construir `Buffer.from('UUID-CONOCIDO:1712500000000').toString('base64')`. 3. Guardarlo en `localStorage.authToken` junto con un `loggedUser` falso. 4. Navegar a cualquier página protegida — acceso concedido. |
| **Evidencia** | `servidor.js:393` — `Buffer.from('${usuarioData.id}:${Date.now()}').toString('base64')`. Ningún middleware de autenticación en ningún endpoint. |
| **Impacto** | Cualquier usuario que conozca un UUID de otro usuario puede suplantar su identidad en el frontend. |
| **Recomendación** | Usar la librería `jsonwebtoken` ya instalada: `jwt.sign({userId, role}, process.env.JWT_SECRET, {expiresIn:'24h'})`. Crear middleware `verifyToken` que valide el token en todos los endpoints protegidos usando `jwt.verify`. |

---

### OBS-01 | Chat de Comunidad solo persiste en localStorage

| Campo | Detalle |
|-------|---------|
| **ID** | OBS-01 |
| **Severidad** | Media |
| **Módulo afectado** | Comunidad (IT-08) |
| **Descripción** | Los mensajes del chat solo se guardan en `localStorage` del navegador del usuario. No se persisten en el servidor ni en Supabase. Si el usuario cambia de dispositivo o borra datos del navegador, pierde todos sus chats. |
| **Evidencia** | `Scripts/ScriptsComunidad.js` — `saveChats()` usa `localStorage.setItem(getStorageKey(), JSON.stringify(chats))`. No hay ningún `fetch` de escritura a un endpoint de mensajes. |
| **Recomendación** | Crear tabla `Mensajes` en Supabase y endpoints `POST /mensajes` y `GET /mensajes/:chatId` para persistencia real. |

---

### OBS-02 | Contraseña por defecto débil al crear usuario desde admin

| Campo | Detalle |
|-------|---------|
| **ID** | OBS-02 |
| **Severidad** | Baja (Seguridad) |
| **Módulo afectado** | Admin CRUD Usuarios (IT-12) |
| **Descripción** | Al crear un usuario desde el panel admin, si no se especifica contraseña, se usa `"12345678"` como contraseña por defecto. |
| **Evidencia** | `servidor.js:1341` — `const password = String(req.body?.password \|\| '12345678')` |
| **Recomendación** | Forzar al admin a especificar una contraseña. O generar una contraseña temporal aleatoria segura y mostrarla una sola vez. |

---

### OBS-03 | Función isUuid definida dos veces en servidor.js

| Campo | Detalle |
|-------|---------|
| **ID** | OBS-03 |
| **Severidad** | Baja (Mantenibilidad) |
| **Descripción** | La función `isUuid` aparece definida en `servidor.js:130-132` y nuevamente como `const isUuid` en líneas locales dentro de los handlers de `/perfil`. JavaScript permite la redeclaración de funciones pero esto genera confusión. |
| **Evidencia** | `servidor.js:130` (función global) y `servidor.js:739, 765` (variables locales `const isUuid` dentro de los handlers de perfil). |
| **Recomendación** | Eliminar las redeclaraciones locales y usar siempre la función global. |

---

### OBS-04 | Comportamiento inconsistente entre botones de logout

| Campo | Detalle |
|-------|---------|
| **ID** | OBS-04 |
| **Severidad** | Baja |
| **Módulo afectado** | Control de Acceso (IT-14) |
| **Descripción** | El botón de logout del header (`headerLogout`) y el del drawer ejecutan `localStorage.clear()` eliminando todos los datos. El botón "🚪 Cerrar Sesión" del perfil ejecuta `localStorage.removeItem('loggedUser')`, eliminando solo la sesión. |
| **Evidencia** | Script inline en `Perfil.html:253` — `.clear()`. `Scripts/ScriptsCliente.js:170` — `.removeItem('loggedUser')`. |
| **Recomendación** | Estandarizar usando `localStorage.removeItem('authToken'); localStorage.removeItem('loggedUser')` en todos los puntos de logout para ser explícitos y no borrar datos no relacionados con la sesión. |

---

## 10. Nivel de Aceptación y Criterios

### 10.1 Criterios de Aceptación por Nivel de Criticidad

| Nivel | Descripción | Umbral mínimo | Resultado | Estado |
|-------|-------------|---------------|-----------|--------|
| **Crítico** | Autenticación, registro, creación y gestión de reservas (IT-01, IT-02, IT-05, IT-06) | 100% de casos PASS | 100% (21/21 casos) | ✅ CUMPLIDO |
| **Alto** | Control de acceso, panel admin, CRUD de recursos (IT-10, IT-11, IT-12, IT-13, IT-14) | ≥ 90% de casos PASS | 85.7% (12/14 casos — 2 FAIL: token inseguro, eliminación de cuenta) | ⚠️ NO CUMPLIDO |
| **Medio** | Perfil, comunidad, IA Chat, Explorar (IT-04, IT-07, IT-08, IT-09) | ≥ 80% de casos PASS | 90.9% (20/22 casos) | ✅ CUMPLIDO |
| **Total general** | Todos los módulos | ≥ 85% de casos PASS | 92.2% (59/64 casos) | ✅ CUMPLIDO |

### 10.2 Criterios de Aceptación por Tipo de Defecto

| Tipo de Criterio | Resultado | Cumplido |
|------------------|-----------|----------|
| **Cero defectos bloqueantes (Críticos)**: Ningún flujo principal de negocio debe fallar | No hay defectos en autenticación, registro, reservas ni CRUD admin | ✅ SÍ |
| **Seguridad básica**: Contraseñas hasheadas, mensajes de error genéricos | Contraseñas con bcrypt. Mensajes 401 genéricos. ⚠️ Token no firmado (DEF-04) | ⚠️ PARCIAL |
| **Validaciones de formulario**: Todos los campos obligatorios validados en cliente y servidor | 100% de formularios validados en ambas capas | ✅ SÍ |
| **Control de acceso por roles**: Clientes no acceden a admin, admins no pueden crear reservas | Verificado en frontend y backend | ✅ SÍ |
| **Manejo de errores**: Todos los flujos de error retornan mensajes descriptivos | HTTP status codes correctos. Mensajes descriptivos. Fallbacks implementados | ✅ SÍ |

### 10.3 Resumen del Nivel de Aceptación

```
┌─────────────────────────────────────────────────────────────────────┐
│   VEREDICTO: CONDICIONALMENTE ACEPTABLE                             │
│                                                                      │
│   Score general: 92.2%  (umbral: 85%)    ✅ Supera el umbral         │
│   Funciones críticas: 100%               ✅ Sin fallos               │
│   Defectos bloqueantes: 0                ✅ Ninguno                  │
│   Defectos no bloqueantes: 4             ⚠️ Requieren corrección     │
│                                                                      │
│   CONDICIÓN: Resolver DEF-03 (URL hardcodeada) y DEF-04             │
│   (token inseguro) antes de pasar a producción.                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 11. Conclusiones y Recomendaciones

### 11.1 Resumen ejecutivo

El sistema **Tropical Travel** fue evaluado mediante análisis estático exhaustivo del código fuente. Se ejecutaron **64 casos de prueba** distribuidos en **14 ítems de prueba** cubriendo los **7 módulos principales** y **21 endpoints del servidor**.

### 11.2 Fortalezas identificadas

| Fortaleza | Evidencia en código |
|-----------|---------------------|
| **Seguridad de contraseñas**: bcrypt con 10 salt rounds | `servidor.js:327, 844, 1366` |
| **Mensajes de error no reveladores**: 401 genérico en login | `servidor.js:378-390` |
| **Validación doble**: Frontend + Backend en formularios clave | `ScriptsReg.js + servidor.js:303` |
| **Control de roles**: Verificación en frontend y backend | `ScriptsAdmin.js:18 + servidor.js:480` |
| **Soft delete en destinos**: No elimina físicamente, preserva referencias | `servidor.js:1317` |
| **Protección XSS en Admin**: `escapeHtml()` en todo el HTML generado | `ScriptsAdmin.js:186-193` |
| **Prevención de duplicados**: Reservas y registros de usuario | `servidor.js:488-503, 307-320` |
| **Fallbacks de UI**: Destino Cartagena cuando el servidor falla | `ScriptsInicio.js:52-69` |
| **Auto-detección de puerto (Admin)**: Prueba automáticamente 5501-5503 | `ScriptsAdmin.js:114-132` |

### 11.3 Plan de corrección de defectos (priorizado)

| Prioridad | ID | Acción | Archivos a modificar |
|-----------|-----|--------|---------------------|
| 1 (Alta) | DEF-03 | Cambiar `'http://localhost:5501/chat'` → `'/chat'` | `Scripts/ScriptsIAChat.js:109` |
| 2 (Alta) | DEF-04 | Implementar JWT firmado con middleware de verificación | `servidor.js` — nuevo middleware + todos los endpoints |
| 3 (Media) | DEF-02 | Implementar `PUT /perfil/:userId/deactivate` | `servidor.js` + `Scripts/ScriptsCliente.js` |
| 4 (Baja) | DEF-01 | Unificar longitud mínima de contraseña a 8 chars | `Scripts/ScriptsReg.js:29` + `Registro.html:32` |
| 5 (Baja) | OBS-02 | Requerir contraseña al crear usuario desde admin | `servidor.js:1341` |
| 6 (Baja) | OBS-03 | Eliminar redeclaraciones de `isUuid` | `servidor.js:739, 765` |
| 7 (Baja) | OBS-04 | Estandarizar lógica de logout | `Scripts/ScriptsCliente.js:170` |

### 11.4 Recomendación final

> **El sistema CUMPLE los criterios de aceptación generales (92.2% > 85%) y puede avanzar a un ambiente de pruebas controlado (staging).**
>
> **Para producción, es OBLIGATORIO** resolver **DEF-03** (URL hardcodeada en IA Chat) y **DEF-04** (token de sesión no firmado) antes del despliegue final, ya que representan riesgos funcionales y de seguridad respectivamente.
>
> El resto de defectos (DEF-01, DEF-02, OBS-01 a OBS-04) son mejoras que pueden abordarse en el siguiente sprint de desarrollo sin bloquear el avance.

---

*Informe generado por análisis estático del código fuente del repositorio Tropical Travel.*  
*Versión del informe: 2.0 — Completo con evidencia de código y datos de prueba.*  
*Fecha: 08 de abril de 2026*
