# API de Control de Inventario

## Descripción

Esta API está diseñada para gestionar el control de inventario de productos, manejando la autenticación de usuarios, el registro de productos y los movimientos de stock. Está construida para trabajar con MongoDB como base de datos e integrarse con una aplicación frontend hecha en Angular.

## Funcionalidades

- Gestión de Usuarios
  - Usuarios regulares
  - Usuarios administradores
  - Autenticación y autorización
- Gestión de Productos
  - Registro de productos
  - Seguimiento de inventario
  - Gestión de categorías
- Movimientos de Stock
  - Productos entrantes
  - Productos salientes
  - Seguimiento de productos perdidos/extraviados
- Sistema de Reportes
  - Niveles de stock
  - Historial de movimientos
  - Configuración de alertas

## Tecnologías

- Node.js
- Express.js
- MongoDB
- Autenticación con JWT
- Arquitectura REST API

## Requisitos Previos

- Node.js instalado
- MongoDB instalado y en ejecución
- Gestor de paquetes npm o yarn

## Instalación

```bash
npm install
npm run dev
```

## Endpoints de la API

### Autenticación

- POST /api/auth/register
- POST /api/auth/login

### Productos

- GET /api/products
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id

### Inventario

- POST /api/stock/in
- POST /api/stock/out
- POST /api/stock/missing
- GET /api/stock/history

### Usuarios

- GET /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

## Variables de Entorno

PORT=3000
MONGODB_URI=mongodb://localhost/stockapp
JWT_SECRET=tu_clave_jwt

## Integración con Frontend

Esta API está diseñada para trabajar con una aplicación frontend en Angular. Consulta el repositorio del frontend para más detalles.

## Licencia

MIT
