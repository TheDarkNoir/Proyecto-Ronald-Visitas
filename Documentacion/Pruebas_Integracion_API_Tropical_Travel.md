# PRUEBAS DE INTEGRACIÓN DE LA API
## Sistema: Tropical Travel

Fecha de ejecución: 2026-04-13T05:18:13Z  
Base URL de prueba: `http://127.0.0.1:5501`

---

## 1) Plan de pruebas de integración API (qué es)

Las pruebas de integración API validan la comunicación real entre cliente HTTP, rutas de `servidor.js`, validaciones de entrada y respuestas del backend en formato JSON/HTML/SSE.

### Objetivo
Verificar que los endpoints principales:
- respondan con códigos HTTP correctos,
- validen datos inválidos,
- devuelvan mensajes consistentes,
- mantengan el contrato mínimo de respuesta.

### Alcance
Se cubrieron 10 pruebas sobre:
- Home (`/`)
- Registro (`/registrar`)
- Login (`/login`)
- Perfil (`/perfil/:userId`)
- Reservas (`/reservas/:userId`, `/reservas/:reservationId/status`)
- Admin panel (`/admin/panel`)
- Chat streaming (`/chat/stream`)

### Criterio de aceptación
Cada prueba se considera aprobada cuando el código HTTP y el comportamiento real coinciden con el resultado esperado del caso.

---

## 2) Paso a paso para ejecutar las pruebas

1. Abrir terminal en el proyecto:
   ```bash
   cd /home/runner/work/Proyecto-Ronald-Visitas/Proyecto-Ronald-Visitas
   ```
2. Iniciar API:
   ```bash
   npm start
   ```
3. Confirmar que el servicio está activo (puerto 5501):
   ```bash
   curl -i http://127.0.0.1:5501/
   ```
4. Ejecutar casos TI-01 a TI-10 con `curl`.

### Comandos usados por caso

- **TI-01**
  ```bash
  curl -i http://127.0.0.1:5501/
  ```
- **TI-02**
  ```bash
  curl -i -X POST http://127.0.0.1:5501/registrar -H "Content-Type: application/json" -d '{}'
  ```
- **TI-03**
  ```bash
  curl -i -X POST http://127.0.0.1:5501/login -H "Content-Type: application/json" -d '{}'
  ```
- **TI-04**
  ```bash
  curl -i http://127.0.0.1:5501/perfil/no-es-uuid
  ```
- **TI-05**
  ```bash
  curl -i -X PUT http://127.0.0.1:5501/perfil/no-es-uuid -H "Content-Type: application/json" -d '{"nombre":"QA"}'
  ```
- **TI-06**
  ```bash
  curl -i -X PUT http://127.0.0.1:5501/perfil/no-es-uuid/password -H "Content-Type: application/json" -d '{"currentPassword":"x","newPassword":"12345678"}'
  ```
- **TI-07**
  ```bash
  curl -i http://127.0.0.1:5501/reservas/no-es-uuid
  ```
- **TI-08**
  ```bash
  curl -i -X PUT http://127.0.0.1:5501/reservas/no-es-uuid/status -H "Content-Type: application/json" -d '{"userId":"no-es-uuid","status":"confirmed"}'
  ```
- **TI-09**
  ```bash
  curl -i http://127.0.0.1:5501/admin/panel
  ```
- **TI-10**
  ```bash
  curl -N -X POST http://127.0.0.1:5501/chat/stream -H "Content-Type: application/json" -d '{"message":"Quiero viajar a Cartagena"}'
  ```

---

## 3) Evidencia de resultados (10 pruebas)

| ID | Endpoint | Esperado | Obtenido | Resultado |
|---|---|---|---|---|
| TI-01 | `GET /` | `200` + HTML de inicio | `200` + HTML correcto | ✅ Aprobada |
| TI-02 | `POST /registrar` con `{}` | `400` validación campos | `400` `Nombre, correo y contraseña son requeridos` | ✅ Aprobada |
| TI-03 | `POST /login` con `{}` | `400` validación campos | `400` `Correo y contraseña son requeridos` | ✅ Aprobada |
| TI-04 | `GET /perfil/no-es-uuid` | `400` ID inválido | `400` `ID de usuario no válido.` | ✅ Aprobada |
| TI-05 | `PUT /perfil/no-es-uuid` | `400` ID inválido | `400` `ID de usuario no válido.` | ✅ Aprobada |
| TI-06 | `PUT /perfil/no-es-uuid/password` | `400` ID inválido | `400` `ID de usuario no válido.` | ✅ Aprobada |
| TI-07 | `GET /reservas/no-es-uuid` | `400` userId inválido | `400` `ID de usuario inválido` | ✅ Aprobada |
| TI-08 | `PUT /reservas/no-es-uuid/status` | `400` datos inválidos | `400` `Datos inválidos` | ✅ Aprobada |
| TI-09 | `GET /admin/panel` sin `adminId` | `400` admin inválido | `400` `Administrador no válido.` | ✅ Aprobada |
| TI-10 | `POST /chat/stream` | eventos `start/chunk/done` | sólo `start/chunk` | ❌ Rechazada |

### Extractos de evidencia capturada

- **TI-01 (body inicio):**
  ```html
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tropical Travel - Inicio de Sesión</title>
  ```

- **TI-02:**
  ```json
  {"error":"Nombre, correo y contraseña son requeridos"}
  ```

- **TI-03:**
  ```json
  {"error":"Correo y contraseña son requeridos"}
  ```

- **TI-04 / TI-05 / TI-06:**
  ```json
  {"error":"ID de usuario no válido."}
  ```

- **TI-07:**
  ```json
  {"error":"ID de usuario inválido"}
  ```

- **TI-08:**
  ```json
  {"error":"Datos inválidos"}
  ```

- **TI-09:**
  ```json
  {"error":"Administrador no válido."}
  ```

- **TI-10 (SSE):**
  ```text
  event: start
  data: {"ok":true}

  event: chunk
  data: {"text":"🏖️ **Cartagena de Indias**"}
  ```

### Resumen final

- Total pruebas: **10**
- Aprobadas: **9**
- Rechazadas: **1**
- Hallazgo principal: en `POST /chat/stream` no se evidenció evento `done` durante la ejecución registrada.

