# Guía paso a paso para ejecución de casos de prueba

## 1) Objetivo
Definir **cómo ejecutar** los casos de prueba funcionales y de seguridad del proyecto, y **qué evidencia** guardar para demostrar su ejecución.

## 2) Alcance
Esta guía cubre los casos de prueba:
- MOD-01 a MOD-11
- CP-01-01 hasta CP-11-05

## 3) Reglas de evidencia (aplican a todos los casos)
Para cada caso de prueba, guardar:
1. **ID del caso** (ej. CP-01-01).
2. **Fecha/hora** de ejecución.
3. **Entorno** (Web o Móvil, navegador/dispositivo, URL/API base).
4. **Datos usados** (correo, usuario, destino, etc. sin exponer secretos).
5. **Capturas de pantalla**:
   - Antes de ejecutar (estado inicial/precondición).
   - Durante el flujo (pasos clave).
   - Resultado final (éxito o error esperado).
6. **Evidencia técnica** cuando aplique:
   - Pestaña **Network** (request/response, código HTTP).
   - **Consola** (si el caso requiere validar ausencia/presencia de errores).
   - Base de datos (captura de registro creado/actualizado).
7. **Resultado obtenido** (Aprobado/Rechazado) y observaciones.

## 4) Preparación del entorno
1. Verificar que backend y frontend estén activos.
2. Confirmar conexión a base de datos y disponibilidad de API IA (Groq) cuando aplique.
3. Preparar datos de prueba:
   - Usuario cliente.
   - Usuario administrador.
   - Destinos activos/inactivos.
   - Reservas de prueba.
4. Limpiar sesión según caso:
   - Cerrar sesión o eliminar `localStorage` si se requiere “sin sesión activa”.
5. Abrir herramientas del navegador (Network y Console) para capturas.

---

## 5) Paso a paso por casos de prueba

> Formato por caso: **Ejecución** + **Evidencia mínima**.

## MOD-01: AUTENTICACIÓN

### CP-01-01 Registro exitoso de nuevo usuario (Alta)
**Ejecución:**
1. Abrir `index.html` y entrar a `Registro.html`.
2. Completar nombre, correo, contraseña, teléfono, país, ciudad y fecha de nacimiento con datos válidos no existentes.
3. Clic en **Registrarse**.
4. Intentar iniciar sesión con el nuevo usuario.
**Evidencia mínima:**
- Captura del formulario completo antes de enviar.
- Captura del mensaje de éxito.
- Captura en BD del usuario creado (password en hash).
- Captura de login exitoso con ese usuario.

### CP-01-02 Registro con correo existente (Alta)
**Ejecución:**
1. Ir a `Registro.html`.
2. Registrar usando un correo ya existente.
3. Enviar formulario.
**Evidencia mínima:**
- Captura del correo duplicado ingresado.
- Captura del mensaje “correo en uso” (o equivalente).
- Captura/consulta BD que confirme que no hay duplicado nuevo.

### CP-01-03 Registro con campos obligatorios vacíos (Media)
**Ejecución:**
1. Abrir `Registro.html`.
2. Dejar campos obligatorios en blanco.
3. Enviar formulario.
**Evidencia mínima:**
- Captura de validaciones en pantalla.
- Captura de Network mostrando que no se envía petición al servidor.

### CP-01-04 Login exitoso rol cliente (Alta)
**Ejecución:**
1. Abrir `index.html`.
2. Ingresar email y contraseña válidos de cliente.
3. Clic en **Iniciar sesión**.
**Evidencia mínima:**
- Captura de login con credenciales cliente.
- Captura de redirección a `Inicio.html`.
- Captura de `localStorage` con JWT.

### CP-01-05 Login exitoso rol admin (Alta)
**Ejecución:**
1. Abrir `index.html`.
2. Ingresar credenciales de administrador.
3. Iniciar sesión.
**Evidencia mínima:**
- Captura de credenciales admin (sin mostrar contraseña completa).
- Captura de redirección a `InicioAdmin.html`.

### CP-01-06 Login con contraseña incorrecta (Alta)
**Ejecución:**
1. Ingresar email válido y contraseña incorrecta.
2. Enviar.
**Evidencia mínima:**
- Captura de error de autenticación.
- Captura de respuesta HTTP de error en Network.

### CP-01-07 Login con correo no registrado (Alta)
**Ejecución:**
1. Ingresar correo inexistente y cualquier contraseña.
2. Enviar.
**Evidencia mínima:**
- Captura del mensaje de error.
- Captura de respuesta HTTP de error.

### CP-01-08 Acceso a página protegida sin sesión (Alta)
**Ejecución:**
1. Eliminar JWT de `localStorage`.
2. Acceder directamente a `Inicio.html` o `Perfil.html`.
**Evidencia mínima:**
- Captura de `localStorage` sin token.
- Captura de redirección al login.

## MOD-02: GESTIÓN DE PERFIL

### CP-02-01 Consulta del perfil (Media)
**Ejecución:**
1. Iniciar sesión.
2. Ir a `Perfil.html`.
**Evidencia mínima:**
- Captura del perfil con datos cargados (nombre, correo, teléfono, país, ciudad, fecha, foto).

### CP-02-02 Edición exitosa del perfil (Media)
**Ejecución:**
1. En `Perfil.html`, editar teléfono/ciudad.
2. Guardar cambios.
3. Recargar o volver al perfil.
**Evidencia mínima:**
- Captura antes y después de editar.
- Captura en BD o respuesta API con datos actualizados.

### CP-02-03 Actualización de preferencias (Media)
**Ejecución:**
1. Editar intereses, presupuesto, idiomas, moneda, notificaciones.
2. Guardar.
**Evidencia mínima:**
- Captura del formulario de preferencias.
- Evidencia de persistencia en `Referencias_Usuarios`.

### CP-02-04 Actualización de foto de perfil (Baja)
**Ejecución:**
1. Seleccionar nueva imagen.
2. Guardar.
**Evidencia mínima:**
- Captura de carga de imagen.
- Captura de la foto actualizada sin recargar.

## MOD-03: EXPLORACIÓN DE DESTINOS

### CP-03-01 Listado de destinos activos (Alta)
**Ejecución:** abrir `Explorar.html` con usuario autenticado.
**Evidencia mínima:** captura del listado mostrando nombre, imagen, precio, dificultad, duración y categoría.

### CP-03-02 Filtrado por categoría (Media)
**Ejecución:** seleccionar categoría (ej. playa).
**Evidencia mínima:** captura del filtro aplicado + resultados solo de esa categoría.

### CP-03-03 Filtrado por dificultad (Media)
**Ejecución:** seleccionar Fácil/Moderado/Difícil.
**Evidencia mínima:** captura del filtro + resultados coincidentes.

### CP-03-04 Filtrado por precio (Media)
**Ejecución:** aplicar rango min/máx.
**Evidencia mínima:** captura del rango + resultados dentro del rango.

### CP-03-05 Detalle de destino (Media)
**Ejecución:** clic en un destino del listado.
**Evidencia mínima:** captura de ficha completa (descripción, imágenes, actividades, restaurantes, precio, alertas).

### CP-03-06 Sin destinos activos (Baja)
**Ejecución:** dejar `activo=true` en 0 registros y abrir `Explorar.html`.
**Evidencia mínima:** captura del mensaje “sin destinos disponibles” + consola sin errores.

## MOD-04: RESERVACIONES

### CP-04-01 Creación exitosa de reservación (Alta)
**Ejecución:** desde `Explorar.html` seleccionar destino, clic **Reservar**, confirmar fecha.
**Evidencia mínima:** captura de confirmación + registro en BD con estado **Pendiente**.

### CP-04-02 Listado de reservas del usuario (Alta)
**Ejecución:** ir a `MisViajes.html`.
**Evidencia mínima:** captura de lista con destino, fecha, estado y acciones.

### CP-04-03 Cancelación por usuario (Alta)
**Ejecución:** en `MisViajes.html`, seleccionar reserva activa, clic **Cancelar**, confirmar.
**Evidencia mínima:** captura antes/después + estado **Cancelada** en BD.

### CP-04-04 Intento de reserva duplicada (Media)
**Ejecución:** intentar crear segunda reserva activa para el mismo destino.
**Evidencia mínima:** captura de mensaje de bloqueo + evidencia de no creación en BD.

### CP-04-05 Actualización de estado por admin (Alta)
**Ejecución:** en panel admin, pasar una reserva pendiente a confirmada.
**Evidencia mínima:** captura en panel admin + captura de vista cliente actualizada.

## MOD-05: ITINERARIOS

### CP-05-01 Creación de itinerario (Media)
**Ejecución:** en `itinerario.html`, crear con nombre, descripción, fecha inicio y fin; guardar.
**Evidencia mínima:** captura de formulario y confirmación + registro en tabla `Itinerarios`.

### CP-05-02 Agregar actividades a itinerario (Media)
**Ejecución:** seleccionar itinerario y agregar actividades con día y orden.
**Evidencia mínima:** captura de actividades organizadas + evidencia en `Itinerario_Actividades`.

### CP-05-03 Configurar itinerario público (Baja)
**Ejecución:** editar itinerario, marcar **Público**, guardar.
**Evidencia mínima:** captura del campo público activo + persistencia `publico=true`.

### CP-05-04 Agregar colaboradores (Baja)
**Ejecución:** agregar usuario colaborador con permiso ver/editar.
**Evidencia mínima:** captura del colaborador agregado + evidencia en `Itinerario_Colaboradores`.

## MOD-06: COMUNIDAD

### CP-06-01 Búsqueda de viajeros (Media)
**Ejecución:** abrir `Comunidad.html`, buscar por nombre.
**Evidencia mínima:** captura de resultados sin incluir al usuario autenticado.

### CP-06-02 Mensaje directo (Media)
**Ejecución:** seleccionar usuario, enviar mensaje.
**Evidencia mínima:** captura del mensaje en remitente y destinatario.

### CP-06-03 Crear grupo (Media)
**Ejecución:** crear grupo con nombre/descripcion y agregar miembros.
**Evidencia mínima:** captura del grupo creado + interacción de miembros.

### CP-06-04 Enviar reporte/queja (Baja)
**Ejecución:** enviar reporte con motivo y descripción.
**Evidencia mínima:** captura del envío + registro en tabla `Reportes`.

## MOD-07: ASISTENTE IA (LAWMOON)

### CP-07-01 Mensaje y respuesta (Alta)
**Ejecución:** abrir `IAChat.html`, enviar consulta de viaje.
**Evidencia mínima:** captura de pregunta y respuesta relevante.

### CP-07-02 Respuesta streaming SSE (Alta)
**Ejecución:** enviar mensaje largo/complexo.
**Evidencia mínima:** grabación o secuencia de capturas mostrando salida progresiva + request a `/chat/stream`.

### CP-07-03 Indisponibilidad API IA (Media)
**Ejecución:** simular caída de Groq y enviar mensaje.
**Evidencia mínima:** captura de mensaje de error controlado sin crash ni detalle sensible.

### CP-07-04 Persistencia historial sesión (Baja)
**Ejecución:** enviar varios mensajes en la misma sesión.
**Evidencia mínima:** captura del historial visible en pantalla durante la sesión.

## MOD-08: PANEL DE ADMINISTRACIÓN

### CP-08-01 Acceso admin correcto (Alta)
**Ejecución:** login con usuario admin.
**Evidencia mínima:** captura de `InicioAdmin.html` con alertas, estadísticas, inventario, usuarios y operaciones cargados.

### CP-08-02 Acceso admin con rol cliente (Alta)
**Ejecución:** siendo cliente, intentar abrir `InicioAdmin.html` directo.
**Evidencia mínima:** captura de denegación y redirección a `Inicio.html` (o mensaje de acceso denegado).

### CP-08-03 Crear destino (Alta)
**Ejecución:** en inventario admin, crear destino con campos requeridos.
**Evidencia mínima:** captura del alta + visualización en panel y en exploración de cliente.

### CP-08-04 Editar destino (Alta)
**Ejecución:** modificar precio/descripción y guardar.
**Evidencia mínima:** captura antes/después + reflejo en vista cliente.

### CP-08-05 Eliminar destino (Alta)
**Ejecución:** seleccionar destino, eliminar y confirmar.
**Evidencia mínima:** captura de confirmación + no aparición en exploración cliente.

### CP-08-06 Gestión de usuarios (Alta)
**Ejecución:** en sección usuarios, editar o eliminar usuario.
**Evidencia mínima:** captura de operación + evidencia en tabla `Usuarios`; si se eliminó, validar que no puede iniciar sesión.

### CP-08-07 Analíticas y estadísticas (Media)
**Ejecución:** abrir sección de analíticas.
**Evidencia mínima:** captura de usuarios activos, destinos, reservas e ingresos.

## MOD-09: NOTIFICACIONES

### CP-09-01 Alertas activas (Media)
**Ejecución:** iniciar sesión y revisar sección de alertas.
**Evidencia mínima:** captura de alertas con `activo=true`.

### CP-09-02 Notificación por cambio de reserva (Media)
**Ejecución:** admin cambia estado de reserva de un cliente.
**Evidencia mínima:** captura del cambio en admin + captura de notificación recibida por cliente.

## MOD-10: APLICACIÓN MÓVIL (FLUTTER)

### CP-10-01 Registro/Login móvil (Alta)
**Ejecución:** abrir app, registrar o iniciar sesión.
**Evidencia mínima:** capturas del flujo + evidencia de token en almacenamiento seguro (`flutter_secure_storage`).

### CP-10-02 Explorar destinos móvil (Alta)
**Ejecución:** abrir pantalla **Explorar**.
**Evidencia mínima:** captura de lista con imágenes, precios y categorías correctas.

### CP-10-03 Crear reserva móvil (Alta)
**Ejecución:** seleccionar destino y confirmar reserva.
**Evidencia mínima:** captura de confirmación + registro en BD con estado Pendiente.

### CP-10-04 Chat IA móvil (Media)
**Ejecución:** abrir pantalla chat IA y enviar mensaje.
**Evidencia mínima:** captura de pregunta/respuesta en interfaz móvil.

### CP-10-05 Panel admin móvil (Media)
**Ejecución:** login como admin y navegar Dashboard/Inventario/Usuarios/Operaciones.
**Evidencia mínima:** capturas de cada pantalla funcional.

### CP-10-06 Persistencia de sesión móvil (Media)
**Ejecución:** cerrar app totalmente y reabrir.
**Evidencia mínima:** captura que muestre sesión aún activa sin nuevo login.

## MOD-11: SEGURIDAD

### CP-11-01 Protección endpoint admin (Alta)
**Ejecución:** hacer `POST /admin/destinos` con JWT de cliente.
**Evidencia mínima:** captura request/response con 401/403 y sin cambios en BD.

### CP-11-02 Token JWT caducado (Alta)
**Ejecución:** llamar endpoint protegido con token expirado.
**Evidencia mínima:** captura respuesta 401 + redirección al login en cliente.

### CP-11-03 Acceso sin token JWT (Alta)
**Ejecución:** llamar endpoint protegido sin `Authorization`.
**Evidencia mínima:** captura 401 y no exposición de datos sensibles.

### CP-11-04 UUID inválido en ruta (Media)
**Ejecución:** llamar `/perfil/123abc`.
**Evidencia mínima:** captura respuesta 400 controlada (sin error interno).

### CP-11-05 Verificación de hash de contraseñas (Alta)
**Ejecución:** consultar tabla usuarios y revisar `password`.
**Evidencia mínima:** captura del valor hasheado (no texto plano) y comparación con política esperada.

---

## 6) Plantilla de registro de ejecución (usar por cada caso)
- **Caso:** CP-XX-XX
- **Módulo:** MOD-XX
- **Prioridad:** Alta/Media/Baja
- **Ejecutor:**
- **Fecha/Hora:**
- **Datos de prueba:**
- **Pasos ejecutados:**
- **Resultado esperado:**
- **Resultado obtenido:**
- **Estado:** Aprobado / Rechazado
- **Evidencias adjuntas:** (capturas, video, network, BD)
- **Observaciones / Incidencias:**

## 7) Criterio de cierre
Se considera ejecución completa cuando:
1. Todos los casos definidos fueron corridos en el entorno objetivo.
2. Cada caso tiene evidencia mínima adjunta.
3. Cada fallo tiene incidencia registrada y trazabilidad.
