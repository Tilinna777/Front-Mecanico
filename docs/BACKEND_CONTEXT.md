# 📘 CONTEXTO TOTAL DEL BACKEND - TALLER MECÁNICO

> **PARA:** Gemini 3 Pro (Frontend Developer) / Desarrolladores Frontend
> **OBJETIVO:** Documentación absoluta y exhaustiva para construir el frontend sin necesidad de revisar el código del backend.

---

## 1. 🌐 Configuración y Entorno

- **Base URL API**: `http://localhost:3000` (o variable de entorno `VITE_API_URL`)
- **Autenticación**:
  - Header: `Authorization: Bearer <token_jwt>`
  - El token se obtiene en `/auth/login`.
  - Expiración: 8 horas.
- **Formato Fechas**: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **Manejo de Errores**:
  ```json
  {
    "statusCode": 400,
    "message": ["rut must be a string", "password too short"], // Puede ser string o array
    "error": "Bad Request"
  }
  ```

---

## 2. 🗂️ Enums y Constantes

### `UserRole` (Roles de Usuario)
- `ADMIN`: Acceso total (Usuarios, Compras, Reportes Financieros).
- `WORKER`: Acceso limitado (Órdenes de Trabajo, Clientes, Vehículos, Ventas Mostrador).

### `MovementType` (Ventas de Mostrador)
- `VENTA`: Cliente compra producto (Suma a caja).
- `PERDIDA`: Producto roto/robado (No suma a caja, solo costo).
- `USO_INTERNO`: Gasto del taller (No suma a caja).

---

## 3. 📝 DTOs (Estructuras de Datos para Formularios)

Aquí están los JSON exactos que debes enviar en los `POST` y `PATCH`.

### A. Autenticación (`POST /auth/login`)
```json
{
  "rut": "11.111.111-1", // Acepta puntos y guion, el backend limpia
  "password": "mypassword"
}
```

### B. Crear Orden de Trabajo (`POST /work-orders`)
**Lógica Mágica**:
1. Si envías `cliente` con un RUT que ya existe -> Actualiza sus datos.
2. Si envías `vehiculo` con Patente que ya existe -> Actualiza kilometraje.
3. Si `items` tienen `product_sku` -> Descuenta stock automáticamente.

```json
{
  "numero_orden_papel": 1547, // Obligatorio, único del talonario
  "realizado_por": "Pedro Mecánico",
  "revisado_por": "Juan Supervisor", // Opcional
  "cliente": { // Objeto anidado
    "nombre": "Juan Pérez",
    "rut": "12.345.678-9",
    "email": "juan@gmail.com", // Opcional
    "telefono": "+56912345678" // Opcional
  },
  "vehiculo": { // Objeto anidado
    "patente": "ABCD12", // Se convierte a mayúsculas auto
    "marca": "Toyota",
    "modelo": "Yaris",
    "kilometraje": 85000 // Opcional
  },
  "items": [
    {
      "servicio_nombre": "Cambio Pastillas", // Texto libre o de catálogo
      "descripcion": "Pastillas cerámicas", // Opcional
      "precio": 45000, // Precio FINAL cobrado al cliente
      "product_sku": "F-001", // Opcional (si gasta repuesto)
      "cantidad_producto": 1 // Opcional (default 1)
    }
  ]
}
```

### C. Registrar Compra (`POST /purchases`)
**Nota**: Solo ADMIN.
**Tipo Documento**: `FACTURA` (calcula IVA 19% automático) o `INFORMAL` (sin IVA).

```json
{
  "proveedor_nombre": "Repuestos Sur", // Si existe lo usa, si no lo crea (o error si prefieres select)
  "numero_documento": "F-998877", // N° Factura
  "tipo_documento": "FACTURA", // "FACTURA" | "INFORMAL"
  "items": [
    {
      "sku": "F-001", // Si existe suma stock, si no CREA producto nuevo
      "nombre": "Pastilla Frenos",
      "marca": "Bosch", // Opcional
      "calidad": "Cerámica", // Opcional
      "cantidad": 10,
      "precio_costo": 15000, // Costo unitario neto
      "precio_venta_sugerido": 28000, // Para actualizar precio venta
      "modelos_compatibles_ids": ["uuid-1", "uuid-2"] // Opcional
    }
  ]
}
```

### D. Venta Mostrador / Pérdida (`POST /counter-sales`)
Para salidas de inventario que NO son órdenes de taller.

```json
{
  "tipo_movimiento": "VENTA", // "VENTA" | "PERDIDA" | "USO_INTERNO"
  "comprador": "Cliente de paso", // Opcional (Solo para VENTA)
  "comentario": "Compró líquido de frenos para llevar", // Opcional
  "items": [
    {
      "sku": "LF-001",
      "cantidad": 2,
      "precio_venta": 8000 // Obligatorio si es VENTA (precio unitario)
    }
  ]
}
```

### E. Gestión Usuarios, Productos, etc.

**Crear Usuario (`POST /auth/register` - Solo Admin)**
```json
{
  "rut": "99.999.999-9",
  "nombre": "Nuevo Mecánico",
  "password": "clave",
  "role": "WORKER"
}
```

**Crear Proveedor (`POST /providers`)**
```json
{
  "nombre": "Frenos Chile",
  "rut": "76.123.456-7", // Opcional
  "telefono": "+569...", // Opcional
  "email": "contacto@..." // Opcional
}
```

---

## 4. 🧩 Modelos de Datos (Entidades Completas)

### `User`
- `id`, `rut` (unique), `nombre`, `password`, `role` (`ADMIN`/`WORKER`), `isActive`.

### `Product`
- `id`, `sku` (código único), `nombre`, `marca`, `calidad`.
- `precio_venta` (int).
- `stock_actual` (int).
- `stock_minimo` (int).
- `categoria` (Relación objeto Category).
- `modelosCompatibles` (Array de objetos VehicleModel).

### `VehicleModel` (Catálogo, no autos clientes)
- `id`, `marca` (Toyota), `modelo` (Yaris), `anio` (2018), `motor`.

### `Provider`
- `id`, `nombre` (unique).
- `rut` (Opcional, N° Documento).
- `telefono`, `email` (Opcionales).

### `Client`
- `id`, `nombre`.
- `rut` (unique, nullable), `email` (unique, nullable), `telefono`, `direccion`.

### `Vehicle` (Auto Cliente)
- `id`, `patente` (unique).
- `marca`, `modelo`, `anio`, `kilometraje` (último registrado).

### `WorkOrder`
- `id`, `numero_orden_papel` (unique).
- `estado` (Siempre "FINALIZADA" por ahora).
- `total_cobrado`.
- `fecha_ingreso` (Date).
- `cliente` (Objeto Client).
- `items` (Array WorkOrderDetail).
- `patente_vehiculo`, `kilometraje` (Snapshot).
- `realizado_por`, `revisado_por`.

---

## 5. 🛣️ Rutas y Vistas del Frontend (Guía Paso a Paso)

### 1. Login (`/login`)
- **API**: `POST /auth/login`.
- **Acción**: Guardar JWT en LocalStorage. Redirigir a `/`.

### 2. Dashboard (`/`)
- **API Caja**: `GET /reports/daily-cash` -> Muestra Tarjetas con "Total Taller", "Total Mesón", "Total Día".
- **API Alertas**: `GET /reports/low-stock` -> Si array > 0, mostrar alerta roja "X productos bajos de stock".
- **Buscador Universal**: Input en el header que llama a `GET /reports/search?q=...`. Muestra resultados dropdown de Clientes, Autos y Órdenes.

### 3. Crear Orden (`/ordenes/nueva`)
- **Formulario**:
  - **Paso 1: Cliente/Auto**:
    - Buscador de Cliente (`GET /reports/search` o `GET /clients`). Si no está, inputs manuales (Nombre, Rut, Tel).
    - Buscador de Vehículo (`GET /vehicles/:patente` o similar). Si no está, inputs manuales (Patente, Marca, Modelo).
  - **Paso 2: Items**:
    - Botón "Agregar Servicio".
    - Input "Nombre Servicio": Usar datalist con `GET /work-orders/services-catalog` (retorna array `["Cambio Pastillas", ...]`).
    - Checkbox "¿Usó Repuesto?".
      - Si sí: Select/Buscador de productos (`GET /products` filtrando por nombre/sku).
      - Al seleccionar producto, llenar precio sugerido y cantidad stock warning.
  - **Paso 3: Totales**:
    - Mostrar suma total en vivo.
    - Input "N° Orden Papel" (Validar que no esté vacío).
    - Input "Mecánico".
- **Botón Guardar**: Envía JSON al `POST /work-orders`.

### 4. Inventario (`/inventario`)
- **Tabla**: Data de `GET /products`.
- **Columnas**: SKU, Nombre, Marca, Precio Venta, Stock (Poner en rojo si < min).
- **Acciones**: Editar (`PATCH`), Eliminar (`DELETE`).
- **Botón Nuevo**: `POST /products` (Aunque idealmente se crean vía Compras, se puede crear manual).

### 5. Compras / Ingresos (`/compras`) - Solo Admin
- **Vista**: Tabla historial `GET /purchases`.
- **Botón Nueva Compra**:
  - Formulario Proveedor (Select `GET /providers` + opción "Crear Nuevo").
  - Formulario Items (Array dinámico).
  - Al guardar -> `POST /purchases`.

### 6. Ventas Rápidas (`/ventas-meson`)
- **Tabs**: "Venta", "Pérdida", "Uso Interno".
- **Formulario**:
  - Buscador Productos (Select SKU).
  - Cantidad.
  - Precio (Solo si es Venta).
- **Historial**: Tabla `GET /counter-sales`.

### 7. Mantenedores (Config)
- **Usuarios**: `GET /users`, `POST /auth/register`.
- **Categorías**: `GET /categories`.
- **Modelos Autos**: `GET /vehicle-models`.

---

## 6. 🚀 Tips para el Frontend (Gemini 3 Pro)

1.  **React Hook Form + Zod**: Usa estas librerías. Los DTOs de arriba son básicamente tus schemas de Zod.
2.  **Autocompletado Mágico**: En la orden de trabajo, la gracia del backend es que es "idempotente" con clientes y vehículos.
    - No necesitas crear el cliente primero en un endpoint separado.
    - Simplemente manda el objeto `cliente: { nombre, rut }` DENTRO del `POST /work-orders` y el backend se encarga de buscarlo o crearlo. ¡Aprovéchalo para simplificar la UI!
3.  **Buscador Global**: Implementa la barra de búsqueda en el Navbar (`GET /reports/search?q=XYZ`). Es la función más útil para el usuario final (buscar "Juan" y ver sus autos y órdenes al tiro).
4.  **Impresión**: El backend no genera PDFs aún. La impresión de la orden se hace en el frontend (diseño CSS print) usando los datos de la respuesta de la orden.
