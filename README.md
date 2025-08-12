# 🌮 Genesis Tamales - Frontend Web Application

Aplicación web de comercio electrónico y panel administrativo para Genesis Tamales, construida con React 19, TypeScript, Redux Toolkit y Tailwind CSS.

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
- **Gestión completa**: Control de productos, órdenes y usuarios

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
- **Precios automáticos**: Pollo Q6, Cerdo/Res Q12, Otros Q8

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
VITE_API_BASE_URL=http://albmdwapi-1889324219.us-east-1.elb.amazonaws.com/api/v1

# Configuración de encriptación
VITE_ENCRYPTION_KEY=your-encryption-key
```

## 🗂️ **Estructura del Proyecto**

```
src/
├── global/                 # Estado global compartido
│   ├── authSlice.ts       # Redux slice para autenticación
│   └── index.ts           # Store y hooks compartidos
├── types/                 # Interfaces TypeScript
│   ├── auth.ts           # Tipos de autenticación
│   └── chat.ts           # Tipos de chat
├── store/                 # Aplicación e-commerce
│   ├── api/              # Servicios de API
│   ├── components/       # Componentes de la tienda
│   ├── hooks/            # Hooks customizados
│   ├── types/            # Tipos específicos de store
│   ├── utils/            # Utilidades y helpers
│   └── App.tsx           # Componente principal de la tienda
├── dashboard/            # Panel administrativo
│   ├── components/       # Componentes del dashboard
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
- **Colores principales**: Orange/Red gradient, Blue accents
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

## 📊 **Gestión de Estado**

### **Redux Store Global**
```typescript
// Estado de autenticación
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

// Persistencia automática
- localStorage para tokens y usuario
- Restauración automática al cargar la app
- Limpieza en logout
```

### **Estados Locales**
- Carrito de compras por usuario
- Historial de chat por sesión
- Configuraciones de UI temporales
- Estados de formularios

## 🚀 **Nuevas Funcionalidades Recientes**

### **🔄 Sistema de Refresh Tokens Mejorado**
- **Sin headers en refresh**: El endpoint `/user/refresh` no requiere token en header
- **Body con PascalCase**: Envía `Token` y `RefreshToken` en el cuerpo
- **Retry automático**: Reintenta peticiones fallidas después del refresh
- **Logs detallados**: Debugging mejorado para troubleshooting

### **🛒 Resolución de Nombres de Productos Customizables**
- **Caché local**: Sistema de caché para productos personalizados
- **Resolución inteligente**: Prioridad productName > catálogo > caché > ID
- **Persistencia**: Nombres guardados para mostrar en órdenes históricas
- **Expiración automática**: Limpieza de caché antiguo

### **💳 Validaciones Avanzadas de Tarjeta de Crédito**
- **Formato automático**: Espaciado de números de tarjeta
- **Validación en tiempo real**: Restricciones por tipo de campo
- **Solo números**: CVV y partes numéricas
- **Solo letras**: Nombres y ciudades
- **Fechas**: Validación de expiración
- **Longitud**: Límites apropiados por campo

## 🐛 **Problemas Resueltos**

### **❌ Productos Customizables Mostrando ID**
- **Problema**: Los tamales y bebidas personalizados mostraban ID en lugar del nombre
- **Causa**: Backend no almacena `productName`, solo `productId`
- **Solución**: Sistema de caché local + resolución inteligente de nombres

### **❌ Refresh Token con Headers**
- **Problema**: Endpoint `/user/refresh` recibía token en header
- **Causa**: Configuración incorrecta en `ApiService`
- **Solución**: Modificación para enviar solo en body sin headers

### **❌ Validaciones de Formulario Inconsistentes**
- **Problema**: Campos permitían caracteres inválidos
- **Causa**: Falta de validación en tiempo real
- **Solución**: Sistema de validación por tipo de campo

## 📈 **Métricas y Monitoreo**

### **Logs Implementados**
- 🛒 Datos de orden enviados
- 📋 Órdenes recibidas del backend
- 🌽 Productos customizados creados
- 🔍 Detalles de resolución de nombres
- 📦 Operaciones de caché

### **Debugging Tools**
- Console logs con emojis para fácil identificación
- Información detallada de estados
- Tracking de operaciones asíncronas
- Estadísticas de caché

## 🚀 **Roadmap Futuro**

### **Próximas Funcionalidades**
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Analytics integrado
- [ ] Tests automatizados
- [ ] CI/CD pipeline

### **Optimizaciones Planeadas**
- [ ] Code splitting avanzado
- [ ] Service Workers
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] Performance monitoring

## 👥 **Contribución**

### **Desarrollo**
1. Fork del repositorio
2. Crear branch feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit changes (`git commit -am 'Add nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### **Reportar Bugs**
- Usar GitHub Issues
- Incluir steps para reproducir
- Adjuntar logs de consola
- Especificar browser y versión

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para Genesis Tamales**

*Última actualización: Agosto 2025*