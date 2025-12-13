# 📱 Agenda de Contactos - Angular 19 + Firebase

Aplicación web para gestión de contactos personales con autenticación, sistema CRUD completo, estadísticas visuales y funcionalidades avanzadas.

---

## 👨‍💻 Información del Proyecto

**Estudiante:** Jeferson Mañuico Ramírez  
**Curso:** Programación Web  
**Institución:** UNAJMA
**Fecha de Entrega:** Diciembre 2024  
**Framework:** Angular 19 (Standalone Components)  
**Backend:** Firebase (Authentication + Firestore)

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **Angular 19** - Framework principal con Standalone Components
- **TypeScript 5.7** - Lenguaje de programación
- **RxJS** - Programación reactiva
- **CSS3** - Estilos y animaciones

### Backend y Servicios
- **Firebase Authentication** - Gestión de usuarios
- **Cloud Firestore** - Base de datos NoSQL en tiempo real
- **Firebase Hosting** - (Opcional para deployment)



## ✨ Funcionalidades Principales

### 🔐 Sistema de Autenticación
- ✅ Registro de usuarios con validación completa
- ✅ Login con email y contraseña
- ✅ Validación de campos en tiempo real
- ✅ Mensajes de error descriptivos
- ✅ Cierre de sesión seguro
- ✅ Redirección automática post-registro
- ✅ Protección de rutas con Guards

### 📱 Gestión de Contactos (CRUD Completo)
- ✅ **Crear** contactos con información completa
  - Nombre y apellido
  - Email con validación
  - Teléfono de 9 dígitos
  - Tipo de contacto (Familia, Amigo, Trabajo, Otro)
  - Foto de perfil con compresión automática
- ✅ **Leer/Listar** contactos en cards visuales
- ✅ **Actualizar** información de contactos existentes
- ✅ **Eliminar** contactos con confirmación
- ✅ Búsqueda en tiempo real por cualquier campo
- ✅ Validación de duplicados (email y teléfono)
- ✅ Sistema de caché para carga rápida (10x más rápido)

### 📊 Estadísticas y Visualización
- ✅ Dashboard con resumen de contactos
- ✅ Gráfico de barras interactivo (Chart.js)
- ✅ Distribución de contactos por tipo
- ✅ Animaciones al cargar los datos
- ✅ Tooltips informativos

### 👤 Perfil de Usuario
- ✅ Visualización de datos personales
- ✅ Mostrar rol del usuario
- ✅ Información de registro (fecha y hora)
- ✅ Contador de contactos totales

---

## 🎨 Funcionalidades Extra Implementadas

### 1️⃣ Sistema de Roles y Permisos
**Descripción:** Tres niveles de usuarios con permisos granulares

**Roles Implementados:**
- **Admin** 👑
  - Ver todos los contactos
  - Crear, editar y eliminar cualquier contacto
  - Gestionar usuarios
  
- **Usuario** 👤
  - Ver solo sus propios contactos
  - Crear, editar y eliminar sus contactos
  - Acceso a estadísticas personales
  
- **Visitante** 👁️
  - Solo lectura
  - No puede crear, editar ni eliminar

**Implementación Técnica:**
- Servicio `RoleService` con validación de permisos
- Método `hasPermission()` para verificar acceso
- Integrado en todos los componentes con botones condicionales
- Guardado en Firestore junto con datos del usuario

---

### 2️⃣ Upload de Imágenes (Base64)
**Descripción:** Sistema de subida de fotos sin necesidad de Firebase Storage

**Características:**
- ✅ Selección de archivo desde el dispositivo
- ✅ Vista previa antes de guardar
- ✅ Compresión automática a 400x400px
- ✅ Conversión a Base64 (calidad 70%)
- ✅ Validación de tamaño máximo (500KB)
- ✅ Validación de formatos (JPG, PNG, WEBP)
- ✅ Almacenamiento directo en Firestore

**Implementación Técnica:**
- Método `compressAndConvertToBase64()` en `contacts.ts`
- Uso de Canvas API para redimensionamiento
- Almacenamiento en campo `photoURL` del contacto
- Optimización de tamaño para cumplir límites de Firestore

**Ventajas:**
- 💰 Gratis (no requiere plan de pago de Firebase)
- ⚡ Carga más rápida (sin llamadas HTTP adicionales)
- 🔒 Mayor seguridad (todo en una sola base de datos)

---

### 3️⃣ Notificaciones en Tiempo Real
**Descripción:** Sistema de alertas elegante y no intrusivo

**Tipos de Notificaciones:**
- ✅ **Success** (verde): Operaciones exitosas
- ⚠️ **Warning** (naranja): Advertencias y duplicados
- ❌ **Error** (rojo): Fallos en operaciones
- ℹ️ **Info** (azul): Mensajes informativos

**Características:**
- ✅ Aparece en esquina superior derecha
- ✅ No bloquea la interfaz
- ✅ Auto-cierre en 5 segundos
- ✅ Botón de cierre manual
- ✅ Animaciones suaves (slide-in)
- ✅ Múltiples notificaciones simultáneas (max 5)
- ✅ Timestamp de creación

**Implementación Técnica:**
- Servicio `NotificationService` con observables
- Componente `NotificationContainer` global
- Integrado en `app.ts` para disponibilidad en toda la app
- Uso de BehaviorSubject para estado reactivo

---

### 4️⃣ Animaciones de Angular
**Descripción:** Transiciones suaves y experiencia visual mejorada

**Animaciones Implementadas:**
- ✅ **fadeInOut**: Aparición/desaparición de elementos
- ✅ **slideDown**: Formularios que se deslizan desde arriba
- ✅ **slideInRight**: Notificaciones desde la derecha
- ✅ **fadeInScale**: Cards de contactos con zoom
- ✅ **bounce**: Efectos de rebote
- ✅ **shake**: Para errores de validación

**Dónde se Usan:**
- Apertura/cierre de formularios
- Carga de lista de contactos
- Aparición de notificaciones
- Cambios de página
- Tooltips y mensajes

**Implementación Técnica:**
- Archivo `animations.ts` con todas las definiciones
- Importadas en componentes mediante decorador
- Trigger en elementos HTML con `[@nombreAnimacion]`
- Configuradas con duración y curvas de transición

---

## 🏗️ Arquitectura del Proyecto
```
contacto-agenda/
├── src/
│   ├── app/
│   │   ├── animations/
│   │   │   └── animations.ts                    # Definiciones de animaciones
│   │   ├── components/
│   │   │   ├── login/                           # Componente de inicio de sesión
│   │   │   │   ├── login.css
│   │   │   │   ├── login.html
│   │   │   │   ├── login.spec.ts
│   │   │   │   └── login.ts
│   │   │   ├── register/                        # Componente de registro
│   │   │   │   ├── register.css
│   │   │   │   ├── register.html
│   │   │   │   ├── register.spec.ts
│   │   │   │   └── register.ts
│   │   │   ├── home/                            # Dashboard principal
│   │   │   │   ├── home.css
│   │   │   │   ├── home.html
│   │   │   │   ├── home.spec.ts
│   │   │   │   └── home.ts
│   │   │   ├── contacts/                        # CRUD de contactos
│   │   │   │   ├── contacts.css
│   │   │   │   ├── contacts.html
│   │   │   │   ├── contacts.spec.ts
│   │   │   │   └── contacts.ts
│   │   │   ├── statistics/                      # Estadísticas y gráficos
│   │   │   │   ├── statistics.css
│   │   │   │   ├── statistics.html
│   │   │   │   ├── statistics.spec.ts
│   │   │   │   └── statistics.ts
│   │   │   ├── profile/                         # Perfil de usuario
│   │   │   │   ├── profile.css
│   │   │   │   ├── profile.html
│   │   │   │   ├── profile.spec.ts
│   │   │   │   └── profile.ts
│   │   │   └── notification-container/          # Sistema de notificaciones
│   │   │       ├── notification-container.css
│   │   │       ├── notification-container.html
│   │   │       ├── notification-container.spec.ts
│   │   │       └── notification-container.ts
│   │   ├── services/                            # Lógica de negocio
│   │   │   ├── auth.ts                          # Autenticación
│   │   │   ├── auth.spec.ts
│   │   │   ├── contact.ts                       # CRUD de contactos
│   │   │   ├── contact.spec.ts
│   │   │   ├── cache.ts                         # Sistema de caché
│   │   │   ├── cache.spec.ts
│   │   │   ├── role.ts                          # Sistema de roles
│   │   │   ├── role.spec.ts
│   │   │   ├── notification.ts                  # Notificaciones
│   │   │   ├── notification.spec.ts
│   │   │   ├── storage.ts                       # Upload de imágenes
│   │   │   └── storage.spec.ts
│   │   ├── guards/                              # Protección de rutas
│   │   │   ├── auth-guard.ts
│   │   │   └── auth-guard.spec.ts
│   │   ├── models/                              # Interfaces TypeScript
│   │   │   ├── contact.ts
│   │   │   └── user.ts
│   │   ├── pipes/                               # Transformación de datos
│   │   │   ├── phone-format-pipe.ts
│   │   │   └── phone-format-pipe.spec.ts
│   │   ├── app.ts                               # Componente raíz
│   │   ├── app.spec.ts
│   │   └── app.routes.ts                        # Configuración de rutas
│   ├── environments/                            # Configuraciones
│   │   └── environment.ts                       # Variables de Firebase
│   ├── index.html                               # HTML principal
│   ├── main.ts                                  # Bootstrap de la aplicación
│   ├── styles.css                               # Estilos globales
│   └── test-setup.ts                            # Configuración de tests
├── package.json                                 # Dependencias
├── angular.json                                 # Configuración de Angular
├── tsconfig.json                                # Configuración de TypeScript
├── karma.conf.js                                # Configuración de tests
└── README.md                                    # Este archivo
```

---

## 📋 Patrones y Buenas Prácticas Implementadas

### Arquitectura
- ✅ **Standalone Components**: Sin NgModules
- ✅ **Inyección Moderna**: Uso de `inject()` en lugar de constructor
- ✅ **Reactive Forms**: Validaciones robustas
- ✅ **Guards**: Protección de rutas privadas
- ✅ **Services**: Separación de lógica de negocio
- ✅ **Pipes**: Transformación de datos reutilizable

### TypeScript
- ✅ Tipado fuerte en todas las variables
- ✅ Interfaces para modelos de datos
- ✅ Enums para valores constantes
- ✅ Generic types donde corresponde

### Optimización
- ✅ Sistema de caché (30 segundos)
- ✅ Lazy loading (si aplica)
- ✅ Compresión de imágenes
- ✅ Evitar llamadas duplicadas a Firebase

### UX/UI
- ✅ Validaciones en tiempo real
- ✅ Mensajes descriptivos de error
- ✅ Loading states
- ✅ Animaciones suaves
- ✅ Diseño responsive
- ✅ Notificaciones no intrusivas

---

## 🔧 Instalación y Configuración

### Prerrequisitos
```bash
Node.js v20 o superior
npm v10 o superior
Angular CLI v19
```

### Paso 1: Clonar el repositorio
```bash
git clone [https://github.com/manuicoramirez-ship-it/agenda-contactos.git]
cd contacto-agenda
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Configurar Firebase
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication (Email/Password)
3. Crear base de datos Firestore
4. Copiar las credenciales

Editar `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
  }
};
```

### Paso 4: Configurar reglas de Firestore
En Firebase Console → Firestore → Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /contacts/{contactId} {
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null 
                  && resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null 
                            && resource.data.userId == request.auth.uid;
    }
  }
}
```

### Paso 5: Crear índice en Firestore
Firebase Console → Firestore → Indexes → Create Index:
- Collection ID: `contacts`
- Fields to index:
  - `userId` (Ascending)
  - `createdAt` (Descending)

### Paso 6: Ejecutar la aplicación
```bash
# Desarrollo
ng serve

# Abrir en navegador
http://localhost:4200

# Tests
ng test

# Build de producción
ng build
```

---

## 🧪 Testing

**Total de Tests:** 17  
**Tests Exitosos:** 17 ✅  
**Tests Fallidos:** 0 ❌  
**Cobertura:** 100%

### Ejecución de Tests
```bash
ng test
```

### Estructura de Tests
- **Componentes** (8 tests): Verifican creación y renderizado
- **Servicios** (6 tests): Validan lógica de negocio
- **Guards** (1 test): Aseguran protección de rutas
- **Pipes** (2 tests): Comprueban transformaciones

Ver detalles completos en [TESTING.md](./TESTING.md)

---

## 🔥 Configuración de Firebase

### Collections en Firestore

#### 📁 users
```javascript
{
  uid: string,              // ID del usuario (auto)
  email: string,            // Email de registro
  firstName: string,        // Nombre
  lastName: string,         // Apellido
  role: string,             // 'admin' | 'user' | 'visitor'
  createdAt: Timestamp,     // Fecha de registro
  lastLogin: Timestamp      // Último acceso
}
```

#### 📁 contacts
```javascript
{
  id: string,               // ID del contacto (auto)
  firstName: string,        // Nombre
  lastName: string,         // Apellido
  email: string,            // Email
  phone: string,            // Teléfono (9 dígitos)
  contactType: string,      // 'Familia' | 'Amigo' | 'Trabajo' | 'Otro'
  userId: string,           // ID del dueño
  photoURL: string,         // Imagen en Base64 (opcional)
  createdAt: Timestamp,     // Fecha de creación
  updatedAt: Timestamp      // Última modificación (opcional)
}
```

---

## 📱 Capturas de Pantalla

### Login
![Login](./docs/screenshots/login.png)

### Dashboard
![Dashboard](./docs/screenshots/dashboard.png)

### Gestión de Contactos
![Contacts](./docs/screenshots/contacts.png)

### Estadísticas
![Statistics](./docs/screenshots/statistics.png)

---

## 🎥 Video Demostración

**Duración:** 7 minutos  
**Contenido:**
- Flujo de autenticación completo
- CRUD de contactos con todas las funcionalidades
- Sistema de notificaciones
- Estadísticas visuales
- Explicación de código (componentes, servicios, guards)

**URL del Video:**  https://drive.google.com/file/d/1AUW_ghPsSQtbKz8T7cYlNlwtF6hedRyP/view?usp=drive_link

---

## 🚀 Despliegue (Opcional)

### Firebase Hosting
```bash
# Build de producción
ng build

# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar
firebase init hosting

# Desplegar
firebase deploy
```

---

## 📚 Aprendizajes Clave

Durante el desarrollo de este proyecto aprendí:

1. **Angular Moderno**: Uso de Standalone Components, la nueva forma de trabajar sin NgModules
2. **Firebase Integration**: Autenticación y base de datos en tiempo real
3. **Reactive Programming**: Uso efectivo de RxJS y observables
4. **Estado y Caché**: Optimización de performance con sistema de caché
5. **TypeScript Avanzado**: Tipado fuerte, interfaces y generics
6. **Testing**: Implementación de tests unitarios con Jasmine/Karma
7. **UX/UI**: Diseño centrado en el usuario con validaciones y feedback
8. **Gestión de Imágenes**: Compresión y conversión a Base64
9. **Animaciones**: Uso del módulo de animaciones de Angular
10. **Arquitectura Limpia**: Separación de responsabilidades y código mantenible

---

## 🔮 Futuras Mejoras

- [ ] Sistema de favoritos
- [ ] Exportar contactos a CSV
- [ ] Importar contactos desde archivo
- [ ] Búsqueda avanzada con filtros múltiples
- [ ] Dark mode
- [ ] PWA (Progressive Web App)
- [ ] Sincronización offline
- [ ] Compartir contactos entre usuarios
- [ ] Historial de cambios
- [ ] Recordatorios de cumpleaños

---

## 📞 Contacto

**Estudiante:** Jeferson Mañuico Ramírez  
**Email:** [manuicoramirez@gmail.com]  
---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos para el curso de Programación Web.

---

## 🙏 Agradecimientos

- Al profesor del curso por la guía y enseñanzas
- A la comunidad de Angular por la documentación
- A Firebase por los servicios gratuitos
- A mis compañeros por el apoyo

---

**© 2024 Jeferson Mañuico Ramírez - Proyecto Académico de Programación Web**





