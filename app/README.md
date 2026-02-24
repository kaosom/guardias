# App - Aplicacion Web

Este directorio contiene la aplicacion web completa del sistema **Guardias**: la interfaz de usuario, los endpoints HTTP del servidor y toda la logica de autenticacion y validacion. Esta construida con Next.js 15 usando el paradigma de App Router, React 19 y TypeScript estricto.

---

## Tabla de contenidos

- [Descripcion general](#descripcion-general)
- [Tecnologias y dependencias principales](#tecnologias-y-dependencias-principales)
- [Requisitos previos](#requisitos-previos)
- [Instalacion](#instalacion)
- [Variables de entorno](#variables-de-entorno)
- [Ejecutar en desarrollo](#ejecutar-en-desarrollo)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
  - [app/](#app-directorio-de-rutas)
  - [app/api/](#appapi-route-handlers)
  - [components/](#components-componentes-de-ui)
  - [lib/](#lib-utilidades-y-tipos)
  - [hooks/](#hooks)
  - [contexts/](#contexts)
  - [styles/](#styles)
  - [scripts/](#scripts)
- [Autenticacion y autorizacion](#autenticacion-y-autorizacion)
- [Rutas de la aplicacion](#rutas-de-la-aplicacion)
- [Despliegue en produccion](#despliegue-en-produccion)

---

## Descripcion general

El sistema Guardias permite a los guardias de puerta de un campus universitario registrar la entrada y salida de vehiculos de forma rapida y eficiente. Desde la interfaz principal, un guardia puede buscar un vehiculo por placa o matricula del estudiante, ver su informacion completa y registrar el movimiento correspondiente.

Los administradores cuentan con un panel separado para gestionar los vehiculos registrados y las cuentas de los guardias.

---

## Tecnologias y dependencias principales

| Categoria | Tecnologia | Version |
|---|---|---|
| Framework | Next.js | 15.2.6 |
| UI Library | React | 19 |
| Lenguaje | TypeScript | 5+ |
| Estilos | Tailwind CSS | 3.4+ |
| Componentes | Radix UI + shadcn/ui | Varias |
| Formularios | React Hook Form + Zod | 7+ / 3.25+ |
| Graficos | Recharts | 2.15 |
| Animaciones | Framer Motion | latest |
| Autenticacion | jose (JWT) + bcrypt | 6+ / 6+ |
| Base de datos | mysql2 | 3.17+ |
| Iconos | lucide-react | 0.454+ |
| Notificaciones | Sonner | 1.7+ |

---

## Requisitos previos

Antes de instalar y ejecutar la aplicacion, asegurate de contar con:

- **Node.js** version 20 o superior. Se recomienda usar la version LTS mas reciente.
- **npm** version 9 o superior (incluido con Node.js).
- Una instancia de **MySQL 8+** corriendo y accesible. Consulta el README del modulo `database` para la configuracion del esquema.
- Los archivos de certificados SSL locales `cert.pem` y `key.pem` en la raiz de este directorio para poder levantar el servidor de desarrollo bajo HTTPS. Puedes generarlos con:

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
```

> El servidor de desarrollo usa HTTPS de forma obligatoria porque algunas APIs del navegador (como acceso a la camara para el escaner QR) solo estan disponibles en contextos seguros.

---

## Instalacion

```bash
# Posicionarte en el directorio de la aplicacion
cd apps/guardias/app

# Instalar todas las dependencias
npm install
```

---

## Variables de entorno

Copia el archivo de ejemplo y rellena los valores correspondientes a tu entorno:

```bash
cp .env.example .env.local
```

Contenido de `.env.local`:

```env
# Base de datos MySQL (obligatorio)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=tu_contrasena
MYSQL_DATABASE=guardias

# JWT para sesiones (obligatorio). Minimo 16 caracteres.
# Puedes generar uno con: openssl rand -base64 24
JWT_SECRET=una_clave_secreta_larga_y_segura

# QR institucional (opcional). Si el QR viene cifrado con AES-GCM, mismo secreto que genero el QR.
# Si el QR es solo base64(JSON) con "matricula", no hace falta.
# NEXT_PUBLIC_QR_SECRET=

# Ruta donde se almacenan las fotos de vehiculos (obligatorio en produccion).
# IMPORTANTE: debe estar FUERA de /public/ y del directorio de la app para que
# Next.js no la sirva como archivo estatico.
# En produccion apuntar a la carpeta uploads/ en la raiz del proyecto:
# UPLOAD_DIR=/ruta/absoluta/al/proyecto/uploads
```

> Nunca subas `.env.local` al repositorio. El archivo ya esta listado en `.gitignore`.

---

## Ejecutar en desarrollo

```bash
npm run dev
```

La aplicacion estara disponible en `https://localhost:3000`. El servidor usa los certificados `key.pem` y `cert.pem` para servir el contenido bajo HTTPS.

Al ser un certificado autofirmado, el navegador mostrara una advertencia de seguridad en el primer acceso. Acepta el riesgo y continua; esto es esperado y normal en entornos locales.

---

## Scripts disponibles

| Script | Comando | Descripcion |
|---|---|---|
| Desarrollo | `npm run dev` | Inicia el servidor de desarrollo con HTTPS, hot reload habilitado. |
| Build | `npm run build` | Compila la aplicacion para produccion. |
| Produccion | `npm run start` | Inicia el servidor en modo produccion (requiere build previo). |
| Lint | `npm run lint` | Ejecuta ESLint sobre todo el proyecto. |
| Seed admin | `npm run seed-admin` | Crea el usuario administrador inicial en la base de datos. Ejecutar una sola vez al configurar el proyecto por primera vez. |

---

## Estructura del proyecto

```
app/
├── app/                   - Rutas y layouts principales (App Router de Next.js)
│   ├── layout.tsx         - Layout raiz de la aplicacion (fuentes, providers, metadata)
│   ├── page.tsx           - Pagina principal: panel de busqueda y registro para guardias
│   ├── error.tsx          - Vista de error global de Next.js
│   ├── loading.tsx        - Pantalla de carga global
│   ├── globals.css        - Estilos globales y directivas de Tailwind
│   ├── login/             - Pagina de inicio de sesion
│   └── admin/             - Seccion de administracion (protegida, solo role: admin)
│       └── page.tsx       - Panel de administracion: vehiculos y guardias
│
├── app/api/               - Route Handlers HTTP (backend de la aplicacion)
│   ├── auth/              - Endpoints de autenticacion (login, logout, sesion)
│   ├── vehicles/          - CRUD de vehiculos (requiere sesion)
│   ├── movements/         - Registro de entradas y salidas (requiere sesion)
│   ├── photos/            - Servicio autenticado de fotos de vehiculos
│   ├── admin/             - Endpoints exclusivos del panel de administracion (role: admin)
│   └── upload/            - Subida de fotos de vehiculos (requiere sesion)
│
├── components/            - Componentes de UI reutilizables
│   ├── ui/                - Primitivos de shadcn/ui (Button, Dialog, Input, etc.)
│   ├── guard-header.tsx   - Header principal de la aplicacion
│   ├── vehicle-modal.tsx  - Modal de creacion y edicion de vehiculos
│   ├── search-bar.tsx     - Barra de busqueda por placa o matricula
│   ├── result-card.tsx    - Tarjeta con el resultado de la busqueda
│   ├── camera-scanner.tsx - Componente de escaneo via camara
│   ├── qr-scanner.tsx     - Scanner de codigos QR
│   ├── confirm-dialog.tsx - Dialogo de confirmacion generico
│   └── creative.tsx       - Componentes visuales adicionales
│
├── lib/                   - Utilidades y configuracion global
│   ├── types.ts           - Tipos TypeScript compartidos (VehicleRecord, VehicleType, etc.)
│   ├── auth.ts            - Funciones de autenticacion: generacion y verificacion de JWT
│   ├── validation.ts      - Esquemas Zod para validar inputs de formularios y APIs
│   └── utils.ts           - Utilidades generales (cn para clases de Tailwind, etc.)
│
├── hooks/                 - Custom Hooks de React
├── contexts/              - Proveedores de contexto global de React
├── styles/                - Archivos CSS adicionales
│
├── middleware.ts           - Middleware de Next.js para proteger rutas
├── next.config.mjs         - Configuracion de Next.js
├── tailwind.config.ts      - Configuracion de Tailwind CSS
├── tsconfig.json           - Configuracion de TypeScript
├── .env.example            - Plantilla de variables de entorno
├── cert.pem                - Certificado SSL para desarrollo local (no versionado)
└── key.pem                 - Clave privada SSL para desarrollo local (no versionado)
```

---

## Autenticacion y autorizacion

El sistema usa JWT almacenado en una cookie `HttpOnly` llamada `session`. La cookie se genera al iniciar sesion satisfactoriamente y se verifica en cada request mediante el middleware de Next.js.

**Flujo de autenticacion:**

1. El usuario ingresa su correo y contrasena en `/login`.
2. El Route Handler `POST /api/auth/login` valida las credenciales contra la tabla `guards` usando bcrypt.
3. Si son correctas, genera un JWT firmado con `JWT_SECRET` y lo establece como cookie `session`.
4. El middleware (`middleware.ts`) intercepta cada request antes de llegar a la pagina y verifica el JWT.
5. Si el token es invalido o inexistente, redirige a `/login`.
6. Si el path comienza con `/admin` y el rol de la sesion no es `admin`, redirige a `/`.

**Rutas protegidas por el middleware:**

- `/` - Requiere sesion valida (cualquier rol).
- `/admin/*` - Requiere sesion con `role: "admin"`.
- `/login` - Si ya hay sesion, redirige a `/`.

---

## Rutas de la aplicacion

### Paginas

| Ruta | Acceso | Descripcion |
|---|---|---|
| `/login` | Publico | Formulario de inicio de sesion |
| `/` | Guardias y admins | Panel principal: busqueda y registro de movimientos |
| `/admin` | Solo admins | Gestion de vehiculos, alumnos y guardias |

### Endpoints HTTP (`app/api/`)

| Metodo | Ruta | Acceso | Descripcion |
|---|---|---|---|
| `POST` | `/api/auth/login` | Publico | Inicia sesion. Devuelve cookie de sesion. Rate limiting: 10 intentos / 15 min. |
| `POST` | `/api/auth/logout` | Publico | Cierra sesion. Elimina la cookie. |
| `GET` | `/api/auth/session` | Publico | Retorna los datos de la sesion activa. |
| `GET` | `/api/vehicles` | Sesion valida | Lista o busca vehiculos (query param: `q`). |
| `POST` | `/api/vehicles` | Sesion valida | Crea un vehiculo nuevo. |
| `GET` | `/api/vehicles/[id]` | Sesion valida | Retorna un vehiculo por ID. |
| `PUT` | `/api/vehicles/[id]` | Sesion valida | Actualiza un vehiculo existente. |
| `DELETE` | `/api/vehicles/[id]` | Solo admin | Elimina un vehiculo. |
| `POST` | `/api/movements` | Sesion valida | Registra una entrada o salida. |
| `POST` | `/api/upload` | Sesion valida | Sube una foto de vehiculo. Retorna la ruta relativa. |
| `GET` | `/api/photos/[...path]` | Sesion valida | Sirve una foto de vehiculo con anti path-traversal. |
| `GET` | `/api/admin/guards` | Solo admin | Lista los guardias. |
| `POST` | `/api/admin/guards` | Solo admin | Crea un nuevo guardia. Contrasena minimo 8 caracteres. |
| `DELETE` | `/api/admin/guards/[id]` | Solo admin | Elimina un guardia. |

---

## Despliegue en produccion

### Variables de entorno en produccion

Asegurate de que todas las variables de entorno esten configuradas directamente en el servidor o plataforma de hosting (Vercel, Railway, etc.):

- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `JWT_SECRET` (usa una clave aleatoria larga; no reutilices la de desarrollo)
- `UPLOAD_DIR` (ruta absoluta donde se almacenaran las fotos, fuera de public/)

### Compilar y ejecutar

```bash
# Compilar la aplicacion para produccion
npm run build

# Iniciar el servidor en modo produccion
npm run start
```

### Almacenamiento de fotos en disco

Las fotos de vehiculos se guardan en la carpeta `uploads/` ubicada en la **raiz del proyecto** (al mismo nivel que `api/`, `app/` y `database/`). Esta ubicacion esta **intencionalmente fuera del directorio de Next.js** para que no sea accesible como archivo estatico. El acceso siempre pasa por el endpoint autenticado `GET /api/photos/[...path]`.

La ruta exacta se configura con la variable `UPLOAD_DIR` en `.env.local`. En produccion se recomienda usar la ruta absoluta:

```env
UPLOAD_DIR=/ruta/absoluta/al/proyecto/uploads
```

Para usar la foto de un vehiculo en el frontend, construye la URL de esta forma:

```tsx
// vehicle.vehiclePhotoUrl contiene algo como "vehicles/TNA-1234-uuid.jpg"
<img src={`/api/photos/${vehicle.vehiclePhotoUrl}`} alt="Foto del vehiculo" />
```

En un servidor universitario tradicional (no contenedores), la carpeta persiste entre reinicios del proceso. Asegurate de que el usuario que corre la app tenga permisos de escritura en esa ruta.

### Notas sobre despliegue universitario

- Crea la carpeta de uploads antes de arrancar: `mkdir -p /ruta/al/proyecto/uploads/vehicles`
- Verifica permisos: `chown -R tu_usuario /ruta/al/proyecto/uploads`
- Agrega la ruta absoluta al `.env.local` de produccion: `UPLOAD_DIR=/ruta/absoluta/al/proyecto/uploads`
- El archivo `vercel.json` en la raiz del directorio contiene la configuracion minima para despliegues en la plataforma Vercel si se decide usar esa opcion de hosting.

