# CropAI — Contexto del producto para asistentes (RAG)

**CropAI** es una plataforma de **gestión agrícola inteligente para fincas y bodegas**. Centraliza **producción**, **sanidad**, **operaciones**, **almacén**, **equipo**, **finanzas** y **cumplimiento**. Este documento evita confusiones entre **plan de suscripción**, **módulos por finca** y **jerarquía de datos**.

---

## Plan Free vs Plan Pro

Son dos dimensiones distintas: **suscripción del usuario** (`free` | `pro`) y **módulos habilitados por finca** (ver siguiente sección). Ambas pueden bloquear una función.

### Plan **Free** (sin Pro activo ni trial válido)

- Acceso al **núcleo operativo**: **Finca**, **parcelas / lotes**, **catálogo de cultivos**, **ciclos de producción**, **tareas**, **flujos de trabajo**, **sanidad (Health)**, **operaciones con ganado** (si el módulo está activo), **almacén** (si el módulo está activo), **administración** y **finanzas** (si el módulo está activo).
- **No** debe asumirse acceso a las pantallas del menú **Compliance** que están detrás del **Plan Pro** (ver abajo).

### Plan **Pro** (suscripción activa o trial vigente)

- Desbloquea el **área Compliance** tal como está acotada en la app con **ProPlanGate**:
  - **Informes** (ruta de menú *Compliance → Reports* / `reports-complience/reports`).
  - **Bóveda de documentos** (*Document Vault* / `reports-complience/documents`).
  - **Certificaciones** (`reports-complience/certifications` y detalle de certificación).
- Además, esas entradas de menú exigen el **módulo `compliance`** en `true` (si está en `false`, el ítem ni siquiera aparece).

### Nota técnica para la IA (evitar contradicciones)

- Existe una ruta adicional **`…/dashboard/analytics/reports`** que puede mostrar la pantalla de informes **sin** pasar por el mismo gate que el ítem **Compliance → Informes**. Si el usuario describe solo “Informes” desde **Analytics**, no afirmar automáticamente que falta Pro; si habla del **menú Compliance** o de **bóveda / certificaciones**, sí aplicar la regla **Pro + módulo compliance**.

---

## Módulos por finca (feature flags)

Los flags viven en la finca (`farm.modules`, JSON) y controlan **visibilidad del menú** y **acceso a rutas** en la interfaz.

| Flag           | Efecto principal en la UI |
|----------------|---------------------------|
| **`crops`**    | Presente en el modelo; **no** se usa hoy para ocultar ítems del menú principal (cultivos y ciclos siguen siendo el núcleo por defecto). |
| **`cattle`**   | Si es **`false`**: se ocultan **Ganado**, **Pastoreo** y entradas asociadas. |
| **`logistics`**| Si es **`false`**: **no** hay acceso a **Insumos**, **Inventario de producción**, **Proveedores**, **trazabilidad** e información de producto ligada a almacén (rutas con `RequireFarmModule`). |
| **`compliance`**| Si es **`false`**: desaparece el bloque de menú **Compliance** (Informes, Bóveda, Certificaciones). |
| **`finance`**  | Si es **`false`**: se ocultan **resumen financiero**, **transacciones** y **clientes** del menú Admin. |

**Regla para el asistente:** si el usuario no ve un módulo o recibe bloqueo, responder en dos pasos: (1) **activar el módulo** en **Configuración de cuenta → Módulos** (o equivalente) para esa finca; (2) si la función es **Compliance (Informes / Bóveda / Certificaciones)**, además hace falta **Plan Pro**.

**Valores por defecto:** si `modules` no viene informado, se asume **todo habilitado** (`true`).

---

## Jerarquía de datos y dependencias

Orden conceptual de **entidades** y qué **requiere** qué. Los nombres en UI pueden ser *Field* / *Parcela*, *Plot* / *Lote*.

### 1. **Finca (`Farm`)**

- Raíz de casi todos los datos: usuarios vinculados, parcelas, cultivos del catálogo, tareas, insumos, transacciones, documentos, etc.

### 2. **Parcela / unidad de producción (`Field`)**

- Pertenece a una **Finca** (`farmId`).
- Agrupa **lotes** y concentra parte de la información operativa (riego a nivel campo, algunos registros de sanidad, etc.).

### 3. **Lote (`Plot`)**

- Pertenece a una **Field** (`fieldId` obligatorio).
- **No** hay lote sin parcela (field).

### 4. **Cultivo en catálogo (`Crop`)**

- Definición de variedad/cultivo a nivel **Finca**.
- **Ciclo de producción** siempre referencia un cultivo del catálogo.

### 5. **Ciclo de producción (`CropCycle`)**

- **Requiere** obligatoriamente:
  - **`cropId`** → cultivo del catálogo de la finca.
  - **`plotId`** → lote.
- **No hay ciclo sin cultivo ni sin lote.**

### 6. **Tarea (`Task`)**

- Siempre pertenece a una **Finca** (`farmId`).
- Puede vincularse a un **`CropCycle`** (`cropCycleId` opcional en modelo) o a un **`Workflow`**.
- **Regla orientada al usuario:** las tareas **ligadas al cultivo / operación de lote** deben entenderse en el contexto de un **ciclo** (y por tanto **lote + cultivo**). Las tareas genéricas o de flujo pueden existir a nivel finca sin ciclo; **no** afirmar que “toda tarea exige lote” en sentido absoluto, pero **sí** que **no hay ciclo sin lote/cultivo** y que **las tareas de producción por lote** se apoyan en el ciclo.

### 7. **Insumo (`Supply`)**

- Pertenece a la **Finca** (`farmId`).
- Puede asociarse a **proveedor**; el **stock** se mueve con **movimientos** (`SupplyStockMovement`), opcionalmente ligados a un **`CropCycle`**.
- **No** es obligatorio que un insumo “pertenezca” a un lote: la **ubicación lógica** es la finca; el **uso** en campo se refleja en registros (p. ej. pulverización) o movimientos vinculados a ciclo.

### Reglas cortas (memoria para RAG)

- **Lote** → siempre **Parcela (Field)** → siempre **Finca**.
- **Ciclo** → siempre **Lote + Cultivo (catálogo)**.
- **Pulverización / scouting / diagnóstico** (sanidad) → **Finca** + **Field** obligatorios; **Plot** suele ser relevante u opcional según registro.
- **Insumo** → **Finca**; uso en cultivo vía **productos en pulverización** o **movimientos de stock** (opcional **`cropCycleId`**).

---

## Mapa menú → función (palabras clave)

| Necesidad del usuario | Dónde está en la app (menú) |
|------------------------|-----------------------------|
| Ver / crear **parcelas y lotes** | **Home → Fields** |
| **Catálogo de cultivos** | **Home → Catalog** |
| **Ciclos de producción** | **Operations → Production** |
| **Tareas (tablero)** | **Operations → Task Management** |
| **Flujos / workflows** | **Operations → Workflows** |
| **Ganado / animales** | **Home → Cattle** (módulo **cattle**) |
| **Pastoreo** | **Operations → Grazing Management** (módulo **cattle**) |
| **Calendario de tratamientos** | **Health → Spray & Treatment Calendar** |
| **Pulverizaciones / aplicaciones** | **Health → Spray Records** |
| **Monitoreo de campo** | **Health → Scouting** |
| **Diagnósticos** | **Health → Diagnostics** |
| **Plagas (historial)** | **Health → Pest History** |
| **Insumos** | **Warehouse → Supplies** (módulo **logistics**) |
| **Stock de cosecha / producto terminado** | **Warehouse → Production Inventory** (módulo **logistics**) |
| **Proveedores** | **Warehouse → Suppliers** (módulo **logistics**) |
| **Finanzas / movimientos / clientes** | **Admin →** vistas financieras (módulo **finance**) |
| **Personal y profesionales** | **Admin → Personnel / Professionals** |
| **Informes / bóveda / certificaciones (cumplimiento)** | **Compliance →** … (**Pro** + módulo **compliance**) |

---

## Preguntas frecuentes técnicas

**¿Dónde cargo una pulverización?**  
En **Health → Spray Records** (Sanidad / registros de aplicación). A nivel datos exige **Finca** y **Parcela (Field)**; el **Lote** puede detallarse según el formulario.

**¿Por qué no veo el almacén ni los insumos?**  
Comprobar el módulo **`logistics`**. Si está en **`false`**, debe **activarse en la configuración de módulos** de la finca.

**¿Por qué no aparece Compliance?**  
El módulo **`compliance`** está en **`false`** o el usuario no tiene **Plan Pro** para las pantallas que lo requieren.

**¿Puedo crear un ciclo sin haber creado antes un lote?**  
**No.** El ciclo exige **`plotId`** (lote), y el lote exige una **parcela (field)**.

**¿Puedo tener un ciclo sin cultivo en el catálogo?**  
**No.** El ciclo exige **`cropId`**; el cultivo debe existir en el **catálogo de la finca**.

**¿Dónde están los informes para auditorías?**  
En el menú **Compliance → Reports**, con **Plan Pro** y módulo **compliance**. (Si el usuario entra por **Analytics → Reports**, puede ver otra ruta de informes según la implementación actual.)

**¿Dónde guardo PDFs y documentos de certificación?**  
**Compliance → Document Vault** (Bóveda), con **Pro** y módulo **compliance**.

**¿Dónde gestiono certificaciones (GlobalGAP, orgánico, etc.)?**  
**Compliance → Certifications**, con **Pro** y módulo **compliance**.

**¿Por qué no veo ganado ni pastoreo?**  
Módulo **`cattle`** en **`false`** → activar en configuración de módulos.

**¿Por qué no veo finanzas ni clientes?**  
Módulo **`finance`** en **`false`** → activar en configuración de módulos.

**¿Qué es un insumo y a qué está atado?**  
**Insumo (`Supply`)** es inventario a nivel **Finca**. Se usa en **pulverizaciones** (productos aplicados) y en **movimientos de stock**; opcionalmente se asocia el movimiento a un **ciclo**.

**¿Las tareas siempre son de un lote?**  
**No siempre** a nivel modelo: la tarea tiene **`farmId`** y opcionalmente **`cropCycleId`**. Para **tareas de producción por cultivo**, el contexto correcto es el **ciclo** (lote + cultivo).

---

## Resumen para el modelo

- **Pro** desbloquea **Compliance**: **Informes**, **Bóveda de documentos**, **Certificaciones** (con módulo **`compliance`**).
- **`cattle`**, **`logistics`**, **`finance`**, **`compliance`** ocultan o bloquean secciones si están en **`false`** → indicar **activación en configuración de la finca**.
- **Datos:** **Finca → Field → Plot → CropCycle (Crop + Plot)**; **Supply** a **Finca**; **sanidad** clave en **Health**; **pulverización** en **Spray Records**.
