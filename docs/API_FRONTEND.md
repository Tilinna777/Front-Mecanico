# 📚 Guía de API para Frontend - Sistema Taller Mecánico

> **Última actualización:** Enero 2026  
> **Estado del Backend:** ✅ 100% Completo y funcional  
> **Swagger UI:** `http://[TU-IP]:3000/docs`

---

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Autenticación](#autenticación)
3. [Endpoints por Módulo](#endpoints-por-módulo)
4. [Flujos de Trabajo Principales](#flujos-de-trabajo-principales)
5. [Manejo de Errores](#manejo-de-errores)
6. [Tipos de Datos y Enums](#tipos-de-datos-y-enums)

---

## ⚙️ Configuración Inicial

### Base URL
```
Producción: http://[IP-SERVIDOR]:3000/api
Desarrollo: http://localhost:3000/api
```

### Headers Requeridos
```javascript
// Todas las peticiones
{
  'Content-Type': 'application/json'
}

// Peticiones autenticadas (agregar después de login)
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer [ACCESS_TOKEN]'
}
```

### Usuarios de Prueba
| Rol | RUT | Contraseña |
|-----|-----|------------|
| ADMIN | 11.111.111-1 | admin123 |
| WORKER | 99.999.999-9 | taller123 |

---

## 🔐 Autenticación

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "rut": "11.111.111-1",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "rut": "111111111",
    "nombre": "Administradora",
    "role": "ADMIN"
  }
}
```

**⚠️ Importante:** 
- El token expira en 8 horas
- Guardar en localStorage/sessionStorage
- Incluir en header `Authorization: Bearer [token]`
- El RUT se normaliza automáticamente (acepta con o sin puntos/guiones)

### Registrar Usuario (Solo ADMIN)
```http
POST /auth/register
Authorization: Bearer [token]
```

**Request Body:**
```json
{
  "rut": "12.345.678-9",
  "nombre": "Juan Pérez",
  "password": "clave123",
  "role": "WORKER"
}
```

---

## 📦 Endpoints por Módulo

### 🏷️ Categorías

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/categories` | Listar todas | No |
| GET | `/categories/:id` | Obtener una | No |
| POST | `/categories` | Crear | No |
| PATCH | `/categories/:id` | Actualizar | No |
| DELETE | `/categories/:id` | Eliminar | No |

**Crear Categoría:**
```json
{
  "nombre": "Frenos",
  "descripcion": "Pastillas, discos, líquido de frenos"
}
```

---

### 📦 Productos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/products` | Listar todos | No |
| GET | `/products/:id` | Obtener uno (incluye modelos compatibles) | No |
| POST | `/products` | Crear | No |
| PATCH | `/products/:id` | Actualizar | No |
| DELETE | `/products/:id` | Eliminar | No |

**Crear Producto:**
```json
{
  "sku": "F-001",
  "nombre": "Pastilla de Freno Delantera",
  "marca": "Bosch",
  "calidad": "Cerámica",
  "precio_venta": 28000,
  "stock_actual": 10,
  "stock_minimo": 5,
  "categoria_id": "uuid-categoria",
  "modelos_compatibles_ids": ["uuid-modelo-1", "uuid-modelo-2"]
}
```

**Respuesta GET /products/:id:**
```json
{
  "id": "uuid",
  "sku": "F-001",
  "nombre": "Pastilla de Freno Delantera",
  "marca": "Bosch",
  "calidad": "Cerámica",
  "precio_venta": 28000,
  "stock_actual": 8,
  "stock_minimo": 5,
  "categoria": { "id": "uuid", "nombre": "Frenos" },
  "modelosCompatibles": [
    { "id": "uuid", "marca": "Toyota", "modelo": "Corolla", "anio": 2020 }
  ]
}
```

---

### 🚗 Modelos de Vehículos (Compatibilidad de Productos)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/vehicle-models` | Listar todos | JWT |
| GET | `/vehicle-models/:id` | Obtener uno | JWT |
| GET | `/vehicle-models/search?q=` | Buscar (autocompletado) | JWT |
| GET | `/vehicle-models/marcas` | Listar marcas únicas | JWT |
| GET | `/vehicle-models/marcas/:marca/modelos` | Modelos de una marca | JWT |
| POST | `/vehicle-models` | Crear (ADMIN) | JWT |
| PATCH | `/vehicle-models/:id` | Actualizar (ADMIN) | JWT |
| DELETE | `/vehicle-models/:id` | Eliminar (ADMIN) | JWT |

**Crear Modelo:**
```json
{
  "marca": "Toyota",
  "modelo": "Corolla",
  "anio": 2020
}
```

**Uso típico en frontend (selector cascada):**
```javascript
// 1. Obtener marcas para primer select
const marcas = await fetch('/vehicle-models/marcas');
// ["Toyota", "Honda", "Chevrolet"]

// 2. Al seleccionar marca, obtener modelos
const modelos = await fetch('/vehicle-models/marcas/Toyota/modelos');
// ["Corolla", "Yaris", "Hilux"]

// 3. Para autocompletado general
const resultados = await fetch('/vehicle-models/search?q=cor');
// [{ id: "uuid", marca: "Toyota", modelo: "Corolla", anio: 2020 }]
```

---

### 🚙 Vehículos de Clientes

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/vehicles` | Listar todos | No |
| GET | `/vehicles/:id` | Obtener uno | No |
| POST | `/vehicles` | Crear | No |
| PATCH | `/vehicles/:id` | Actualizar | No |
| DELETE | `/vehicles/:id` | Eliminar | No |

**Crear Vehículo (con patente - cliente real):**
```json
{
  "patente": "ABCD12",
  "marca": "Toyota",
  "modelo": "Corolla",
  "anio": 2020,
  "color": "Blanco",
  "cliente_id": "uuid-cliente"
}
```

**⚠️ Diferencia VehicleModel vs Vehicle:**
- **VehicleModel:** Marca/Modelo/Año genérico para compatibilidad de productos (sin patente)
- **Vehicle:** Vehículo real de un cliente con patente y kilometraje

---

### 👥 Clientes

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/clients` | Listar todos | JWT |
| POST | `/clients` | Crear | JWT |

**Crear Cliente:**
```json
{
  "rut": "12.345.678-9",
  "nombre": "Juan Pérez",
  "telefono": "+56912345678",
  "email": "juan@email.com",
  "direccion": "Av. Principal 123"
}
```

---

### 🏢 Proveedores (Solo ADMIN)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/providers` | Listar todos | JWT + ADMIN |
| GET | `/providers/:id` | Obtener uno | JWT + ADMIN |
| POST | `/providers` | Crear | JWT + ADMIN |
| PATCH | `/providers/:id` | Actualizar | JWT + ADMIN |
| DELETE | `/providers/:id` | Eliminar | JWT + ADMIN |

**Crear Proveedor:**
```json
{
  "nombre": "Distribuidora Frenos SpA",
  "rut": "76.123.456-7",
  "direccion": "Av. Industrial 456",
  "telefono": "+56222334455",
  "email": "ventas@distribuidora.cl"
}
```

---

### 🛒 Compras a Proveedores (Solo ADMIN)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/purchases` | Listar todas | JWT + ADMIN |
| POST | `/purchases` | Crear compra | JWT + ADMIN |
| DELETE | `/purchases/:id` | Eliminar (revierte stock) | JWT + ADMIN |

**Crear Compra:**
```json
{
  "proveedor_id": "uuid-proveedor",
  "numero_factura": "FAC-2026-001",
  "items": [
    {
      "sku": "F-001",
      "nombre": "Pastilla de Freno Bosch",
      "cantidad": 20,
      "precio_unitario": 15000,
      "modelos_compatibles_ids": ["uuid-modelo-1", "uuid-modelo-2"]
    }
  ]
}
```

**Lógica automática:**
- ✅ Si el SKU existe: suma stock al producto existente
- ✅ Si el SKU no existe: crea producto nuevo con los datos proporcionados
- ✅ Actualiza modelos compatibles del producto

---

### 📋 Órdenes de Trabajo

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/work-orders` | Listar todas | JWT |
| GET | `/work-orders/services-catalog` | Catálogo de servicios | JWT |
| POST | `/work-orders` | Crear orden | JWT |

**Obtener catálogo de servicios:**
```http
GET /work-orders/services-catalog
```
```json
[
  "Cambio Pastillas",
  "Cambio Discos",
  "Rectificado",
  "Cambio Líquido Frenos",
  "Revisión Sistema Completo",
  "Cambio Zapatas Traseras",
  "Purga Sistema Frenos",
  "Revisión ABS",
  "Otros"
]
```

**Crear Orden de Trabajo:**
```json
{
  "numero_orden_papel": 1547,
  "cliente_rut": "12.345.678-9",
  "cliente_nombre": "Juan Pérez",
  "cliente_telefono": "+56912345678",
  "vehiculo_patente": "ABCD12",
  "vehiculo_marca": "Toyota",
  "vehiculo_modelo": "Corolla",
  "vehiculo_anio": 2020,
  "vehiculo_km": 85000,
  "items": [
    {
      "servicio_nombre": "Cambio Pastillas",
      "descripcion": "Cambio pastillas delanteras Bosch",
      "precio": 45000,
      "product_sku": "F-001",
      "product_cantidad": 1
    },
    {
      "servicio_nombre": "Revisión Sistema Completo",
      "descripcion": "Revisión frenos y suspensión",
      "precio": 25000
    }
  ]
}
```

**Respuesta 201:**
```json
{
  "message": "Orden de trabajo creada exitosamente",
  "id": "uuid",
  "numero_orden_papel": 1547,
  "total_cobrado": 70000,
  "cliente": "Juan Pérez",
  "vehiculo": "ABCD12",
  "items_procesados": 2
}
```

**Lógica automática:**
- ✅ Si cliente (RUT) existe: reutiliza y actualiza datos
- ✅ Si cliente no existe: crea nuevo cliente
- ✅ Si vehículo (patente) existe: reutiliza y actualiza km
- ✅ Si vehículo no existe: crea nuevo vehículo
- ✅ Si item tiene `product_sku`: descuenta stock automáticamente

---

### 💰 Ventas de Mostrador / Movimientos de Inventario

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/counter-sales` | Listar todos | JWT |
| GET | `/counter-sales?tipo=VENTA` | Filtrar por tipo | JWT |
| POST | `/counter-sales` | Crear movimiento | JWT |

**Tipos de Movimiento:**
- `VENTA` - Cliente compra producto sin instalación
- `PERDIDA` - Producto dañado, vencido o robado
- `USO_INTERNO` - Consumo del taller

**Crear Venta Mostrador:**
```json
{
  "tipo_movimiento": "VENTA",
  "comprador": "Juan Pérez (walk-in)",
  "comentario": "Cliente compró sin instalación",
  "items": [
    { "sku": "F-001", "cantidad": 2, "precio_venta": 28000 }
  ]
}
```

**Registrar Pérdida:**
```json
{
  "tipo_movimiento": "PERDIDA",
  "comentario": "Producto dañado en almacenamiento",
  "items": [
    { "sku": "F-002", "cantidad": 1 }
  ]
}
```

---

### 📊 Reportes

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/reports/low-stock` | Productos con stock bajo | JWT |
| GET | `/reports/daily-cash` | Caja diaria | JWT |
| GET | `/reports/daily-cash?fecha=2026-01-24` | Caja fecha específica | JWT |
| GET | `/reports/search?q=` | Búsqueda global | JWT |

**Stock Bajo:**
```http
GET /reports/low-stock
```
```json
{
  "total_alertas": 2,
  "fecha_consulta": "2026-01-24T10:30:00.000Z",
  "productos": [
    {
      "id": "uuid",
      "sku": "F-002",
      "nombre": "Disco Ventilado",
      "marca": "Brembo",
      "stock_actual": 2,
      "stock_minimo": 5,
      "diferencia": 3,
      "categoria": "Frenos",
      "precio_venta": 45000
    }
  ]
}
```

**Caja Diaria:**
```http
GET /reports/daily-cash?fecha=2026-01-24
```
```json
{
  "fecha": "2026-01-24",
  "total_taller": 350000,
  "cantidad_ordenes": 5,
  "total_meson": 85000,
  "cantidad_ventas_meson": 3,
  "total_final": 435000
}
```

**Búsqueda Global:**
```http
GET /reports/search?q=Juan
```
```json
{
  "busqueda": "Juan",
  "total_resultados": 5,
  "clientes": [
    { "id": "uuid", "nombre": "Juan Pérez", "rut": "12345678-9" }
  ],
  "vehiculos": [],
  "ordenes_recientes": [
    { "id": "uuid", "numero_orden_papel": 1234, "total_cobrado": 85000 }
  ]
}
```

---

### 👤 Usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/users` | Listar usuarios (ADMIN) | JWT + ADMIN |
| PATCH | `/users/change-password` | Cambiar contraseña propia | JWT |
| DELETE | `/users/:id` | Desactivar usuario (ADMIN) | JWT + ADMIN |

**Cambiar Contraseña:**
```json
{
  "currentPassword": "clave_actual",
  "newPassword": "nueva_clave_123"
}
```

---

## 🔄 Flujos de Trabajo Principales

### 1. Flujo: Nueva Orden de Trabajo (más común)

```
1. GET /work-orders/services-catalog → Poblar checkboxes/select
2. GET /products → Mostrar productos para seleccionar
3. POST /work-orders → Crear orden con cliente, vehículo e items
   (El backend crea/actualiza cliente y vehículo automáticamente)
```

### 2. Flujo: Registrar Compra a Proveedor

```
1. GET /providers → Listar proveedores para select
2. GET /vehicle-models → Obtener modelos para compatibilidad
3. POST /purchases → Registrar compra
   (Stock se actualiza automáticamente)
```

### 3. Flujo: Consultar Historial de Cliente

```
1. GET /reports/search?q=patente_o_nombre → Buscar
2. Los resultados incluyen cliente, vehículos y órdenes relacionadas
```

### 4. Flujo: Control de Inventario Diario

```
1. GET /reports/low-stock → Ver alertas de recompra
2. GET /reports/daily-cash → Ver cierre de caja
```

---

## ❌ Manejo de Errores

### Códigos HTTP Comunes

| Código | Significado | Acción Frontend |
|--------|-------------|-----------------|
| 200 | Éxito | Procesar respuesta |
| 201 | Creado | Mostrar confirmación |
| 400 | Datos inválidos | Mostrar mensaje al usuario |
| 401 | No autenticado | Redirigir a login |
| 403 | Sin permisos | Mostrar acceso denegado |
| 404 | No encontrado | Mostrar mensaje "no existe" |
| 409 | Conflicto (duplicado) | Mostrar "ya existe" |

### Estructura de Error
```json
{
  "statusCode": 400,
  "message": "Stock insuficiente para Disco Ventilado. Disponible: 2, Solicitado: 5",
  "error": "Bad Request"
}
```

### Interceptor Recomendado (Axios)
```javascript
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 📐 Tipos de Datos y Enums

### Roles de Usuario
```typescript
enum UserRole {
  ADMIN = 'ADMIN',   // Acceso total
  WORKER = 'WORKER'  // Operaciones básicas
}
```

### Tipos de Movimiento (Counter Sales)
```typescript
enum MovementType {
  VENTA = 'VENTA',           // Suma a caja
  PERDIDA = 'PERDIDA',       // No suma a caja
  USO_INTERNO = 'USO_INTERNO' // No suma a caja
}
```

### Formato de IDs
- Todos los IDs son **UUID v4**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Formato de Fechas
- ISO 8601: `2026-01-24T10:30:00.000Z`
- Para queries de reportes: `YYYY-MM-DD` (ej: `2026-01-24`)

---

## ✅ Checklist de Implementación Frontend

- [ ] Login y manejo de token JWT
- [ ] Interceptor para errores 401 (redirigir a login)
- [ ] CRUD de Categorías
- [ ] CRUD de Productos con selector de modelos compatibles
- [ ] CRUD de Proveedores (solo admin)
- [ ] Registro de Compras (solo admin)
- [ ] Formulario de Orden de Trabajo
- [ ] Ventas de Mostrador
- [ ] Dashboard con reportes (stock bajo, caja diaria)
- [ ] Buscador global
- [ ] Gestión de usuarios (solo admin)

---

## 🚀 Endpoints Resumen Rápido

```
AUTH
├── POST   /auth/login
└── POST   /auth/register (ADMIN)

CATEGORÍAS
├── GET    /categories
├── GET    /categories/:id
├── POST   /categories
├── PATCH  /categories/:id
└── DELETE /categories/:id

PRODUCTOS
├── GET    /products
├── GET    /products/:id
├── POST   /products
├── PATCH  /products/:id
└── DELETE /products/:id

MODELOS DE VEHÍCULOS
├── GET    /vehicle-models
├── GET    /vehicle-models/:id
├── GET    /vehicle-models/search?q=
├── GET    /vehicle-models/marcas
├── GET    /vehicle-models/marcas/:marca/modelos
├── POST   /vehicle-models (ADMIN)
├── PATCH  /vehicle-models/:id (ADMIN)
└── DELETE /vehicle-models/:id (ADMIN)

VEHÍCULOS (de clientes)
├── GET    /vehicles
├── GET    /vehicles/:id
├── POST   /vehicles
├── PATCH  /vehicles/:id
└── DELETE /vehicles/:id

CLIENTES
├── GET    /clients
└── POST   /clients

PROVEEDORES (ADMIN)
├── GET    /providers
├── GET    /providers/:id
├── POST   /providers
├── PATCH  /providers/:id
└── DELETE /providers/:id

COMPRAS (ADMIN)
├── GET    /purchases
├── POST   /purchases
└── DELETE /purchases/:id

ÓRDENES DE TRABAJO
├── GET    /work-orders
├── GET    /work-orders/services-catalog
└── POST   /work-orders

VENTAS MOSTRADOR
├── GET    /counter-sales
├── GET    /counter-sales?tipo=VENTA
└── POST   /counter-sales

REPORTES
├── GET    /reports/low-stock
├── GET    /reports/daily-cash
├── GET    /reports/daily-cash?fecha=YYYY-MM-DD
└── GET    /reports/search?q=

USUARIOS
├── GET    /users (ADMIN)
├── PATCH  /users/change-password
└── DELETE /users/:id (ADMIN)
```

---

> 💡 **Tip:** Prueba todos los endpoints en Swagger UI: `http://[IP]:3000/docs`  
> Primero hace login y luego usa el botón "Authorize" para probar endpoints protegidos.
