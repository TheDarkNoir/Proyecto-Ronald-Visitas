# PLAN DE ASEGURAMIENTO DE CALIDAD DEL SOFTWARE (SQA)

## Tropical Travel — Sistema de Turismo Integral

---

| Campo                | Valor                                            |
|----------------------|--------------------------------------------------|
| **Proyecto**         | Tropical Travel                                  |
| **Versión documento**| 2.0                                              |
| **Responsables**     | Jair Luna · Antoine Vislan · Yair Barboza        |
| **Institución**      | Servicio Nacional de Aprendizaje — SENA           |
| **Programa**         | Análisis y Desarrollo de Software (ADSO‑2995985) |
| **Fecha**            | 09/04/2026                                       |
| **Ubicación**        | Cartagena — Bolívar                              |

---

## ÍNDICE

1. [Propósito](#1-propósito)
2. [Alcance](#2-alcance)
3. [Tipo de Aplicación](#3-tipo-de-aplicación)
4. [Metodología Utilizada](#4-metodología-utilizada)
5. [Documentos de Referencia](#5-documentos-de-referencia)
6. [Organización del Equipo SQA](#6-organización-del-equipo-sqa)
7. [Gestión de Documentación](#7-gestión-de-documentación)
8. [Gestión de la Configuración](#8-gestión-de-la-configuración)
9. [Versionado y Backup](#9-versionado-y-backup)
10. [Cambio de Repositorio y Herramientas](#10-cambio-de-repositorio-y-herramientas)
11. [Estándares de Calidad Aplicables](#11-estándares-de-calidad-aplicables)
12. [Actividades de Aseguramiento de Calidad](#12-actividades-de-aseguramiento-de-calidad)
13. [Matriz de Trazabilidad Documentada](#13-matriz-de-trazabilidad-documentada)
14. [Gestión de Defectos](#14-gestión-de-defectos)
15. [Métricas de Calidad](#15-métricas-de-calidad)
16. [Herramientas de Calidad](#16-herramientas-de-calidad)
17. [Gestión de Riesgos de Calidad](#17-gestión-de-riesgos-de-calidad)
18. [Plan de Mejora de Procesos](#18-plan-de-mejora-de-procesos)
19. [Lecciones Aprendidas](#19-lecciones-aprendidas)
20. [Criterios de Calidad para Liberación](#20-criterios-de-calidad-para-liberación)
21. [Anexos](#21-anexos)

---

## 1. Propósito

El presente Plan de Aseguramiento de Calidad del Software (SQA) tiene como objetivo definir las actividades, estándares, procedimientos y responsabilidades necesarias para garantizar que el sistema **Tropical Travel** cumpla con los niveles de calidad establecidos durante todo su ciclo de vida.

Este plan aplica a todas las fases del proyecto, incluyendo:

- Análisis de requisitos
- Diseño del sistema
- Desarrollo
- Integración
- Pruebas
- Despliegue

Asimismo, abarca todos los componentes del sistema: plataforma web, aplicación móvil y backend.

---

## 2. Alcance

El Plan SQA cubre los siguientes componentes del sistema Tropical Travel:

| Componente         | Descripción                                                                  |
|--------------------|------------------------------------------------------------------------------|
| **Backend**        | API REST desarrollada en Node.js con Express.js                              |
| **Interfaz Web**   | Aplicación web construida con HTML5, CSS3 y JavaScript Vanilla               |
| **Aplicación Móvil** | App multiplataforma desarrollada en Flutter (Android / iOS)                |
| **Base de Datos**  | PostgreSQL gestionado mediante Supabase                                      |
| **Integración IA** | Módulo de chat con inteligencia artificial (API externa Groq / GPT)          |
| **Infraestructura**| Configuración de entornos, variables de entorno y despliegue                 |

---

## 3. Tipo de Aplicación

Tropical Travel es una **aplicación web y móvil de turismo integral** de tipo **cliente-servidor** con arquitectura de tres capas. A continuación se detalla su clasificación:

### 3.1 Clasificación General

| Criterio                  | Descripción                                                                |
|---------------------------|----------------------------------------------------------------------------|
| **Dominio**               | Turismo y viajes (e-tourism)                                               |
| **Tipo de software**      | Sistema de información web + aplicación móvil multiplataforma              |
| **Arquitectura**          | Cliente-Servidor con API REST centralizada                                 |
| **Modelo de despliegue**  | Aplicación web servida por Express.js + App móvil Flutter nativa           |
| **Usuarios objetivo**     | Clientes (viajeros) y Administradores (gestión de destinos y reservas)     |
| **Alcance funcional**     | Gestión de destinos, reservaciones, perfiles, comunidad, chat IA, admin    |

### 3.2 Stack Tecnológico

| Capa               | Tecnología                                          |
|---------------------|-----------------------------------------------------|
| **Frontend Web**    | HTML5, CSS3, JavaScript Vanilla                     |
| **Frontend Móvil**  | Flutter (Dart) — Android e iOS                      |
| **Backend / API**   | Node.js + Express.js v5                             |
| **Base de Datos**   | PostgreSQL vía Supabase                             |
| **Autenticación**   | JWT (jsonwebtoken) + bcryptjs                       |
| **IA Integrada**    | Groq API (modelo openai/gpt-oss-120b) con SSE      |
| **Variables Seguras** | dotenv (.env)                                     |

### 3.3 Módulos Funcionales del Sistema

| Módulo                     | Descripción                                                           |
|---------------------------|-----------------------------------------------------------------------|
| MOD-01: Autenticación     | Registro, login, JWT, control de roles (cliente/admin)                |
| MOD-02: Gestión de Perfil | Consulta, edición de perfil, cambio de contraseña, foto              |
| MOD-03: Exploración       | Listado de destinos, filtros por categoría/dificultad/precio         |
| MOD-04: Reservaciones     | CRUD de reservas, estados (pendiente/confirmada/cancelada)           |
| MOD-05: Itinerarios       | Creación, actividades, colaboradores, enlaces públicos               |
| MOD-06: Comunidad         | Búsqueda de viajeros, mensajes, grupos, reportes                    |
| MOD-07: Asistente IA      | Chat con IA (LawMoon) vía streaming SSE                             |
| MOD-08: Admin Panel       | Dashboard, CRUD destinos, CRUD usuarios, gestión de reservas         |
| MOD-09: Notificaciones    | Alertas de precio/ruta, notificaciones de estado de reserva          |
| MOD-10: App Móvil         | Réplica de flujos principales en Flutter                             |
| MOD-11: Seguridad         | JWT, roles, validaciones UUID, hash de contraseñas                   |

---

## 4. Metodología Utilizada

### 4.1 Enfoque Adoptado: Metodología Híbrida (Ágil + Tradicional)

El proyecto Tropical Travel emplea un **enfoque híbrido** que combina elementos de metodologías ágiles y tradicionales. Esta decisión se justifica por las características específicas del proyecto y del contexto académico-formativo en el que se desarrolla.

### 4.2 Componentes Ágiles Adoptados

| Práctica Ágil               | Aplicación en el Proyecto                                          |
|-----------------------------|---------------------------------------------------------------------|
| **Iteraciones cortas**      | El desarrollo se organiza en sprints de 1-2 semanas, permitiendo entregas incrementales de funcionalidad |
| **Entregas incrementales**  | Los módulos se desarrollan y prueban de forma progresiva: primero autenticación, luego destinos, reservas, etc. |
| **Retrospectivas**          | Al finalizar cada iteración se evalúan aciertos, fallos y oportunidades de mejora |
| **Revisiones de código**    | Se realizan revisiones de Pull Requests antes de integrar cambios al repositorio |
| **Adaptabilidad**           | El equipo responde a cambios de requisitos (como la migración de repositorio) sin interrumpir el desarrollo |
| **Comunicación continua**   | Coordinación constante entre el equipo SQA y el equipo de desarrollo |

### 4.3 Componentes Tradicionales Adoptados

| Práctica Tradicional              | Aplicación en el Proyecto                                    |
|-----------------------------------|---------------------------------------------------------------|
| **Planificación formal**          | Se crearon documentos formales: Plan SQA, Plan de Pruebas, Informe Final, Listas de Chequeo |
| **Documentación exhaustiva**      | Seguimiento de estándares IEEE 730-2014 e IEEE 829 para documentación de pruebas |
| **Fases definidas**               | El proyecto sigue fases claras: análisis → diseño → desarrollo → pruebas → despliegue |
| **Matrices de trazabilidad**      | Se mantiene una matriz que vincula requisitos → casos de prueba → resultados |
| **Control de versiones formal**   | Versionado de documentos con numeración mayor/menor y estados de aprobación |
| **Roles definidos**               | Asignación clara de roles SQA: Líder, Analista, Tester Funcional, Tester API, Tester de Seguridad |

### 4.4 Justificación del Enfoque Híbrido

1. **Contexto académico**: Al ser un proyecto del programa ADSO-SENA, se requiere documentación formal y trazabilidad (tradicional), pero el equipo reducido y los plazos cortos favorecen la agilidad.

2. **Equipo pequeño (3 personas)**: Un equipo de 3 desarrolladores se beneficia de la flexibilidad ágil para la asignación dinámica de tareas, sin la sobrecarga de un marco ágil completo como Scrum.

3. **Múltiples plataformas**: El desarrollo simultáneo de web, móvil y backend requiere iteraciones cortas para detectar inconsistencias entre plataformas de forma temprana.

4. **Requisitos de calidad formal**: Los estándares IEEE exigidos para documentación de SQA y pruebas requieren una estructura tradicional de documentación.

5. **Evolución del proyecto**: La migración desde un proyecto anterior (Proyecto-Ronald-Visitas) demuestra la necesidad de adaptabilidad ágil, mientras que las lecciones aprendidas requieren documentación formal.

6. **Gestión de riesgos**: La combinación permite mitigar riesgos de forma temprana (ágil) sin perder la trazabilidad y auditabilidad del proceso (tradicional).

> **En resumen**: Se adoptan las prácticas ágiles para la ejecución diaria del desarrollo y pruebas (iteraciones, comunicación, adaptabilidad), mientras que las prácticas tradicionales se usan para la gobernanza, documentación y aseguramiento de calidad formal del proyecto.

---

## 5. Documentos de Referencia

| Documento        | Descripción                                                   |
|------------------|---------------------------------------------------------------|
| IEEE 730-2014    | Estándar para Planes de Aseguramiento de Calidad del Software |
| IEEE 829         | Estándar para documentación de pruebas de software            |
| Base de datos    | Esquema de la base de datos del sistema                       |
| servidor.js      | Código fuente del servidor Express.js                         |
| package.json     | Dependencias y configuración del proyecto Node.js             |
| pubspec.yaml     | Dependencias y configuración del proyecto Flutter             |

---

## 6. Organización del Equipo SQA

### 6.1 Estructura del equipo

| Rol                    | Responsabilidades                                                           |
|------------------------|-----------------------------------------------------------------------------|
| **Líder SQA**          | Dirigir el plan, aprobar entregables, supervisar calidad                    |
| **Analista de Calidad**| Revisar requisitos, estándares y documentación                              |
| **Tester Funcional**   | Ejecutar pruebas en web y móvil                                             |
| **Tester de API**      | Validar endpoints REST                                                      |
| **Tester de Seguridad**| Evaluar autenticación, autorización y datos                                 |
| **Desarrollador**      | Corregir defectos y participar en revisiones                                |
| **Administrador BD**   | Validar integridad de datos                                                 |

### 6.2 Relación con el equipo de desarrollo

El equipo SQA trabaja de forma independiente para garantizar objetividad, pero colabora con el equipo de desarrollo en:

- Revisiones de código
- Definición de criterios de aceptación
- Retroalimentación de errores

Esto permite mejorar la calidad sin afectar la productividad.

---

## 7. Gestión de Documentación

### 7.1 Documentos del SQA

| Documento             | Descripción              | Frecuencia             |
|-----------------------|--------------------------|------------------------|
| Plan SQA              | Documento principal      | Inicio del proyecto    |
| Plan de Pruebas       | Casos de prueba          | Inicio y por sprint    |
| Informe de Código     | Resultados de revisión   | Por entrega            |
| Registro de Defectos  | Lista de errores         | Continuo               |
| Informe de Calidad    | Métricas y avance        | Semanal                |
| Informe Final         | Resumen de calidad       | Final del proyecto     |

### 7.2 Control de versiones de documentos

Todos los documentos deben incluir:

- Nombre del proyecto
- Versión
- Fecha
- Autor
- Estado (Borrador / En revisión / Aprobado)

**Versionado:**
- Cambios grandes: aumentan versión mayor → Ej: 1.0 → 2.0
- Cambios pequeños: aumentan versión menor → Ej: 1.0 → 1.1

---

## 8. Gestión de la Configuración

La gestión de la configuración del proyecto Tropical Travel establece los mecanismos para identificar, controlar y auditar todos los elementos que componen el sistema, garantizando la integridad, trazabilidad y reproducibilidad del software en cualquier momento del ciclo de vida.

### 8.1 Ítems de Configuración (CI)

Los siguientes elementos se consideran ítems de configuración sujetos a control:

| ID     | Ítem de Configuración              | Tipo         | Ubicación                              |
|--------|-------------------------------------|--------------|----------------------------------------|
| CI-01  | Código fuente del backend           | Código       | `servidor.js`, `package.json`          |
| CI-02  | Código fuente del frontend web      | Código       | `HtmlPrin/`, `Scripts/`, `Css/`        |
| CI-03  | Código fuente de la app Flutter     | Código       | `Movil/travel_tropic_flutter/lib/`     |
| CI-04  | Esquema de base de datos            | Configuración| `Base de datos/`                       |
| CI-05  | Variables de entorno                | Configuración| `.env` (no versionado)                 |
| CI-06  | Dependencias Node.js                | Configuración| `package.json`, `package-lock.json`    |
| CI-07  | Dependencias Flutter                | Configuración| `pubspec.yaml`, `pubspec.lock`         |
| CI-08  | Plan SQA                           | Documento    | `Documentacion/Plan SQA.docx`         |
| CI-09  | Plan de Pruebas                    | Documento    | `Documentacion/Plan de Pruebas - Tropical Travel.docx` |
| CI-10  | Informe Final de Pruebas           | Documento    | `Documentacion/Informe Final - Tropical Travel.docx` |
| CI-11  | Informe de Resultados de Pruebas   | Documento    | `Informe_Pruebas_Tropical_Travel.md`  |
| CI-12  | Listas de Chequeo                  | Documento    | `Documentacion/Listas de chequeo.docx`|
| CI-13  | Imágenes y recursos estáticos       | Recurso      | `Imagenes/`                            |

### 8.2 Líneas Base (Baselines)

Se establecen las siguientes líneas base del proyecto:

| Línea Base       | Contenido                                                   | Punto de creación                |
|------------------|-------------------------------------------------------------|----------------------------------|
| **LB-Requisitos**| Requisitos funcionales y no funcionales aprobados            | Fin de la fase de análisis       |
| **LB-Diseño**   | Esquema de BD, arquitectura API, diseño de interfaces        | Fin de la fase de diseño         |
| **LB-Desarrollo**| Código fuente funcional de todas las plataformas            | Fin de cada sprint de desarrollo |
| **LB-Pruebas**  | Casos de prueba ejecutados, informes, matrices               | Fin de la fase de pruebas        |
| **LB-Release**  | Versión candidata para producción con toda la documentación  | Aprobación para despliegue       |

### 8.3 Control de Cambios

Todo cambio a un ítem de configuración controlado debe seguir el siguiente proceso:

1. **Solicitud**: El solicitante describe el cambio requerido y su justificación.
2. **Evaluación**: El Líder SQA evalúa el impacto en otros componentes, la trazabilidad y los riesgos.
3. **Aprobación/Rechazo**: Se aprueba o rechaza el cambio con base en la evaluación de impacto.
4. **Implementación**: El desarrollador realiza el cambio en una rama separada (feature branch).
5. **Verificación**: Se ejecutan pruebas de regresión para confirmar que el cambio no introduce defectos.
6. **Integración**: Se realiza un Pull Request y, tras revisión de código, se fusiona a la rama principal.
7. **Registro**: Se documenta el cambio en el historial de versiones del repositorio.

### 8.4 Estructura del Repositorio

```
Proyecto-Ronald-Visitas/
├── servidor.js                  # Backend API (Express.js)
├── package.json                 # Dependencias Node.js
├── .env                         # Variables de entorno (NO versionado)
├── .hintrc                      # Configuración de webhint
├── index.html                   # Página de login
├── Registro.html                # Página de registro
├── HtmlPrin/                    # Páginas HTML del sistema
│   ├── Inicio.html
│   ├── Explorar.html
│   ├── MisViajes.html
│   ├── Perfil.html
│   ├── Comunidad.html
│   ├── IAChat.html
│   ├── InicioAdmin.html
│   └── itinerario.html
├── Scripts/                     # JavaScript del frontend
│   ├── ScriptsLogin.js
│   ├── ScriptsReg.js
│   ├── ScriptsInicio.js
│   ├── ScriptsExplorar.js
│   ├── ScriptsAdmin.js
│   ├── ScriptsCliente.js
│   ├── ScriptsComunidad.js
│   ├── ScriptsIAChat.js
│   ├── ScriptsFichasViaje.js
│   └── ScriptsRegisTitle.js
├── Css/                         # Estilos CSS
├── Imagenes/                    # Recursos estáticos
├── Movil/                       # Aplicación Flutter
│   └── travel_tropic_flutter/
│       ├── lib/                 # Código Dart
│       ├── pubspec.yaml         # Dependencias Flutter
│       ├── android/             # Configuración Android
│       ├── ios/                 # Configuración iOS
│       └── test/                # Pruebas Flutter
├── Base de datos/               # Esquema de BD
├── Documentacion/               # Documentación formal del proyecto
│   ├── Plan SQA.docx
│   ├── Plan de Pruebas - Tropical Travel.docx
│   ├── Informe Final - Tropical Travel.docx
│   ├── Listas de chequeo.docx
│   ├── INFORME DE RESULTADOS DEL COMPORTAMIENTO DEL SOFTWARE.docx
│   └── VERIFICACIONES DE CONDICIONES DE CALIDAD DEL PRODUCTO DE SOFTWARE.docx
├── Informe_Pruebas_Tropical_Travel.md
└── datos base de datos/         # Datos auxiliares de BD
```

### 8.5 Variables de Entorno Controladas

| Variable            | Descripción                           | Sensibilidad |
|---------------------|---------------------------------------|-------------|
| `SUPABASE_URL`      | URL de conexión a Supabase            | Alta        |
| `SUPABASE_ANON_KEY` | Clave anónima de Supabase             | Alta        |
| `GROQ_API_KEY`      | Clave de API de Groq (IA)             | Alta        |
| `PORT`              | Puerto del servidor (default: 5501)   | Baja        |

> **Política**: El archivo `.env` **nunca** se versiona en el repositorio. Cada desarrollador mantiene su copia local. Un archivo `.env.example` (sin valores reales) sirve como referencia.

---

## 9. Versionado y Backup

### 9.1 Estrategia de Versionado del Código Fuente

El proyecto utiliza **Git** como sistema de control de versiones distribuido, alojado en **GitHub**.

#### Esquema de ramas

| Rama              | Propósito                                                  |
|-------------------|-------------------------------------------------------------|
| `main`            | Rama principal con código estable y listo para producción    |
| `feature/*`       | Ramas de funcionalidad para desarrollo de nuevos módulos     |
| `copilot/*`       | Ramas generadas por herramientas de IA (GitHub Copilot)      |
| `bugfix/*`        | Ramas para corrección de defectos                            |

#### Convenciones de commits

Se recomienda el uso de commits descriptivos siguiendo el estándar de **Conventional Commits**:

| Prefijo    | Uso                                    | Ejemplo                                           |
|-----------|----------------------------------------|----------------------------------------------------|
| `feat:`   | Nueva funcionalidad                    | `feat: agregar filtro de destinos por precio`       |
| `fix:`    | Corrección de errores                  | `fix: corregir validación UUID en reservas`         |
| `docs:`   | Cambios en documentación               | `docs: actualizar Plan SQA con lecciones aprendidas`|
| `style:`  | Cambios de formato (sin lógica)        | `style: ajustar indentación en servidor.js`         |
| `refactor:` | Refactorización de código            | `refactor: separar rutas de admin en módulo`        |
| `test:`   | Agregar o modificar pruebas            | `test: agregar pruebas unitarias de login`          |

#### Versionado semántico del sistema

El sistema Tropical Travel sigue un esquema de versionado semántico (SemVer):

```
MAYOR.MENOR.PARCHE  →  Ej: 1.0.0
```

| Componente | Cuándo incrementa                                                  |
|------------|---------------------------------------------------------------------|
| **MAYOR**  | Cambios incompatibles en API, rediseño de módulos, migración de BD  |
| **MENOR**  | Nuevas funcionalidades compatibles hacia atrás                      |
| **PARCHE** | Corrección de defectos, mejoras de rendimiento sin cambio funcional  |

**Versión actual del sistema**: **v1.0.0**

### 9.2 Versionado de Documentos

| Documento                          | Versión Actual | Estado          |
|------------------------------------|----------------|-----------------|
| Plan SQA                          | 2.0            | En revisión     |
| Plan de Pruebas                   | 1.0            | Aprobado        |
| Informe Final de Pruebas          | 1.0            | Aprobado        |
| Informe de Resultados (Markdown)  | 2.0            | Aprobado        |
| Listas de Chequeo                 | 1.0            | Aprobado        |
| Verificaciones de Condiciones     | 1.0            | Aprobado        |

### 9.3 Historial de Versiones del Plan SQA

| Versión | Fecha       | Autor(es)                             | Cambios Realizados                                      |
|---------|-------------|---------------------------------------|---------------------------------------------------------|
| 1.0     | 01/04/2026  | Jair Luna, Antoine Vislan, Yair Barboza | Creación inicial del documento                          |
| 2.0     | 09/04/2026  | Equipo SQA + Revisión automatizada     | Agregado: Tipo de aplicación, Metodología, Gestión de configuración, Versionado y Backup, Lecciones aprendidas, Matriz de trazabilidad, Cambio de repositorio |

### 9.4 Estrategia de Backup

La estrategia de backup del proyecto contempla tres niveles de protección:

#### Nivel 1: Repositorio Remoto (GitHub)

- **Mecanismo**: Todo el código fuente y documentación se almacena en GitHub como repositorio remoto.
- **URL**: `https://github.com/TheDarkNoir/Proyecto-Ronald-Visitas`
- **Frecuencia**: Cada `git push` (mínimo diario durante desarrollo activo).
- **Protección**: GitHub mantiene redundancia y backups propios de la infraestructura.

#### Nivel 2: Copias Locales Distribuidas

- **Mecanismo**: Cada miembro del equipo mantiene una copia completa del repositorio (naturaleza distribuida de Git).
- **Miembros**: 3 copias locales activas (Jair, Antoine, Yair).
- **Ventaja**: Si GitHub falla, cualquier copia local puede restaurar el repositorio completo.

#### Nivel 3: Base de Datos (Supabase)

- **Mecanismo**: Supabase (PostgreSQL gestionado) incluye backups automáticos diarios.
- **Retención**: Según el plan de Supabase contratado.
- **Responsabilidad**: El Administrador de BD verifica periódicamente la integridad de los backups.

#### Procedimiento de Restauración

1. **Código fuente**: Clonar el repositorio desde GitHub o desde la copia local de cualquier miembro.
2. **Base de datos**: Restaurar desde el backup automático de Supabase o desde scripts de carga de datos.
3. **Variables de entorno**: Cada desarrollador reconfigura su `.env` local a partir del `.env.example`.
4. **Dependencias**: Ejecutar `npm install` (backend) y `flutter pub get` (móvil) para restaurar dependencias.

---

## 10. Cambio de Repositorio y Herramientas

### 10.1 Migración del Repositorio

El proyecto experimentó una migración significativa de repositorio durante su ciclo de vida:

| Aspecto            | Anterior                                     | Actual                                          |
|--------------------|----------------------------------------------|--------------------------------------------------|
| **Nombre del repo**| Proyecto original de visitas                 | `Proyecto-Ronald-Visitas` (Tropical Travel)      |
| **Plataforma**     | GitHub                                       | GitHub                                            |
| **Organización**   | Repositorio personal/individual              | Repositorio del equipo (`TheDarkNoir`)            |
| **URL actual**     | —                                            | `https://github.com/TheDarkNoir/Proyecto-Ronald-Visitas` |

#### Razones de la migración

1. **Reestructuración del equipo**: La consolidación del equipo de trabajo requirió un repositorio centralizado con acceso compartido.
2. **Mejora en la gestión de versiones**: El nuevo repositorio implementa Pull Requests obligatorios y revisiones de código.
3. **Integración de herramientas**: La migración permitió integrar GitHub Copilot y herramientas automatizadas de análisis.
4. **Organización del código**: Se reorganizó la estructura de carpetas para separar claramente backend, frontend, móvil, documentación y recursos.

#### Proceso de migración realizado

1. Creación del nuevo repositorio en la organización `TheDarkNoir`.
2. Migración del código fuente preservando el historial de commits.
3. Configuración de ramas protegidas y políticas de merge.
4. Reorganización de la estructura de carpetas del proyecto.
5. Migración de la documentación al directorio `Documentacion/`.
6. Verificación de integridad post-migración.

### 10.2 Herramientas Incorporadas

Con la migración y evolución del proyecto, se han incorporado las siguientes herramientas al flujo de trabajo:

| Herramienta            | Propósito                                           | Fase de adopción  |
|------------------------|------------------------------------------------------|-------------------|
| **GitHub Actions**     | Automatización de CI/CD y validaciones               | Post-migración    |
| **GitHub Copilot**     | Asistente de IA para desarrollo y análisis de código | Post-migración    |
| **Postman / Thunder Client** | Pruebas de endpoints REST de la API            | Desde inicio      |
| **Flutter Test Framework** | Pruebas unitarias y de widgets en la app móvil  | Desde inicio      |
| **webhint (.hintrc)**  | Análisis de mejores prácticas web                    | Post-migración    |
| **Supabase Dashboard** | Administración de BD, monitoreo y backups            | Desde inicio      |
| **VS Code**            | IDE principal con extensiones para JS, Dart y HTML   | Desde inicio      |
| **Git**                | Control de versiones distribuido                     | Desde inicio      |
| **dotenv**             | Gestión segura de variables de entorno               | Desde inicio      |
| **bcryptjs**           | Hash seguro de contraseñas                           | Desde inicio      |
| **jsonwebtoken (JWT)** | Autenticación basada en tokens                       | Desde inicio      |

### 10.3 Impacto del Cambio en la Calidad

La migración de repositorio y la incorporación de nuevas herramientas tuvo un impacto positivo en la calidad del proyecto:

- **Mayor trazabilidad**: El historial de commits y Pull Requests permite auditar cada cambio.
- **Revisiones de código obligatorias**: Los PRs requieren al menos una revisión antes de fusionarse.
- **Detección temprana de defectos**: Las herramientas automatizadas identifican problemas antes de las pruebas manuales.
- **Documentación centralizada**: Toda la documentación reside en el mismo repositorio que el código.
- **Colaboración mejorada**: El equipo trabaja de forma simultánea sin conflictos gracias al flujo de ramas.

---

## 11. Estándares de Calidad Aplicables

### Backend (Node.js / Express)

- Uso de `camelCase` para variables y funciones.
- Endpoints en minúsculas y con guiones.
- Uso obligatorio de `try/catch` en operaciones async.
- Validación de entradas (ID, email, etc.).
- Uso de `bcrypt` para contraseñas.
- Uso de `.env` para datos sensibles.
- Separación de capas (rutas, lógica, servicios).

### Frontend (Web)

- HTML semántico.
- Separación clara: HTML / CSS / JS.
- Validación en cliente y servidor.
- No almacenar datos sensibles en `localStorage`.

### Flutter

- Clases en `PascalCase`.
- Variables en `camelCase`.
- Uso de `flutter_secure_storage` para JWT.
- Arquitectura en capas: `pantallas/`, `servicios/`, `modelos/`, `componentes/`.

### Base de Datos

- Uso de `ID` como PK.
- Uso de `created_at` y `updated_at`.
- Relaciones con FK bien definidas.
- Uso de `jsonb` cuando sea necesario.

---

## 12. Actividades de Aseguramiento de Calidad

### 12.1 Revisiones de requisitos

**Objetivo**: Garantizar que los requisitos sean completos, consistentes, verificables y trazables.

**Actividades**:
- Validar que cada módulo tenga requisitos definidos.
- Revisar criterios de aceptación.
- Confirmar reglas de negocio.

### 12.2 Revisiones de diseño

**Objetivo**: Verificar que el diseño arquitectónico y de base de datos sea coherente con los requisitos.

**Actividades**:
- Revisar el esquema de la base de datos (tablas, relaciones, tipos de datos, restricciones).
- Verificar que el diseño de la API REST siga las convenciones RESTful.
- Validar que la estructura de capas de la aplicación Flutter (modelos, servicios, pantallas) sea mantenible.
- Revisar que el diseño de seguridad incluya autenticación JWT y control de acceso por roles.

**Lista de verificación de diseño de base de datos**:
- [ ] Todas las tablas tienen PK tipo ID.
- [ ] Las FK están correctamente referenciadas.
- [ ] Los campos de auditoría (`created_at`, `updated_at`) están presentes.
- [ ] Los campos sensibles (contraseñas) no se almacenan en texto plano.
- [ ] Los índices necesarios están definidos para consultas frecuentes.

### 12.3 Revisiones de código

**Objetivo**: Detectar errores lógicos, vulnerabilidades de seguridad y violaciones de estándares antes de las pruebas.

**Criterios de revisión**:

| Criterio                                                    | Aplica a       |
|-------------------------------------------------------------|----------------|
| Ausencia de credenciales en el código fuente                | Backend, Móvil |
| Validación de entradas en todos los endpoints               | Backend        |
| Manejo correcto de errores y excepciones                    | Backend, Móvil |
| Uso de hash para contraseñas                                | Backend        |
| Verificación de rol en endpoints de admin                   | Backend        |
| No almacenar datos sensibles en localStorage                | Interfaz web   |
| Mensajes de error en español y sin info técnica             | Todos          |
| Ausencia de código muerto o comentado innecesariamente      | Todos          |
| Nombres de variables y funciones descriptivas               | Todos          |

---

## 13. Matriz de Trazabilidad Documentada

La matriz de trazabilidad vincula cada requisito funcional del sistema con sus componentes de implementación, casos de prueba y estado de verificación, asegurando cobertura completa del proceso de calidad.

### 13.1 Trazabilidad: Requisito → Componente → Caso de Prueba

| ID Requisito | Requisito Funcional                        | Componente(s)           | Caso(s) de Prueba          | Estado        |
|-------------|----------------------------------------------|-------------------------|----------------------------|---------------|
| RF-01       | Registro de usuarios                        | Backend, Web, Móvil     | CP-01-01, CP-01-02, CP-01-03 | ✅ Aprobado   |
| RF-02       | Inicio de sesión con roles                  | Backend, Web, Móvil     | CP-01-04, CP-01-05, CP-01-06, CP-01-07 | ✅ Aprobado |
| RF-03       | Protección de rutas sin sesión              | Backend, Web, Móvil     | CP-01-08                    | ✅ Aprobado   |
| RF-04       | Consulta y edición de perfil                | Backend, Web, Móvil     | CP-02-01, CP-02-02, CP-02-03 | ✅ Aprobado  |
| RF-05       | Actualización de foto de perfil             | Backend, Web            | CP-02-04                    | ✅ Aprobado   |
| RF-06       | Listado de destinos activos                 | Backend, Web, Móvil     | CP-03-01, CP-03-06          | ✅ Aprobado   |
| RF-07       | Filtrado de destinos (categoría, dificultad, precio) | Backend, Web, Móvil | CP-03-02, CP-03-03, CP-03-04 | ✅ Aprobado |
| RF-08       | Detalle de destino                          | Backend, Web, Móvil     | CP-03-05                    | ✅ Aprobado   |
| RF-09       | Creación de reservas                        | Backend, Web, Móvil     | CP-04-01                    | ✅ Aprobado   |
| RF-10       | Consulta de reservas del usuario            | Backend, Web, Móvil     | CP-04-02                    | ✅ Aprobado   |
| RF-11       | Cancelación de reservas                     | Backend, Web, Móvil     | CP-04-03                    | ✅ Aprobado   |
| RF-12       | Restricción de reserva duplicada            | Backend                 | CP-04-04                    | ✅ Aprobado   |
| RF-13       | Actualización de estado de reserva (admin)  | Backend, Web            | CP-04-05                    | ✅ Aprobado   |
| RF-14       | Creación de itinerarios                     | Backend, Web            | CP-05-01                    | ⚠️ Parcial    |
| RF-15       | Actividades en itinerarios                  | Backend, Web            | CP-05-02                    | ⚠️ Parcial    |
| RF-16       | Itinerarios públicos y colaboradores        | Backend, Web            | CP-05-03, CP-05-04          | ⚠️ Parcial    |
| RF-17       | Búsqueda de viajeros                        | Backend, Web            | CP-06-01                    | ⚠️ Parcial    |
| RF-18       | Mensajes directos                           | Backend, Web            | CP-06-02                    | ⚠️ Parcial    |
| RF-19       | Grupos de viajeros                          | Backend, Web            | CP-06-03                    | ⚠️ Parcial    |
| RF-20       | Reportes/quejas                             | Backend, Web            | CP-06-04                    | ⚠️ Parcial    |
| RF-21       | Chat con asistente IA                       | Backend, Web, Móvil     | CP-07-01, CP-07-02          | ✅ Aprobado   |
| RF-22       | Manejo de indisponibilidad IA               | Backend, Web            | CP-07-03                    | ✅ Aprobado   |
| RF-23       | Historial de chat IA                        | Web                     | CP-07-04                    | ✅ Aprobado   |
| RF-24       | Panel de administración                     | Backend, Web, Móvil     | CP-08-01, CP-08-02          | ✅ Aprobado   |
| RF-25       | CRUD de destinos (admin)                    | Backend, Web            | CP-08-03, CP-08-04, CP-08-05 | ✅ Aprobado  |
| RF-26       | Gestión de usuarios (admin)                 | Backend, Web            | CP-08-06                    | ✅ Aprobado   |
| RF-27       | Análisis y estadísticas (admin)             | Backend, Web            | CP-08-07                    | ✅ Aprobado   |
| RF-28       | Notificaciones y alertas                    | Backend, Web            | CP-09-01, CP-09-02          | ✅ Aprobado   |
| RF-29       | Flujos móviles (login, destinos, reservas)  | Backend, Móvil          | CP-10-01 a CP-10-06         | ✅ Aprobado   |
| RF-30       | Protección de endpoints admin               | Backend                 | CP-11-01                    | ✅ Aprobado   |
| RF-31       | Validación de JWT                           | Backend                 | CP-11-02, CP-11-03          | ✅ Aprobado   |
| RF-32       | Validación de UUID                          | Backend                 | CP-11-04                    | ✅ Aprobado   |
| RF-33       | Hash de contraseñas con bcrypt              | Backend                 | CP-11-05                    | ✅ Aprobado   |

### 13.2 Trazabilidad: Módulo → Cobertura de Pruebas

| Módulo                      | Total CPs | Aprobados | Parciales | Fallidos | Cobertura |
|-----------------------------|-----------|-----------|-----------|----------|-----------|
| MOD-01: Autenticación       | 8         | 8         | 0         | 0        | 100%      |
| MOD-02: Gestión de Perfil   | 4         | 4         | 0         | 0        | 100%      |
| MOD-03: Exploración         | 6         | 6         | 0         | 0        | 100%      |
| MOD-04: Reservaciones       | 5         | 5         | 0         | 0        | 100%      |
| MOD-05: Itinerarios         | 4         | 0         | 4         | 0        | 0%        |
| MOD-06: Comunidad           | 4         | 0         | 4         | 0        | 0%        |
| MOD-07: Asistente IA        | 4         | 4         | 0         | 0        | 100%      |
| MOD-08: Admin Panel         | 7         | 7         | 0         | 0        | 100%      |
| MOD-09: Notificaciones      | 2         | 2         | 0         | 0        | 100%      |
| MOD-10: App Móvil           | 6         | 6         | 0         | 0        | 100%      |
| MOD-11: Seguridad           | 5         | 5         | 0         | 0        | 100%      |
| **TOTAL**                   | **55**    | **47**    | **8**     | **0**    | **85.5%** |

### 13.3 Trazabilidad: Código Fuente → Endpoint → Caso de Prueba

| Archivo Fuente    | Endpoint(s)                     | Módulo         | Caso(s) de Prueba |
|-------------------|---------------------------------|----------------|-------------------|
| `servidor.js`     | `POST /registrar`               | Autenticación  | CP-01-01 a CP-01-03 |
| `servidor.js`     | `POST /login`                   | Autenticación  | CP-01-04 a CP-01-08 |
| `servidor.js`     | `GET /destinos`                 | Exploración    | CP-03-01 a CP-03-06 |
| `servidor.js`     | `POST /reservas`                | Reservaciones  | CP-04-01           |
| `servidor.js`     | `GET /reservas/:userId`         | Reservaciones  | CP-04-02           |
| `servidor.js`     | `PUT /reservas/:id/cancel`      | Reservaciones  | CP-04-03           |
| `servidor.js`     | `GET /perfil/:userId`           | Perfil         | CP-02-01           |
| `servidor.js`     | `PUT /perfil/:userId`           | Perfil         | CP-02-02, CP-02-03 |
| `servidor.js`     | `POST /chat`, `POST /chat/stream` | IA Chat     | CP-07-01 a CP-07-04 |
| `servidor.js`     | `GET /admin/panel`              | Admin          | CP-08-01, CP-08-07 |
| `servidor.js`     | `POST/PUT/DELETE /admin/destinos` | Admin        | CP-08-03 a CP-08-05 |
| `servidor.js`     | `POST/PUT/DELETE /admin/usuarios` | Admin        | CP-08-06           |
| `ScriptsLogin.js` | (Frontend) Login UI             | Autenticación  | CP-01-04 a CP-01-08 |
| `ScriptsReg.js`   | (Frontend) Registro UI          | Autenticación  | CP-01-01 a CP-01-03 |
| `ScriptsExplorar.js` | (Frontend) Explorar UI       | Exploración    | CP-03-01 a CP-03-06 |
| `ScriptsAdmin.js` | (Frontend) Admin UI             | Admin          | CP-08-01 a CP-08-07 |
| `ScriptsIAChat.js`| (Frontend) Chat IA UI           | IA Chat        | CP-07-01 a CP-07-04 |

### 13.4 Requisitos Sin Cobertura Completa (Riesgos)

Los siguientes requisitos presentan cobertura parcial y representan riesgo para el despliegue:

| Requisito       | Descripción                        | Estado     | Riesgo    | Plan de acción                              |
|-----------------|-------------------------------------|-----------|-----------|----------------------------------------------|
| RF-14 a RF-16   | Módulo de Itinerarios              | Parcial   | Alto      | Completar endpoints y pruebas en Sprint 1    |
| RF-17 a RF-20   | Módulo de Comunidad                | Parcial   | Medio     | Implementar funcionalidades en Sprint 2      |

---

## 14. Gestión de Defectos

### 14.1 Clasificación de gravedad

| Severidad  | Descripción                                                     | Ejemplo                                           |
|------------|-----------------------------------------------------------------|---------------------------------------------------|
| **Crítico** | El sistema no puede funcionar. Funcionalidad principal bloqueada | No se puede iniciar sesión. La API no responde.    |
| **Alto**    | Funcionalidad importante no opera correctamente                 | Las reservas no se crean. Admin no puede gestionar |
| **Medio**   | Funcionalidad afectada parcialmente. Existe solución alternativa | Filtro falla en un caso específico                 |
| **Bajo**    | Problema cosmético o de usabilidad menor                        | Espaciado incorrecto. Error tipográfico            |

### 14.2 Prioridad

| Prioridad | Descripción                              |
|-----------|------------------------------------------|
| **Alta**  | Se debe corregir antes del despliegue    |
| **Media** | Se corrige en el sprint actual           |
| **Baja**  | Puede esperar futuras versiones          |

### 14.3 Tiempos de respuesta esperados según severidad

| Severidad  | Tiempo máximo para asignar | Tiempo máximo para resolver |
|------------|----------------------------|-----------------------------|
| Crítico    | 1 hora                     | 4 horas                     |
| Alto       | 4 horas                    | 1 día hábil                 |
| Medio      | 1 día hábil                | 3 días hábiles              |
| Bajo       | 3 días hábiles             | Próxima iteración           |

---

## 15. Métricas de Calidad

El equipo monitorea las siguientes métricas a lo largo del desarrollo del proyecto, con el fin de evaluar el nivel de calidad del software y la eficiencia del proceso de pruebas.

### 15.1 Métricas de pruebas

| Métrica                           | Fórmula                                                  | Meta   |
|-----------------------------------|----------------------------------------------------------|--------|
| Porcentaje de casos ejecutados    | (Casos ejecutados / Total de casos planificados) × 100   | > 95%  |
| Tasa de éxito de pruebas          | (Casos aprobados / Casos ejecutados) × 100               | > 85%  |
| Densidad de defectos              | Número de defectos / Módulo evaluado                     | Referencial |
| Eficiencia de detección           | (Defectos en pruebas / Total de defectos) × 100          | > 80%  |

### 15.2 Métricas de defectos

| Métrica                      | Fórmula                                          | Meta                                |
|------------------------------|--------------------------------------------------|-------------------------------------|
| Defectos abiertos            | Total de defectos sin cerrar                     | 0 críticos al momento de la entrega |
| Tasa de resolución           | (Defectos cerrados / Defectos reportados) × 100  | > 90%                               |
| Tasa de reapertura           | (Defectos reabiertos / Defectos cerrados) × 100  | < 10%                               |
| Tiempo promedio de resolución| Tiempo total / Número de defectos                | Según sección 14.3                  |

### 15.3 Métricas de rendimiento

| Métrica                                                     | Meta         |
|-------------------------------------------------------------|--------------|
| Tiempo de respuesta de la API (operaciones simples)          | < 1 segundo  |
| Tiempo de respuesta de la API (operaciones complejas)        | < 3 segundos |
| Tiempo de carga inicial del panel de administración          | < 3 segundos |
| Tiempo de primera respuesta del chat IA                      | < 3 segundos |
| Tiempo de carga inicial de la aplicación móvil (Flutter)     | < 4 segundos |

### 15.4 Métricas de cobertura de código

| Componente                                                  | Meta de cobertura |
|-------------------------------------------------------------|-------------------|
| Endpoints críticos del backend (autenticación, reservas)     | > 80%             |
| Lógica de negocio del servidor                               | > 70%             |
| Componentes críticos de Flutter (login, reservas)            | > 60%             |

---

## 16. Herramientas de Calidad

Las siguientes herramientas son utilizadas para apoyar las actividades de aseguramiento de calidad:

| Herramienta              | Uso                                                   |
|--------------------------|-------------------------------------------------------|
| Postman / Thunder Client | Pruebas de endpoints REST de la API                   |
| GitHub                   | Control de versiones y gestión de Pull Requests        |
| GitHub Copilot           | Asistencia en revisión de código y análisis estático   |
| GitHub Actions           | Automatización de CI/CD y validaciones                 |
| Flutter Test Framework   | Pruebas unitarias y de widgets en la app móvil         |
| webhint (.hintrc)        | Análisis de mejores prácticas web                      |
| VS Code                  | IDE principal con extensiones para JS, Dart y HTML     |
| Supabase Dashboard       | Administración de BD, monitoreo y backups              |

---

## 17. Gestión de Riesgos de Calidad

La gestión de riesgos de calidad tiene como objetivo identificar, analizar y mitigar los posibles eventos que puedan afectar negativamente la calidad del sistema Tropical Travel durante su desarrollo y pruebas.

### 17.1 Identificación y análisis de riesgos

| ID    | Riesgo                                               | Probabilidad | Impacto  | Estrategia de mitigación                                                 |
|-------|------------------------------------------------------|-------------|----------|-------------------------------------------------------------------------|
| RQ-01 | Indisponibilidad de la API de IA durante las pruebas | Media       | Alta     | Implementar respuestas simuladas para pruebas offline                   |
| RQ-02 | Cambios frecuentes en endpoints sin documentación    | Alta        | Alta     | Establecer control de cambios y actualizar el Plan de Pruebas           |
| RQ-03 | Configuración incorrecta de variables de entorno     | Media       | Crítico  | Validar archivo .env antes de pruebas y mantener archivo de referencia  |
| RQ-04 | Inconsistencias entre aplicación web y móvil         | Media       | Media    | Ejecutar pruebas equivalentes en ambas plataformas                      |
| RQ-05 | Falta de datos de prueba en la base de datos         | Media       | Alta     | Utilizar scripts de carga para poblar datos antes de pruebas            |
| RQ-06 | Detección tardía de defectos críticos                | Baja        | Crítico  | Priorizar pruebas tempranas en módulos críticos                         |
| RQ-07 | Exposición de credenciales en el repositorio         | Baja        | Crítico  | Validar en revisiones de código y excluir .env mediante .gitignore      |
| RQ-08 | Tiempo insuficiente para pruebas de regresión        | Media       | Alta     | Automatizar pruebas críticas y priorizar módulos modificados            |

---

## 18. Plan de Mejora de Procesos

El equipo implementará un proceso de mejora continua con el fin de optimizar la calidad del producto y la eficiencia del proceso de desarrollo.

### Estrategias de mejora

**Retrospectivas de calidad:**
Al finalizar cada iteración, el equipo evaluará los resultados del proceso de calidad, identificando aciertos, fallos y oportunidades de mejora.

**Análisis de causa raíz:**
Para defectos de severidad Crítica o Alta, se realizará un análisis detallado para identificar su origen y evitar su recurrencia.

**Automatización progresiva:**
Se priorizará la automatización de pruebas en módulos críticos como autenticación y reservas, con el fin de mejorar la cobertura y reducir errores humanos.

---

## 19. Lecciones Aprendidas

Esta sección documenta las experiencias, desafíos y cambios significativos identificados durante el desarrollo del proyecto Tropical Travel, con el objetivo de mejorar prácticas futuras y servir como referencia para proyectos similares.

### 19.1 Experiencias Positivas

| # | Experiencia                                          | Impacto en el Proyecto                                           |
|---|------------------------------------------------------|------------------------------------------------------------------|
| 1 | **Separación clara de roles SQA**                    | Permitió revisiones objetivas e independientes del desarrollo     |
| 2 | **Uso de Supabase como BaaS**                        | Aceleró el desarrollo al eliminar la necesidad de configurar y mantener un servidor PostgreSQL propio |
| 3 | **API REST centralizada**                            | Un solo `servidor.js` sirviendo a web y móvil aseguró consistencia en la lógica de negocio |
| 4 | **Autenticación JWT bien implementada**              | El módulo de autenticación aprobó el 100% de las pruebas, demostrando solidez desde las primeras iteraciones |
| 5 | **Documentación desde el inicio**                    | Crear el Plan SQA y el Plan de Pruebas al inicio del proyecto facilitó la ejecución ordenada de las pruebas |
| 6 | **Adopción de estándares IEEE**                      | Los estándares IEEE 730 e IEEE 829 proporcionaron una estructura clara para toda la documentación de calidad |

### 19.2 Desafíos Encontrados y Cambios Realizados

| # | Desafío / Problema                                   | Causa Raíz                                    | Cambio / Solución Aplicada                                   |
|---|------------------------------------------------------|-----------------------------------------------|--------------------------------------------------------------|
| 1 | **Migración de repositorio**                         | Necesidad de centralizar el código del equipo  | Se creó un nuevo repositorio en GitHub con estructura organizada y políticas de ramas |
| 2 | **Módulos de Itinerarios y Comunidad incompletos**   | Complejidad subestimada y priorización tardía  | Se definió un plan de corrección por sprints (Sprint 1: bloqueantes, Sprint 2: funcionalidad media) |
| 3 | **Variables de entorno no documentadas**              | Falta de un `.env.example` inicial             | Se documentaron todas las variables requeridas y se creó un archivo de referencia |
| 4 | **Pruebas de rendimiento limitadas**                 | Imposibilidad de ejecutar el servidor en entorno de análisis estático | Se adoptó un enfoque de estimación basado en análisis de código y métricas de referencia |
| 5 | **Inconsistencias entre plataformas web y móvil**    | Desarrollo en paralelo sin pruebas cruzadas tempranas | Se implementaron pruebas equivalentes en ambas plataformas para los flujos críticos |
| 6 | **Código fuente monolítico en servidor.js**          | Toda la lógica en un solo archivo              | Se identificó como mejora futura: separar rutas, middleware y servicios en módulos |
| 7 | **Falta de pruebas automatizadas en backend**        | No se configuró un framework de testing para Node.js | Se recomienda integrar Jest o Mocha en futuras iteraciones |

### 19.3 Recomendaciones para Proyectos Futuros

1. **Iniciar con estructura modular**: Desde el inicio, separar el código en módulos (rutas, controladores, servicios) para facilitar pruebas y mantenimiento.

2. **Implementar CI/CD desde la primera iteración**: Configurar GitHub Actions para ejecutar pruebas automáticas en cada Push/PR, evitando la detección tardía de defectos.

3. **Definir datos de prueba antes del desarrollo**: Crear scripts de carga de datos de prueba que puedan ejecutarse automáticamente antes de cada sesión de pruebas.

4. **Establecer el repositorio definitivo desde el inicio**: La migración de repositorio genera fricción y riesgo de pérdida de historial. Es preferible definir la estructura organizativa del repositorio antes de empezar a codificar.

5. **Priorizar módulos por riesgo**: Desarrollar y probar primero los módulos con mayor riesgo de negocio (autenticación, pagos, reservas) antes de abordar funcionalidades complementarias.

6. **Mantener paridad web-móvil**: Ejecutar pruebas de aceptación equivalentes en ambas plataformas al finalizar cada sprint para detectar inconsistencias tempranamente.

7. **Documentar decisiones técnicas**: Mantener un registro de decisiones de arquitectura (ADR) para justificar el uso de cada tecnología y facilitar la incorporación de nuevos miembros.

### 19.4 Comparativa: Proyecto Anterior vs. Proyecto Actual

| Aspecto                        | Proyecto Anterior                          | Proyecto Actual (Tropical Travel)              |
|-------------------------------|---------------------------------------------|------------------------------------------------|
| **Repositorio**               | Individual / fragmentado                    | Centralizado en GitHub (TheDarkNoir)           |
| **Documentación**             | Mínima o ausente                            | Formal (Plan SQA, Plan de Pruebas, Informes)  |
| **Pruebas**                   | Manuales, sin estructura                    | 55 casos de prueba estructurados por módulo    |
| **Control de versiones**      | Básico (commits directos a main)            | Ramas protegidas, Pull Requests obligatorios   |
| **Estándares**                | No definidos                                | IEEE 730, IEEE 829, convenciones de código     |
| **Herramientas de calidad**   | Ninguna                                     | Postman, Flutter Test, GitHub Copilot, webhint |
| **Trazabilidad**              | Inexistente                                 | Matriz RF → CP → Estado documentada            |
| **Gestión de defectos**       | Informal                                    | Clasificación por severidad/prioridad con SLAs |
| **Aplicación móvil**          | No existía                                  | Flutter multiplataforma (Android/iOS)          |
| **Integración IA**            | No existía                                  | Chat con Groq API (streaming SSE)              |

---

## 20. Criterios de Calidad para Liberación

El sistema Tropical Travel solo podrá ser liberado a producción cuando se cumplan los siguientes criterios de calidad:

### 20.1 Criterios obligatorios

- El 100% de los casos de prueba de prioridad Alta deben estar ejecutados y aprobados.
- No deben existir defectos de severidad Crítica abiertos.
- No deben existir defectos de severidad Alta sin un plan de corrección definido.
- Las contraseñas deben estar correctamente protegidas mediante hash con bcrypt.
- No deben existir credenciales, tokens o claves API expuestas en el código fuente.
- El archivo `.env` no debe estar incluido en repositorios públicos.
- Los endpoints de administración deben validar correctamente el rol del usuario.
- El sistema debe impedir el acceso a funcionalidades protegidas sin un JWT válido, redirigiendo al inicio de sesión.

### 20.2 Criterios recomendados

- Al menos el 90% de los casos de prueba de prioridad Media deben estar aprobados.
- El informe de auditoría de seguridad debe haber sido revisado.
- Los tiempos de respuesta de la API deben cumplir con las métricas definidas.
- La aplicación móvil debe haber sido probada en:
  - Un dispositivo físico Android
  - Un emulador iOS
- Debe existir un informe final de calidad aprobado por el Líder SQA.

---

## 21. Anexos

### ANEXO A: Lista de Verificación de Revisión del Código

| Campo                 | Valor                  |
|-----------------------|------------------------|
| **Proyecto**          | Tropical Travel        |
| **Módulo revisado**   | _______________        |
| **Revisor**           | _______________        |
| **Fecha**             | _______________        |
| **Pull Request / Commit** | _______________   |

| # | Criterio de verificación                                                      | Cumple | No cumple | Observaciones |
|---|-------------------------------------------------------------------------------|--------|-----------|---------------|
| 1 | No hay credenciales, tokens o claves API en el código                         | | | |
| 2 | Las contraseñas se hashean con bcryptjs antes de guardarlas                   | | | |
| 3 | Los endpoints de admin verifican el rol del usuario                           | | | |
| 4 | Todos los endpoints protegidos validan el JWT                                 | | | |
| 5 | Los parámetros de entrada (UUID, correos) se validan                          | | | |
| 6 | Los errores del servidor no exponen stack traces al cliente                   | | | |
| 7 | Los mensajes de error al usuario están en español                             | | | |
| 8 | Se usa try/catch en todas las operaciones asíncronas                          | | | |
| 9 | Las variables de entorno se acceden a través de `process.env`                 | | | |
| 10 | El código no tiene funciones ni variables sin usar                           | | | |
| 11 | Los nombres de variables y funciones son descriptivos                        | | | |
| 12 | El código sigue la convención de nomenclatura del proyecto                   | | | |
| 13 | No se almacenan datos sensibles en localStorage (interfaz web)               | | | |
| 14 | En Flutter, el JWT se guarda con flutter_secure_storage                      | | | |
| 15 | Los formularios tienen validación del lado del cliente y del servidor        | | | |

**Resultado**: ☐ Aprobado · ☐ Aprobado con observaciones · ☐ Rechazado

**Comentarios generales**: _______________

---

### ANEXO B: Lista de Verificación del Entorno de Pruebas

Antes de iniciar cada sesión de pruebas, el tester debe verificar:

| # | Verificación                                                                  | Cumple | No cumple |
|---|-------------------------------------------------------------------------------|--------|-----------|
| 1 | El servidor Node.js está corriendo en el puerto correcto                      | | |
| 2 | El archivo .env está configurado con URL y claves válidas                     | | |
| 3 | La base de datos Supabase tiene datos de prueba cargados                      | | |
| 4 | Existe al menos un usuario con rol "cliente" en la BD                         | | |
| 5 | Existe al menos un usuario con rol "admin" en la BD                           | | |
| 6 | Existen al menos 2 destinos activos en la tabla Destinos                      | | |
| 7 | La API de Groq está disponible (verificar con prueba rápida)                  | | |
| 8 | Postman o Thunder Client tiene la colección de pruebas cargada                | | |

---

### ANEXO C: Registro de Cambios de Configuración

| Fecha       | Ítem Modificado | Descripción del Cambio                           | Solicitante    | Aprobado por |
|-------------|-----------------|--------------------------------------------------|----------------|-------------|
| 01/04/2026  | CI-08           | Creación inicial del Plan SQA v1.0               | Equipo SQA     | Líder SQA   |
| 09/04/2026  | CI-08           | Actualización a v2.0 con secciones de gestión de configuración, trazabilidad, lecciones aprendidas | Equipo SQA | Líder SQA |
| 09/04/2026  | CI-01 a CI-13   | Documentación de todos los ítems de configuración | Equipo SQA     | Líder SQA   |

---

> **Documento generado**: Plan SQA v2.0 — Tropical Travel  
> **Fecha de última actualización**: 09/04/2026  
> **Estado**: En revisión
