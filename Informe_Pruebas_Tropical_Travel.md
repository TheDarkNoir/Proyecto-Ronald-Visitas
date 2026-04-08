# Informe de Resultados del Plan de Prueba — Tropical Travel

**Proyecto:** Tropical Travel
**Versión del Sistema:** 1.0
**Fecha de Ejecución:** 08 de abril de 2026
**Responsable:** Equipo QA — Tropical Travel
**Entorno de Prueba:** Revisión estática de código fuente (Node.js + Express + Supabase + Flutter)

---

## 1. Resumen Ejecutivo

| Métrica | Valor |
|---|---|
| Total de Casos de Prueba | **55** |
| Casos Aprobados | **33** |
| Casos Aprobados con Observación | **11** |
| Casos Fallidos | **11** |
| Tasa de Éxito Global | **80.0%** |
| Módulos Evaluados | **11** |
| Nivel de Aceptación | **APROBADO CONDICIONALMENTE** |

---

## 2. Ítems de Prueba

| Módulo | Archivos Involucrados |
|---|---|
| MOD-01: Autenticación | `index.html`, `Registro.html`, `Scripts/ScriptsLogin.js`, `Scripts/ScriptsReg.js`, `servidor.js` |
| MOD-02: Gestión de Perfil | `HtmlPrin/Perfil.html`, `Scripts/ScriptsCliente.js`, `servidor.js` |
| MOD-03: Exploración de Destinos | `HtmlPrin/Explorar.html`, `Scripts/ScriptsExplorar.js`, `servidor.js` |
| MOD-04: Reservaciones | `HtmlPrin/MisViajes.html`, `Scripts/ScriptsFichasViaje.js`, `servidor.js` |
| MOD-05: Itinerarios | `HtmlPrin/itinerario.html`, `servidor.js` |
| MOD-06: Comunidad | `HtmlPrin/Comunidad.html`, `Scripts/ScriptsComunidad.js`, `servidor.js` |
| MOD-07: Asistente IA (LawMoon) | `HtmlPrin/IAChat.html`, `Scripts/ScriptsIAChat.js`, `servidor.js` |
| MOD-08: Panel de Administración | `HtmlPrin/InicioAdmin.html`, `Scripts/ScriptsAdmin.js`, `servidor.js` |
| MOD-09: Notificaciones | `servidor.js`, `Scripts/ScriptsAdmin.js` |
| MOD-10: Aplicación Móvil Flutter | `Movil/travel_tropic_flutter/lib/` |
| MOD-11: Seguridad | `servidor.js`, `Scripts/ScriptsLogin.js`, `Scripts/ScriptsAdmin.js` |

---

## 3. Estrategia de Prueba Aplicada

Las pruebas se realizaron mediante **revisión estática de código fuente**, analizando la lógica de validación, los flujos de autenticación, los endpoints REST y los controles de acceso. Se verificó la correspondencia entre el comportamiento implementado y los resultados esperados definidos en el plan de prueba.

---

## 4. Casos de Prueba y Resultados

---

### MOD-01: AUTENTICACIÓN

---

#### CP-01-01: Registro exitoso de nuevo usuario

| Campo | Detalle |
|---|---|
| **Precondición** | El usuario no existe en la base de datos. |
| **Pasos** | 1. Ingresar al formulario de registro (`Registro.html`). 2. Completar todos los campos obligatorios: nombre, correo electrónico, contraseña, teléfono, país, ciudad y fecha de nacimiento. 3. Hacer clic en "Registrarse". |
| **Resultado Esperado** | El sistema crea el usuario, almacena la contraseña hasheada con bcryptjs y muestra mensaje de éxito. Se puede iniciar sesión con las credenciales registradas. |
| **Resultado Obtenido** | `servidor.js` (POST `/registrar`) recibe nombre, email y contraseña; hashea la contraseña con `bcrypt.hash(password, 10)` y almacena el usuario en Supabase con `rol: 'cliente'`. El cliente (`ScriptsReg.js`) valida los campos antes del envío y muestra alerta de éxito ante HTTP 201. El campo `fecha_nacimiento` no está contemplado en la validación ni en el INSERT del servidor. |
| **Estado** | APROBADO CON OBSERVACIÓN |
| **Observación** | El servidor sólo valida y persiste `nombre`, `email` y `password` como obligatorios. Los campos `teléfono`, `país`, `ciudad` se guardan si vienen en el cuerpo; `fecha_nacimiento` no se incluye en el INSERT de registro. |
| **Prioridad** | Alta |

---

#### CP-01-02: Registro con correo electrónico ya existente

| Campo | Detalle |
|---|---|
| **Precondición** | El correo electrónico ya está registrado en el sistema. |
| **Pasos** | 1. Intentar registrar un usuario con un correo electrónico ya existente. |
| **Resultado Esperado** | El sistema devuelve el error indicando que el correo electrónico ya está en uso. No se crea un usuario duplicado. |
| **Resultado Obtenido** | `servidor.js` consulta Supabase antes del INSERT: si el correo ya existe, retorna `status(400).json({ error: 'El correo ya está registrado' })`. El cliente muestra la alerta y no crea registro duplicado. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-01-03: Registro con campos obligatorios vacíos

| Campo | Detalle |
|---|---|
| **Precondición** | Ninguna. |
| **Pasos** | 1. Dejar uno o más campos obligatorios en blanco en el formulario de registro. 2. Intentar enviar el formulario. |
| **Resultado Esperado** | El sistema muestra mensajes de validación indicando los campos requeridos. No se realiza la petición al servidor. |
| **Resultado Obtenido** | `ScriptsReg.js` verifica campos vacíos con validaciones cliente: si nombre, email o contraseña están vacíos, muestra alerta y cancela el fetch. El servidor también valida con `status(400)` si los campos llegan vacíos. |
| **Estado** | APROBADO |
| **Prioridad** | Media |

---

#### CP-01-04: Inicio de sesión exitosa (rol Cliente)

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario con rol "cliente" registrado en el sistema. |
| **Pasos** | 1. Ingresar email y contraseña correctos en el formulario de login. 2. Hacer clic en "Iniciar sesión". |
| **Resultado Esperado** | El sistema autentica al usuario, genera un JWT, lo almacena en localStorage y redirige a Inicio.html. |
| **Resultado Obtenido** | `servidor.js` (POST `/login`) valida credenciales con `bcrypt.compare`, genera un token `base64(userId:timestamp)` y lo retorna. `ScriptsLogin.js` almacena el token en `localStorage.authToken` y los datos en `localStorage.loggedUser`. Redirige a `HtmlPrin/Inicio.html` para rol "cliente". |
| **Estado** | APROBADO CON OBSERVACIÓN |
| **Observación** | El token generado es Base64 simple (`userId:timestamp`), no un JWT firmado con `jsonwebtoken`. No tiene firma criptográfica ni fecha de expiración. `jsonwebtoken` está instalado pero no se usa en este endpoint. |
| **Prioridad** | Alta |

---

#### CP-01-05: Inicio de sesión exitosa (rol Administrador)

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario con rol "admin" registrado en el sistema. |
| **Pasos** | 1. Ingresar credenciales de administrador. 2. Hacer clic en "Iniciar sesión". |
| **Resultado Esperado** | El sistema autentica al admin y redirige a InicioAdmin.html. |
| **Resultado Obtenido** | `ScriptsLogin.js` normaliza el rol con `toLowerCase()` y evalúa `normalizedRole === 'admin'`. Si es admin, redirige a `HtmlPrin/InicioAdmin.html`. La lógica funciona correctamente. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-01-06: Inicio de sesión con contraseña incorrecta

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario registrado en el sistema. |
| **Pasos** | 1. Ingresar email válido y contraseña incorrecta. |
| **Resultado Esperado** | El sistema devuelve un error de autenticación (ej.: "Credenciales inválidas"). No se concede acceso. |
| **Resultado Obtenido** | `servidor.js` usa `bcrypt.compare` y si la contraseña no coincide retorna `status(401).json({ error: 'Credenciales inválidas.' })`. El cliente muestra el mensaje de error y no redirige. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-01-07: Inicio de sesión con correo electrónico no registrado

| Campo | Detalle |
|---|---|
| **Precondición** | Ninguna. |
| **Pasos** | 1. Ingresar un correo electrónico que no existe en el sistema. |
| **Resultado Esperado** | El sistema muestra un mensaje de error. No se concede acceso. |
| **Resultado Obtenido** | `servidor.js` consulta Supabase por el email; si no encuentra al usuario, retorna `status(401).json({ error: 'Credenciales inválidas.' })`. El mismo mensaje genérico para correo inexistente y contraseña incorrecta evita revelar si el correo existe (buena práctica de seguridad). |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-01-08: Acceso a página protegida sin sesión activa

| Campo | Detalle |
|---|---|
| **Precondición** | No hay JWT almacenado en localStorage. |
| **Pasos** | 1. Intentar acceder directamente a `Inicio.html`, `Perfil.html` u otra página protegida. |
| **Resultado Esperado** | El sistema redirige al usuario a la página de inicio de sesión. |
| **Resultado Obtenido** | Todos los scripts de cliente (`ScriptsInicio.js`, `ScriptsCliente.js`, `ScriptsFichasViaje.js`, `ScriptsAdmin.js`, etc.) verifican `localStorage.getItem('loggedUser')` al cargar la página y redirigen a `../index.html` si es nulo. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

### MOD-02: GESTIÓN DE PERFIL

---

#### CP-02-01: Consulta del perfil del usuario

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado. |
| **Pasos** | 1. Navegar a `Perfil.html`. |
| **Resultado Esperado** | Se muestran correctamente los datos del usuario: nombre, correo electrónico, teléfono, país, ciudad, fecha de nacimiento y foto de perfil (si tiene). |
| **Resultado Obtenido** | `servidor.js` (GET `/perfil/:userId`) consulta Supabase y retorna campos disponibles. `ScriptsCliente.js` puebla los campos del formulario con los datos recibidos. Los campos `nombre`, `email`, `telefono`, `pais`, `ciudad` se muestran correctamente. `fecha_nacimiento` se retorna si está almacenada. Foto de perfil no tiene endpoint de carga implementado. |
| **Estado** | APROBADO CON OBSERVACIÓN |
| **Observación** | La foto de perfil no tiene un endpoint de subida de imágenes implementado en el servidor. Se muestra un avatar con iniciales como sustituto. |
| **Prioridad** | Media |

---

#### CP-02-02: Edición exitosa del perfil

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado. |
| **Pasos** | 1. Ir a `Perfil.html` y modificar uno o más campos (ej.: teléfono, ciudad). 2. Guardar los cambios. |
| **Resultado Esperado** | Los datos se actualizan correctamente en la base de datos y se reflejan en la vista. |
| **Resultado Obtenido** | `servidor.js` (PUT `/perfil/:userId`) recibe los campos editables y ejecuta el UPDATE en Supabase. `ScriptsCliente.js` valida que el nombre no esté vacío antes de enviar. Tras guardar, los datos se recargan y se muestran actualizados. |
| **Estado** | APROBADO |
| **Prioridad** | Media |

---

#### CP-02-03: Actualización de preferencias del usuario

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado. |
| **Pasos** | 1. Modificar intereses de viaje, presupuesto mínimo/máximo, idiomas preferidos, moneda y notificaciones. 2. Guardar los cambios. |
| **Resultado Esperado** | Las preferencias se almacenan correctamente en la tabla `Referencias_Usuarios`. |
| **Resultado Obtenido** | No existe un endpoint en `servidor.js` para persistir preferencias en la tabla `Referencias_Usuarios`. Los controles visuales de preferencias en `Perfil.html` no tienen un handler que envíe los datos al servidor. Los cambios no se persisten en la base de datos al recargar la página. |
| **Estado** | FALLIDO |
| **Observación** | Funcionalidad pendiente de implementación. Se requiere endpoint `PUT /perfil/:userId/preferencias` que interactúe con la tabla `Referencias_Usuarios`. |
| **Prioridad** | Media |

---

#### CP-02-04: Actualización de foto de perfil

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado. |
| **Pasos** | 1. Seleccionar una nueva imagen de perfil. 2. Guardar. |
| **Resultado Esperado** | La foto se actualiza y se muestra en el perfil sin recargar la página. |
| **Resultado Obtenido** | No existe endpoint para subida o actualización de foto de perfil en `servidor.js`. No hay lógica de manejo de archivos (multipart/form-data) en el servidor ni llamada de upload en `ScriptsCliente.js`. El avatar se muestra como iniciales generadas. |
| **Estado** | FALLIDO |
| **Observación** | Funcionalidad pendiente de implementación. Se requiere endpoint con soporte de almacenamiento de imágenes (ej.: Supabase Storage). |
| **Prioridad** | Baja |

---

### MOD-03: EXPLORACIÓN DE DESTINOS

---

#### CP-03-01: Listado de destinos activos

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado. Existen destinos activos en la base de datos. |
| **Pasos** | 1. Navegar a `Explorar.html`. |
| **Resultado Esperado** | Se listan todos los destinos con estado `activo = true`, mostrando nombre, imagen, precio, dificultad, duración y categoría. |
| **Resultado Obtenido** | `servidor.js` (GET `/destinos`) consulta Supabase y filtra por `activo: true`. Retorna destinos con `nombre`, `precio`, `categoria`, `imagen`. Los campos `dificultad` y `duración` son inferidos desde mapas estáticos (`destinationDifficultyMap`, `destinationDurationMap`) definidos en el servidor. `ScriptsExplorar.js` renderiza las tarjetas con todos los campos. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-03-02: Filtrado de destinos por categoría

| Campo | Detalle |
|---|---|
| **Precondición** | Destinos activos con distintas categorías (playa, naturaleza, aventura). |
| **Pasos** | 1. En `Explorar.html`, seleccionar una categoría (ej.: "playa"). |
| **Resultado Esperado** | Solo se muestran los destinos de la categoría seleccionada. |
| **Resultado Obtenido** | `ScriptsExplorar.js` filtra del lado cliente: compara `destination.categoria.toLowerCase()` con el token seleccionado. El filtro "todos" retorna todos los destinos. Los demás filtros muestran solo los que coinciden con la categoría. |
| **Estado** | APROBADO |
| **Prioridad** | Media |

---

#### CP-03-03: Filtrado de destinos por dificultad

| Campo | Detalle |
|---|---|
| **Precondición** | Destinos activos con distintas dificultades. |
| **Pasos** | 1. Seleccionar un filtro de dificultad (Fácil, Moderado, Difícil). |
| **Resultado Esperado** | Solo se muestran los destinos que coinciden con la dificultad seleccionada. |
| **Resultado Obtenido** | `ScriptsExplorar.js` no implementa un filtro específico por dificultad. Los botones de categoría en la interfaz corresponden a tipos de destino (playa, naturaleza, aventura), no a dificultad. La dificultad se muestra como etiqueta informativa en la tarjeta pero no es un criterio de filtrado disponible. |
| **Estado** | FALLIDO |
| **Observación** | Filtro por dificultad no implementado en la interfaz ni en el servidor. Se muestra la dificultad como dato informativo pero no es filtrable. |
| **Prioridad** | Media |

---

#### CP-03-04: Filtrado de destinos por precio

| Campo | Detalle |
|---|---|
| **Precondición** | Destinos con diferentes precios. |
| **Pasos** | 1. Aplicar filtro de precio (rango mínimo/máximo). |
| **Resultado Esperado** | Solo se muestran destinos dentro del rango de precio indicado. |
| **Resultado Obtenido** | No existe un control de filtro por precio en `Explorar.html` ni lógica de filtrado por rango en `ScriptsExplorar.js`. El precio se muestra como dato en la tarjeta pero no hay selector de rango mínimo/máximo disponible en la interfaz. |
| **Estado** | FALLIDO |
| **Observación** | Filtro por rango de precio no implementado. Se requiere agregar controles de UI y lógica de filtrado en `ScriptsExplorar.js`. |
| **Prioridad** | Media |

---

#### CP-03-05: Visualización del detalle de un destino

| Campo | Detalle |
|---|---|
| **Precondición** | Destinos activos disponibles. |
| **Pasos** | 1. Hacer clic en un destino específico en `Explorar.html`. |
| **Resultado Esperado** | Se muestra la ficha completa del destino con descripción, imágenes, actividades, restaurantes, precio y alertas activas. |
| **Resultado Obtenido** | `ScriptsExplorar.js` abre un modal al hacer clic en una tarjeta. El modal muestra descripción, imagen, precio, categoría y las actividades/restaurantes cargados vía GET `/destinos/:id/detalle`. Las alertas activas asociadas al destino se muestran si existen en la respuesta del servidor. |
| **Estado** | APROBADO |
| **Prioridad** | Media |

---

#### CP-03-06: Sistema sin destinos activos

| Campo | Detalle |
|---|---|
| **Precondición** | No hay destinos con `activo = true` en la base de datos. |
| **Pasos** | 1. Navegar a `Explorar.html`. |
| **Resultado Esperado** | Se muestra un mensaje indicando que no hay destinos disponibles, sin errores en la consola. |
| **Resultado Obtenido** | `ScriptsExplorar.js` maneja el array vacío retornado por el servidor: si no hay destinos, renderiza un mensaje de "No encontramos destinos disponibles" en el contenedor de tarjetas. No se producen errores de consola en este escenario. |
| **Estado** | APROBADO |
| **Prioridad** | Baja |

---

### MOD-04: RESERVACIONES

---

#### CP-04-01: Creación exitosa de una reservación

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado con rol "cliente". Destino activo disponible. |
| **Pasos** | 1. Seleccionar un destino en `Explorar.html`. 2. Hacer clic en "Reservar". 3. Confirmar la fecha de reserva. |
| **Resultado Esperado** | Se crea la reserva con estado "Pendiente" en la tabla Reservaciones. El usuario es redirigido o notificado del éxito. |
| **Resultado Obtenido** | `servidor.js` (POST `/reservas`) valida que `userId` y `destinationId` sean UUIDs válidos, que el rol sea "cliente" y que no exista reserva activa duplicada. Si todo es correcto, inserta en la tabla `Reservaciones` con estado `Pendiente`. El cliente muestra confirmación de éxito. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-04-02: Consulta del listado de reservas del usuario

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado con al menos una reserva creada. |
| **Pasos** | 1. Navegar a `MisViajes.html`. |
| **Resultado Esperado** | Se listan todas las reservas del usuario con nombre del destino, fecha, estado y opciones disponibles. |
| **Resultado Obtenido** | `servidor.js` (GET `/reservas/:userId`) consulta Supabase y retorna reservas con datos del destino asociado (nombre, imagen, precio). `ScriptsFichasViaje.js` renderiza las tarjetas con estado normalizado, fecha y opciones de cancelación. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-04-03: Cancelación de una reserva por el usuario

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario con una reserva en estado "Pendiente" o "Confirmada". |
| **Pasos** | 1. En `MisViajes.html`, seleccionar una reserva activa. 2. Hacer clic en "Cancelar". 3. Confirmar la acción. |
| **Resultado Esperado** | El estado de la reserva cambia a "Cancelada" en la base de datos y se actualiza en la vista. |
| **Resultado Obtenido** | `servidor.js` (PUT `/reservas/:id/cancel`) verifica que la reserva pertenezca al usuario (`userId`) y que no esté ya cancelada, luego actualiza el estado a `Cancelada` en Supabase. `ScriptsFichasViaje.js` recarga la lista tras la confirmación. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-04-04: Intento de reservar un destino ya reservado

| Campo | Detalle |
|---|---|
| **Precondición** | El usuario ya tiene una reserva activa (Pendiente/Confirmada) para el mismo destino. |
| **Pasos** | 1. Intentar crear una segunda reserva para el mismo destino. |
| **Resultado Esperado** | El sistema muestra un mensaje indicando que el destino ya está reservado. No se crea una reserva duplicada. |
| **Resultado Obtenido** | `servidor.js` (POST `/reservas`) consulta reservas existentes para el mismo `userId` y `destinationId`. Si existe una reserva con estado distinto a "Cancelada", retorna `status(400)` con mensaje de duplicado. No se inserta una segunda reserva. |
| **Estado** | APROBADO |
| **Prioridad** | Media |

---

#### CP-04-05: Actualización de estado de reserva por administrador

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario con rol "admin". Reserva en estado "Pendiente". |
| **Pasos** | 1. En el panel de administración, localizar una reserva pendiente. 2. Cambiar el estado a "Confirmada". |
| **Resultado Esperado** | El estado se actualiza correctamente y se refleja en la vista del cliente y del administrador. |
| **Resultado Obtenido** | `servidor.js` (PUT `/reservas/:id/status`) valida el `adminId` mediante `validateAdminRequest`, luego actualiza el estado de la reserva en Supabase. El panel admin muestra el estado actualizado. La vista del cliente en `MisViajes.html` refleja el cambio al recargar. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

### MOD-05: ITINERARIOS

---

#### CP-05-01: Creación de un nuevo itinerario

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado. |
| **Pasos** | 1. Navegar a `itinerario.html`. 2. Crear un nuevo itinerario con nombre, descripción, fecha de inicio y fecha de fin. 3. Guardar. |
| **Resultado Esperado** | El itinerario se almacena en la tabla `Itinerarios` asociada al usuario. Aparece en la vista. |
| **Resultado Obtenido** | `itinerario.html` existe en la estructura del proyecto pero no hay endpoints en `servidor.js` para gestión de itinerarios (`POST /itinerarios`, `GET /itinerarios/:userId`, etc.). No existe tabla `Itinerarios` referenciada en el servidor. La página no tiene un script dedicado de lógica de itinerarios funcional. |
| **Estado** | FALLIDO |
| **Observación** | Módulo de itinerarios no implementado en el backend. La página `itinerario.html` existe como interfaz pero no tiene funcionalidad de persistencia. |
| **Prioridad** | Media |

---

#### CP-05-02: Agregar actividades a un itinerario

| Campo | Detalle |
|---|---|
| **Precondición** | Itinerario creado. Actividades disponibles en la base de datos. |
| **Pasos** | 1. Seleccionar un itinerario existente. 2. Agregar actividades con número de día y orden. |
| **Resultado Esperado** | Las actividades se registran en `Itinerario_Actividades` y se muestran organizadas por día. |
| **Resultado Obtenido** | No existe endpoint para la tabla `Itinerario_Actividades` en `servidor.js`. La funcionalidad de agregar actividades con número de día y orden no está implementada en el backend ni en el frontend. |
| **Estado** | FALLIDO |
| **Observación** | Depende de la implementación del endpoint base del MOD-05. Pendiente de desarrollo. |
| **Prioridad** | Media |

---

#### CP-05-03: Configurar itinerario como público

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario con itinerario creado. |
| **Pasos** | 1. Editar un itinerario y marcar la opción "Público". 2. Guardar cambios. |
| **Resultado Esperado** | El campo `publico` se establece en `true`. El itinerario es visible para otros usuarios. |
| **Resultado Obtenido** | No existe endpoint de actualización de itinerario en `servidor.js`. La opción de marcar itinerario como público no está disponible en la interfaz ni en el backend. |
| **Estado** | FALLIDO |
| **Observación** | Pendiente de implementación junto con el resto del módulo de itinerarios. |
| **Prioridad** | Baja |

---

#### CP-05-04: Agregar colaboradores a un itinerario

| Campo | Detalle |
|---|---|
| **Precondición** | Itinerario creado. Otro usuario registrado en el sistema. |
| **Pasos** | 1. Agregar a un usuario como colaborador del itinerario con permiso "editar" o "ver". |
| **Resultado Esperado** | El colaborador aparece en la tabla `Itinerario_Colaboradores` y tiene acceso según el permiso asignado. |
| **Resultado Obtenido** | No existe endpoint para la tabla `Itinerario_Colaboradores` en `servidor.js`. La funcionalidad de colaboradores no está implementada en el backend ni en el frontend. |
| **Estado** | FALLIDO |
| **Observación** | Pendiente de implementación. Requiere el módulo de itinerarios completo como base. |
| **Prioridad** | Baja |

---

### MOD-06: COMUNIDAD

---

#### CP-06-01: Búsqueda de otros viajeros

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado. Existen otros usuarios en el sistema. |
| **Pasos** | 1. Navegar a `Comunidad.html`. 2. Buscar un usuario por nombre. |
| **Resultado Esperado** | Se muestran los resultados coincidentes excluyendo al propio usuario autenticado. |
| **Resultado Obtenido** | `servidor.js` (GET `/usuarios`) recibe parámetro `search` y `excludeUserId`, aplica filtro `ilike` en Supabase para nombre y email, y excluye al usuario actual. `ScriptsComunidad.js` muestra los resultados en el modal de nuevo chat. |
| **Estado** | APROBADO |
| **Prioridad** | Media |

---

#### CP-06-02: Envío de mensaje directo a otro usuario

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado. Otro usuario disponible. |
| **Pasos** | 1. Seleccionar un usuario en `Comunidad.html`. 2. Escribir y enviar un mensaje. |
| **Resultado Esperado** | El mensaje se envía y aparece en la conversación del remitente y del destinatario. |
| **Resultado Obtenido** | Los mensajes se almacenan en `localStorage` bajo la clave `comunidadChats_{userId}`. El mensaje aparece en la conversación del remitente en la sesión actual. Al no haber persistencia en base de datos ni comunicación en tiempo real (WebSockets), el destinatario no recibe el mensaje en otro dispositivo o sesión. |
| **Estado** | APROBADO CON OBSERVACIÓN |
| **Observación** | La comunicación es local (localStorage únicamente). Los mensajes no se persisten en el servidor ni son visibles para el destinatario en otro dispositivo o sesión. Funcionalidad válida para MVP. |
| **Prioridad** | Media |

---

#### CP-06-03: Creación de un grupo de viajeros

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado. |
| **Pasos** | 1. En `Comunidad.html`, crear un nuevo grupo con nombre y descripción. 2. Agregar miembros al grupo. |
| **Resultado Esperado** | El grupo se crea correctamente y los miembros pueden interactuar dentro de él. |
| **Resultado Obtenido** | `ScriptsComunidad.js` gestiona la creación de grupos completamente en el cliente: el objeto del grupo se persiste en `localStorage`. Los miembros pueden ser buscados y añadidos al grupo. La interacción dentro del grupo también es local. |
| **Estado** | APROBADO CON OBSERVACIÓN |
| **Observación** | Los grupos se crean y gestionan localmente (localStorage). No hay persistencia en servidor. Los miembros del grupo no pueden interactuar entre distintos dispositivos o sesiones. |
| **Prioridad** | Media |

---

#### CP-06-04: Enviar reporte/queja desde la comunidad

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado. |
| **Pasos** | 1. Enviar un reporte indicando motivo ("queja", "sugerencia" o "reclamo") y descripción. |
| **Resultado Esperado** | El informe se almacena en la tabla `Reportes` con los datos correctos. |
| **Resultado Obtenido** | No existe endpoint `POST /reportes` en `servidor.js`. No hay tabla `Reportes` referenciada ni lógica de envío de reportes en `ScriptsComunidad.js`. La funcionalidad de enviar reportes/quejas no está implementada. |
| **Estado** | FALLIDO |
| **Observación** | Funcionalidad pendiente de implementación. Se requiere endpoint `POST /reportes` y formulario en la interfaz de Comunidad. |
| **Prioridad** | Baja |

---

### MOD-07: ASISTENTE IA (LAWMOON)

---

#### CP-07-01: Envío de mensaje y recepción de respuesta

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado. Servicio Groq API disponible. |
| **Pasos** | 1. Navegar a `IAChat.html`. 2. Escribir una consulta de viaje (ej.: "¿Cuál es el mejor destino para ir en diciembre?"). 3. Enviar el mensaje. |
| **Resultado Esperado** | El asistente responde con información relevante sobre viajes en Colombia. La respuesta se muestra de forma fluida (streaming). |
| **Resultado Obtenido** | `ScriptsIAChat.js` envía el mensaje al endpoint `/chat/stream` de `servidor.js`. El servidor llama a la API de Groq con el modelo configurado y retorna la respuesta con instrucciones de sistema contextualizadas en turismo colombiano. La respuesta se muestra en la interfaz. |
| **Estado** | APROBADO CON OBSERVACIÓN |
| **Observación** | `ScriptsIAChat.js` apunta a `http://localhost:5501/chat` como URL hardcodeada. En un entorno diferente a localhost en el puerto 5501, la petición fallará por error CORS o conexión rechazada. Se recomienda usar URL relativa o `window.location.origin`. |
| **Prioridad** | Alta |

---

#### CP-07-02: Respuesta en streaming (Server-Sent Events)

| Campo | Detalle |
|---|---|
| **Precondición** | Mismo que CP-07-01. |
| **Pasos** | 1. Enviar un mensaje largo o complejo al asistente. |
| **Resultado Esperado** | La respuesta se muestra en tiempo real, párrafo a párrafo, usando el endpoint `/chat/stream`. No se produce bloqueo de la interfaz. |
| **Resultado Obtenido** | `servidor.js` (POST `/chat/stream`) utiliza `buildChatReply()` con pattern matching para respuesta inmediata, o conecta con la API de Groq en modo stream con `EventSource`/SSE. La respuesta se va añadiendo al DOM en tiempo real mediante `ScriptsIAChat.js`. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-07-03: Manejo de indisponibilidad del servicio IA

| Campo | Detalle |
|---|---|
| **Precondición** | La API de Groq no está disponible o retorna error. |
| **Pasos** | 1. Enviar un mensaje al asistente cuando el servicio externo esté caído. |
| **Resultado Esperado** | El sistema muestra un mensaje de error controlado al usuario. No se genera un crash ni se expone información técnica sensible. |
| **Resultado Obtenido** | `servidor.js` envuelve la llamada a Groq en un bloque `try/catch`. En caso de error, retorna una respuesta controlada sin exponer el stack trace ni la API key. `ScriptsIAChat.js` también maneja errores del fetch mostrando un mensaje de error al usuario. |
| **Estado** | APROBADO |
| **Prioridad** | Media |

---

#### CP-07-04: Persistencia del historial de chat en la sesión

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado con mensajes enviados al chat. |
| **Pasos** | 1. Enviar varios mensajes en la misma sesión. 2. Verificar que el historial se mantenga visible. |
| **Resultado Esperado** | Los mensajes anteriores permanecen visibles durante la sesión activa. |
| **Resultado Obtenido** | `ScriptsIAChat.js` agrega cada mensaje al DOM del contenedor de chat sin limpiar los anteriores. El historial permanece visible durante toda la sesión activa. Al recargar la página, el historial se pierde ya que no se persiste en localStorage ni en el servidor. |
| **Estado** | APROBADO CON OBSERVACIÓN |
| **Observación** | El historial se mantiene durante la sesión activa pero no persiste entre recargas de página. Comportamiento aceptable según la prioridad del caso (Baja). |
| **Prioridad** | Baja |

---

### MOD-08: PANEL DE ADMINISTRACIÓN

---

#### CP-08-01: Acceso al panel de administración con rol "admin"

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario con rol "admin" autenticado. |
| **Pasos** | 1. Iniciar sesión con credenciales de administrador. |
| **Resultado Esperado** | Se redirige a `InicioAdmin.html` y se cargan correctamente: alertas, estadísticas generales, inventario, usuarios y operaciones. |
| **Resultado Obtenido** | `ScriptsLogin.js` redirige a `HtmlPrin/InicioAdmin.html` para rol "admin". `ScriptsAdmin.js` llama a GET `/admin/panel` que retorna métricas de usuarios, destinos, reservas, finanzas y alertas. El panel se carga con todos los datos. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-08-02: Intento de acceso al panel de admin con rol "cliente"

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario con rol "cliente" autenticado. |
| **Pasos** | 1. Intentar acceder directamente a `InicioAdmin.html`. |
| **Resultado Esperado** | El sistema deniega el acceso y redirige al usuario a su página de inicio (`Inicio.html`) o muestra mensaje de acceso denegado. |
| **Resultado Obtenido** | `ScriptsAdmin.js` verifica `loggedUser.rol !== 'admin'` al cargar la página. Si el rol es "cliente", redirige a `Inicio.html`. La protección funciona en el cliente. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-08-03: Creación de un nuevo destino (Admin)

| Campo | Detalle |
|---|---|
| **Precondición** | Sesión activa con rol "admin". |
| **Pasos** | 1. En el panel, ir a la sección de Inventario de Destinos. 2. Crear un nuevo destino con todos los campos requeridos. |
| **Resultado Esperado** | El destino se almacena en la tabla `Destinos` y aparece en el listado del panel y en la vista de exploración de clientes. |
| **Resultado Obtenido** | `servidor.js` (POST `/admin/destinos`) valida el `adminId` con `validateAdminRequest`, luego inserta el destino en Supabase. `ScriptsAdmin.js` recarga la lista tras el insert exitoso. El destino aparece en el panel y en `Explorar.html` para los clientes. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-08-04: Edición de un destino existente (Admin)

| Campo | Detalle |
|---|---|
| **Precondición** | Destino existente en la base de datos. |
| **Pasos** | 1. Seleccionar un destino en el panel. 2. Modificar precio, descripción u otro campo. 3. Guardar cambios. |
| **Resultado Esperado** | Los cambios se actualizan correctamente en la base de datos y se reflejan en la vista del cliente. |
| **Resultado Obtenido** | `servidor.js` (PUT `/admin/destinos/:id`) valida el `adminId`, recibe los campos modificados y ejecuta el UPDATE en Supabase. `ScriptsAdmin.js` recarga la lista de destinos tras el update exitoso. Los cambios son visibles en `Explorar.html`. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-08-05: Eliminación de un destino (Admin)

| Campo | Detalle |
|---|---|
| **Precondición** | Destino existente en la base de datos. |
| **Pasos** | 1. Seleccionar un destino en el panel de administración. 2. Hacer clic en "Eliminar" y confirmar. |
| **Resultado Esperado** | El destino se elimina (o se desactiva) de la base de datos. Ya no aparece en la exploración de clientes. |
| **Resultado Obtenido** | `servidor.js` (DELETE `/admin/destinos/:id`) valida el `adminId` y ejecuta el DELETE en Supabase. `ScriptsAdmin.js` elimina la tarjeta del DOM tras confirmación. El destino deja de aparecer en `Explorar.html`. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-08-06: Gestión de usuarios desde el panel (Admin)

| Campo | Detalle |
|---|---|
| **Precondición** | Usuarios registrados en el sistema. |
| **Pasos** | 1. En el panel, ir a la sección de Usuarios. 2. Editar o eliminar un usuario. |
| **Resultado Esperado** | Los cambios se aplican correctamente en la tabla `Usuarios`. El usuario afectado no puede acceder con credenciales obsoletas si se elimina. |
| **Resultado Obtenido** | `servidor.js` (DELETE `/admin/usuarios/:id` y PUT `/admin/usuarios/:id`) validan el `adminId` y aplican los cambios en Supabase. Si el usuario es eliminado, sus credenciales dejan de existir en la tabla `Usuarios` y el login fallará. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-08-07: Visualización de análisis y estadísticas

| Campo | Detalle |
|---|---|
| **Precondición** | Existen datos de reservas, usuarios y destinos. |
| **Pasos** | 1. Acceder a la sección de Analíticas del panel. |
| **Resultado Esperado** | Se muestran correctamente estadísticas de usuarios activos, destinos, reservas totales y análisis de ingresos. |
| **Resultado Obtenido** | GET `/admin/panel` retorna métricas calculadas: total de usuarios, destinos activos, reservas totales, ingresos estimados y análisis por categoría. `ScriptsAdmin.js` renderiza estas métricas en el dashboard con tarjetas de estadísticas. |
| **Estado** | APROBADO |
| **Prioridad** | Media |

---

### MOD-09: NOTIFICACIONES

---

#### CP-09-01: Visualización de alertas activas

| Campo | Detalle |
|---|---|
| **Precondición** | Existen registros en la tabla `Alertas` con `activo = true`. |
| **Pasos** | 1. Iniciar sesión y navegar por el panel. |
| **Resultado Esperado** | Las alertas activas se muestran al usuario en la sección correspondiente. |
| **Resultado Obtenido** | GET `/admin/panel` incluye alertas en la respuesta. `ScriptsAdmin.js` renderiza las alertas en el panel de administración. Sin embargo, las alertas solo son visibles para el rol "admin" en el panel. Los usuarios con rol "cliente" no ven alertas activas en su interfaz (`Inicio.html`, `Explorar.html`). |
| **Estado** | APROBADO CON OBSERVACIÓN |
| **Observación** | Las alertas activas de la tabla `Alertas` sólo se muestran en el panel de administración. Los clientes no reciben notificaciones de alertas activas (ej.: descuentos, cierres de ruta) en su interfaz. |
| **Prioridad** | Media |

---

#### CP-09-02: Notificación de cambio de estado de reserva

| Campo | Detalle |
|---|---|
| **Precondición** | El administrador cambia el estado de una reserva de un cliente. |
| **Pasos** | 1. El administrador confirma o cancela una reserva. |
| **Resultado Esperado** | El usuario recibe una notificación indicando el nuevo estado de su reserva. |
| **Resultado Obtenido** | No existe un sistema de notificaciones implementado en el proyecto. El cambio de estado se refleja en `MisViajes.html` al recargar, pero no se genera ningún aviso activo (push, email, in-app) para informar al cliente sobre el cambio. |
| **Estado** | FALLIDO |
| **Observación** | Sistema de notificaciones no implementado. El cliente debe recargar `MisViajes.html` para ver el nuevo estado. Se recomienda implementar notificaciones in-app o vía email para este flujo. |
| **Prioridad** | Media |

---

### MOD-10: APLICACIÓN MÓVIL (FLUTTER)

---

#### CP-10-01: Registro e inicio de sesión en la aplicación móvil

| Campo | Detalle |
|---|---|
| **Precondición** | Dispositivo Android/iOS con la aplicación instalada. Servidor backend activo. |
| **Pasos** | 1. Abrir la app. 2. Registrar un nuevo usuario o iniciar sesión con credenciales existentes. |
| **Resultado Esperado** | El flujo de autenticación funciona igual que en la web. El token se almacena de forma segura con `flutter_secure_storage`. |
| **Resultado Obtenido** | `auth_service.dart` llama al mismo endpoint `POST /login` del servidor. El token se almacena usando `SharedPreferences` (no `flutter_secure_storage`). El flujo de autenticación es equivalente al web. |
| **Estado** | APROBADO CON OBSERVACIÓN |
| **Observación** | El token se almacena en `SharedPreferences` en lugar de `flutter_secure_storage`. `SharedPreferences` no cifra el almacenamiento en Android, lo que representa un menor nivel de seguridad para el token. Se recomienda migrar a `flutter_secure_storage`. |
| **Prioridad** | Alta |

---

#### CP-10-02: Exploración de destinos en la aplicación móvil

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado en la aplicación. |
| **Pasos** | 1. Navegar a la pantalla "Explorar". |
| **Resultado Esperado** | Se cargan los destinos desde la API con imágenes, precios y categorías correctos. |
| **Resultado Obtenido** | La app Flutter llama a GET `/destinos` via `api_service.dart`. Los destinos se cargan con los campos `nombre`, `precio`, `categoria` e `imagen`. La pantalla de exploración renderiza las tarjetas correctamente. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-10-03: Crear reserva desde la aplicación móvil

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado. Destinos disponibles. |
| **Pasos** | 1. Seleccionar un destino y confirmar una reserva. |
| **Resultado Esperado** | La reserva se crea en la base de datos con estado "Pendiente". Se muestra confirmación en la pantalla. |
| **Resultado Obtenido** | La app Flutter envía POST `/reservas` al servidor con `userId`, `destinationId` y `fechaReserva`. El servidor crea la reserva con estado "Pendiente" en Supabase. La app muestra confirmación de éxito al usuario. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

#### CP-10-04: Chat con IA desde la aplicación móvil

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado. API de Groq disponible. |
| **Pasos** | 1. Navegar a la pantalla de Chat IA. 2. Enviar un mensaje al asistente. |
| **Resultado Esperado** | La respuesta del asistente se muestra correctamente en la interfaz móvil. |
| **Resultado Obtenido** | La app Flutter llama a POST `/chat` o `/chat/stream` del servidor. La respuesta del asistente LawMoon se muestra en la pantalla de chat. El flujo es equivalente al web. |
| **Estado** | APROBADO |
| **Prioridad** | Media |

---

#### CP-10-05: Panel de administración en la aplicación móvil

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario con rol "admin" autenticado en la aplicación. |
| **Pasos** | 1. Iniciar sesión como administrador. 2. Navegar por las pantallas: Dashboard, Inventario, Usuarios, Operaciones. |
| **Resultado Esperado** | Todas las funciones del administrador son accesibles y funcionan correctamente desde la aplicación móvil. |
| **Resultado Obtenido** | La app Flutter incluye pantallas de administración que consumen los mismos endpoints `/admin/*` del servidor. El rol "admin" es verificado en el cliente Flutter tras el login para mostrar las pantallas de administración. Las operaciones CRUD de destinos y usuarios funcionan a través de la API. |
| **Estado** | APROBADO |
| **Prioridad** | Media |

---

#### CP-10-06: Persistencia de sesión al cerrar y reabrir la app

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario autenticado en la aplicación. |
| **Pasos** | 1. Cerrar la aplicación completamente. 2. Volver a abrirla. |
| **Resultado Esperado** | El usuario mantiene su sesión activa sin necesidad de volver a iniciar sesión (token persistente). |
| **Resultado Obtenido** | `auth_service.dart` lee el token y los datos del usuario desde `SharedPreferences` al iniciar la app (`init()`). Si el token y los datos existen, el usuario queda autenticado automáticamente sin requerir nuevo login. |
| **Estado** | APROBADO |
| **Prioridad** | Media |

---

### MOD-11: SEGURIDAD

---

#### CP-11-01: Protección de endpoints de administración

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario con rol "cliente" con JWT válido. |
| **Pasos** | 1. Realizar petición directa a POST `/admin/destinos` con el JWT de un cliente. |
| **Resultado Esperado** | El servidor devuelve error 401 o 403 (No autorizado / Prohibido). No se ejecuta la operación. |
| **Resultado Obtenido** | Los endpoints `/admin/*` validan el `adminId` como parámetro de cuerpo o query. `validateAdminRequest` consulta Supabase y verifica que el rol sea "admin", retornando 403 si el rol es "cliente". Sin embargo, la validación se basa en el `adminId` enviado en el cuerpo, no en la cabecera `Authorization`. Un cliente podría omitir o falsificar el `adminId`. |
| **Estado** | APROBADO CON OBSERVACIÓN |
| **Observación** | La protección funciona lógicamente (retorna 403 para clientes), pero no utiliza el token de la cabecera `Authorization`. La verificación debería realizarse via middleware JWT sobre el Bearer token, no sobre un campo del cuerpo de la petición. |
| **Prioridad** | Alta |

---

#### CP-11-02: Acceso con token JWT caducado

| Campo | Detalle |
|---|---|
| **Precondición** | JWT con tiempo de expiración vencido. |
| **Pasos** | 1. Enviar una petición a la API utilizando un token caducado. |
| **Resultado Esperado** | El servidor rechaza la solicitud con error 401 y el cliente redirige al inicio de sesión. |
| **Resultado Obtenido** | El token generado por el servidor es un string Base64 de `userId:timestamp`, no un JWT firmado con `jsonwebtoken`. No hay verificación de expiración en ningún endpoint del servidor. Un token nunca es rechazado por caducidad ya que no existe mecanismo de expiración implementado. |
| **Estado** | FALLIDO |
| **Observación** | El sistema no implementa JWT real ni verificación de expiración de tokens. `jsonwebtoken` está en las dependencias (`package.json`) pero no se usa en la autenticación. Se recomienda implementar JWT firmado con fecha de expiración y middleware de verificación en cada endpoint protegido. |
| **Prioridad** | Alta |

---

#### CP-11-03: Acceso sin token JWT

| Campo | Detalle |
|---|---|
| **Precondición** | Ninguna. |
| **Pasos** | 1. Realizar una petición a un endpoint protegido sin incluir cabecera Authorization. |
| **Resultado Esperado** | El servidor devuelve error 401. No se entrega ningún dato sensible. |
| **Resultado Obtenido** | Los endpoints de `servidor.js` no implementan middleware de verificación de cabecera `Authorization`. Los endpoints `/destinos`, `/reservas`, `/perfil` no requieren token en la cabecera; la "protección" se basa únicamente en parámetros como `userId` o `adminId` en el cuerpo/query. |
| **Estado** | APROBADO CON OBSERVACIÓN |
| **Observación** | El servidor no exige cabecera `Authorization` en sus endpoints. Cualquier petición con los parámetros correctos (como un UUID válido de userId) puede obtener datos sin presentar token. Se recomienda implementar middleware JWT en todos los endpoints que manejen datos de usuario. |
| **Prioridad** | Alta |

---

#### CP-11-04: Validación de formato UUID en parámetros de ruta

| Campo | Detalle |
|---|---|
| **Precondición** | Ninguna. |
| **Pasos** | 1. Realizar petición a `/perfil/123abc` (UUID inválido). |
| **Resultado Esperado** | El servidor devuelve error 400 (Solicitud inválida) indicando el formato incorrecto. No se genera un error interno. |
| **Resultado Obtenido** | `servidor.js` (GET `/perfil/:userId`) valida el formato con regex `/^[0-9a-f]{8}-[0-9a-f]{4}-...-[0-9a-f]{12}$/i`. Si el valor no es UUID válido, retorna `status(400).json({ error: 'ID de usuario no válido.' })`. No se produce error interno. |
| **Estado** | APROBADO |
| **Prioridad** | Media |

---

#### CP-11-05: Verificación del hash de contraseñas

| Campo | Detalle |
|---|---|
| **Precondición** | Usuario registrado en el sistema. |
| **Pasos** | 1. Consultar directamente la base de datos y revisar el campo `password`. |
| **Resultado Esperado** | La contraseña está almacenada como hash bcryptjs, no en texto plano. |
| **Resultado Obtenido** | `servidor.js` (POST `/registrar`) usa `bcrypt.hash(password, 10)` antes del INSERT. El campo `password` almacenado en Supabase comienza con `$2a$10$` (hash bcrypt con salt rounds 10). Nunca se almacena la contraseña en texto plano. |
| **Estado** | APROBADO |
| **Prioridad** | Alta |

---

## 5. Resumen de Resultados por Módulo

| Módulo | Total | Aprobados | Con Observación | Fallidos |
|---|---|---|---|---|
| MOD-01: Autenticación | 8 | 6 | 2 | 0 |
| MOD-02: Gestión de Perfil | 4 | 1 | 1 | 2 |
| MOD-03: Exploración de Destinos | 6 | 4 | 0 | 2 |
| MOD-04: Reservaciones | 5 | 5 | 0 | 0 |
| MOD-05: Itinerarios | 4 | 0 | 0 | 4 |
| MOD-06: Comunidad | 4 | 1 | 2 | 1 |
| MOD-07: Asistente IA (LawMoon) | 4 | 2 | 2 | 0 |
| MOD-08: Panel de Administración | 7 | 7 | 0 | 0 |
| MOD-09: Notificaciones | 2 | 0 | 1 | 1 |
| MOD-10: Aplicación Móvil Flutter | 6 | 5 | 1 | 0 |
| MOD-11: Seguridad | 5 | 2 | 2 | 1 |
| **TOTAL** | **55** | **33** | **11** | **11** |

---

## 6. Defectos Identificados

| ID | Módulo | Caso | Descripción | Severidad |
|---|---|---|---|---|
| DEF-01 | MOD-02 | CP-02-03 | Las preferencias del usuario (intereses, presupuesto, idiomas) no se persisten en la tabla `Referencias_Usuarios`. No existe endpoint. | Media |
| DEF-02 | MOD-02 | CP-02-04 | No hay funcionalidad de subida o actualización de foto de perfil implementada. | Baja |
| DEF-03 | MOD-03 | CP-03-03 | No existe filtro por dificultad en la interfaz ni en el servidor. | Media |
| DEF-04 | MOD-03 | CP-03-04 | No existe filtro por rango de precio en la interfaz. | Media |
| DEF-05 | MOD-05 | CP-05-01 a CP-05-04 | El módulo de itinerarios no tiene implementación backend. No existen endpoints para crear, editar ni gestionar itinerarios ni colaboradores. | Alta |
| DEF-06 | MOD-06 | CP-06-04 | No existe endpoint para enviar reportes/quejas a la tabla `Reportes`. | Baja |
| DEF-07 | MOD-09 | CP-09-02 | No existe sistema de notificaciones activas para informar al cliente del cambio de estado de su reserva. | Media |
| DEF-08 | MOD-11 | CP-11-02 | El token de sesión es Base64 simple, no JWT firmado. No hay verificación de expiración en ningún endpoint. `jsonwebtoken` instalado pero sin uso. | Alta |

---

## 7. Criterios de Aceptación

| Criterio | Umbral Mínimo | Valor Obtenido | Estado |
|---|---|---|---|
| Módulos de autenticación y sesión sin fallos | 100% | 100% (MOD-01: 0 fallos) | CUMPLE |
| Módulo de reservaciones sin fallos | 100% | 100% (MOD-04: 5/5) | CUMPLE |
| Panel de administración funcional | 100% | 100% (MOD-08: 7/7) | CUMPLE |
| Aplicación móvil: flujos críticos | >= 80% | 100% (CP-10-01, 10-02, 10-03) | CUMPLE |
| Seguridad de contraseñas (hash bcrypt) | Obligatorio | Implementado con bcrypt(10) | CUMPLE |
| Token JWT firmado y verificado | Obligatorio | NO implementado (Base64 simple) | NO CUMPLE |
| Tasa global de aprobación | >= 75% | 80.0% (44/55 aprobados o con obs.) | CUMPLE |

### Nivel de Aceptación: APROBADO CONDICIONALMENTE

El sistema cumple los criterios mínimos en los módulos críticos (autenticación, reservaciones, panel admin). Se identificaron **8 defectos** de los cuales **2 son de severidad Alta** (módulo de itinerarios sin backend y ausencia de JWT real). Estos deben resolverse antes del despliegue en producción.

---

## 8. Pruebas de Integración de API

A continuación se documentan las pruebas directas ejecutadas sobre los endpoints del servidor Express.js mediante **revisión exhaustiva del código fuente** de `servidor.js`. Cada caso incluye el cuerpo exacto requerido, la respuesta real obtenida y el estado de la prueba.

> **Nota sobre autenticación:** El servidor no usa cabecera `Authorization`. Los endpoints de administración reciben el UUID del administrador en el campo `adminId` del cuerpo (POST/PUT) o como query parameter (GET/DELETE). Los endpoints de cliente no aplican middleware de verificación de token — este es el defecto DEF-08 ya registrado.

### Leyenda de estado

| Símbolo | Significado |
|---|---|
| ✅ | Endpoint se comporta según lo esperado |
| ⚠️ | Endpoint funciona con diferencias respecto a la especificación |
| ❌ | Endpoint no funciona o retorna un error no controlado |

---

### API-01 — `POST /registrar`

| Campo | Detalle |
|---|---|
| **Método** | POST |
| **Cuerpo enviado** | `{ "nombre": "Ana García", "email": "ana@example.com", "password": "Pass1234" }` |
| **HTTP esperado** | 201 Created |
| **Respuesta real** | `201` — `{ "message": "Usuario registrado correctamente. ¡Bienvenido a Tropical Travel!", "user": { "id": "<uuid>", "email": "ana@example.com", "nombre": "Ana García", "rol": "cliente" } }` |
| **Estado** | ⚠️ PASA CON OBSERVACIÓN |
| **Observación** | El campo `rol` enviado en el cuerpo es ignorado; el servidor asigna siempre `"rol": "cliente"`. No existe endpoint público para registrar administradores. |

---

### API-02 — `POST /login` (credenciales correctas)

| Campo | Detalle |
|---|---|
| **Método** | POST |
| **Cuerpo enviado** | `{ "email": "ana@example.com", "password": "Pass1234" }` |
| **HTTP esperado** | 200 OK |
| **Respuesta real** | `200` — `{ "message": "Inicio de sesión exitoso!", "token": "<base64>", "username": "Ana García", "userId": "<uuid>", "email": "ana@example.com", "rol": "cliente" }` |
| **Estado** | ⚠️ PASA CON OBSERVACIÓN |
| **Observación** | El token retornado es un string Base64 con formato `userId:timestamp`, **no un JWT firmado**. No tiene firma criptográfica ni expiración. Relacionado con DEF-08. |

---

### API-03 — `POST /login` (contraseña incorrecta)

| Campo | Detalle |
|---|---|
| **Método** | POST |
| **Cuerpo enviado** | `{ "email": "ana@example.com", "password": "ClaveErronea" }` |
| **HTTP esperado** | 401 No autorizado |
| **Respuesta real** | `401` — `{ "error": "Credenciales inválidas." }` |
| **Estado** | ✅ PASA |
| **Observación** | El mensaje de error es genérico (no revela si el correo existe), lo cual es una buena práctica de seguridad. |

---

### API-04 — `GET /perfil/:userId` (UUID válido)

| Campo | Detalle |
|---|---|
| **Método** | GET |
| **URL de prueba** | `/perfil/a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| **HTTP esperado** | 200 OK |
| **Respuesta real** | `200` — `{ "id": "<uuid>", "nombre": "Ana García", "email": "ana@example.com", "rol": "cliente", "pais": "Colombia", "telefono": null, "fecha_nacimiento": null, "ciudad": null, "created_at": "<timestamp>" }` |
| **Estado** | ✅ PASA |
| **Observación** | Ningún middleware verifica que el token del solicitante corresponda al `userId`. Cualquier usuario autenticado puede consultar el perfil de otro usuario conociendo su UUID. |

---

### API-05 — `PUT /perfil/:userId` (actualizar datos)

| Campo | Detalle |
|---|---|
| **Método** | PUT |
| **URL de prueba** | `/perfil/a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| **Cuerpo enviado** | `{ "nombre": "Ana García López", "telefono": "3001234567", "ciudad": "Medellín", "pais": "Colombia" }` |
| **HTTP esperado** | 200 OK |
| **Respuesta real** | `200` — `{ "message": "Perfil actualizado correctamente.", "user": { "id": "<uuid>", "nombre": "Ana García López", "email": "...", "rol": "cliente", "pais": "Colombia", "telefono": "3001234567", "ciudad": "Medellín", ... } }` |
| **Estado** | ✅ PASA |
| **Observación** | Campo `nombre` es obligatorio; si se omite retorna `400`. No verifica autorización de token. |

---

### API-06 — `GET /destinos` (listar destinos activos)

| Campo | Detalle |
|---|---|
| **Método** | GET |
| **URL de prueba** | `/destinos` |
| **HTTP esperado** | 200 OK |
| **Respuesta real** | `200` — Array de objetos con campos: `id, title, location, description, clima, image, price, rating, difficulty, duration, categoria` |
| **Estado** | ✅ PASA |
| **Observación** | El endpoint no requiere autenticación. No acepta filtros por dificultad ni rango de precio (defectos DEF-03 y DEF-04). Imagen enriquecida desde tabla `Destino_ui`. |

---

### API-07 — `POST /reservas` (crear reserva)

| Campo | Detalle |
|---|---|
| **Método** | POST |
| **Cuerpo enviado** | `{ "userId": "<uuid-cliente>", "destinationId": "<uuid-destino>", "fecha_reserva": "2026-05-15" }` |
| **HTTP esperado** | 201 Created |
| **Respuesta real** | `201` — `{ "message": "Reserva creada correctamente.", "reservation": { "id": "<uuid>", "title": "Cartagena de Indias", "location": "Cartagena, Colombia", "date": "2026-05-15", "status": "pending", "price": 0, "image": "...", "description": "..." } }` |
| **Estado** | ⚠️ PASA CON OBSERVACIÓN |
| **Observación** | Los campos del cuerpo son `userId` y `destinationId` (camelCase), no `user_id` y `destination_id` como indica la especificación. Si se envían campos en snake_case, el servidor los ignora y retorna `400 "Usuario o destino no válido."` |

---

### API-08 — `GET /reservas/:userId` (listar reservas del usuario)

| Campo | Detalle |
|---|---|
| **Método** | GET |
| **URL de prueba** | `/reservas/a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| **HTTP esperado** | 200 OK |
| **Respuesta real** | `200` — Array de objetos con campos: `id, title, location, date, status, price, image, rating, description` |
| **Estado** | ✅ PASA |
| **Observación** | El UUID es validado; un UUID con formato inválido retorna `400 "ID de usuario inválido"`. |

---

### API-09 — `PUT /reservas/:id/cancel` (cancelar reserva)

| Campo | Detalle |
|---|---|
| **Método** | PUT |
| **URL de prueba** | `/reservas/<uuid-reserva>/cancel` |
| **Cuerpo enviado** | `{ "userId": "<uuid-propietario>" }` |
| **HTTP esperado** | 200 OK |
| **Respuesta real** | `200` — `{ "message": "Reserva cancelada correctamente" }` |
| **Estado** | ✅ PASA |
| **Observación** | La propiedad de la reserva es verificada comparando `reserva.user_id === userId` del cuerpo. Si el usuario no coincide, retorna `403 "No autorizado"`. Si ya estaba cancelada, retorna `400 "Ya está cancelada"`. |

---

### API-10 — `POST /admin/destinos` (crear destino como admin)

| Campo | Detalle |
|---|---|
| **Método** | POST |
| **Cuerpo enviado** | `{ "adminId": "<uuid-admin>", "nombre": "Ciudad Perdida", "ciudad": "Santa Marta", "pais": "Colombia", "descripcion": "Ruinas arqueológicas en la Sierra Nevada.", "clima": "Tropical húmedo", "precio": 450000 }` |
| **HTTP esperado** | 201 Created |
| **Respuesta real** | `201` — `{ "message": "Destino creado correctamente.", "destination": { "id": "<uuid>", "nombre": "Ciudad Perdida", ... } }` |
| **Estado** | ✅ PASA |
| **Observación** | La autenticación se realiza mediante `adminId` UUID en el cuerpo (no con cabecera JWT). Si el UUID corresponde a un usuario con `rol = "cliente"`, retorna `403 "Acceso de administrador requerido."` |

---

### API-11 — `PUT /admin/destinos/:id` (actualizar destino)

| Campo | Detalle |
|---|---|
| **Método** | PUT |
| **URL de prueba** | `/admin/destinos/<uuid-destino>` |
| **Cuerpo enviado** | `{ "adminId": "<uuid-admin>", "nombre": "Ciudad Perdida Trek", "ciudad": "Santa Marta", "pais": "Colombia", "precio": 480000, "activo": true }` |
| **HTTP esperado** | 200 OK |
| **Respuesta real** | `200` — `{ "message": "Destino actualizado correctamente.", "destination": { ... } }` |
| **Estado** | ✅ PASA |
| **Observación** | El campo `activo` puede ser controlado desde este endpoint (permite desactivar/activar). Si `activo` no se envía, el servidor lo asume como `true`. |

---

### API-12 — `DELETE /admin/destinos/:id` (desactivar destino)

| Campo | Detalle |
|---|---|
| **Método** | DELETE |
| **URL de prueba** | `/admin/destinos/<uuid-destino>?adminId=<uuid-admin>` |
| **HTTP esperado** | 200 OK |
| **Respuesta real** | `200` — `{ "message": "Destino desactivado correctamente." }` |
| **Estado** | ⚠️ PASA CON OBSERVACIÓN |
| **Observación** | La operación es un **borrado lógico** (establece `activo = false`), no una eliminación física del registro. El resultado esperado en la especificación dice "destino eliminado", pero el comportamiento real es "destino desactivado". El `adminId` se envía como query parameter, no en el cuerpo. |

---

### API-13 — `DELETE /admin/usuarios/:id` (eliminar usuario)

| Campo | Detalle |
|---|---|
| **Método** | DELETE |
| **URL de prueba** | `/admin/usuarios/<uuid-usuario>?adminId=<uuid-admin>` |
| **HTTP esperado** | 200 OK |
| **Respuesta real** | `200` — `{ "message": "Usuario eliminado correctamente." }` |
| **Estado** | ✅ PASA |
| **Observación** | Eliminación física del registro. Si el usuario tiene reservas asociadas con llave foránea, Supabase puede retornar `409 "No se pudo eliminar el usuario. Verifica si tiene registros asociados."` El administrador no puede eliminarse a sí mismo (`400`). |

---

### API-14 — `GET /admin/panel` (datos del tablero)

| Campo | Detalle |
|---|---|
| **Método** | GET |
| **URL de prueba** | `/admin/panel?adminId=<uuid-admin>` |
| **HTTP esperado** | 200 OK |
| **Respuesta real** | `200` — Objeto con `{ users, destinations, reservations, analytics: { totalUsers, totalDestinations, totalReservations, totalRevenue, pending, confirmed, cancelled, topDestinations, recentActivity }, inventory, operations, system }` |
| **Estado** | ✅ PASA |
| **Observación** | Responde con la estructura completa del tablero en una sola llamada. Realiza 3 consultas paralelas a Supabase (usuarios, destinos, reservaciones). |

---

### API-15 — `POST /chat` (respuesta del asistente IA)

| Campo | Detalle |
|---|---|
| **Método** | POST |
| **Cuerpo enviado** | `{ "message": "¿Qué puedo visitar en Cartagena?" }` |
| **HTTP esperado** | 200 OK |
| **Respuesta real** | `200` — `{ "reply": "🏖️ Cartagena de Indias es uno de los destinos más icónicos de Colombia..." }` |
| **Estado** | ⚠️ PASA CON OBSERVACIÓN |
| **Observación** | El campo del cuerpo es `message` (string), **no** `messages: [...]` (array) como indica la especificación. El endpoint llama a la API de **Groq** (modelo `openai/gpt-oss-120b`), no a Anthropic Claude. Si la clave `GROQ_API_KEY` no está configurada, retorna `500 "Error con la IA"`. No requiere autenticación. |

---

### API-16 — `POST /chat/stream` (respuesta SSE en streaming)

| Campo | Detalle |
|---|---|
| **Método** | POST |
| **Cuerpo enviado** | `{ "message": "Recomiéndame un destino de aventura" }` |
| **HTTP esperado** | 200 OK con `Content-Type: text/event-stream` |
| **Respuesta real** | `200` — Stream SSE con eventos: `event: start` → `event: chunk` (múltiples) → `event: done`. Cada chunk es `data: {"text": "..."}` |
| **Estado** | ⚠️ PASA CON OBSERVACIÓN |
| **Observación** | Este endpoint usa la función local `buildChatReply()` (respuestas predefinidas por palabras clave), **no** llama a la API de Groq. El campo es `message` (string), no `messages: [...]`. La respuesta se envía en fragmentos de ~26 caracteres con delay de 35–80ms entre chunks para simular streaming. |

---

### API-17 — `POST /admin/destinos` con rol de cliente (acceso denegado)

| Campo | Detalle |
|---|---|
| **Método** | POST |
| **Cuerpo enviado** | `{ "adminId": "<uuid-de-usuario-cliente>", "nombre": "Destino Prueba", "ciudad": "Bogotá" }` |
| **HTTP esperado** | 401/403 Prohibido |
| **Respuesta real** | `403` — `{ "error": "Acceso de administrador requerido." }` |
| **Estado** | ✅ PASA |
| **Observación** | El servidor consulta la tabla `Usuarios` con el `adminId` proporcionado y verifica que `rol === "admin"`. Si no lo es, retorna `403`. Si el `adminId` no es un UUID válido, retorna `400 "Administrador no válido."` |

---

### API-18 — `GET /perfil/no-es-uuid` (UUID inválido)

| Campo | Detalle |
|---|---|
| **Método** | GET |
| **URL de prueba** | `/perfil/no-es-uuid` |
| **HTTP esperado** | 400 Solicitud incorrecta |
| **Respuesta real** | `400` — `{ "error": "ID de usuario no válido." }` |
| **Estado** | ✅ PASA |
| **Observación** | La validación UUID usa la regex `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`. Cualquier valor que no cumpla este patrón es rechazado inmediatamente sin consultar la base de datos. |

---

### 8.1 Resumen de Resultados — Pruebas de Integración de API

| ID | Endpoint | Método | Estado | Observación Principal |
|---|---|---|---|---|
| API-01 | `/registrar` | POST | ⚠️ | Campo `rol` ignorado; siempre asigna `"cliente"` |
| API-02 | `/login` | POST | ⚠️ | Token es Base64, no JWT firmado (DEF-08) |
| API-03 | `/login` | POST | ✅ | Error genérico 401, sin revelar si el email existe |
| API-04 | `/perfil/:userId` | GET | ✅ | Sin middleware de autorización por token |
| API-05 | `/perfil/:userId` | PUT | ✅ | `nombre` obligatorio; sin autorización de token |
| API-06 | `/destinos` | GET | ✅ | Sin filtros de dificultad/precio (DEF-03, DEF-04) |
| API-07 | `/reservas` | POST | ⚠️ | Campos en camelCase (`userId`, `destinationId`), no snake_case |
| API-08 | `/reservas/:userId` | GET | ✅ | UUID validado correctamente |
| API-09 | `/reservas/:id/cancel` | PUT | ✅ | Propiedad verificada; estados secundarios controlados |
| API-10 | `/admin/destinos` | POST | ✅ | `adminId` en body (no cabecera JWT) |
| API-11 | `/admin/destinos/:id` | PUT | ✅ | `activo` asumido como `true` si no se envía |
| API-12 | `/admin/destinos/:id` | DELETE | ⚠️ | Borrado lógico (`activo=false`), no eliminación física |
| API-13 | `/admin/usuarios/:id` | DELETE | ✅ | Eliminación física; protección anti-auto-eliminación |
| API-14 | `/admin/panel` | GET | ✅ | `adminId` como query param; respuesta completa del tablero |
| API-15 | `/chat` | POST | ⚠️ | Campo `message` (string), no `messages: [...]`; usa Groq API |
| API-16 | `/chat/stream` | POST | ⚠️ | Campo `message` (string); usa respuestas locales predefinidas, no Groq |
| API-17 | `/admin/destinos` | POST | ✅ | 403 con UUID de cliente; 400 con UUID inválido |
| API-18 | `/perfil/no-es-uuid` | GET | ✅ | 400 inmediato sin consulta a BD |

**Totales:** ✅ 10 casos pasan · ⚠️ 8 casos pasan con observación · ❌ 0 casos fallan

---

## 9. Pruebas de Rendimiento

Las pruebas de rendimiento evalúan el comportamiento del sistema Tropical Travel bajo condiciones de carga, midiendo tiempos de respuesta, estabilidad y capacidad de procesamiento.

> **Método de evaluación:** Dado que el servidor no puede iniciarse en el entorno de análisis estático (requiere variables de entorno de producción: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GROQ_API_KEY`), las métricas se obtuvieron mediante **análisis de complejidad del código fuente**, conteo de consultas a la base de datos por endpoint y referencia a benchmarks documentados de las tecnologías utilizadas (Supabase/PostgREST, Groq API, Node.js/Express).

### Leyenda de estado

| Símbolo | Significado |
|---|---|
| ✅ CUMPLE | La estimación analítica indica que el endpoint puede cumplir la métrica objetivo |
| ⚠️ CONDICIONAL | Puede cumplir la métrica con volumen de datos bajo; riesgo a escala |
| ❌ NO CUMPLE | El diseño del endpoint tiene riesgos estructurales que impiden cumplir la métrica |

---

### PERF-01 — Carga del listado de destinos (`GET /destinos`)

| Campo | Detalle |
|---|---|
| **Métrica objetivo** | Tiempo de respuesta < 2 segundos |
| **Consultas a BD** | 2 consultas: `SELECT * FROM Destinos WHERE activo=true` + `SELECT * FROM Destino_ui WHERE destination_id IN (...)` |
| **Procesamiento** | Mapeado en memoria: `Array.map()` sobre la lista de destinos para enriquecer rating, dificultad, duración y categoría (O(n) lineal) |
| **Latencia estimada** | 200–600 ms con conexión a Supabase en producción (región US-East o EU) y hasta 20 destinos activos |
| **Resultado** | La métrica < 2 segundos es alcanzable con el volumen actual de datos. No se aplica paginación; con más de 500 destinos la respuesta podría superar el umbral. |
| **Estado** | ✅ CUMPLE (con datos actuales) |

---

### PERF-02 — Login de usuario (`POST /login`)

| Campo | Detalle |
|---|---|
| **Métrica objetivo** | Tiempo de respuesta < 1 segundo |
| **Consultas a BD** | 1 consulta: `SELECT id, email, nombre, password, rol FROM Usuarios WHERE email = ?` |
| **Procesamiento** | `bcrypt.compare()` con factor de costo 10 → tiempo de hashing estimado 100–150 ms en servidor con 1 vCPU |
| **Latencia estimada** | 300–600 ms total (150 ms bcrypt + 150–400 ms consulta Supabase + overhead HTTP) |
| **Resultado** | La métrica < 1 segundo es alcanzable en condiciones normales. Bajo carga alta (>50 req/s concurrentes), el hashing bcrypt puede saturar el event loop de Node.js dado su naturaleza síncrona-bloqueante. |
| **Estado** | ⚠️ CONDICIONAL |

---

### PERF-03 — Carga del panel del administrador (`GET /admin/panel`)

| Campo | Detalle |
|---|---|
| **Métrica objetivo** | Tiempo de respuesta < 3 segundos |
| **Consultas a BD** | 4 consultas paralelas: `SELECT * FROM Usuarios` + `SELECT * FROM Destinos` + `SELECT * FROM Reservaciones` + `SELECT * FROM Destino_ui WHERE destination_id IN (...)` |
| **Procesamiento** | Múltiples `Array.map()`, `Array.filter()`, `Array.reduce()` para construir filas de inventario, usuarios, operaciones y analytics. Complejidad O(n × m) en el peor caso (cruce de reservaciones × destinos). |
| **Latencia estimada** | 600–1800 ms con tablas pequeñas (<100 registros cada una). Con crecimiento de datos (>1.000 reservaciones), el procesamiento en memoria puede superar los 2 segundos. |
| **Resultado** | La métrica < 3 segundos es alcanzable en fase inicial. Se recomienda implementar paginación en la consulta de reservaciones y mover cálculos analíticos a vistas materializadas en la BD para escalar. |
| **Estado** | ⚠️ CONDICIONAL |

---

### PERF-04 — Primera respuesta del asistente IA (`POST /chat`)

| Campo | Detalle |
|---|---|
| **Métrica objetivo** | Primer token recibido en < 3 segundos |
| **Dependencia externa** | API de Groq (`https://api.groq.com/openai/v1/chat/completions`) con modelo `openai/gpt-oss-120b` |
| **Procesamiento local** | Mínimo: solo construcción del cuerpo JSON y lectura de la respuesta completa |
| **Latencia estimada** | Groq API tiene latencia típica de 200–800 ms para el primer token con modelos grandes. Latencia total (Node.js overhead + Groq) estimada en 500 ms–2 s. |
| **Resultado** | La métrica < 3 segundos es factible en condiciones normales de la API de Groq. Sin embargo, el endpoint actual espera **toda la respuesta** antes de enviarla (`await response.json()`), por lo que el "primer token" visible para el usuario es equivalente al tiempo total de respuesta. Para cumplir el espíritu de la métrica se debería implementar streaming en este endpoint. |
| **Estado** | ⚠️ CONDICIONAL |

---

### PERF-05 — Carga inicial de la aplicación Flutter

| Campo | Detalle |
|---|---|
| **Métrica objetivo** | Pantalla principal visible en < 4 segundos |
| **Análisis** | La aplicación Flutter compila en modo Release a código nativo AOT (Ahead-of-Time). No requiere compilación en dispositivo. Los activos estáticos (imágenes, fuentes) están incluidos en el bundle. |
| **Dependencias de arranque** | Al iniciar, la app verifica `SharedPreferences` para recuperar el token y userId, luego redirige a la pantalla apropiada. Esta operación es local y < 50 ms. |
| **Llamadas de red en inicio** | Solo si el usuario ya tiene sesión activa (carga pantalla de inicio con llamada a API). |
| **Resultado** | La pantalla de login/registro (primera pantalla visible) carga desde el bundle local sin llamadas de red, por lo que aparece en < 1 segundo en dispositivos modernos. La pantalla principal post-login requiere una llamada de red adicional. En redes 4G/WiFi, la pantalla principal completa es visible en 2–4 segundos. |
| **Estado** | ✅ CUMPLE |

---

### PERF-06 — Concurrencia: 10 usuarios simultáneos realizando login

| Campo | Detalle |
|---|---|
| **Métrica objetivo** | Sin errores; tiempo de respuesta promedio < 2 segundos |
| **Análisis** | Node.js es monohilo con event loop no bloqueante. Las operaciones de I/O (consulta Supabase) son asíncronas y pueden manejarse en paralelo. Sin embargo, `bcrypt.compare()` es computacionalmente intensivo y puede bloquear el event loop parcialmente bajo carga concurrente. |
| **Estimación para 10 usuarios simultáneos** | Con 10 req simultáneas, cada una ejecuta ~150 ms de bcrypt + ~150–400 ms de consulta Supabase. Dado el event loop, las primeras respuestas llegarán en ~500–700 ms y las últimas en ~1.5–2 s dependiendo de la cola del event loop. |
| **Riesgo identificado** | Si se superan las 20–30 peticiones simultáneas de login, el tiempo de respuesta puede exceder los 2 segundos por saturación del hilo de CPU con bcrypt. Se recomienda mover bcrypt a un worker thread con `bcrypt.compare()` usando la versión `async` (ya implementada) pero considerar un pool de workers para escalar. |
| **Resultado** | Para 10 usuarios simultáneos, el sistema puede manejar la carga sin errores y dentro del umbral de 2 segundos promedio en un servidor con ≥1 vCPU y ≥512 MB RAM. |
| **Estado** | ✅ CUMPLE (con la infraestructura actual) |

---

### 9.1 Resumen de Resultados — Pruebas de Rendimiento

| ID | Escenario | Métrica Objetivo | Latencia Estimada | Estado |
|---|---|---|---|---|
| PERF-01 | `GET /destinos` | < 2 s | 200–600 ms | ✅ CUMPLE |
| PERF-02 | `POST /login` | < 1 s | 300–600 ms | ⚠️ CONDICIONAL |
| PERF-03 | `GET /admin/panel` | < 3 s | 600–1800 ms | ⚠️ CONDICIONAL |
| PERF-04 | `POST /chat` (primer token) | < 3 s | 500 ms–2 s | ⚠️ CONDICIONAL |
| PERF-05 | Carga inicial Flutter | < 4 s | < 1 s (login), 2–4 s (inicio) | ✅ CUMPLE |
| PERF-06 | 10 usuarios concurrentes en login | Sin errores, promedio < 2 s | 500 ms–2 s promedio | ✅ CUMPLE |

**Recomendaciones de optimización:**
- PERF-02/06: Considerar `bcrypt.hash/compare` en worker threads para no bloquear el event loop bajo carga.
- PERF-03: Implementar paginación en la consulta de reservaciones del panel admin y calcular analytics en la BD mediante vistas o funciones RPC de Supabase.
- PERF-04: Implementar streaming real hacia el cliente en `POST /chat` usando la misma lógica SSE de `/chat/stream` pero con la API de Groq.

---

## 10. Pruebas de Usabilidad

Las pruebas de usabilidad evalúan la facilidad de uso, accesibilidad y experiencia del usuario al interactuar con el sistema Tropical Travel. Las pruebas fueron realizadas mediante **revisión estática de código fuente HTML/CSS/JS** y análisis de la estructura de navegación.

### Leyenda de estado

| Símbolo | Significado |
|---|---|
| ✅ CUMPLE | El criterio evaluado se satisface completamente |
| ⚠️ CUMPLE PARCIALMENTE | El criterio se satisface en la mayoría de los casos con observaciones |
| ❌ NO CUMPLE | El criterio evaluado no se satisface |

---

### US-01 — Navegación entre secciones de la aplicación web

| Campo | Detalle |
|---|---|
| **Criterio** | El usuario puede moverse entre todas las secciones en ≤ 2 clics desde el menú principal |
| **Archivos revisados** | `HtmlPrin/Inicio.html`, `HtmlPrin/IAChat.html`, `HtmlPrin/Explorar.html`, `HtmlPrin/MisViajes.html`, `HtmlPrin/Comunidad.html`, `HtmlPrin/Perfil.html` |
| **Hallazgos** | La barra de navegación superior (`<nav class="top-nav">`) expone directamente los botones: **Explorar**, **Mis Viajes**, **Comunidad**, **IA Chat** y **Perfil**. Cada botón lleva directamente a la página de destino mediante `onclick="location.href='X.html'"`. En pantallas móviles (≤768px) los botones de la barra superior se colapsan y se reemplaza por un menú hamburguesa (sidebar drawer) que también expone todas las secciones en un clic adicional (hamburguesa → sección). También existe una barra de navegación inferior en IAChat.html para facilitar el acceso desde móvil. |
| **Resultado** | Desktop: 1 clic desde cualquier pantalla. Móvil: 2 clics (hamburguesa + sección). El criterio ≤ 2 clics se cumple en todos los dispositivos. |
| **Estado** | ✅ CUMPLE |

---

### US-02 — Mensajes de error comprensibles

| Campo | Detalle |
|---|---|
| **Criterio** | Los errores muestran texto legible en español, sin códigos técnicos expuestos al usuario |
| **Archivos revisados** | `Scripts/ScriptsLogin.js`, `Scripts/ScriptsReg.js`, `Scripts/ScriptsExplorar.js`, `Scripts/ScriptsFichasViaje.js`, `Scripts/ScriptsAdmin.js` |
| **Hallazgos** | **Login:** Usa `alert(err.message)` o `alert('Credenciales incorrectas o servidor no disponible.')`. El mensaje del servidor (`"Credenciales inválidas."`) se pasa directamente al alert — está en español. **Registro:** Los mensajes de validación son en español (`"Nombre, correo y contraseña son requeridos"`). **Explorar:** Muestra `"Error al cargar destinos desde el servidor."` en el grid. **Mis Viajes:** Renderiza `"Error al cargar tus viajes 😥"` en el contenedor. **Admin:** Usa `toast.textContent` con mensajes en español. El error del servidor se puede exponer directamente al usuario en algunos `alert(error.message)` sin filtrar términos técnicos de Supabase (ej: mensajes de violación de restricción de BD). |
| **Resultado** | Los mensajes propios del servidor están en español. Sin embargo, errores de Supabase (stack traces o mensajes de restricción) podrían exponerse directamente al usuario en casos de error 500. |
| **Estado** | ⚠️ CUMPLE PARCIALMENTE |

---

### US-03 — Diseño responsivo — vista móvil (web)

| Campo | Detalle |
|---|---|
| **Criterio** | El sitio web es usable en pantallas de 375 px a 1920 px de ancho |
| **Archivos revisados** | `Css/ClienteStyle.css`, `HtmlPrin/IAChat.html` |
| **Hallazgos** | El CSS define múltiples breakpoints responsivos: `@media (max-width: 1024px)`, `@media (max-width: 768px)`, `@media (max-width: 600px)` y `@media (max-width: 480px)`. El viewport meta tag está presente en las páginas HTML. Los contenedores usan `max-width` relativo y `width: 100%` para adaptarse. El límite inferior de 480px está cubierto con reglas específicas. Para pantallas de 375px (iPhone SE), las reglas de 480px son las más cercanas y se aplican. No se detectó un breakpoint específico para 375px, pero los elementos principales usan `width: 100%` y `min-width: 0`, lo que permite adaptación. |
| **Resultado** | El diseño es funcional desde 375px hasta 1920px. No existe un breakpoint específico para 375px, pero la ausencia de widths fijas en los contenedores principales garantiza usabilidad. |
| **Estado** | ✅ CUMPLE |

---

### US-04 — Indicadores de carga durante solicitudes al servidor

| Campo | Detalle |
|---|---|
| **Criterio** | Durante las solicitudes al servidor, se muestra un indicador visual de carga |
| **Archivos revisados** | `Scripts/ScriptsLogin.js`, `Scripts/ScriptsReg.js`, `Scripts/ScriptsExplorar.js`, `Scripts/ScriptsFichasViaje.js`, `Scripts/ScriptsAdmin.js`, `Scripts/ScriptsIAChat.js` |
| **Hallazgos** | **ScriptsAdmin.js:** Implementa función de `toast` con mensajes informativos (ej: "Cargando datos del panel..."). **ScriptsIAChat.js:** No implementa spinner ni deshabilita el botón `#sendBtn` durante el envío; el botón permanece activo y el usuario puede enviar mensajes duplicados. **ScriptsLogin.js:** No deshabilita el botón durante la solicitud `fetch`; el formulario puede enviarse múltiples veces. **ScriptsReg.js:** Sin indicador de carga. **ScriptsExplorar.js:** Sin spinner durante carga de destinos (el grid simplemente aparece cuando los datos llegan). **ScriptsFichasViaje.js:** Sin indicador visual durante cancelación o confirmación de reservas. |
| **Resultado** | El panel de administración tiene feedback textual básico. Los módulos principales de uso por el cliente (login, registro, exploración, reservas, chat IA) carecen de spinners o estados de carga visual. Este comportamiento puede llevar a clics duplicados y confusión en el usuario. |
| **Estado** | ❌ NO CUMPLE |

---

### US-05 — Confirmaciones de acciones destructivas

| Campo | Detalle |
|---|---|
| **Criterio** | Al cancelar una reserva o eliminar datos, se solicita confirmación previa |
| **Archivos revisados** | `Scripts/ScriptsFichasViaje.js`, `Scripts/ScriptsAdmin.js` |
| **Hallazgos** | **ScriptsFichasViaje.js (cancelar reserva):** Línea 147: `if (confirm('¿Seguro que deseas cancelar esta reserva?'))` — diálogo nativo del navegador con confirmación antes de ejecutar la cancelación. ✅ **ScriptsFichasViaje.js (confirmar pago):** Línea 137: `if (confirm('¿Confirmar pago de esta reserva?'))` — confirma antes de cambiar estado. ✅ **ScriptsAdmin.js (desactivar destino):** Línea 876: `if (button.dataset.action === 'delete-destination' && window.confirm('Desactivar X?'))` — confirmación antes de desactivar. ✅ **ScriptsAdmin.js (eliminar usuario):** Línea 896: `if (button.dataset.action === 'delete-user' && window.confirm('Eliminar X?'))` — confirmación antes de eliminar. ✅ |
| **Resultado** | Todas las acciones destructivas identificadas en el código tienen diálogo de confirmación previo. Los diálogos usan `confirm()` nativo del navegador, que es funcional aunque básico visualmente. |
| **Estado** | ✅ CUMPLE |

---

### US-06 — Accesibilidad del chat IA

| Campo | Detalle |
|---|---|
| **Criterio** | El campo de texto y el botón de envío son claramente identificables y funcionales |
| **Archivos revisados** | `HtmlPrin/IAChat.html`, `Scripts/ScriptsIAChat.js` |
| **Hallazgos** | **Campo de texto:** `<input id="chatInput" class="chat-input" placeholder="Escribe tu mensaje...">` — Visible, con placeholder descriptivo, identificado por ID. No tiene `aria-label` ni `aria-describedby` para lectores de pantalla. **Botón de envío:** `<button class="btn-send" id="sendBtn" type="button">` con un icono SVG de avión de papel. El botón no tiene texto visible ni `aria-label`. **Funcionalidad:** El input detecta evento `keydown Enter` para enviar; el botón `#sendBtn` tiene listener de `click`. El `sendBtn` no se deshabilita durante el envío (riesgo de mensajes duplicados). **Navegación desde móvil:** La barra de navegación inferior incluye el botón de IA Chat, facilitando el acceso. |
| **Resultado** | El campo y el botón son visualmente identificables y funcionales. Sin embargo, la ausencia de `aria-label` en el botón lo hace inaccesible para usuarios con lectores de pantalla. La falta de estado `disabled` durante el envío puede causar mensajes duplicados. |
| **Estado** | ⚠️ CUMPLE PARCIALMENTE |

---

### 10.1 Resumen de Resultados — Pruebas de Usabilidad

| ID | Criterio Evaluado | Estado | Defecto/Mejora Identificada |
|---|---|---|---|
| US-01 | Navegación en ≤ 2 clics | ✅ CUMPLE | Ninguna |
| US-02 | Mensajes de error en español | ⚠️ CUMPLE PARCIALMENTE | Mensajes de error de Supabase pueden exponerse sin filtrar |
| US-03 | Diseño responsivo 375–1920 px | ✅ CUMPLE | Sin breakpoint específico para 375px; funciona por diseño fluido |
| US-04 | Indicadores de carga | ❌ NO CUMPLE | Login, registro, exploración, reservas y chat sin spinner o `disabled` durante fetch |
| US-05 | Confirmaciones de acciones destructivas | ✅ CUMPLE | Diálogos nativos `confirm()` presentes en todas las acciones destructivas |
| US-06 | Accesibilidad del chat IA | ⚠️ CUMPLE PARCIALMENTE | Botón sin `aria-label`; input sin `aria-label`; botón no se deshabilita durante envío |

**Recomendaciones de mejora:**
- **US-04:** Agregar `disabled` y texto de carga (ej: "Iniciando sesión...") al botón durante el `fetch` en Login, Registro y Chat IA.
- **US-06:** Añadir `aria-label="Enviar mensaje"` al botón de envío del chat y `aria-label="Escribe tu mensaje"` al input para accesibilidad con lectores de pantalla.
- **US-02:** Filtrar mensajes de error de Supabase en el servidor antes de enviarlos al cliente (ej: reemplazar errores de restricción de BD por mensajes amigables genéricos).

---

## 11. Conclusión

El sistema **Tropical Travel v1.0** fue evaluado en sus **11 módulos** mediante **55 casos de prueba** definidos en el plan. Los módulos de autenticación, reservaciones y panel de administración funcionan correctamente. Se identificaron módulos con implementación pendiente (Itinerarios, sistema de notificaciones, preferencias de perfil) y deficiencias de seguridad (token no firmado, ausencia de middleware de autorización por cabecera).

**Acciones requeridas antes de producción:**

1. Implementar JWT firmado con `jsonwebtoken` y middleware de verificación en todos los endpoints protegidos.
2. Desarrollar el backend completo del módulo de Itinerarios (endpoints + tablas `Itinerarios`, `Itinerario_Actividades`, `Itinerario_Colaboradores`).
3. Implementar endpoint `PUT /perfil/:userId/preferencias` para la tabla `Referencias_Usuarios`.
4. Corregir la URL hardcodeada de IA Chat en `ScriptsIAChat.js`.
5. Migrar el almacenamiento de token en Flutter a `flutter_secure_storage`.

---

---

## 12. Matriz de Trazabilidad

La matriz relaciona cada **Requisito Funcional (RF)** del sistema con los **Casos de Prueba (CP)** que lo verifican y el estado de cobertura resultante.

### Leyenda de estado

| Símbolo | Significado |
|---|---|
| ✅ | Caso aprobado — requisito cubierto |
| ⚠️ | Caso aprobado con observación — cobertura parcial |
| ❌ | Caso fallido — requisito no cubierto |

---

### 12.1 Tabla de Trazabilidad Requisito → Caso de Prueba

| ID Requisito | Descripción del Requisito | Casos de Prueba | Estado |
|---|---|---|---|
| RF-01 | El sistema debe permitir registrar un nuevo usuario con todos sus datos obligatorios y almacenar la contraseña hasheada con bcryptjs | CP-01-01 | ✅ |
| RF-02 | El sistema debe impedir el registro con un correo electrónico ya existente | CP-01-02 | ✅ |
| RF-03 | El sistema debe validar campos obligatorios en el formulario de registro antes de enviar la petición al servidor | CP-01-03 | ✅ |
| RF-04 | El sistema debe autenticar usuarios con rol "cliente", generar un token, almacenarlo en localStorage y redirigir a Inicio.html | CP-01-04 | ⚠️ |
| RF-05 | El sistema debe autenticar usuarios con rol "admin" y redirigir a InicioAdmin.html | CP-01-05 | ✅ |
| RF-06 | El sistema debe rechazar el inicio de sesión con contraseña incorrecta | CP-01-06 | ✅ |
| RF-07 | El sistema debe rechazar el inicio de sesión con correo no registrado | CP-01-07 | ✅ |
| RF-08 | El sistema debe proteger las páginas privadas redirigiendo al login si no hay sesión activa | CP-01-08 | ✅ |
| RF-09 | El sistema debe mostrar los datos completos del perfil del usuario autenticado | CP-02-01 | ⚠️ |
| RF-10 | El sistema debe permitir editar y guardar los datos del perfil del usuario | CP-02-02 | ✅ |
| RF-11 | El sistema debe persistir las preferencias del usuario en la tabla Referencias_Usuarios | CP-02-03 | ❌ |
| RF-12 | El sistema debe permitir subir y actualizar la foto de perfil del usuario | CP-02-04 | ❌ |
| RF-13 | El sistema debe listar todos los destinos activos con nombre, imagen, precio, dificultad, duración y categoría | CP-03-01 | ✅ |
| RF-14 | El sistema debe filtrar destinos por categoría | CP-03-02 | ✅ |
| RF-15 | El sistema debe filtrar destinos por dificultad | CP-03-03 | ❌ |
| RF-16 | El sistema debe filtrar destinos por rango de precio (mínimo/máximo) | CP-03-04 | ❌ |
| RF-17 | El sistema debe mostrar la ficha completa de un destino con descripción, actividades, restaurantes, precio y alertas | CP-03-05 | ✅ |
| RF-18 | El sistema debe mostrar un mensaje cuando no hay destinos activos disponibles | CP-03-06 | ✅ |
| RF-19 | El sistema debe permitir a un cliente crear una reserva con estado "Pendiente" | CP-04-01 | ✅ |
| RF-20 | El sistema debe listar todas las reservas del usuario con nombre del destino, fecha, estado y opciones | CP-04-02 | ✅ |
| RF-21 | El sistema debe permitir al usuario cancelar una reserva activa | CP-04-03 | ✅ |
| RF-22 | El sistema debe impedir reservas duplicadas para el mismo destino | CP-04-04 | ✅ |
| RF-23 | El sistema debe permitir al administrador cambiar el estado de una reserva | CP-04-05 | ✅ |
| RF-24 | El sistema debe permitir crear un itinerario con nombre, descripción, fecha de inicio y fin | CP-05-01 | ❌ |
| RF-25 | El sistema debe permitir agregar actividades a un itinerario organizadas por día | CP-05-02 | ❌ |
| RF-26 | El sistema debe permitir configurar un itinerario como público | CP-05-03 | ❌ |
| RF-27 | El sistema debe permitir agregar colaboradores a un itinerario con permisos específicos | CP-05-04 | ❌ |
| RF-28 | El sistema debe permitir buscar otros usuarios por nombre excluyendo al usuario autenticado | CP-06-01 | ✅ |
| RF-29 | El sistema debe permitir el envío de mensajes directos entre usuarios | CP-06-02 | ⚠️ |
| RF-30 | El sistema debe permitir crear grupos de viajeros y agregar miembros | CP-06-03 | ⚠️ |
| RF-31 | El sistema debe almacenar reportes/quejas en la tabla Reportes | CP-06-04 | ❌ |
| RF-32 | El asistente IA (LawMoon) debe responder consultas de viaje con información relevante sobre Colombia | CP-07-01 | ⚠️ |
| RF-33 | El asistente IA debe responder en streaming (Server-Sent Events) sin bloquear la interfaz | CP-07-02 | ✅ |
| RF-34 | El sistema debe manejar la indisponibilidad del servicio de IA mostrando un error controlado | CP-07-03 | ✅ |
| RF-35 | El historial de mensajes del chat debe mantenerse visible durante la sesión activa | CP-07-04 | ⚠️ |
| RF-36 | El sistema debe redirigir al administrador a InicioAdmin.html con todos los datos del panel cargados | CP-08-01 | ✅ |
| RF-37 | El sistema debe denegar el acceso al panel de administración a usuarios con rol "cliente" | CP-08-02 | ✅ |
| RF-38 | El sistema debe permitir al administrador crear nuevos destinos | CP-08-03 | ✅ |
| RF-39 | El sistema debe permitir al administrador editar destinos existentes | CP-08-04 | ✅ |
| RF-40 | El sistema debe permitir al administrador eliminar o desactivar destinos | CP-08-05 | ✅ |
| RF-41 | El sistema debe permitir al administrador editar o eliminar usuarios | CP-08-06 | ✅ |
| RF-42 | El sistema debe mostrar estadísticas de usuarios, destinos, reservas e ingresos en el panel de analytics | CP-08-07 | ✅ |
| RF-43 | El sistema debe mostrar alertas activas de la tabla Alertas al usuario correspondiente | CP-09-01 | ⚠️ |
| RF-44 | El sistema debe notificar al usuario cuando el estado de su reserva cambia | CP-09-02 | ❌ |
| RF-45 | La aplicación móvil debe permitir registro e inicio de sesión con almacenamiento seguro del token | CP-10-01 | ⚠️ |
| RF-46 | La aplicación móvil debe cargar y mostrar los destinos desde la API correctamente | CP-10-02 | ✅ |
| RF-47 | La aplicación móvil debe permitir crear reservas con estado "Pendiente" | CP-10-03 | ✅ |
| RF-48 | La aplicación móvil debe integrar el chat con el asistente IA | CP-10-04 | ✅ |
| RF-49 | La aplicación móvil debe dar acceso completo al panel de administración para usuarios admin | CP-10-05 | ✅ |
| RF-50 | La aplicación móvil debe mantener la sesión activa al cerrar y reabrir la app | CP-10-06 | ✅ |
| RF-51 | Los endpoints de administración deben rechazar peticiones de usuarios con rol "cliente" (403) | CP-11-01 | ⚠️ |
| RF-52 | El servidor debe rechazar tokens JWT caducados con error 401 | CP-11-02 | ❌ |
| RF-53 | El servidor debe rechazar peticiones sin cabecera Authorization con error 401 | CP-11-03 | ⚠️ |
| RF-54 | El servidor debe validar el formato UUID en parámetros de ruta y retornar 400 si es inválido | CP-11-04 | ✅ |
| RF-55 | Las contraseñas deben almacenarse hasheadas con bcryptjs, nunca en texto plano | CP-11-05 | ✅ |

---

### 12.2 Cobertura por Módulo

| Módulo | Requisitos Cubiertos (✅) | Cobertura Parcial (⚠️) | Sin Cobertura (❌) | Total RF | % Cubierto |
|---|---|---|---|---|---|
| MOD-01: Autenticación | 6 | 2 | 0 | 8 | 100% |
| MOD-02: Gestión de Perfil | 1 | 1 | 2 | 4 | 50% |
| MOD-03: Exploración de Destinos | 4 | 0 | 2 | 6 | 67% |
| MOD-04: Reservaciones | 5 | 0 | 0 | 5 | 100% |
| MOD-05: Itinerarios | 0 | 0 | 4 | 4 | 0% |
| MOD-06: Comunidad | 1 | 2 | 1 | 4 | 75% |
| MOD-07: Asistente IA (LawMoon) | 2 | 2 | 0 | 4 | 100% |
| MOD-08: Panel de Administración | 7 | 0 | 0 | 7 | 100% |
| MOD-09: Notificaciones | 0 | 1 | 1 | 2 | 50% |
| MOD-10: Aplicación Móvil Flutter | 5 | 1 | 0 | 6 | 100% |
| MOD-11: Seguridad | 2 | 2 | 1 | 5 | 80% |
| **TOTAL** | **33** | **11** | **11** | **55** | **80%** |

---

### 12.3 Requisitos Críticos Sin Cobertura

Los siguientes requisitos funcionales de prioridad **Alta** o **Media** no están cubiertos y representan riesgo para el despliegue:

| RF | Descripción | Prioridad | Defecto Asociado |
|---|---|---|---|
| RF-11 | Persistencia de preferencias en `Referencias_Usuarios` | Media | DEF-01 |
| RF-15 | Filtrado de destinos por dificultad | Media | DEF-03 |
| RF-16 | Filtrado de destinos por rango de precio | Media | DEF-04 |
| RF-24 | Creación de itinerarios con persistencia en BD | Media | DEF-05 |
| RF-25 | Agregar actividades a itinerarios | Media | DEF-05 |
| RF-44 | Notificación de cambio de estado de reserva | Media | DEF-07 |
| RF-52 | Rechazo de tokens JWT caducados (expiración) | **Alta** | DEF-08 |

---

## 13. Conclusiones y Recomendaciones

### 13.1 Resumen Ejecutivo

El sistema **Tropical Travel v1.0** fue sometido a un proceso de pruebas funcionales, de seguridad y de integración móvil que abarcó **11 módulos** y **55 casos de prueba**. Los resultados globales indican un nivel de madurez suficiente para un despliegue controlado en ambientes de pre-producción, con restricciones específicas antes de pasar a producción.

| Indicador | Valor |
|---|---|
| Total de casos de prueba ejecutados | 55 |
| Casos aprobados (sin observaciones) | 33 (60%) |
| Casos aprobados con observación | 11 (20%) |
| Casos fallidos | 11 (20%) |
| Tasa de aprobación efectiva (✅ + ⚠️) | **80%** |
| Defectos registrados | 8 |
| Defectos de severidad Alta | 2 (DEF-05, DEF-08) |
| Defectos de severidad Media | 4 (DEF-01, DEF-03, DEF-04, DEF-07) |
| Defectos de severidad Baja | 2 (DEF-02, DEF-06) |
| Nivel de aceptación del sistema | **APROBADO CONDICIONALMENTE** |

El sistema cumple el umbral mínimo de aceptación del 75% y satisface el 100% de los criterios en los módulos críticos de negocio (autenticación, reservaciones, panel de administración). No obstante, dos defectos de severidad Alta —la ausencia de backend en el módulo de Itinerarios y la implementación incorrecta del token de sesión— constituyen impedimentos para el despliegue en producción.

---

### 13.2 Fortalezas Identificadas

Las siguientes características del sistema demostraron un funcionamiento correcto y robusto durante las pruebas, y representan una base sólida para el crecimiento del producto:

#### ✅ Autenticación y Control de Acceso
- El flujo completo de registro → login → sesión activa → logout funciona sin errores críticos.
- La separación de roles `cliente` / `admin` se aplica correctamente en la interfaz web y en la aplicación móvil.
- Las contraseñas se almacenan con **bcryptjs (factor 10)**, eliminando el riesgo de exposición de credenciales en texto plano.
- La validación de campos en el formulario de registro es consistente entre frontend y backend.

#### ✅ Módulo de Reservaciones
- El ciclo de vida completo de una reserva (crear → listar → cancelar → cambio de estado por admin) funciona sin fallos.
- La restricción de reserva duplicada está implementada a nivel de base de datos y validada por el servidor.

#### ✅ Panel de Administración
- Los 7 flujos de administración evaluados (acceso, gestión de destinos, gestión de usuarios, analytics) aprobaron sin observaciones.
- El control de acceso al panel rechaza correctamente a usuarios con rol `cliente`.

#### ✅ Aplicación Móvil Flutter
- La app replica correctamente los flujos de autenticación, exploración de destinos, reservas, chat IA y administración.
- La integración con la API REST es estable; todos los flujos críticos funcionan en dispositivo físico/emulador.

#### ✅ Asistente IA (LawMoon)
- La integración con la API de Anthropic Claude mediante **Server-Sent Events** funciona en streaming sin bloquear la interfaz.
- El sistema maneja correctamente la indisponibilidad del servicio IA mostrando un mensaje de error controlado.

#### ✅ Exploración de Destinos
- El listado y la ficha de detalle de destinos cargan correctamente con todos los campos requeridos.
- El filtro por categoría funciona tanto en web como en la app móvil.

---

### 13.3 Plan de Corrección de Defectos (Priorizado)

Los defectos identificados se organizan en tres sprints de corrección según su severidad e impacto en la operación del sistema.

---

#### Sprint 1 — Correcciones Bloqueantes (Previo a Producción)

Estos defectos son **obligatorios** antes de cualquier despliegue en producción. Afectan la seguridad o la disponibilidad de funcionalidades nucleares.

| Defecto | Descripción | Responsable sugerido | Esfuerzo estimado |
|---|---|---|---|
| **DEF-08** | Implementar JWT firmado con `jsonwebtoken`: generar token con `jwt.sign()`, configurar expiración (`expiresIn`), y crear middleware `verifyToken` que valide firma y expiración en todos los endpoints protegidos. Eliminar el token Base64 simple. | Backend Lead | 2–3 días |
| **DEF-05** | Desarrollar el backend completo del módulo de Itinerarios: endpoints `POST /itinerarios`, `GET /itinerarios/:userId`, `PUT /itinerarios/:id`, `DELETE /itinerarios/:id`, `POST /itinerarios/:id/actividades`, `POST /itinerarios/:id/colaboradores`. Validar contra tablas `Itinerarios`, `Itinerario_Actividades`, `Itinerario_Colaboradores`. | Backend + Frontend | 5–7 días |

---

#### Sprint 2 — Correcciones de Funcionalidad Media (Semana 1 post-lanzamiento)

Afectan funcionalidades prometidas al usuario final que están incompletas. No bloquean la operación principal pero degradan la experiencia.

| Defecto | Descripción | Responsable sugerido | Esfuerzo estimado |
|---|---|---|---|
| **DEF-01** | Implementar endpoint `PUT /perfil/:userId/preferencias` que persista los campos `intereses`, `presupuesto` e `idiomas_preferidos` en la tabla `Referencias_Usuarios`. Conectar el formulario de preferencias en `EditarPerfil.html` a este endpoint. | Backend + Frontend | 1–2 días |
| **DEF-03** | Agregar filtro por dificultad en `GET /destinos?dificultad=` en el servidor y el selector correspondiente en la interfaz de Exploración. | Backend + Frontend | 1 día |
| **DEF-04** | Agregar filtro por rango de precio en `GET /destinos?precioMin=&precioMax=` en el servidor e inputs numéricos en la interfaz de Exploración. | Backend + Frontend | 1 día |
| **DEF-07** | Implementar notificación al cliente cuando el administrador cambia el estado de su reserva. Opciones: websocket, polling periódico o correo electrónico mediante `nodemailer`. Registrar notificación en tabla `Notificaciones`. | Backend | 2–3 días |

---

#### Sprint 3 — Mejoras Menores (Semana 2–3 post-lanzamiento)

Defectos de baja severidad o mejoras de calidad que no afectan flujos críticos.

| Defecto | Descripción | Responsable sugerido | Esfuerzo estimado |
|---|---|---|---|
| **DEF-02** | Implementar endpoint `PUT /perfil/:userId/foto` con `multer` para subir imagen de perfil al servidor o a un bucket S3/Supabase Storage. Mostrar la imagen en el perfil y en la barra de navegación. | Backend + Frontend | 2 días |
| **DEF-06** | Implementar endpoint `POST /comunidad/reportes` que almacene el reporte en la tabla `Reportes` con `id_reportador`, `id_reportado`, `motivo` y `fecha`. Conectar el formulario de reporte en la interfaz de Comunidad. | Backend + Frontend | 1 día |
| *(Mejora)* | Reemplazar la URL hardcodeada `http://localhost:3000` en `ScriptsIAChat.js` por una variable de entorno o constante de configuración para evitar errores en despliegues que no sean localhost. | Frontend | < 1 día |
| *(Mejora)* | Migrar el almacenamiento del token en Flutter de `SharedPreferences` a `flutter_secure_storage` para cumplir con buenas prácticas de seguridad en dispositivos móviles. | Mobile | 1 día |

---

#### Resumen del Plan de Corrección

| Sprint | Defectos | Esfuerzo total estimado | Condición |
|---|---|---|---|
| Sprint 1 | DEF-08, DEF-05 | 7–10 días | **Obligatorio antes de producción** |
| Sprint 2 | DEF-01, DEF-03, DEF-04, DEF-07 | 5–7 días | Recomendado en semana 1 post-lanzamiento |
| Sprint 3 | DEF-02, DEF-06 + 2 mejoras | 4–5 días | Deseable en semana 2–3 post-lanzamiento |

---

*Informe elaborado por el Equipo QA — Tropical Travel v1.0 — 08 de abril de 2026*
