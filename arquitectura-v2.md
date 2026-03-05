```mermaid
flowchart TB

Usuario[Persona que usa el sistema]
Decision{¿Es ADMIN o GUARDIA?}

Guardia[Guardia(usa app en el celular)]
Admin[Administrador(usa sistema en celular)]

App[App / Lógica del sistema]
DB[Base de datos]

Usuario --> Decision
Decision -->|GUARDIA| Guardia
Decision -->|ADMIN| Admin

Guardia -->|Inicia sesión y escanea QR| App
Guardia -->|Registra ENTRADA/SALIDA solo vehículos/alumnos ya dados de alta| App

Admin -->|Inicia sesión en el panel| App
Admin -->|Da de alta y actualiza alumnos, vehículos y guardias| App
Admin -->|Consulta historial y reportes| App

App -->|Guarda y lee información del sistema| DB
DB -->|Regresa datos actualizados| App
```
