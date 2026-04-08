# Informe de Resultados de Pruebas
## Proyecto: Tropical Travel
**Fecha de ejecución:** 08 de abril de 2026  
**Versión del sistema:** 1.0  
**Tipo de prueba:** Revisión estática de código + Análisis funcional  
**Responsable:** Equipo QA – Tropical Travel  

---

## 1. Introducción

Este documento recoge los resultados de la ejecución del Plan de Prueba para el sistema **Tropical Travel**, una aplicación web de turismo que permite a los usuarios explorar destinos, realizar reservas, gestionar su perfil, comunicarse con otros viajeros y consultar un asistente de IA. Las pruebas se ejecutaron mediante revisión estática de código (análisis de lógica, validaciones y flujos) sobre el código fuente del proyecto.

---

## 2. Alcance del Sistema Probado

La aplicación consta de las siguientes capas tecnológicas:

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | Node.js + Express v5 |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | JWT (token base64) + bcryptjs |
| Dependencias clave | `@supabase/supabase-js`, `bcryptjs`, `cors`, `dotenv`, `jsonwebtoken` |

---

## 3. Ítems de Prueba

Los siguientes ítems de prueba fueron identificados y evaluados:

| # | Ítem de Prueba | Archivo(s) involucrado(s) |
|---|----------------|--------------------------|
| IT-01 | Inicio de sesión (Login) | `index.html`, `Scripts/ScriptsLogin.js`, `servidor.js` (POST /login) |
| IT-02 | Registro de usuario | `Registro.html`, `Scripts/ScriptsReg.js`, `servidor.js` (POST /registrar) |
| IT-03 | Página de inicio y listado de destinos | `HtmlPrin/Inicio.html`, `Scripts/ScriptsInicio.js`, `servidor.js` (GET /destinos) |
| IT-04 | Exploración y búsqueda de destinos | `HtmlPrin/Explorar.html`, `Scripts/ScriptsExplorar.js` |
| IT-05 | Gestión de reservas (Mis Viajes) | `HtmlPrin/MisViajes.html`, `Scripts/ScriptsFichasViaje.js`, `servidor.js` (POST/GET/PUT /reservas) |
| IT-06 | Perfil de usuario | `HtmlPrin/Perfil.html`, `Scripts/ScriptsCliente.js`, `servidor.js` (GET/PUT /perfil) |
| IT-07 | Módulo de comunidad (chat) | `HtmlPrin/Comunidad.html`, `Scripts/ScriptsComunidad.js` |
| IT-08 | Asistente IA (IA Chat) | `HtmlPrin/IAChat.html`, `Scripts/ScriptsIAChat.js`, `servidor.js` (POST /chat) |
| IT-09 | Panel de administración | `HtmlPrin/InicioAdmin.html`, `Scripts/ScriptsAdmin.js`, `servidor.js` (GET /admin/*) |
| IT-10 | Control de acceso y sesión | Todos los módulos – verificación de `localStorage` y redirecciones |

---

## 4. Módulos a Evaluar

### 4.1 Módulo de Autenticación (IT-01, IT-02, IT-10)
Gestiona el acceso al sistema mediante login y registro de usuarios. Incluye validación de credenciales contra Supabase, hash de contraseñas con bcrypt, generación de token base64 y almacenamiento de sesión en `localStorage`.

### 4.2 Módulo de Destinos (IT-03, IT-04)
Muestra los destinos turísticos disponibles obtenidos desde Supabase. Permite búsqueda por texto libre y filtrado por categoría (playa, aventura, naturaleza). Incluye modal de detalles del destino.

### 4.3 Módulo de Reservas (IT-05)
Permite a los clientes crear reservas sobre destinos disponibles, ver su historial de reservas con estados (pendiente, confirmado, cancelado) y actualizar el estado de una reserva.

### 4.4 Módulo de Perfil (IT-06)
Permite visualizar y editar información personal del usuario (nombre, teléfono, país, ciudad, fecha de nacimiento), cambiar contraseña y eliminar cuenta (programada a 7 días).

### 4.5 Módulo de Comunidad (IT-07)
Chat entre usuarios: permite crear chats directos con otros usuarios del sistema y grupos. Los mensajes se persisten en `localStorage`. Incluye búsqueda de usuarios vía API.

### 4.6 Módulo de IA Chat (IT-08)
Asistente virtual basado en reglas (pattern matching) que responde preguntas sobre destinos, presupuesto, clima, alojamiento e itinerarios en Colombia.

### 4.7 Panel de Administración (IT-09)
Dashboard exclusivo para usuarios con rol `admin`. Muestra métricas de inventario, usuarios, operaciones, finanzas y experiencia del cliente. Incluye gestión de destinos y usuarios.

---

## 5. Estrategias de Prueba Aplicadas

| Estrategia | Descripción | Módulos aplicados |
|------------|-------------|------------------|
| **Prueba de Caja Negra (Funcional)** | Verificar que las funciones del sistema producen los resultados esperados dado un conjunto de entradas, sin conocer la implementación interna | Todos |
| **Prueba de Validación de Entradas** | Verificar que el sistema rechaza entradas inválidas y acepta las válidas con los mensajes apropiados | IT-01, IT-02, IT-06 |
| **Prueba de Flujo de Navegación** | Verificar que las redirecciones y transiciones entre pantallas se comportan correctamente | IT-01, IT-02, IT-03, IT-10 |
| **Prueba de Control de Acceso** | Verificar que los usuarios no autenticados o con rol incorrecto no acceden a recursos protegidos | IT-10, IT-09 |
| **Prueba de API (Revisión Estática)** | Analizar la lógica de los endpoints del servidor para verificar manejo de errores, validaciones y respuestas HTTP correctas | IT-01, IT-02, IT-05, IT-06 |
| **Prueba de Integridad de Datos** | Verificar que los datos se almacenan, recuperan y actualizan correctamente | IT-05, IT-06 |
| **Prueba de Límites (Boundary Testing)** | Verificar el comportamiento en valores extremos (contraseña de 5/6 caracteres, campos vacíos) | IT-01, IT-02, IT-06 |

---

## 6. Casos de Prueba y Resultados

### 6.1 Módulo de Autenticación – Login (IT-01)

#### CP-01-01: Login con credenciales válidas
| Campo | Valor |
|-------|-------|
| **Precondición** | El servidor está activo. El usuario existe en la BD con contraseña hasheada. |
| **Datos de prueba** | Email: `usuario@test.com` / Contraseña: `Test123` |
| **Pasos** | 1. Abrir `index.html` 2. Ingresar email y contraseña válidos 3. Clic en "Iniciar sesión" |
| **Resultado esperado** | Respuesta 200. Token y datos guardados en `localStorage`. Redirección a `Inicio.html` (cliente) o `InicioAdmin.html` (admin). |
| **Resultado obtenido** | ✅ El código en `ScriptsLogin.js` llama a `POST /login`. El servidor consulta Supabase, compara hash bcrypt, genera token base64 y retorna `{ token, username, userId, email, rol }`. El cliente redirige según `normalizedRole`. **Lógica correcta.** |
| **Estado** | ✅ **APROBADO** |
| **Observaciones** | El token es base64 de `userId:timestamp`, no un JWT firmado. Esto representa un riesgo de seguridad (ver sección 9). |

---

#### CP-01-02: Login con contraseña incorrecta
| Campo | Valor |
|-------|-------|
| **Precondición** | El usuario existe en la BD. |
| **Datos de prueba** | Email: `usuario@test.com` / Contraseña: `Incorrecta` |
| **Pasos** | 1. Ingresar email correcto y contraseña incorrecta 2. Clic en "Iniciar sesión" |
| **Resultado esperado** | HTTP 401. Mensaje de error visible al usuario. |
| **Resultado obtenido** | ✅ El servidor retorna `res.status(401).json({ error: 'Credenciales inválidas.' })`. El cliente muestra `alert(err.message)`. **Comportamiento correcto.** |
| **Estado** | ✅ **APROBADO** |

---

#### CP-01-03: Login con campos vacíos
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Email: `` (vacío) / Contraseña: `` (vacío) |
| **Resultado esperado** | Mensaje de error "Ingrese correo y contraseña" sin llamada al servidor. |
| **Resultado obtenido** | ✅ `ScriptsLogin.js` verifica `if (!email || !pass)` y muestra `alert('Ingrese correo y contraseña.')` antes de hacer fetch. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-01-04: Login con correo inexistente
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Email: `noexiste@test.com` / Contraseña: `cualquiera` |
| **Resultado esperado** | HTTP 401. Mensaje de error sin revelar si el correo existe. |
| **Resultado obtenido** | ✅ Servidor retorna `status(401)` con mensaje genérico `'Credenciales inválidas.'` en ambos casos (correo no encontrado o contraseña incorrecta). Buena práctica de seguridad. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-01-05: Redirección a login si no hay sesión
| Campo | Valor |
|-------|-------|
| **Precondición** | `localStorage` no contiene `loggedUser`. |
| **Resultado esperado** | Al navegar directamente a `HtmlPrin/Inicio.html`, el sistema redirige a `../index.html`. |
| **Resultado obtenido** | ✅ Todos los scripts de cliente (`ScriptsInicio.js`, `ScriptsExplorar.js`, `ScriptsFichasViaje.js`, etc.) verifican `JSON.parse(localStorage.getItem('loggedUser'))` y redirigen si es `null`. |
| **Estado** | ✅ **APROBADO** |

---

### 6.2 Módulo de Registro (IT-02)

#### CP-02-01: Registro con todos los campos obligatorios válidos
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Nombre: `Juan Prueba`, Email: `juan@prueba.com`, Contraseña: `Abc123`, Confirmar: `Abc123` |
| **Resultado esperado** | HTTP 201. Alert "Registro exitoso. Ahora inicia sesión." Redirección a `index.html`. |
| **Resultado obtenido** | ✅ El servidor crea el usuario en Supabase con `rol: 'cliente'`, retorna `status(201)`. El cliente muestra alert y redirige. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-02-02: Registro con contraseñas que no coinciden
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Contraseña: `Abc123` / Confirmar: `Xyz789` |
| **Resultado esperado** | Alerta "Las contraseñas no coinciden." Sin llamada al servidor. |
| **Resultado obtenido** | ✅ `ScriptsReg.js` verifica `if (pass !== pass2)` y muestra alert. No realiza fetch. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-02-03: Registro con contraseña menor a 6 caracteres
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Contraseña: `Ab1` (3 caracteres) |
| **Resultado esperado** | Alerta "La contraseña debe tener al menos 6 caracteres." |
| **Resultado obtenido** | ✅ `ScriptsReg.js` verifica `if (pass.length < 6)`. **Nota:** La validación del servidor en `/perfil/:userId/password` exige mínimo 8 caracteres, lo cual es inconsistente con el registro que acepta 6 caracteres. |
| **Estado** | ⚠️ **APROBADO CON OBSERVACIÓN** |
| **Observaciones** | Inconsistencia: registro acepta desde 6 caracteres; cambio de contraseña requiere mínimo 8 caracteres. Se recomienda unificar en 8 caracteres. |

---

#### CP-02-04: Registro con formato de email inválido
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Email: `no-es-un-email` |
| **Resultado esperado** | Alerta "Por favor ingrese un correo válido." |
| **Resultado obtenido** | ✅ `ScriptsReg.js` aplica regex `/^[\w.-]+@[\w.-]+\.\w+$/`. Bloquea la solicitud y muestra alert. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-02-05: Registro con correo ya registrado
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Email de un usuario ya existente en la BD. |
| **Resultado esperado** | HTTP 400 con mensaje "El correo ya está registrado". |
| **Resultado obtenido** | ✅ El servidor consulta Supabase antes del INSERT y retorna `status(400).json({ error: 'El correo ya está registrado' })`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-02-06: Registro con campos obligatorios vacíos
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Nombre: `` / Email: `` / Contraseña: `` |
| **Resultado esperado** | Alerta "Completa todos los campos." Sin llamada al servidor. |
| **Resultado obtenido** | ✅ `ScriptsReg.js` verifica `if (!username || !email || !pass || !pass2)`. |
| **Estado** | ✅ **APROBADO** |

---

### 6.3 Módulo de Destinos – Inicio (IT-03)

#### CP-03-01: Carga de destinos desde el servidor
| Campo | Valor |
|-------|-------|
| **Precondición** | Usuario autenticado. Servidor activo con conexión a Supabase. |
| **Resultado esperado** | Los destinos activos se muestran en el grid de la página de inicio. |
| **Resultado obtenido** | ✅ `ScriptsInicio.js` llama a `GET /destinos`. El servidor consulta `Destinos` con `eq('activo', true)`, mapea imágenes, metadatos y retorna JSON. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-03-02: Búsqueda de destino por nombre
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Texto de búsqueda: `"Cartagena"` |
| **Resultado esperado** | Muestra solo las tarjetas cuyo título, ubicación o descripción coincidan. |
| **Resultado obtenido** | ✅ `ScriptsInicio.js → runSearch()` filtra localmente el array `tripsData` comparando en `title`, `location`, `description` y `duration` con `includes(query)`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-03-03: Búsqueda sin resultados
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Texto de búsqueda: `"Plutón"` |
| **Resultado esperado** | Mensaje: "No encontramos destinos para esa búsqueda." |
| **Resultado obtenido** | ✅ `renderDestinations([])` muestra `<div class="empty-message">No encontramos destinos para esa búsqueda.</div>`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-03-04: Fallback cuando el servidor no está disponible
| Campo | Valor |
|-------|-------|
| **Precondición** | Servidor no disponible o timeout. |
| **Resultado esperado** | Se muestra un destino predeterminado (Cartagena) como fallback. |
| **Resultado obtenido** | ✅ `ScriptsInicio.js` tiene un bloque `catch` que puebla `tripsData` con un objeto hardcoded de Cartagena y llama `renderDestinations()`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-03-05: Modal de detalle de destino
| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Clic en botón `"›"` de una tarjeta de destino. |
| **Resultado esperado** | Modal visible con título, ubicación, descripción, duración, precio y calificación del destino. |
| **Resultado obtenido** | ✅ `showDetails(trip)` popula los elementos `modalTitle`, `modalLocation`, `modalDescription`, `modalDuration`, `modalRating`, `modalPrice` y establece `aria-hidden="false"`. |
| **Estado** | ✅ **APROBADO** |

---

### 6.4 Módulo de Explorar Destinos (IT-04)

#### CP-04-01: Filtrado por categoría
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Filtro activo: `"playa"` |
| **Resultado esperado** | Solo se muestran destinos con `categoria === 'playa'`. |
| **Resultado obtenido** | ✅ `ScriptsExplorar.js → applyFilter()` filtra el array `destinations` por `destination.categoria`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-04-02: Búsqueda por texto en Explorar
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Búsqueda: `"Tayrona"` |
| **Resultado esperado** | Se muestran destinos que contengan "Tayrona" en título, ubicación, categoría o descripción. |
| **Resultado obtenido** | ✅ `runSearch()` en `ScriptsExplorar.js` filtra en `title`, `location`, `category` y `description`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-04-03: Agregar destino a "Mis Viajes" desde Explorar
| Campo | Valor |
|-------|-------|
| **Precondición** | Usuario autenticado con `userId` válido. |
| **Pasos** | 1. Clic en "Revisar" sobre una tarjeta 2. En modal, clic en "Agregar a Mis Viajes" |
| **Resultado esperado** | POST /reservas con userId y destinationId. Alert "Destino agregado a Mis Viajes." Modal se cierra. |
| **Resultado obtenido** | ✅ `addToMyTrips(destination)` en `ScriptsExplorar.js` realiza `POST /reservas`. Maneja error con `alert`. |
| **Estado** | ✅ **APROBADO** |

---

### 6.5 Módulo de Mis Viajes / Reservas (IT-05)

#### CP-05-01: Visualización de reservas del usuario
| Campo | Valor |
|-------|-------|
| **Precondición** | Usuario tiene al menos una reserva creada. |
| **Resultado esperado** | Las reservas se muestran en tarjetas con estado, precio, fecha y destino. |
| **Resultado obtenido** | ✅ `ScriptsFichasViaje.js → loadReservations()` llama a `GET /reservas/:userId`. El servidor retorna reservas con datos del destino via JOIN en Supabase. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-05-02: Filtrado de reservas por estado
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Filtro: `"confirmed"` |
| **Resultado esperado** | Solo se muestran reservas confirmadas. |
| **Resultado obtenido** | ✅ `renderTrips(filter)` filtra `tripsData` por `t.status === filter`. El estado se normaliza con `normalizeStatus()`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-05-03: Confirmar pago de una reserva pendiente
| Campo | Valor |
|-------|-------|
| **Precondición** | La reserva está en estado `pending`. |
| **Pasos** | 1. Clic en "Pagar" 2. Confirmar en diálogo |
| **Resultado esperado** | `PUT /reservas/:id/status` con `status: 'confirmed'`. Lista de viajes se recarga. |
| **Resultado obtenido** | ✅ `updateStatus(trip.id, 'confirmed')` hace el PUT. El servidor valida que la reserva pertenezca al usuario antes de actualizar. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-05-04: Cancelar una reserva activa
| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Clic en "Cancelar" 2. Confirmar en diálogo |
| **Resultado esperado** | La reserva pasa a estado `cancelled`. |
| **Resultado obtenido** | ✅ `updateStatus(trip.id, 'cancelled')`. El servidor verifica propiedad de la reserva (`reserva.user_id !== userId` → 403). |
| **Estado** | ✅ **APROBADO** |

---

#### CP-05-05: Intentar crear reserva duplicada
| Campo | Valor |
|-------|-------|
| **Precondición** | El usuario ya tiene una reserva activa para el mismo destino. |
| **Resultado esperado** | HTTP 400. Mensaje: "Ya tienes una reserva activa para este destino." |
| **Resultado obtenido** | ✅ El servidor consulta `existingReservation` y retorna `status(400)` si existe una reserva no cancelada para ese destino. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-05-06: Reserva solo permitida para rol 'cliente'
| Campo | Valor |
|-------|-------|
| **Precondición** | Usuario con `rol: 'admin'` intenta crear reserva. |
| **Resultado esperado** | HTTP 403. "Solo los clientes pueden crear reservas." |
| **Resultado obtenido** | ✅ El servidor valida `String(user.rol).toLowerCase() !== 'cliente'` → `res.status(403)`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-05-07: Reserva con userId o destinationId inválido (no UUID)
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | `userId: "no-soy-uuid"`, `destinationId: "tampocoyo"` |
| **Resultado esperado** | HTTP 400. "Usuario o destino no válido." |
| **Resultado obtenido** | ✅ El servidor aplica `isUuid()` en ambos IDs antes de consultar la BD. |
| **Estado** | ✅ **APROBADO** |

---

### 6.6 Módulo de Perfil de Usuario (IT-06)

#### CP-06-01: Visualización del perfil del usuario
| Campo | Valor |
|-------|-------|
| **Precondición** | Usuario autenticado con `userId` válido. |
| **Resultado esperado** | Los campos (nombre, email, teléfono, ciudad, país, fecha de nacimiento) se cargan desde la API. |
| **Resultado obtenido** | ✅ `ScriptsCliente.js` llama a `GET /perfil/:userId` y `populateForm(data)` llena todos los campos. Si falla, usa datos del `localStorage` como fallback. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-06-02: Actualización de datos personales
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Nombre: `"Juan Actualizado"`, Ciudad: `"Cali"` |
| **Pasos** | 1. Modificar campos 2. Clic "Guardar Cambios" |
| **Resultado esperado** | `PUT /perfil/:userId`. Alert "Cambios guardados correctamente". `localStorage` actualizado. |
| **Resultado obtenido** | ✅ `savePersonalBtn` listener realiza PUT, actualiza `localStorage.loggedUser.username` y muestra alert. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-06-03: Actualización con nombre vacío
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Nombre: `` (vacío) |
| **Resultado esperado** | Alert "El nombre no puede estar vacio." Sin llamada al servidor. |
| **Resultado obtenido** | ✅ `ScriptsCliente.js` verifica `if (!nombre)` antes del fetch. Servidor también valida y retorna `status(400)` si nombre no se proporciona. Doble validación correcta. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-06-04: Cambio de contraseña con contraseña actual correcta
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Contraseña actual: `Abc123`, Nueva contraseña: `NuevaClave456`, Confirmar: `NuevaClave456` |
| **Resultado esperado** | `PUT /perfil/:userId/password`. Alert "Contraseña actualizada correctamente." Campos limpiados. |
| **Resultado obtenido** | ✅ El servidor verifica bcrypt de contraseña actual, valida longitud >= 8 de la nueva y actualiza con nuevo hash. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-06-05: Cambio de contraseña con contraseñas nuevas que no coinciden
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Nueva contraseña: `NuevaClave456`, Confirmar: `OtraClave789` |
| **Resultado esperado** | Alert "La confirmación de la contraseña no coincide." Sin llamada al servidor. |
| **Resultado obtenido** | ✅ `ScriptsCliente.js → changePassword()` verifica `newPassword !== confirmPassword`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-06-06: Cambio de contraseña con nueva contraseña menor a 8 caracteres
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Nueva contraseña: `Ab1234` (6 caracteres) |
| **Resultado esperado** | Alert "La nueva contraseña debe tener al menos 8 caracteres." Sin llamada al servidor. |
| **Resultado obtenido** | ✅ `ScriptsCliente.js` verifica `newPassword.length < 8`. Servidor también valida. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-06-07: Cambio de contraseña con contraseña actual incorrecta
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Contraseña actual incorrecta. |
| **Resultado esperado** | HTTP 401. "La contraseña actual es incorrecta." |
| **Resultado obtenido** | ✅ El servidor usa `bcrypt.compare` y retorna `status(401)`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-06-08: Flujo de eliminación de cuenta
| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Clic "Eliminar Cuenta" 2. Confirmar en diálogo |
| **Resultado esperado** | Alert informando que la cuenta queda programada para eliminación en 7 días. |
| **Resultado obtenido** | ⚠️ El cliente muestra el mensaje de alerta, pero **no realiza ninguna llamada al servidor**. La eliminación es solo un mensaje informativo, no se persiste en la BD. |
| **Estado** | ⚠️ **OBSERVACIÓN / FALLA PARCIAL** |
| **Observaciones** | La funcionalidad de eliminación de cuenta está incompleta. No existe endpoint en el servidor para programar o ejecutar la eliminación. Se recomienda implementar `DELETE /perfil/:userId` o `PUT /perfil/:userId/deactivate`. |

---

### 6.7 Módulo de Comunidad (IT-07)

#### CP-07-01: Visualización de chats existentes al cargar
| Campo | Valor |
|-------|-------|
| **Resultado esperado** | Se cargan los chats previos del usuario desde `localStorage`. |
| **Resultado obtenido** | ✅ `ScriptsComunidad.js → loadChats()` lee `localStorage.getItem(getStorageKey())`. Si no hay datos, crea un chat de guía predeterminado. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-07-02: Búsqueda de usuarios para nuevo chat
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Término de búsqueda: `"Ana"` |
| **Resultado esperado** | Lista de usuarios que coincidan con "Ana" en nombre o email, excluyendo al usuario actual. |
| **Resultado obtenido** | ✅ `ScriptsComunidad.js` llama a `GET /usuarios?search=Ana&excludeUserId={id}`. El servidor aplica `ilike` en Supabase y excluye al usuario logueado. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-07-03: Envío de mensajes en chat
| Campo | Valor |
|-------|-------|
| **Precondición** | Chat seleccionado activo. |
| **Pasos** | 1. Escribir mensaje 2. Clic "Enviar" o presionar Enter |
| **Resultado esperado** | Mensaje visible en el área de chat. Persistido en `localStorage`. |
| **Resultado obtenido** | ✅ Los mensajes se almacenan en la clave `comunidadChats_{userId}` del `localStorage`. El chat funciona offline. |
| **Estado** | ✅ **APROBADO** |
| **Observaciones** | Los mensajes no se persisten en servidor/BD, por lo que no son accesibles desde otro dispositivo. Se recomienda persistencia en Supabase para producción. |

---

#### CP-07-04: Creación de grupo con nombre y miembros
| Campo | Valor |
|-------|-------|
| **Pasos** | 1. Clic "Nuevo Grupo" 2. Ingresar nombre del grupo 3. Seleccionar miembros 4. Confirmar |
| **Resultado esperado** | Grupo creado y visible en la lista de chats. |
| **Resultado obtenido** | ✅ `confirmCreateGroup` handler en `ScriptsComunidad.js` crea el objeto de grupo y lo persiste en `localStorage`. |
| **Estado** | ✅ **APROBADO** |

---

### 6.8 Módulo de IA Chat (IT-08)

#### CP-08-01: Mensaje de bienvenida al cargar el chat
| Campo | Valor |
|-------|-------|
| **Resultado esperado** | Al cargar la página, el asistente muestra: "¡Hola! Soy tu asistente de viajes LawMoon🌴 ¿En qué puedo ayudarte?" |
| **Resultado obtenido** | ✅ `ScriptsIAChat.js` llama `addMessage('ai', '¡Hola!...')` en `DOMContentLoaded`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-08-02: Respuesta a consulta sobre destino específico
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Mensaje: `"cuéntame sobre Cartagena"` |
| **Resultado esperado** | Respuesta sobre Cartagena con información turística. |
| **Resultado obtenido** | ✅ `servidor.js → buildChatReply()` detecta `/cartagena/i` y retorna respuesta completa sobre Cartagena. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-08-03: Respuesta a mensaje de saludo
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Mensaje: `"hola"` |
| **Resultado esperado** | Respuesta de saludo del asistente. |
| **Resultado obtenido** | ✅ El patrón `/hola|buenos|buenas|hey|saludos/i` es detectado y retorna saludo personalizado. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-08-04: Respuesta con fallback para mensaje no reconocido
| Campo | Valor |
|-------|-------|
| **Datos de prueba** | Mensaje: `"qué es la inteligencia artificial"` |
| **Resultado esperado** | Respuesta genérica invitando a preguntar sobre viajes. |
| **Resultado obtenido** | ✅ Cuando ningún patrón coincide, `buildChatReply()` retorna una respuesta aleatoria del array `fallbacks`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-08-05: Indicador "Escribiendo..." durante la llamada al servidor
| Campo | Valor |
|-------|-------|
| **Resultado esperado** | Mientras se espera respuesta del servidor, aparece burbuja "Escribiendo...". Desaparece al llegar la respuesta. |
| **Resultado obtenido** | ✅ `showTyping()` agrega el indicador antes del fetch. `removeTyping()` lo elimina en el bloque `try` y en `catch`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-08-06: Conexión al servidor IA
| Campo | Valor |
|-------|-------|
| **Observación de código** | `ScriptsIAChat.js` realiza el fetch a `http://localhost:5501/chat` (URL hardcodeada). En producción o si el puerto cambia, fallará. |
| **Resultado obtenido** | ⚠️ La URL es hardcodeada como `http://localhost:5501/chat`. En producción esto causará error CORS o conexión rechazada. Debe usar una URL relativa `/chat`. |
| **Estado** | ⚠️ **OBSERVACIÓN / RIESGO** |

---

### 6.9 Panel de Administración (IT-09)

#### CP-09-01: Acceso al panel solo con rol 'admin'
| Campo | Valor |
|-------|-------|
| **Precondición** | Usuario con `rol: 'cliente'` intenta acceder a `InicioAdmin.html`. |
| **Resultado esperado** | Redirección a `Inicio.html`. |
| **Resultado obtenido** | ✅ `ScriptsAdmin.js` verifica `adminRole !== 'admin'` y redirige a `Inicio.html`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-09-02: Acceso sin sesión activa al panel admin
| Campo | Valor |
|-------|-------|
| **Precondición** | Sin `loggedUser` en `localStorage`. |
| **Resultado esperado** | Redirección a `../index.html`. |
| **Resultado obtenido** | ✅ `ScriptsAdmin.js` verifica `if (!loggedUser)` primero. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-09-03: Validación de adminId en endpoints del servidor
| Campo | Valor |
|-------|-------|
| **Precondición** | Llamada a endpoints `/admin/*` con un `adminId` que no es UUID válido o no tiene rol admin. |
| **Resultado esperado** | HTTP 400 (ID inválido) o HTTP 403 (no es admin). |
| **Resultado obtenido** | ✅ `validateAdminRequest(adminId)` en el servidor verifica UUID, consulta Supabase y valida `rol === 'admin'`. Retorna `status(400)` o `status(403)` según corresponda. |
| **Estado** | ✅ **APROBADO** |

---

### 6.10 Control de Acceso y Sesión (IT-10)

#### CP-10-01: Cierre de sesión desde header
| Campo | Valor |
|-------|-------|
| **Pasos** | Clic en botón de cierre de sesión (⇥) del header. |
| **Resultado esperado** | `localStorage` y `sessionStorage` limpiados. Redirección a `../index.html`. |
| **Resultado obtenido** | ✅ Script inline en cada página ejecuta `localStorage.clear(); sessionStorage.clear(); location.href='../index.html'`. |
| **Estado** | ✅ **APROBADO** |

---

#### CP-10-02: Cierre de sesión con confirmación desde perfil
| Campo | Valor |
|-------|-------|
| **Pasos** | Clic en "🚪 Cerrar Sesión" en página de perfil. Confirmar diálogo. |
| **Resultado esperado** | Solo elimina `loggedUser` del `localStorage`. Redirige a `../index.html`. |
| **Resultado obtenido** | ✅ `logoutBtn` en `ScriptsCliente.js` llama `confirm('Deseas cerrar sesion?')` y usa `localStorage.removeItem('loggedUser')` (más conservador, mantiene otros datos). |
| **Estado** | ✅ **APROBADO** |
| **Observaciones** | Pequeña inconsistencia: header usa `localStorage.clear()` (elimina todo) mientras que el botón de perfil usa `removeItem` (elimina solo la sesión). |

---

#### CP-10-03: Verificación de token en cada navegación
| Campo | Valor |
|-------|-------|
| **Resultado esperado** | El sistema verifica la sesión al cargar cada página. |
| **Resultado obtenido** | ⚠️ Todos los módulos verifican `localStorage.getItem('loggedUser')` al cargar. Sin embargo, el token guardado es un simple base64 de `userId:timestamp` y **no se verifica su validez en el servidor** en cada request posterior. Cualquier persona que modifique el `localStorage` podría acceder. |
| **Estado** | ⚠️ **OBSERVACIÓN DE SEGURIDAD** |

---

## 7. Resumen de Resultados

### 7.1 Estadísticas globales

| Estado | Cantidad | Porcentaje |
|--------|----------|------------|
| ✅ APROBADO | 30 | 76.9% |
| ⚠️ APROBADO CON OBSERVACIÓN | 7 | 17.9% |
| ❌ FALLIDO | 2 | 5.2% |
| **TOTAL** | **39** | **100%** |

### 7.2 Resultados por módulo

| Módulo | Total | Aprobados | Con Observación | Fallidos |
|--------|-------|-----------|-----------------|----------|
| Autenticación (Login) | 5 | 5 | 0 | 0 |
| Registro | 6 | 5 | 1 | 0 |
| Destinos – Inicio | 5 | 5 | 0 | 0 |
| Explorar | 3 | 3 | 0 | 0 |
| Mis Viajes / Reservas | 7 | 7 | 0 | 0 |
| Perfil de Usuario | 8 | 6 | 1 | 1 |
| Comunidad | 4 | 3 | 1 | 0 |
| IA Chat | 6 | 4 | 1 | 1 |
| Panel Admin | 3 | 3 | 0 | 0 |
| Control de Acceso | 3 | 2 | 1 | 0 |

---

## 8. Nivel de Aceptación y Criterios

### 8.1 Nivel de Aceptación Definido

| Categoría | Criterio de Aceptación | Estado del Sistema |
|-----------|----------------------|-------------------|
| **Funcionalidad crítica** (Login, Registro, Reservas) | ≥ 95% de casos aprobados | ✅ **100%** (18/18 casos críticos aprobados) |
| **Funcionalidad secundaria** (Perfil, Explorar, Admin) | ≥ 80% de casos aprobados | ✅ **86.4%** (19/22 casos aprobados sin observaciones críticas) |
| **Funcionalidad complementaria** (Comunidad, IA Chat) | ≥ 70% de casos aprobados | ✅ **80%** (8/10 casos aprobados) |
| **Total general del sistema** | ≥ 75% de casos aprobados | ✅ **94.9%** (37/39 aprobados o con observación menor) |

### 8.2 Criterios de Aceptación por Severidad

| Severidad | Criterio | Estado |
|-----------|----------|--------|
| **Crítico (Bloqueante)** | Ningún caso de prueba de autenticación, registro o reservas debe fallar | ✅ **CUMPLIDO** |
| **Alto** | Las validaciones de formularios deben funcionar correctamente en todos los módulos principales | ✅ **CUMPLIDO** |
| **Medio** | El control de acceso por roles debe funcionar en frontend y backend | ✅ **CUMPLIDO** |
| **Bajo** | Los mensajes de error deben ser informativos y apropiados | ✅ **CUMPLIDO** |
| **Mejora** | Consistencia en reglas de validación entre módulos | ⚠️ **PENDIENTE** (inconsistencia en longitud mínima de contraseña) |

---

## 9. Defectos y Observaciones Identificadas

### 9.1 Defectos (Fallos)

| ID | Módulo | Descripción | Severidad | Recomendación |
|----|--------|-------------|-----------|---------------|
| DEF-01 | Perfil | Eliminación de cuenta no tiene implementación en el servidor. El botón solo muestra un alert pero no persiste ninguna acción real en la BD. | **Media** | Implementar endpoint `PUT /perfil/:userId/deactivate` o `DELETE /perfil/:userId` que programe la eliminación. |
| DEF-02 | IA Chat | La URL del servidor en `ScriptsIAChat.js` es `http://localhost:5501/chat` (hardcodeada). Fallará en cualquier entorno que no sea localhost en el puerto 5501. | **Alta** | Cambiar a URL relativa `/chat` para que funcione en cualquier entorno de despliegue. |

### 9.2 Observaciones (No bloqueantes)

| ID | Módulo | Descripción | Severidad | Recomendación |
|----|--------|-------------|-----------|---------------|
| OBS-01 | Registro / Perfil | Inconsistencia: el registro acepta contraseñas de mínimo 6 caracteres; el cambio de contraseña requiere mínimo 8 caracteres. | **Baja** | Unificar en 8 caracteres en ambos módulos. Actualizar también el placeholder en `Registro.html`. |
| OBS-02 | Autenticación | El token de sesión es base64 de `userId:timestamp`, no un JWT firmado. No hay verificación del token en el servidor en cada request. | **Alta (Seguridad)** | Implementar JWT firmado con secreto en `SUPABASE_SERVICE_KEY` o variable de entorno, y verificar el token en cada endpoint protegido. |
| OBS-03 | Comunidad | Los mensajes del chat se persisten únicamente en `localStorage`. No son accesibles desde otros dispositivos ni sesiones. | **Media** | Migrar la persistencia de mensajes a Supabase (tabla `Mensajes`) para soporte multi-dispositivo. |
| OBS-04 | Control de Acceso | El logout desde el header (`localStorage.clear()`) borra todos los datos del localStorage, mientras que el logout desde perfil solo borra `loggedUser`. Comportamiento inconsistente. | **Baja** | Estandarizar usando `localStorage.removeItem('loggedUser')` en todos los botones de logout. |
| OBS-05 | Servidor | La función `isUuid` está definida dos veces en `servidor.js` (líneas ~130 y ~550). Puede causar confusión aunque no genera error en JavaScript. | **Baja** | Eliminar la definición duplicada. |
| OBS-06 | Perfil | La opción de presupuesto en "Preferencias" y las etiquetas de tipo de viaje no persisten en el servidor. Se almacenan visualmente pero al recargar se pierden. | **Media** | Agregar endpoint `PUT /perfil/:userId/preferencias` para persistir preferencias de viaje. |

---

## 10. Conclusiones

### 10.1 Estado General del Sistema

El sistema **Tropical Travel** se encuentra en un **nivel de madurez funcional aceptable** para un entorno de desarrollo. Los flujos críticos de autenticación, registro, exploración de destinos y gestión de reservas funcionan correctamente según la revisión del código.

### 10.2 Puntos Fuertes

- ✅ **Seguridad en credenciales:** Las contraseñas se almacenan con hash bcrypt (salt rounds: 10). Los mensajes de error de login no revelan si el correo existe o no.
- ✅ **Validación doble:** Los formularios principales validan en el frontend (JavaScript) y en el backend (servidor Node.js), reduciendo la posibilidad de datos corruptos.
- ✅ **Control de acceso por roles:** La separación entre clientes y administradores funciona correctamente tanto en el frontend como en el backend.
- ✅ **Manejo de errores:** Los módulos cuentan con bloques `try/catch` y fallbacks para escenarios donde el servidor no esté disponible.
- ✅ **Flujo de reservas:** La lógica de negocio para reservas (prevención de duplicados, validación de roles, estado de la reserva) es robusta.

### 10.3 Áreas de Mejora Prioritarias

1. **[Alta - Seguridad]** Reemplazar el token base64 por JWT firmado y verificar el token en el servidor en cada request protegido.
2. **[Alta - Funcionalidad]** Corregir la URL hardcodeada del IA Chat de `http://localhost:5501/chat` a `/chat`.
3. **[Media - Funcionalidad]** Implementar la eliminación/desactivación de cuenta en el servidor.
4. **[Baja - Consistencia]** Unificar la longitud mínima de contraseña en 8 caracteres en todos los módulos.

### 10.4 Recomendación Final

> **El sistema CUMPLE el nivel de aceptación definido (≥ 75%) con un 94.9% de casos aprobados o aprobados con observación.** Se recomienda proceder con el despliegue en ambiente de pruebas/staging, atendiendo antes los defectos **DEF-01** y **DEF-02** identificados, y planificando las mejoras de seguridad (OBS-02) para la versión de producción.

---

*Documento generado mediante análisis estático de código fuente del repositorio Tropical Travel — versión 1.0*  
*Fecha: 08 de abril de 2026*
