# Guardias BUAP

Sistema que hice para el registro de entrada y salida de vehículos en accesos del campus. Sustituye el uso de WhatsApp: los guardias de puerta registran los movimientos desde una aplicación web (búsqueda por placa o matrícula, entradas/salidas, gestión de vehículos y cuentas desde un panel de administración).

Aquí explico cómo instalar mi proyecto desde cero: base de datos, configuración y puesta en marcha. Asumo que vas a crear la base de datos y hacer el setup completo en tu máquina o en un servidor.

---

## Qué hay en este repositorio

- **`app/`** — Frontend y lógica de presentación (Next.js). Es la interfaz que usan guardias y administradores.
- **`api/`** — Backend en Node.js (Express). Atiende las peticiones de la app (vehículos, movimientos, login, fotos, etc.).
- **`database/`** — Esquema y migraciones de MySQL. Aquí está el modelo de datos.
- **`scripts/`** — Scripts para crear la base de datos, arrancar en local y desplegar.

La aplicación corre con **dos procesos**: el servidor de la API (puerto 3001) y el de Next.js (puerto 3000). El frontend redirige todo lo que va a `/api/*` hacia la API; en producción hay que definir la variable `API_URL` en la app para que apunte a ese backend.

---

## Requisitos previos

Necesitas:

- **Node.js** 20+
- **npm**
- **MySQL** 8+

En Linux puedes instalar Node con nvm, fnm o el gestor que uses, y MySQL con el gestor de paquetes de tu distro. En macOS: Node con Homebrew o nvm, y MySQL con `brew install mysql`.

---

## Paso 1: Obtener el proyecto

Clona el repositorio en Git:

```bash
git clone <url-del-repo> guardias
cd guardias
```

En caso de que te hayan pasado esta carpeta (sin Git), ábrela en la terminal y colócate en la raíz del proyecto, donde están las carpetas `app`, `api`, `database` y `scripts`.

---

## Paso 2: Crear la base de datos y el usuario en MySQL

Crea una base de datos y un usuario con permisos sobre ella. En desarrollo puedes usar `root`; en producción conviene un usuario dedicado.

Abre el cliente de MySQL (por ejemplo `mysql -u root -p`) y ejecuta algo como esto, ajustando nombre de base, usuario y contraseña:

```sql
CREATE DATABASE IF NOT EXISTS guardias
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Opcional: usuario solo para esta base (recomendado en producción)
CREATE USER IF NOT EXISTS 'guardias_user'@'localhost' IDENTIFIED BY 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON guardias.* TO 'guardias_user'@'localhost';
FLUSH PRIVILEGES;
```

Si usas `root`, no crees usuario; solo asegúrate de que exista la base `guardias`. Anota nombre de base, usuario y contraseña para usarlos en la configuración.

---

## Paso 3: Configurar las variables de entorno

Mi proyecto usa dos conjuntos de variables: uno para la API y otro para la app. Tienen que ser coherentes (misma base, mismo JWT_SECRET, etc.).

### 3.1 Archivo `api/.env`

Copia el ejemplo y edita los valores:

```bash
cp api/.env.example api/.env
```

En `api/.env` rellena al menos:

- **MYSQL_HOST** — Normalmente `localhost` si MySQL está en la misma máquina.
- **MYSQL_PORT** — Por defecto `3306`.
- **MYSQL_USER** — El usuario que creaste o `root`.
- **MYSQL_PASSWORD** — La contraseña de ese usuario.
- **MYSQL_DATABASE** — Nombre de la base, por ejemplo `guardias`.
- **JWT_SECRET** — Una clave larga y aleatoria (mínimo 16 caracteres). Tiene que ser la misma en `api/.env` y en `app/.env.local`. Genera una con:  
  `openssl rand -base64 24`
- **PORT** — Puerto donde escuchará la API; por defecto `3001`.
- **UPLOAD_DIR** — Ruta absoluta donde se guardarán las fotos de vehículos. En desarrollo puedes usar algo como la carpeta `private-uploads` en la raíz del proyecto, por ejemplo:  
  `/ruta/completa/a/guardias/private-uploads`  
  En producción usa una ruta fija fuera del código.
- **FRONTEND_ORIGIN** — URL desde la que se accede al frontend (cookies y CORS). En desarrollo con HTTPS local: `https://localhost:3000`. En producción: la URL pública de la app (ej. `https://guardias.miuniversidad.edu`).

### 3.2 Archivo `app/.env.local`

Copia el ejemplo y edita:

```bash
cp app/.env.example app/.env.local
```

En `app/.env.local` pon las mismas variables de MySQL y el **mismo JWT_SECRET** que en `api/.env`. Además:

- **API_URL** — En desarrollo suele ser `http://localhost:3001`. En producción, si la API y la app están en el mismo servidor: `http://127.0.0.1:3001`. Next.js usa esta variable para enviar las peticiones de `/api/*` al servidor Express.
- **UPLOAD_DIR** — Opcional en la app si solo sirves fotos desde la API; si la app también necesita la ruta, pon la misma que en la API.
- **NEXT_PUBLIC_QR_SECRET** — Opcional. Para el lector de QR institucional: si el QR viene **solo en base64** (texto en base64 que al decodificar es un JSON con `matricula`), no hace falta. Si el QR viene **cifrado con AES-GCM**, pon aquí el mismo secreto con el que se generó el QR en Autoservicios (o el sistema que emita los códigos). La app decodifica o desencripta en el frontend y extrae la matrícula para buscar al vehículo.

No subas estos archivos (`.env`, `.env.local`) al repositorio; ya están en el `.gitignore`.

---

## Paso 4: Aplicar el esquema y las migraciones en la base de datos

Crea las tablas en la base `guardias`. Incluí un script que lee las variables de `app/.env.local` (o `app/.env`) y aplica el esquema y las migraciones.

Desde la **raíz del proyecto** (carpeta `guardias`):

```bash
./scripts/setup-db.sh
```

Si no tienes permisos de ejecución, dale permisos y vuelve a ejecutarlo:

```bash
chmod +x scripts/setup-db.sh
./scripts/setup-db.sh
```

Ese script:

1. Crea la base de datos si no existe (con `utf8mb4`).
2. Aplica `database/schema.sql` (tablas `users`, `vehicles`, `helmets`, `guards`, `movements`).
3. Aplica las migraciones en `database/migrations/` que correspondan.

Si prefieres hacerlo a mano con MySQL:

```bash
mysql -u tu_usuario -p guardias < database/schema.sql
```

Y luego, en orden, las migraciones:

```bash
mysql -u tu_usuario -p guardias < database/migrations/003_rename_users_to_guards_and_add_users_table.sql
mysql -u tu_usuario -p guardias < database/migrations/004_vehicles_user_id.sql
mysql -u tu_usuario -p guardias < database/migrations/005_drop_users_old.sql
```

(Si partes de una base vacía con el `schema.sql` actual, a veces solo necesitas las últimas migraciones; el script `setup-db.sh` ya aplica las que hagan falta.)

---

## Paso 5: Instalar dependencias y compilar

Instala dependencias y compila la API y la app.

**API:**

```bash
cd api
npm install
npm run build
cd ..
```

**App:**

```bash
cd app
npm install
npm run build
cd ..
```

Si más adelante solo cambias código y no dependencias, basta con `npm run build` en cada carpeta.

---

## Paso 6: Crear la carpeta de fotos

Las fotos de los vehículos se guardan en la ruta que definiste en `UPLOAD_DIR`. Crea esa carpeta y, si quieres, la subcarpeta para vehículos:

```bash
mkdir -p private-uploads/vehicles
```

Si en `UPLOAD_DIR` pusiste otra ruta absoluta, crea esa carpeta. El usuario con el que se ejecute la API debe tener permisos de escritura (evita 777; mejor 755 o 775 y dueño adecuado).

---

## Paso 7: Crear el usuario administrador inicial

La primera vez necesitas un usuario con rol administrador para entrar al panel. Desde la raíz del proyecto:

```bash
cd app
npm run seed-admin
cd ..
```

Ese comando crea (o actualiza) un usuario en la tabla `guards` con correo `admin-guardias@buap.mx` y una contraseña que se imprime en la consola. Anótala y cámbiala después desde la aplicación si quieres. El script usa las variables de MySQL de `app/.env.local` (o `app/.env`).

---

## Paso 8: Arrancar la aplicación

Mantén **dos procesos** en marcha: la API y la app.

### En desarrollo (local)

Desde la raíz del proyecto usa el script que levanta ambos:

```bash
./scripts/run-local.sh
```

Ese script intenta arrancar MySQL si está instalado, aplica el esquema si hace falta, instala dependencias si no existen y luego lanza la API en el puerto 3001 y Next.js en el 3000. Para desarrollo con HTTPS local, la app puede usar certificados `app/key.pem` y `app/cert.pem` (generados por ti); en el README de `app/` está cómo usar HTTPS en dev.

Al salir (Ctrl+C) se detienen ambos servidores.

### A mano (desarrollo o producción)

En una terminal:

```bash
cd api
npm run start
```

En otra terminal:

```bash
cd app
API_URL=http://127.0.0.1:3001 npm run start
```

O, si ya tienes `API_URL` en `app/.env.local`:

```bash
cd app
npm run start
```

La app quedará en el puerto 3000 y redirigirá las peticiones a `/api/*` hacia la URL definida en `API_URL`. Abre el navegador en `http://localhost:3000` (o la URL que corresponda si usas proxy o dominio).

### En un servidor (producción)

En producción suele usarse un gestor de procesos (por ejemplo **pm2**) para mantener la API y la app activas. Ejemplo con pm2:

```bash
cd api
pm2 start npm --name guardias-api -- run start
cd ../app
pm2 start npm --name guardias-app -- run start
pm2 save
```

Asegúrate de que en `app/.env.local` (o en el entorno del servidor) tengas `API_URL=http://127.0.0.1:3001` para que el frontend hable con la API. Delante de la app puedes poner Nginx o Apache como proxy reverso hacia `http://127.0.0.1:3000` y configurar el dominio y HTTPS ahí. En ese caso, en `api/.env` pon en `FRONTEND_ORIGIN` la URL pública final de la aplicación.

---

## Resumen rápido

1. Ten Node 20+, npm y MySQL 8+.
2. Clona el repositorio (o, si te pasaron la carpeta, entra en la raíz del proyecto).
3. Crea la base de datos (y opcionalmente un usuario) en MySQL.
4. Configura `api/.env` y `app/.env.local` (MySQL, JWT_SECRET, UPLOAD_DIR, FRONTEND_ORIGIN, API_URL).
5. Ejecuta `./scripts/setup-db.sh` para crear tablas y migraciones.
6. Haz `npm install` y `npm run build` en `api/` y en `app/`.
7. Crea la carpeta de uploads (`private-uploads/vehicles` o la ruta de `UPLOAD_DIR`).
8. Ejecuta `npm run seed-admin` desde `app/` para crear el admin.
9. Arranca la API (puerto 3001) y la app (puerto 3000) con `run-local.sh`, a mano o con pm2.

Si algo falla, revisa que MySQL esté corriendo, que las credenciales en los `.env` sean correctas, que la base y las tablas existan y que los puertos 3000 y 3001 estén libres. Los logs de la API y de Next.js suelen indicar el motivo del error (conexión a BD, JWT, etc.).
