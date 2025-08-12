# 🌮 La Cazuela Chapina - Frontend Web Application

Aplicación web de comercio electrónico y panel administrativo para La Cazuela Chapina, construida con React 19, TypeScript, Redux Toolkit y Tailwind CSS.

## 🚀 Características Principales

### 🛍️ **Tienda E-commerce (Store)**

- **Navegación libre**: Los productos son visibles sin necesidad de iniciar sesión
- **Autenticación requerida**: Solo para agregar productos al carrito
- **Catálogo de productos**: Tamales, bebidas y combos dinámicos desde API
- **Productos personalizables**: Creación de tamales y bebidas customizadas
- **Carrito persistente**: Se mantiene entre sesiones por usuario
- **Sistema de pagos**: Simulación de pagos con tarjeta de crédito
- **Historial de órdenes**: Visualización de pedidos anteriores
- **Chat con IA**: Asistente virtual con texto y voz

### 🎛️ **Panel Administrativo (Dashboard)**

- **Acceso restringido**: Solo usuarios con rol "Admin"
- **Autenticación obligatoria**: No permite registro por seguridad
- **Gestión completa**: Control de productos, órdenes, inventario, usuarios y proveedores

### 🔒 **Autenticación y Seguridad**

- **JWT con Refresh Tokens**: Renovación automática de sesiones
- **Roles de usuario**: Customer (cliente) y Admin (administrador)
- **Persistencia de sesión**: Mantiene la sesión entre recargas
- **Almacenamiento seguro**: Encriptación AES-GCM para datos sensibles
- **Validaciones robustas**: Formularios con validación en tiempo real

### 🤖 **Chat Inteligente**

- **Streaming de respuestas**: Integración con endpoint `/ai/stream`
- **Autenticación requerida**: Token JWT en headers
- **Persistencia de sesión**: Historial por `sessionID` en localStorage
- **Chat de voz**: WebSocket para comunicación en tiempo real
- **Grabación de audio**: MediaRecorder API para captura de voz

### 🛒 **Productos Customizables**

#### **Tamales Personalizados**

- **Masa**: Amarillo, Blanco, Arroz
- **Relleno**: Recado Rojo de Cerdo, Negro de Pollo, Chipilín Vegetariano, Chuchito
- **Envoltura**: Hoja de Plátano, Tusa de Maíz
- **Picante**: Sin Chile, Suave, Chapín
- **Cantidad**: 1, 6, 12 unidades
- **Precios automáticos**: Pollo $6, Cerdo/Res $12, Otros $8

#### **Bebidas Personalizadas**

- **Tipos**: Atole, Café, Chocolate, Té
- **Endulzante**: Azúcar, Panela, Miel, Stevia
- **Topping**: Canela, Chocolate, Crema, Frutas
- **Tamaño**: 12oz (vaso), 1L (jarro)

### 💳 **Sistema de Pagos**

- **Validaciones avanzadas**: Número de tarjeta, CVV, fecha de expiración
- **Formato automático**: Espaciado de números de tarjeta
- **Validación de campos**: Solo números para CVV, solo letras para nombres
- **Verificación de fecha**: Previene usar tarjetas vencidas
- **Direcciones de facturación**: Validación de datos completos

### 📱 **Características Técnicas**

#### **Arquitectura**

- **React 19**: Latest version con Hooks avanzados
- **TypeScript**: Tipado estático completo
- **Redux Toolkit**: Estado global unificado
- **Tailwind CSS**: Diseño utility-first responsivo

#### **Optimizaciones de Rendimiento**

- **Debouncing**: Para operaciones de localStorage
- **Memoización**: Optimización de operaciones costosas
- **Lazy Loading**: Carga diferida de componentes
- **Caché inteligente**: Sistema de caché local para productos customizables

#### **APIs Integradas**

- **Productos**: `/product` (acceso público)
- **Productos customizados**: `/product/tamal`, `/product/beverage`
- **Órdenes**: `/order/create`, gestión de pedidos
- **Autenticación**: `/user/login`, `/user/register`, `/user/refresh`
- **IA**: `/ai/stream` (streaming de respuestas)
- **Chat de voz**: `/voice/ws/voicechat` (WebSocket)

## 🛠️ **Instalación y Configuración**

### **Prerrequisitos**

- Node.js 18+
- npm o yarn
- Backend API ejecutándose

### **Instalación**

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar en modo desarrollo
npm run dev

# Compilar para producción
npm run build
```

### **Variables de Entorno**

```env
# Modo de aplicación (store o dashboard)
VITE_APP_MODE=store

# URL del backend API
VITE_API_BASE_URL=http://localhost:5000/api/v1

# Configuración de encriptación
VITE_ENCRYPTION_KEY=your-encryption-key
```

## 🗂️ **Estructura del Proyecto**

```
src/
├── global/               # Estado global compartido
│   ├── authSlice.ts      # Redux slice para autenticación
│   └── index.ts          # Store y hooks compartidos
├── types/                # Interfaces TypeScript
│   ├── auth.ts           # Tipos de autenticación
│   └── chat.ts           # Tipos de chat
├── store/                # Aplicación e-commerce
│   ├── api/              # Servicios de API
│   ├── components/       # Componentes de la tienda
│   ├── hooks/            # Hooks customizados
│   ├── types/            # Tipos específicos de store
│   ├── utils/            # Utilidades y helpers
│   └── App.tsx           # Componente principal de la tienda
├── dashboard/            # Panel administrativo
│   ├── components/       # Componentes del dashboard
│   ├── services/         # Servicios del dashboard
│   ├── types/            # Tipos del dashboard
│   └── App.tsx           # Componente principal del dashboard
├── hooks/                # Hooks globales
├── utils/                # Utilidades globales
└── main.tsx              # Punto de entrada
```

## 🔧 **Servicios y APIs**

### **ApiService**

Servicio centralizado para todas las peticiones HTTP con:

- Manejo automático de refresh tokens
- Interceptores de respuesta
- Manejo de errores globalizado
- Headers de autenticación automáticos

### **CustomProductCache**

Sistema de caché local para productos personalizables:

- Almacenamiento en localStorage
- Expiración automática (30 días)
- Límite de tamaño (1000 productos)
- Resolución de nombres para órdenes

### **Hooks Customizados**

- `useAIChat`: Gestión completa del chat con IA
- `useOptimizedStorage`: Almacenamiento optimizado y seguro
- `useCartStorage`: Carrito persistente por usuario
- `useSessionStorage`: Manejo de sesiones de chat

## 🎨 **UI/UX**

### **Diseño Minimalista**

- **Colores principales**: Verde y marrón (colores de tamales)
- **Tipografía**: Lato font family
- **Iconos**: Emojis nativos para mejor rendimiento
- **Responsivo**: Mobile-first design

### **Componentes Reutilizables**

- **Modales**: Sistema unificado de overlays
- **Formularios**: Validación y formato automático
- **Botones**: Estados de loading y disabled
- **Alertas**: Toast notifications con react-hot-toast

## 🔐 **Seguridad Implementada**

### **Autenticación**

- JWT tokens con expiración
- Refresh tokens para renovación automática
- Headers seguros en todas las peticiones
- Logout automático en caso de tokens inválidos

### **Almacenamiento Seguro**

- Encriptación AES-GCM para datos sensibles
- Hashing SHA-256 para IDs
- Limpieza automática de datos expirados
- Validación de integridad de datos

### **Validaciones**

- Sanitización de inputs
- Validación de tipos de datos
- Prevención de XSS
- Límites de tamaño de datos


```typescript
// Persistencia automática
- Restauración automática al cargar la app
- Limpieza en logout
```

### **Estados Locales**

- Carrito de compras por usuario
- Historial de chat por sesión
- Configuraciones de UI temporales
- Estados de formularios

## 🚀 **Funcionalidades del Dashboard**

### **Gestión de Usuarios**
- Lista de usuarios registrados
- Edición de roles y permisos
- Eliminación de usuarios

### **Gestión de Productos**
- CRUD completo de productos
- Control de inventario
- Gestión de precios

### **Gestión de Órdenes**
- Visualización de pedidos
- Cambio de estados
- Historial de cambios

### **Gestión de Inventario**
- Control de stock
- Movimientos de inventario
- Alertas de stock bajo
- Reportes de consumo

### **Gestión de Sucursales**
- Información de ubicaciones
- Horarios de atención
- Contacto y dirección

### **Gestión de Proveedores**
- Catálogo de proveedores
- Información de contacto
## 📈 **Métricas y Monitoreo**

### **Logs Implementados**

- 🛒 Datos de orden enviados
- 📋 Órdenes recibidas del backend
- 🌽 Productos customizados creados
- 🔍 Detalles de resolución de nombres
- 📦 Operaciones de caché

### **Debugging Tools**

- Console logs para fácil identificación
- Información detallada de estados
- Tracking de operaciones asíncronas
- Estadísticas de caché

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para La Cazuela Chapina**

*Última actualización: Agosto 2025*
