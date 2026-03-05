# Frontend - Aplicación Móvil (Flutter)

Este directorio contiene la aplicación cliente del sistema **Guardias**: la interfaz de usuario para dispositivos móviles, diseñada para que los guardias registren la entrada y salida de vehículos mediante el escaneo de códigos QR o búsqueda manual. Está construida con Flutter y Dart.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Tecnologías y dependencias principales](#tecnologías-y-dependencias-principales)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Autenticación](#autenticación)
- [Despliegue](#despliegue)

---

## Descripción general

El sistema Guardias permite a los guardias en las entradas de un campus (ej. BUAP) registrar y validar el acceso de vehículos de forma rápida. Desde esta aplicación móvil, un guardia puede escanear un código QR institucional o buscar un vehículo por placa/matrícula para autorizar su entrada o salida en tiempo real.

---

## Tecnologías y dependencias principales

| Categoría | Tecnología/Paquete | Versión |
|---|---|---|
| Framework | Flutter | 3.x |
| Lenguaje | Dart | 3.x |
| Gestión de Estado | Riverpod (`flutter_riverpod`) | ^3.2.1 |
| Enrutamiento | GoRouter (`go_router`) | ^17.1.0 |
| Peticiones HTTP | HTTP (`http`) | ^1.6.0 |
| Iconos | Lucide Icons (`lucide_icons`) | ^0.257.0 |
| Estilos/Fuentes | Google Fonts (`google_fonts`) | ^6.2.1 |
| Escáner QR | Mobile Scanner (`mobile_scanner`) | ^7.2.0 |
| Persistencia | Shared Preferences (`shared_preferences`) | ^2.5.4 |
| Encriptación | Encrypt (`encrypt`) y Crypto | ^5.0.3 / ^3.0.7 |

---

## Requisitos previos

Antes de compilar y ejecutar la aplicación, asegúrate de contar con:

- **Flutter SDK** instalado y configurado en tu sistema.
- **Android Studio** o **Xcode** para emulación o despliegue en dispositivos físicos.
- Un emulador configurado o un dispositivo físico conectado.
- La **API (backend)** corriendo localmente o accesible externamente (ver directorio `api/`).

---

## Instalación

```bash
# Posicionarte en el directorio del frontend
cd apps/guardias/frontend

# Obtener todas las dependencias
flutter pub get
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del directorio `frontend/` y rellena los valores:

```env
# Secret para desencriptar código QR institucional (AES-GCM)
QR_CRYPTO_SECRET="una_clave_secreta_aqui"

# (Opcional) URL base de la API backend. Si no se establece, usa localhost / 10.0.2.2 por defecto
API_BASE_URL="http://192.168.1.100:3001"
```

El archivo es empaquetado como asset dentro de la app al compilar.

---

## Ejecutar en desarrollo

Para correr la app en un emulador o dispositivo conectado:

```bash
flutter run
```

Si deseas correr todo el stack (Base de datos + API + Flutter web) localmente en un solo comando:
```bash
../scripts/run-local-flutter.sh
```

*(El script levantar un entorno de Flutter en modo web-server en `localhost:3000`)*.

---

## Estructura del proyecto

El proyecto sigue una arquitectura orientada a características e inspirado en Atomic Design para la UI:

```
frontend/
├── lib/
│   ├── core/                  - Utilidades, red, temas y enrutamiento global
│   │   ├── models/            - Modelos de datos (ej. VehicleRecord)
│   │   ├── network/           - Cliente HTTP (api_client.dart) responsable de llamadas y cookies
│   │   ├── theme/             - Configuración global de estilos (colores, fuentes, bordes)
│   │   └── utils/             - Clases auxiliares (validaciones, descifrado QR)
│   │
│   ├── features/              - Módulos por dominio de la aplicación
│   │   ├── auth/              - Lógica y vistas de Autenticación (Login)
│   │   ├── home/              - Pantalla principal del Guardia (Búsqueda y Scanner)
│   │   └── admin/             - Panel básico de métricas para admin
│   │
│   ├── ui/                    - Subdivisión de componentes visuales puramente estéticos o reutilizables
│   │   ├── atoms/             - Elementos mínimos (Botones, text fields)
│   │   ├── molecules/         - Agrupaciones simples (SearchBars, Grid items)
│   │   └── organisms/         - Componentes complejos (Modales, Headers, ResultCards)
│   │
│   └── main.dart              - Punto de entrada de la app
│
├── assets/                    - Imágenes estáticas
├── .env                       - Variables de entorno locales (NO versionar)
└── pubspec.yaml               - Dependencias y configuración del proyecto
```

---

## Autenticación

El sistema maneja la sesión usando cookies HTTP gestionadas a través de la librería `shared_preferences` e interceptores manuales en el `api_client.dart`:

1. Al loguearse en `LoginScreen`, el API devuelve un JWT interno en el header `set-cookie`.
2. El cliente intercepta `set-cookie` y lo guarda en Shared Preferences.
3. En cada petición subsiguiente, se agrega el token en la cabecera `cookie`.

De esta forma, Flutter emula el comportamiento natural de la web con el que fue diseñado el backend original (Next.js/Express).

---

## Despliegue

### Para Android
Construye el APK o AppBundle:
```bash
flutter build apk --release
# o
flutter build appbundle
```

### Para iOS
Configura tus perfiles de aprovisionamiento en Xcode y ejecuta:
```bash
flutter build ios --release
```

Asegúrate de cambiar `API_BASE_URL` en el archivo `.env` por la URL real de tu backend productivo antes de generar la build final.
