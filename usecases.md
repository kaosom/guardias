# Casos de Uso — Sistema de Control de Acceso Vehicular BUAP

El presente documento describe los casos de uso del sistema de control de acceso vehicular desarrollado para la Benemérita Universidad Autónoma de Puebla (BUAP). Su propósito es especificar de manera clara y estructurada las funcionalidades que el sistema pone a disposición del personal de vigilancia y del equipo administrativo, sin profundizar en detalles de implementación técnica.

---

## CU-01 — Autenticación de Guardia (Inicio de Turno)

**Actor principal:** Guardia de seguridad  
**Precondición:** El guardia cuenta con credenciales institucionales activas y dispositivo con la aplicación instalada.

Al iniciar su turno, el guardia de seguridad accede a la aplicación instalada en el dispositivo móvil institucional asignado.

- Ingresa su correo institucional (p. ej. `perez@buap.mx`) y su contraseña.
- El sistema valida las credenciales contra el servidor y, de ser correctas, establece una sesión persistente.
- La puerta de acceso y el plantel asignado al guardia quedan registrados en la sesión activa, visibles desde el encabezado de la aplicación.
- La sesión se mantiene activa de forma continua hasta que el usuario cierre sesión de manera voluntaria, sin requerir reautenticación durante el turno.

**Flujo alternativo:** Si las credenciales son incorrectas, el sistema muestra un mensaje de error y permite reintentar. Tras múltiples intentos fallidos, el acceso puede ser bloqueado temporalmente por el administrador.

---

## CU-02 — Identificación por Código QR

**Actor principal:** Guardia de seguridad  
**Precondición:** El estudiante posee un QR vigente generado desde el portal de autoservicios institucional. El vehículo está registrado en el sistema.

Caso de uso principal para el ingreso de vehículos portadores de credencial digital vigente.

- El estudiante presenta el código QR desde su dispositivo móvil.
- El guardia activa el lector desde el botón flotante de la interfaz principal (con soporte de linterna en condiciones de baja iluminación).
- La aplicación decodifica el contenido del código de forma local mediante cifrado AES, sin requerir consulta al servidor en esta etapa.
- Una vez obtenida la matrícula u otros identificadores, el sistema consulta el registro vehicular asociado y muestra al guardia una ficha con los datos del propietario, el vehículo y su fotografía.
- El guardia valida la identidad visualmente y registra la acción de entrada o salida con un solo toque. El estado del vehículo se actualiza en la base de datos en tiempo real.

**Flujo alternativo:** Si el QR no corresponde a ningún registro activo, el sistema lo indica y el guardia puede continuar con CU-03 o CU-04.

---

## CU-03 — Identificación por Reconocimiento Óptico de Placas (OCR)

**Actor principal:** Guardia de seguridad  
**Precondición:** El vehículo porta una placa visible y legible. La cámara del dispositivo está operativa.

Caso de uso para situaciones en que el estudiante no porta credencial digital o el vehículo no cuenta con QR asociado.

- El guardia activa la cámara desde el botón correspondiente en la barra de acciones.
- Apunta el dispositivo hacia la placa vehicular y el sistema aplica reconocimiento óptico de caracteres (OCR) para extraer la cadena alfanumérica.
- La cadena reconocida se transfiere automáticamente al campo de búsqueda y ejecuta la consulta, eliminando la necesidad de captura manual.
- El guardia puede confirmar o corregir el resultado antes de registrar el acceso.

**Flujo alternativo:** Si la placa es ilegible por condiciones de luz o suciedad, el sistema notifica que la detección falló y sugiere la búsqueda manual (CU-04).

---

## CU-04 — Búsqueda Manual por Placa o Matrícula

**Actor principal:** Guardia de seguridad  
**Precondición:** El guardia conoce al menos la placa vehicular o la matrícula del estudiante.

Alternativa disponible cuando las condiciones físicas impiden el uso de los métodos automatizados (placa deteriorada, cristal roto, mala iluminación, etc.).

- El guardia introduce directamente en el campo de búsqueda la placa vehicular (p. ej. `TXT-123`) o la matrícula del estudiante (p. ej. `201934956`).
- El sistema realiza la búsqueda y retorna la ficha del vehículo registrado con el mismo nivel de detalle que los métodos anteriores.

---

## CU-05 — Registro de Nuevo Vehículo

**Actor principal:** Guardia de seguridad  
**Precondición:** El vehículo no tiene registro previo en el sistema. El propietario está presente y puede proporcionar su matrícula.

Permite dar de alta en el sistema un vehículo que no cuenta con registro previo, ya sea por adquisición reciente o por omisión en el trámite institucional.

- El guardia accede al formulario de alta mediante el botón de acción flotante (+).
- Completa los datos del propietario (matrícula, nombre completo) y del vehículo (tipo, color, marca, descripción, observaciones relevantes).
- Opcionalmente, captura una fotografía del vehículo directamente desde la aplicación para asociarla al registro y facilitar futuras validaciones visuales.
- En el caso de motocicletas, el sistema requiere el registro de los cascos asociados (descripción individual y cantidad total), de acuerdo con la normativa institucional vigente.
- Al confirmar, el vehículo queda disponible de inmediato para consultas y control de acceso.

---

## CU-06 — Edición de Registro Vehicular

**Actor principal:** Guardia de seguridad  
**Precondición:** El vehículo está registrado en el sistema y ha sido localizado mediante búsqueda activa.

Permite corregir o actualizar la información de un vehículo ya existente en el sistema.

- Desde la ficha de resultados, el guardia accede a los controles de edición disponibles junto al nombre del propietario o junto a la placa del vehículo.
- Al activar la edición, el mismo formulario de alta se presenta precargado con la información vigente, lista para modificarse.
- Los cambios se persisten en el servidor al confirmar la operación.

**Casos típicos:** cambio de placas por renovación, actualización de fotografía, corrección de matrícula o nombre del propietario, adición o remoción de cascos registrados.

---

## CU-07 — Eliminación de Registro Vehicular

**Actor principal:** Guardia de seguridad  
**Precondición:** El vehículo existe en el sistema y ha sido localizado mediante búsqueda activa.

Permite eliminar definitivamente el registro de un vehículo cuando este ya no debe tener acceso al plantel.

- Desde la ficha de resultados, el guardia accede a la opción de eliminación del vehículo.
- El sistema solicita confirmación explícita antes de proceder, dado que la operación es irreversible.
- Una vez confirmada, el registro y su historial de accesos asociado son eliminados del sistema.

**Casos típicos:** baja por robo del vehículo reportado, egreso del propietario de la institución, errores de registro duplicado.

---

## CU-08 — Registro de Salida de Vehículo

**Actor principal:** Guardia de seguridad  
**Precondición:** El vehículo figura con estado "dentro" en el sistema.

Durante la operación diaria, los vehículos que ya ingresaron deben poder registrar su salida de forma simétrica al proceso de entrada.

- El guardia localiza el vehículo mediante cualquiera de los métodos disponibles (CU-02, CU-03, CU-04).
- La ficha muestra el estado actual del vehículo como "Dentro" y presenta el botón de acción "Registrar Salida".
- Al confirmar, el sistema actualiza el estado del vehículo a "Fuera" y registra la hora exacta de salida en el historial.

**Flujo alternativo:** Si el vehículo ya figura como "Fuera", el sistema muestra el botón "Registrar Entrada" en su lugar, impidiendo duplicidades de estado.

---

## CU-09 — Verificación de Correspondencia Casco–Motocicleta

**Actor principal:** Guardia de seguridad  
**Precondición:** El vehículo identificado es una motocicleta con cascos registrados en el sistema.

Caso de uso específico para el control del equipamiento de seguridad en vehículos de dos ruedas, conforme a la normativa institucional.

- Al mostrar la ficha de una motocicleta, el sistema despliega el número de cascos registrados y la descripción individual de cada uno.
- El guardia verifica físicamente que el número de cascos presentes coincida con el registrado en el sistema.
- Si existe discrepancia (más o menos cascos de los registrados), el guardia puede iniciar una edición del registro (CU-06) para actualizar la información o dejar observación al respecto.
- El acceso no es bloqueado automáticamente por esta condición; la decisión de permitir el paso queda bajo criterio del guardia conforme al reglamento vigente.

---

## CU-10 — Consulta de Historial de Accesos por Vehículo

**Actor principal:** Guardia de seguridad / Administrador  
**Precondición:** El vehículo existe en el sistema.

Permite revisar el registro cronológico de entradas y salidas de un vehículo específico.

- Desde la ficha del vehículo, el usuario puede acceder al historial de movimientos.
- El sistema presenta una lista ordenada por fecha y hora de cada evento de acceso (entrada o salida), incluyendo el guardia que lo registró y la puerta utilizada.
- Esta información es útil para resolver disputas, verificar permanencia dentro del plantel o generar evidencia ante incidentes.

---

## CU-11 — Acceso Denegado por Vehículo No Registrado

**Actor principal:** Guardia de seguridad  
**Precondición:** El vehículo no tiene registro previo en el sistema.

Describe el flujo cuando un vehículo intenta ingresar al plantel sin estar dado de alta.

- El guardia realiza la búsqueda mediante cualquier método disponible y el sistema devuelve resultado vacío.
- El guardia solicita al conductor la documentación correspondiente (credencial BUAP, comprobante de matrícula).
- Si el estudiante acredita su pertenencia a la institución, el guardia puede proceder al registro inmediato del vehículo (CU-05) y permitir el acceso.
- Si no se puede acreditar la relación con la institución, el acceso es denegado y el guardia puede registrar el incidente en observaciones del sistema.

---

## CU-12 — Cambio de Turno entre Guardias

**Actor principal:** Guardia saliente / Guardia entrante  
**Precondición:** El turno del guardia en funciones está próximo a concluir y el guardia del siguiente turno está presente.

Garantiza la continuidad del control de acceso durante la rotación de personal.

- El guardia saliente cierra su sesión de forma explícita desde el menú de perfil en la aplicación.
- El guardia entrante inicia sesión con sus propias credenciales en el mismo dispositivo.
- El sistema registra automáticamente el cambio de operador y asigna al nuevo guardia la puerta correspondiente a su turno.
- A partir de este momento, todos los accesos registrados en el dispositivo quedan vinculados al nuevo guardia.

---

## CU-13 — Consulta de Estado Actual de la Puerta Asignada

**Actor principal:** Guardia de seguridad  
**Precondición:** El guardia tiene sesión activa.

Permite al guardia consultar en cualquier momento los datos de la puerta y plantel que tiene asignados durante su turno activo.

- Desde el encabezado de la aplicación, el guardia puede acceder al panel de información de su puerta.
- El sistema muestra el número de puerta, el plantel al que pertenece y el estado operativo de la misma (activa).
- Esta consulta es especialmente útil después de reasignaciones realizadas por el administrador durante el turno.

---

## CU-14 — Reasignación de Guardia a Nueva Puerta (Administrador)

**Actor principal:** Administrador  
**Precondición:** El guardia tiene sesión activa y el administrador está autenticado con rol `admin`.

Permite al administrador reasignar a un guardia a una puerta o plantel distinto sin interrumpir la operación.

- El administrador accede al panel de gestión de guardias desde el encabezado de la aplicación.
- Localiza al guardia en la lista y selecciona la opción de edición.
- Modifica la puerta asignada y/o el plantel, y guarda los cambios.
- La próxima vez que el guardia consulte su panel de puerta (CU-13) o reinicie sesión, verá reflejada la nueva asignación.

---

## CU-15 — Registro de Incidente o Anomalía en Acceso

**Actor principal:** Guardia de seguridad  
**Precondición:** Se ha presentado una situación irregular durante el proceso de entrada o salida de un vehículo.

Permite documentar en el sistema situaciones que requieren atención posterior o seguimiento administrativo.

- Durante el proceso de alta o edición de un vehículo (CU-05, CU-06), el guardia puede añadir una nota de observaciones en texto libre.
- Estas observaciones quedan vinculadas al registro del vehículo y son visibles para cualquier guardia o administrador que consulte la ficha posteriormente.
- **Casos típicos:** casco dañado o que no corresponde al descripción registrada, placa con señales de alteración, conductor distinto al propietario registrado, intento de ingreso con QR vencido o inválido, verificación de identidad fallida.

---

## CU-16 — Consulta de Historial de Accesos por Guardia (Administrador)

**Actor principal:** Administrador  
**Precondición:** El guardia existe en el sistema y tiene eventos registrados.

Permite al administrador auditar la actividad de un guardia específico durante sus turnos.

- Desde el panel de administración, el administrador selecciona un guardia de la lista.
- El sistema presenta el historial cronológico de todos los eventos que dicho guardia registró: vehículos ingresados, salidas confirmadas, registros nuevos creados y modificaciones realizadas.
- Esta información sirve como mecanismo de auditoría y control de calidad del servicio de vigilancia.

---

## CU-17 — Alta de Vehículo con Múltiples Propietarios o Usuarios Autorizados

**Actor principal:** Guardia de seguridad / Administrador  
**Precondición:** Un mismo vehículo es utilizado por más de un estudiante con credencial activa (p. ej., vehículo familiar compartido entre hermanos matriculados).

- El guardia registra el vehículo de forma estándar (CU-05), asociándolo al propietario principal.
- En el campo de observaciones, documenta los usuarios adicionales autorizados con sus respectivas matrículas.
- El sistema no bloquea el acceso si quien presenta el vehículo no coincide con el propietario principal, siempre que el guardia valide manualmente la identidad del conductor frente a las observaciones registradas.

---

## CU-18 — Recuperación de Contraseña de Guardia

**Actor principal:** Administrador  
**Precondición:** Un guardia ha olvidado su contraseña o necesita reestablecerla por motivos de seguridad.

- El guardia notifica al administrador de la situación.
- El administrador accede al panel de gestión (CU-07) y edita los datos del guardia afectado.
- Genera una nueva contraseña temporal y la comunica al guardia por un canal seguro (mensaje directo, correo supervisor, etc.).
- El guardia utiliza la contraseña temporal para autenticarse y se recomienda modificarla en su siguiente acceso.

**Nota:** El sistema no implementa recuperación autónoma por correo electrónico; el flujo requiere intermediación del administrador.

---

## CU-19 — Verificación Visual por Fotografía del Vehículo

**Actor principal:** Guardia de seguridad  
**Precondición:** El vehículo tiene una fotografía asociada en su registro.

Complementa la validación de identidad del propietario con una verificación física del vehículo.

- Al consultar la ficha de un vehículo, si existe fotografía asociada, el sistema la muestra de forma prominente en la tarjeta de resultados.
- El guardia compara visualmente el vehículo presente con la fotografía del registro para confirmar que corresponde al mismo.
- En caso de discrepancia evidente (diferente color, modelo o condición), el guardia puede denegar el acceso y registrar la anomalía en observaciones (CU-15).

---

## CU-20 — Cierre de Sesión al Finalizar Turno

**Actor principal:** Guardia de seguridad  
**Precondición:** El guardia tiene una sesión activa en la aplicación.

Garantiza que la sesión del guardia saliente quede correctamente terminada al concluir su jornada.

- El guardia accede al menú de perfil desde el encabezado de la aplicación.
- Selecciona la opción "Cerrar sesión".
- El sistema invalida la sesión activa en el servidor, elimina las credenciales almacenadas localmente en el dispositivo y redirige a la pantalla de autenticación.
- A partir de este punto, el dispositivo queda disponible para que el guardia del siguiente turno inicie sesión con sus propias credenciales (CU-01, CU-12).

---

## Objetivo general del sistema

El sistema tiene como finalidad reducir los tiempos de validación en los accesos vehiculares de los planteles universitarios, minimizando la intervención manual del personal de vigilancia y proveyendo trazabilidad completa de todos los movimientos de entrada y salida registrados. Cada flujo de uso está orientado a requerir el menor número posible de interacciones por parte del guardia, priorizando la agilidad operativa sin comprometer el control de acceso ni la seguridad institucional.

---

*Versión 1.1 — Marzo 2026*
